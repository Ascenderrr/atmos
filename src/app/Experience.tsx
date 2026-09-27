import { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Aircraft from '../experience/Aircraft';
import FlightPathDebug from '../experience/FlightPathDebug';
import {
  createProgressStore,
  updateProgress,
  type ProgressStore,
} from '../animation/progressStore';
import { progressSmoothing } from '../config/scene';
import { getExperienceFlags } from '../utils/searchParams';

interface ExperienceProps {
  onContextLost: () => void;
}

function ProgressDriver({ store }: { store: ProgressStore }) {
  useFrame((_, rawDelta) => {
    updateProgress(store, Math.min(rawDelta, 0.1), progressSmoothing);
  });
  return null;
}

// Phase 3 scene: the aircraft flies the configured spline from the shared
// progress store (inputs arrive in Phase 4; ?progress= sets it for tests).
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

  return (
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
      <ProgressDriver store={store} />
      <Aircraft store={store} />
      {flags.showPath && <FlightPathDebug />}
    </Canvas>
  );
}
