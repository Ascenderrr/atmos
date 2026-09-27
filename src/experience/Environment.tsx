import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sunDirection } from '../config/scene';
import { createAtmosphereSample, evaluateAtmosphere } from './atmospherePalette';
import type { ProgressStore } from '../animation/progressStore';

// Scene lighting driven by the same palette as the sky: sun color/intensity
// and hemisphere colors track the time of day, so craft, clouds, and dome
// always agree. Positions stay fixed; only colors and intensities animate.
export default function Environment({ store }: { store: ProgressStore }) {
  const sample = useMemo(() => createAtmosphereSample(), []);
  const sunDir = useMemo(() => new THREE.Vector3(...sunDirection).normalize(), []);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const sun = useRef<THREE.DirectionalLight>(null!);

  useEffect(() => {
    sun.current.position.copy(sunDir).multiplyScalar(500);
  }, [sunDir]);

  useFrame(() => {
    evaluateAtmosphere(store.current, sample);
    sun.current.color.copy(sample.sunColor);
    sun.current.intensity = sample.sunIntensity;
    hemi.current.color.copy(sample.hemiSky);
    hemi.current.groundColor.copy(sample.hemiGround);
    hemi.current.intensity = sample.hemiIntensity;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#5a6fa8', '#141a30', 0.5]} />
      <directionalLight ref={sun} args={['#8fa8ff', 0.7]} />
    </>
  );
}
