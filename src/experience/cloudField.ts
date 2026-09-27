import * as THREE from 'three';
import type { Vec3Tuple } from '../config/scene';
import { cloudFieldConfig } from '../config/scene';
import { getFlightCurve } from './FlightPath';
import { mulberry32 } from '../utils/seededRandom';

export interface CloudBlob {
  position: Vec3Tuple;
  scale: Vec3Tuple;
  tint: string;
}

// Stylized cloud field: opaque low-poly blobs grouped into clouds, placed by a
// seeded RNG with rejection sampling that keeps the flight corridor clear.
// Deterministic — identical on every load.

const FIELD = { minX: -60, maxX: 350, minY: -30, maxY: 130, minZ: -200, maxZ: 80 };

function curveSamples(): THREE.Vector3[] {
  return getFlightCurve().getPoints(80);
}

function clearsCorridor(
  point: THREE.Vector3,
  samples: THREE.Vector3[],
  clearance: number,
): boolean {
  for (const sample of samples) {
    if (point.distanceToSquared(sample) < clearance * clearance) {
      return false;
    }
  }
  return true;
}

export function buildCloudBlobs(seed = cloudFieldConfig.seed): CloudBlob[] {
  const rng = mulberry32(seed);
  const samples = curveSamples();
  const tint = new THREE.Color();
  const blobs: CloudBlob[] = [];

  for (let c = 0; c < cloudFieldConfig.cloudCount; c += 1) {
    const base = new THREE.Vector3();
    const trial: CloudBlob[] = [];
    let placed = false;
    for (let attempt = 0; attempt < 40 && !placed; attempt += 1) {
      base.set(
        FIELD.minX + rng() * (FIELD.maxX - FIELD.minX),
        FIELD.minY + rng() * (FIELD.maxY - FIELD.minY),
        FIELD.minZ + rng() * (FIELD.maxZ - FIELD.minZ),
      );
      if (!clearsCorridor(base, samples, cloudFieldConfig.corridorClearance)) {
        continue;
      }
      const blobCount =
        cloudFieldConfig.minBlobs +
        Math.floor(rng() * (cloudFieldConfig.maxBlobs - cloudFieldConfig.minBlobs + 1));
      trial.length = 0;
      const probe = new THREE.Vector3();
      let clear = true;
      for (let b = 0; b < blobCount && clear; b += 1) {
        const radius = 4 + rng() * 5;
        const position: Vec3Tuple = [
          base.x + (rng() - 0.5) * 22,
          base.y + (rng() - 0.5) * 7,
          base.z + (rng() - 0.5) * 16,
        ];
        probe.set(...position);
        clear = clearsCorridor(probe, samples, cloudFieldConfig.corridorClearance);
        tint.setHSL(0.6, 0.08 + rng() * 0.14, 0.8 + rng() * 0.14);
        trial.push({
          position,
          scale: [radius * (1.4 + rng() * 0.8), radius * 0.55, radius * (1.2 + rng() * 0.6)],
          tint: `#${tint.getHexString()}`,
        });
      }
      placed = clear;
    }
    if (placed) {
      blobs.push(...trial);
    }
  }
  return blobs;
}
