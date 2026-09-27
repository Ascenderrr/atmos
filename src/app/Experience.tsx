import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface ExperienceProps {
  onContextLost: () => void;
}

// Phase 2 foundation scene: renderer config, default camera, flat background,
// basic lights, and one clearly-marked placeholder mesh proving the pipeline
// renders. Flight path, aircraft, camera rig, and atmosphere arrive in later
// phases; nothing here animates outside the progress model.
export default function Experience({ onContextLost }: ExperienceProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 55, near: 0.1, far: 2000, position: [0, 2, 12] }}
      onCreated={({ gl }) => {
        // Deliberate color strategy (see TECHNICAL_DECISIONS.md): sRGB output
        // is three's default; ACES tone mapping keeps sky gradients smooth.
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
      <mesh position={[0, 0.5, 0]}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#7ea2ff" roughness={0.55} metalness={0.15} />
      </mesh>
    </Canvas>
  );
}
