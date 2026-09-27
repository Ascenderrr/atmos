import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { streakFieldConfig } from '../config/scene';
import { getFlightCurve } from './FlightPath';
import { mulberry32 } from '../utils/seededRandom';
import { streakOpacityForVelocity } from './streaks';
import type { ProgressStore } from '../animation/progressStore';

// Motion-reactive wind streaks: thin shards along the corridor that fade in
// with progress velocity and vanish when calm — the reward for fast input.
// Placement is seeded; opacity is the only per-frame write.
export default function WindStreaks({ store }: { store: ProgressStore }) {
  const lastProgress = useRef<number | null>(null);
  const velocity = useRef(0);

  const mesh = useMemo(() => {
    const rng = mulberry32(streakFieldConfig.seed);
    const curve = getFlightCurve();
    const geometry = new THREE.BoxGeometry(0.07, 0.07, 3.2);
    const material = new THREE.MeshBasicMaterial({
      color: '#cfe0ff',
      transparent: true,
      opacity: 0,
      toneMapped: false,
      depthWrite: false,
    });
    const instanced = new THREE.InstancedMesh(geometry, material, streakFieldConfig.streakCount);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3();
    const orientation = new THREE.Matrix4();
    const scale = new THREE.Vector3(1, 1, 0.7 + rng() * 0.9);
    for (let i = 0; i < streakFieldConfig.streakCount; i += 1) {
      const p = rng();
      curve.getPointAt(p, position);
      curve.getTangentAt(p, tangent);
      position.x += (rng() - 0.5) * 56;
      position.y += (rng() - 0.5) * 26;
      position.z += (rng() - 0.5) * 56;
      right.crossVectors(tangent, up).normalize();
      orientation.makeBasis(right, up, tangent);
      scale.z = 0.7 + rng() * 0.9;
      matrix.compose(position, new THREE.Quaternion().setFromRotationMatrix(orientation), scale);
      instanced.setMatrixAt(i, matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
    instanced.frustumCulled = false;
    instanced.renderOrder = 5;
    return instanced;
  }, []);

  useEffect(() => {
    return () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    };
  }, [mesh]);

  // eslint-disable-next-line react-hooks/immutability -- Three.js material opacity is GPU state mutated per frame by design.
  useFrame((_, rawDelta) => {
    const delta = Math.min(Math.max(rawDelta, 0), 0.1);
    if (lastProgress.current === null || delta <= 0) {
      lastProgress.current = store.current;
      return;
    }
    const instant = Math.abs(store.current - lastProgress.current) / delta;
    lastProgress.current = store.current;
    velocity.current += (instant - velocity.current) * (1 - Math.exp(-3 * delta));
    const material = mesh.material as THREE.MeshBasicMaterial;
    const target = streakOpacityForVelocity(velocity.current);
    // eslint-disable-next-line react-hooks/immutability -- Three.js material opacity is GPU state mutated per frame by design.
    material.opacity += (target - material.opacity) * (1 - Math.exp(-4 * delta));
  });

  return <primitive object={mesh} />;
}
