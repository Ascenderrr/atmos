import { useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Aircraft from '../experience/Aircraft';
import CameraRig from '../experience/CameraRig';
import FlightPathDebug from '../experience/FlightPathDebug';
import ProgressAnnouncer from '../components/ProgressAnnouncer';
import {
  createProgressStore,
  updateProgress,
  type ProgressStore,
} from '../animation/progressStore';
import { createAircraftState } from '../experience/aircraftKinematics';
import { progressSmoothing } from '../config/scene';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { getExperienceFlags } from '../utils/searchParams';

interface ExperienceProps {
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

// Phase 5 scene: the rig and the aircraft share one kinematic evaluation;
// modes blend from the section table at the shared progress.
export default function Experience({ onContextLost }: ExperienceProps) {
  const flags = useMemo(() => getExperienceFlags(), []);
  const store = useMemo<ProgressStore>(() => {
    const initial = createProgressStore();
    if (flags.progress !== null) {
      initial.target = flags.progress;
      initial.current = flags.progress;
    }
    return initial;
  }, [flags]);
  const progressNodeRef = useRef<HTMLDivElement | null>(null);
  const kinematicState = useMemo(() => createAircraftState(), []);

  useScrollProgress(store, true);

  return (
    <>
      <ProgressAnnouncer nodeRef={progressNodeRef} />
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
        {flags.showPath && <FlightPathDebug />}
      </Canvas>
    </>
  );
}
