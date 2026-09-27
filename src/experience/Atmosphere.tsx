import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import skyVert from '../shaders/sky.vert?raw';
import skyFrag from '../shaders/sky.frag?raw';
import { sunDirection } from '../config/scene';
import { createAtmosphereSample, evaluateAtmosphere } from './atmospherePalette';
import type { ProgressStore } from '../animation/progressStore';

// Camera-attached gradient sky dome (seamless, never-empty backdrop) plus
// linear fog, both evaluated from the shared progress each frame. The dome
// travels with the camera; the shader's grain and stars keep the frame alive
// when the user stops scrolling.
export default function Atmosphere({ store }: { store: ProgressStore }) {
  const sample = useMemo(() => createAtmosphereSample(), []);
  const sunDir = useMemo(() => new THREE.Vector3(...sunDirection).normalize(), []);

  const { dome, material, fog } = useMemo(() => {
    const geometry = new THREE.SphereGeometry(900, 32, 15);
    const mat = new THREE.ShaderMaterial({
      vertexShader: skyVert,
      fragmentShader: skyFrag,
      uniforms: {
        topColor: { value: new THREE.Color('#0b1030') },
        horizonColor: { value: new THREE.Color('#27407a') },
        bottomColor: { value: new THREE.Color('#05070f') },
        sunDirection: { value: sunDir.clone() },
        sunColor: { value: new THREE.Color('#8fa8ff') },
        uTime: { value: 0 },
        uStars: { value: 1 },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = -10;
    const f = new THREE.Fog('#101a33', 80, 800);
    return { dome: mesh, material: mat, fog: f };
  }, [sunDir]);

  useEffect(() => {
    return () => {
      dome.geometry.dispose();
      material.dispose();
    };
  }, [dome, material]);

  useFrame(({ camera, scene, clock }) => {
    evaluateAtmosphere(store.current, sample);
    const uniforms = material.uniforms;
    (uniforms.topColor.value as THREE.Color).copy(sample.skyTop);
    (uniforms.horizonColor.value as THREE.Color).copy(sample.skyHorizon);
    (uniforms.bottomColor.value as THREE.Color).copy(sample.skyBottom);
    (uniforms.sunColor.value as THREE.Color).copy(sample.sunColor);
    // eslint-disable-next-line react-hooks/immutability -- Three.js uniforms/fog are GPU state mutated per frame by design.
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uStars.value = sample.stars;

    dome.position.copy(camera.position);
    if (!(scene.fog instanceof THREE.Fog)) {
      scene.fog = fog;
    }
    scene.fog.color.copy(sample.fogColor);
    scene.fog.near = sample.fogNear;
    scene.fog.far = sample.fogFar;
  });

  return <primitive object={dome} />;
}
