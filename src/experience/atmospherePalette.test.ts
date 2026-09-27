import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { atmosphereKeyframes } from '../config/scene';
import { createAtmosphereSample, evaluateAtmosphere } from './atmospherePalette';

describe('evaluateAtmosphere', () => {
  it('matches keyframes exactly at their progress', () => {
    for (const frame of atmosphereKeyframes) {
      const sample = evaluateAtmosphere(frame.progress, createAtmosphereSample());
      expect(sample.skyTop.equals(new THREE.Color(frame.skyTop))).toBe(true);
      expect(sample.fogColor.equals(new THREE.Color(frame.fogColor))).toBe(true);
      expect(sample.sunIntensity).toBeCloseTo(frame.sunIntensity);
      expect(sample.stars).toBeCloseTo(frame.stars);
    }
  });

  it('blends smoothly between keyframes', () => {
    const before = evaluateAtmosphere(0.39, createAtmosphereSample());
    const mid = evaluateAtmosphere(0.4, createAtmosphereSample());
    const after = evaluateAtmosphere(0.41, createAtmosphereSample());
    for (const key of ['skyTop', 'fogColor', 'sunColor'] as const) {
      expect(mid[key].equals(before[key])).toBe(false);
      expect(mid[key].equals(after[key])).toBe(false);
    }
    expect(mid.stars).toBeCloseTo(0);
    expect(mid.sunIntensity).toBeGreaterThan(1.2);
  });

  it('clamps outside 0..1 to the ends', () => {
    const low = evaluateAtmosphere(-2, createAtmosphereSample());
    const start = evaluateAtmosphere(0, createAtmosphereSample());
    expect(low.skyTop.equals(start.skyTop)).toBe(true);
    const high = evaluateAtmosphere(2, createAtmosphereSample());
    const end = evaluateAtmosphere(1, createAtmosphereSample());
    expect(high.skyTop.equals(end.skyTop)).toBe(true);
  });
});
