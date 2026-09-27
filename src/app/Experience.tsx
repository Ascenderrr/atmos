import { useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Aircraft from '../experience/Aircraft';
import Atmosphere from '../experience/Atmosphere';
import CameraRig from '../experience/CameraRig';
import Clouds from '../experience/Clouds';
import Effects from '../experience/Effects';
import Environment from '../experience/Environment';
import FlightPathDebug from '../experience/FlightPathDebug';
import SceneText from '../experience/SceneText';
import WindStreaks from '../experience/WindStreaks';
import ProgressAnnouncer from '../components/ProgressAnnouncer';
import { updateProgress, type ProgressStore } from '../animation/progressStore';
import { createAircraftState } from '../experience/aircraftKinematics';
import { progressSmoothing } from '../config/scene';
import { detectQualityEnvironment, resolveQualityTier } from '../renderer/quality';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { getExperienceFlags } from '../utils/searchParams';

interface ExperienceProps {
  store: ProgressStore;
  inputActive: boolean;
  onActivity: () => void;
  onContextLost: () => void;
}

function ProgressDriver({
  store,
  progressNodeRef,
}: {
  store: ProgressStore;
  progressNodeRef: RefObject<HTMLDivElement | null>;
}) {
  const lastPercent = useRef(-1);
  useFrame((_, rawDelta) => {
    updateProgress(store, Math.min(rawDelta, 0.1), progressSmoothing);
    const percent = Math.round(store.current * 100);
    if (percent !== lastPercent.current) {
      lastPercent.current = percent;
      progressNodeRef.current?.setAttribute('aria-valuenow', String(percent));
    }
  });
  return null;
}

// Phase 8 scene: post-processing joins behind the scene contents; the tier
// resolves once per load (override, touch/small-screen heuristic, desktop).
export default function Experience({
  store,
  inputActive,
  onActivity,
  onContextLost,
}: ExperienceProps) {
  const flags = useMemo(() => getExperienceFlags(), []);
  const tier = useMemo(
    () => resolveQualityTier(flags.quality, detectQualityEnvironment()),
    [flags],
  );
  const progressNodeRef = useRef<HTMLDivElement | null>(null);
  const kinematicState = useMemo(() => createAircraftState(), []);

  useScrollProgress(store, inputActive, onActivity);

  return (
    <>
      <ProgressAnnouncer nodeRef={progressNodeRef} />
      <div className="experience-canvas" aria-hidden="true">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          camera={{ fov: 55, near: 0.1, far: 2000, position: [0, 5, 14] }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault();
              onContextLost();
            });
          }}
        >
          <color attach="background" args={['#0b1030']} />
          <Atmosphere store={store} />
          <Environment store={store} />
          <Clouds store={store} />
          <WindStreaks store={store} />
          <ProgressDriver store={store} progressNodeRef={progressNodeRef} />
          <Aircraft store={store} kinematicState={kinematicState} />
          <CameraRig store={store} kinematicState={kinematicState} />
          <SceneText store={store} />
          {flags.showPath && <FlightPathDebug />}
          <Effects tier={tier} />
        </Canvas>
      </div>
    </>
  );
}
