import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { aircraftConfig, type AircraftConfig } from '../config/scene';
import { getFlightCurve } from './FlightPath';
import { createAircraftState, evaluateAircraft } from './aircraftKinematics';
import type { ProgressStore } from '../animation/progressStore';

// Catches GLB load failures (optional asset) and falls back to procedural geometry.
class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    if (import.meta.env.DEV) {
      console.warn('[Aircraft] optional model failed, using placeholder:', error);
    }
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function GltfAircraft({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

interface PlaceholderParts {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  body: THREE.Material;
  canopy: THREE.Material;
}

// Procedural stylized placeholder: fuselage, nose, canopy, main wings,
// tailplane, vertical stabilizer. Nose points along +Z to match the default
// forwardAxis; any other axis is handled by the kinematics, not the mesh.
function PlaceholderAircraft() {
  const parts = useMemo<PlaceholderParts>(() => {
    const body = new THREE.MeshStandardMaterial({
      color: '#dfe6f5',
      metalness: 0.35,
      roughness: 0.4,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: '#4f7cff',
      metalness: 0.3,
      roughness: 0.45,
    });
    const canopy = new THREE.MeshStandardMaterial({
      color: '#16233f',
      metalness: 0.1,
      roughness: 0.15,
    });
    const geometries: THREE.BufferGeometry[] = [
      new THREE.CapsuleGeometry(0.32, 2.6, 8, 16),
      new THREE.ConeGeometry(0.32, 0.9, 24),
      new THREE.SphereGeometry(0.3, 24, 16),
      new THREE.BoxGeometry(4.6, 0.09, 0.95),
      new THREE.BoxGeometry(1.9, 0.07, 0.55),
      new THREE.BoxGeometry(0.08, 0.85, 0.75),
      new THREE.ConeGeometry(0.2, 0.6, 16),
    ];
    return { geometries, materials: [body, accent, canopy], body, canopy };
  }, []);

  useEffect(() => {
    return () => {
      for (const geometry of parts.geometries) {
        geometry.dispose();
      }
      for (const material of parts.materials) {
        material.dispose();
      }
    };
  }, [parts]);

  const [fuselage, nose, canopyGeo, wing, tailplane, fin, tailCone] = parts.geometries;
  const accent = parts.materials[1];

  return (
    <group>
      <mesh geometry={fuselage} material={parts.body} rotation-x={Math.PI / 2} />
      <mesh
        geometry={nose}
        material={parts.body}
        rotation-x={Math.PI / 2}
        position={[0, 0, 1.95]}
      />
      <mesh
        geometry={canopyGeo}
        material={parts.canopy}
        scale={[0.85, 0.7, 1.6]}
        position={[0, 0.32, 0.55]}
      />
      <mesh geometry={wing} material={accent} position={[0, -0.02, 0.15]} />
      <mesh geometry={tailplane} material={accent} position={[0, 0.18, -1.45]} />
      <mesh geometry={fin} material={parts.body} position={[0, 0.5, -1.45]} />
      <mesh
        geometry={tailCone}
        material={parts.body}
        rotation-x={-Math.PI / 2}
        position={[0, 0.02, -1.8]}
      />
    </group>
  );
}

interface AircraftProps {
  store: ProgressStore;
  config?: AircraftConfig;
}

// Flight-system owner for the craft: evaluates the spline every frame and
// applies position/quaternion to one group. Placeholder and future GLB modes
// share this path — swapping modes never touches flight math.
export default function Aircraft({ store, config = aircraftConfig }: AircraftProps) {
  const group = useRef<THREE.Group>(null!);
  const kinematicState = useMemo(() => createAircraftState(), []);
  const curve = useMemo(() => getFlightCurve(), []);

  useFrame(({ clock }, rawDelta) => {
    const pose = evaluateAircraft(
      curve,
      store.current,
      clock.elapsedTime,
      Math.min(rawDelta, 0.1),
      config,
      kinematicState,
    );
    group.current.position.copy(pose.position);
    group.current.quaternion.copy(pose.quaternion);
  });

  return (
    <group ref={group} scale={config.aircraftScale}>
      {config.mode === 'gltf' && config.gltfUrl ? (
        <ModelErrorBoundary fallback={<PlaceholderAircraft />}>
          <Suspense fallback={<PlaceholderAircraft />}>
            <GltfAircraft url={config.gltfUrl} />
          </Suspense>
        </ModelErrorBoundary>
      ) : (
        <PlaceholderAircraft />
      )}
    </group>
  );
}
