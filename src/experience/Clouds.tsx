import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildCloudBlobs } from './cloudField';
import { createAtmosphereSample, evaluateAtmosphere } from './atmospherePalette';
import type { ProgressStore } from '../animation/progressStore';

// One-draw-call stylized cloud field. Matrices and tints are baked once from
// the seeded builder; per frame only the shared material tint follows the
// palette (dawn rose, midday white, dusk mauve).
export default function Clouds({ store }: { store: ProgressStore }) {
  const sample = useMemo(() => createAtmosphereSample(), []);

  const mesh = useMemo(() => {
    const blobs = buildCloudBlobs();
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const material = new THREE.MeshStandardMaterial({
      roughness: 1,
      metalness: 0,
      flatShading: true,
    });
    const instanced = new THREE.InstancedMesh(geometry, material, Math.max(blobs.length, 1));
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const tint = new THREE.Color();
    blobs.forEach((blob, i) => {
      position.set(...blob.position);
      scale.set(...blob.scale);
      matrix.compose(position, quaternion, scale);
      instanced.setMatrixAt(i, matrix);
      instanced.setColorAt(i, tint.set(blob.tint));
    });
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) {
      instanced.instanceColor.needsUpdate = true;
    }
    instanced.frustumCulled = false;
    return instanced;
  }, []);

  useEffect(() => {
    return () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    };
  }, [mesh]);

  useFrame(() => {
    evaluateAtmosphere(store.current, sample);
    (mesh.material as THREE.MeshStandardMaterial).color.copy(sample.cloudTint);
  });

  return <primitive object={mesh} />;
}
