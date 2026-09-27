import { useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Aircraft from '../experience/Aircraft';
import CameraRig from '../experience/CameraRig';
import FlightPathDebug from '../experience/FlightPathDebug';
import SceneText from '../experience/SceneText';
import ProgressAnnouncer from '../components/ProgressAnnouncer';
import { updateProgress, type ProgressStore } from '../animation/progressStore';
import { createAircraftState } from '../experience/aircraftKinematics';
import { progressSmoothing } from '../config/scene';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { getExperienceFlags } from '../utils/searchParams';

interface ExperienceProps {
  store: ProgressStore;
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

// Phase 6 scene: store arrives from App (shared with the DOM chapters); the
// decorative 3D titles duplicate chapter copy and hide inside an aria-hidden
// canvas container (see .experience-canvas).
export default function Experience({ store, onContextLost }: ExperienceProps) {
  const flags = useMemo(() => getExperienceFlags(), []);
  const progressNodeRef = useRef<HTMLDivElement | null>(null);
  const kinematicState = useMemo(() => createAircraftState(), []);

  useScrollProgress(store, true);

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
          <color attach="background" args={['#101a33']} />
          <hemisphereLight args={['#bcd0ff', '#1a2340', 0.9]} />
          <directionalLight position={[6, 10, 4]} intensity={1.6} />
          <ProgressDriver store={store} progressNodeRef={progressNodeRef} />
          <Aircraft store={store} kinematicState={kinematicState} />
          <CameraRig store={store} kinematicState={kinematicState} />
          <SceneText store={store} />
          {flags.showPath && <FlightPathDebug />}
        </Canvas>
      </div>
    </>
  );
}
