import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { cloudFieldConfig } from '../config/scene';
import { getFlightCurve } from './FlightPath';
import { buildCloudBlobs } from './cloudField';

describe('buildCloudBlobs', () => {
  it('is deterministic for a seed', () => {
    expect(buildCloudBlobs(99)).toEqual(buildCloudBlobs(99));
  });

  it('produces finite blobs within the expected count range', () => {
    const blobs = buildCloudBlobs();
    expect(blobs.length).toBeGreaterThan(0);
    expect(blobs.length).toBeLessThanOrEqual(
      cloudFieldConfig.cloudCount * cloudFieldConfig.maxBlobs,
    );
    for (const blob of blobs) {
      for (const v of [...blob.position, ...blob.scale]) {
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });

  it('keeps the flight corridor clear', () => {
    const samples = getFlightCurve().getPoints(80);
    const clearance = cloudFieldConfig.corridorClearance - 1e-6;
    const point = new THREE.Vector3();
    for (const blob of buildCloudBlobs()) {
      point.set(...blob.position);
      let minDist = Infinity;
      for (const sample of samples) {
        minDist = Math.min(minDist, point.distanceTo(sample));
      }
      expect(minDist).toBeGreaterThanOrEqual(clearance);
    }
  });
});
