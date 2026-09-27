import * as THREE from 'three';
import { atmosphereKeyframes } from '../config/scene';
import { clamp01 } from '../utils/clamp';

// Progress → atmosphere sample. Blends the keyframe table with smoothstep
// easing; written into a caller-owned sample (no per-frame allocation).

export interface AtmosphereSample {
  skyTop: THREE.Color;
  skyHorizon: THREE.Color;
  skyBottom: THREE.Color;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  cloudTint: THREE.Color;
  stars: number;
}

export function createAtmosphereSample(): AtmosphereSample {
  return {
    skyTop: new THREE.Color(),
    skyHorizon: new THREE.Color(),
    skyBottom: new THREE.Color(),
    fogColor: new THREE.Color(),
    fogNear: 80,
    fogFar: 800,
    sunColor: new THREE.Color(),
    sunIntensity: 1,
    hemiSky: new THREE.Color(),
    hemiGround: new THREE.Color(),
    hemiIntensity: 1,
    cloudTint: new THREE.Color(),
    stars: 0,
  };
}

const _a = new THREE.Color();
const _b = new THREE.Color();

function blendColorHex(out: THREE.Color, from: string, to: string, t: number): void {
  _a.set(from);
  if (t <= 0) {
    out.copy(_a);
    return;
  }
  _b.set(to);
  if (t >= 1) {
    out.copy(_b);
    return;
  }
  out.copy(_a).lerp(_b, t);
}

function blendNumber(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function evaluateAtmosphere(progress: number, out: AtmosphereSample): AtmosphereSample {
  const p = clamp01(progress);
  const frames = atmosphereKeyframes;
  let lower = frames[0];
  let upper = frames[frames.length - 1];
  for (let i = 0; i < frames.length - 1; i += 1) {
    if (p >= frames[i].progress && p <= frames[i + 1].progress) {
      lower = frames[i];
      upper = frames[i + 1];
      break;
    }
  }
  const span = upper.progress - lower.progress;
  const raw = span <= 0 ? 0 : (p - lower.progress) / span;
  const t = raw * raw * (3 - 2 * raw);

  blendColorHex(out.skyTop, lower.skyTop, upper.skyTop, t);
  blendColorHex(out.skyHorizon, lower.skyHorizon, upper.skyHorizon, t);
  blendColorHex(out.skyBottom, lower.skyBottom, upper.skyBottom, t);
  blendColorHex(out.fogColor, lower.fogColor, upper.fogColor, t);
  blendColorHex(out.sunColor, lower.sunColor, upper.sunColor, t);
  blendColorHex(out.hemiSky, lower.hemiSky, upper.hemiSky, t);
  blendColorHex(out.hemiGround, lower.hemiGround, upper.hemiGround, t);
  blendColorHex(out.cloudTint, lower.cloudTint, upper.cloudTint, t);
  out.fogNear = blendNumber(lower.fogNear, upper.fogNear, t);
  out.fogFar = blendNumber(lower.fogFar, upper.fogFar, t);
  out.sunIntensity = blendNumber(lower.sunIntensity, upper.sunIntensity, t);
  out.hemiIntensity = blendNumber(lower.hemiIntensity, upper.hemiIntensity, t);
  out.stars = blendNumber(lower.stars, upper.stars, t);
  return out;
}
