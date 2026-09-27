import * as THREE from 'three';
import { cameraModes, type CameraMode } from '../config/scene';
import { experienceSections } from '../config/sections';
import { clamp01 } from '../utils/clamp';

// Progress-driven camera blending. Every section's mode proposes a desired
// pose; smooth window weights (normalized, so they always sum to 1) blend
// them, and the result is exponentially damped. No snapping at boundaries,
// no roll (up stays +Y via lookAt). Pure and allocation-free per call.

export interface CameraRigState {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
  initialized: boolean;
}

export function createCameraRigState(): CameraRigState {
  return {
    position: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    fov: 55,
    initialized: false,
  };
}

export interface CameraRigPose {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
  activeMode: CameraMode;
}

const _tangent = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();
const _desiredLook = new THREE.Vector3();
const _blendedPos = new THREE.Vector3();
const _blendedLook = new THREE.Vector3();

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function dampRate(rate: number, deltaTime: number): number {
  if (rate <= 0 || deltaTime <= 0) {
    return 1;
  }
  return 1 - Math.exp(-rate * deltaTime);
}

/** Blend weight of one section's mode: smooth rise at `start`, smooth fall at `end`. */
export function sectionWindowWeight(
  start: number,
  end: number,
  riseTransition: number,
  fallTransition: number,
  progress: number,
): number {
  let rise: number;
  if (riseTransition <= 0) {
    rise = progress >= start ? 1 : 0;
  } else {
    rise = smoothstep(start - riseTransition, start + riseTransition, progress);
  }
  let fall: number;
  if (fallTransition <= 0) {
    fall = progress <= end ? 1 : 0;
  } else {
    fall = 1 - smoothstep(end - fallTransition, end + fallTransition, progress);
  }
  return rise * fall;
}

/** Per-section blend weights at a progress, using neighbor-averaged transitions. */
export function sectionBlendWeights(progress: number): number[] {
  const p = clamp01(progress);
  return experienceSections.map((section, i) => {
    const mode = cameraModes[section.cameraMode];
    const prev = experienceSections[i - 1];
    const next = experienceSections[i + 1];
    const riseT = prev
      ? (mode.transitionRange + cameraModes[prev.cameraMode].transitionRange) / 2
      : 0;
    const fallT = next
      ? (mode.transitionRange + cameraModes[next.cameraMode].transitionRange) / 2
      : 0;
    return sectionWindowWeight(section.start, section.end, riseT, fallT, p);
  });
}

export function evaluateCameraRig(
  curve: THREE.Curve<THREE.Vector3>,
  progress: number,
  aircraftPosition: THREE.Vector3,
  aircraftQuaternion: THREE.Quaternion,
  deltaTime: number,
  state: CameraRigState,
): CameraRigPose {
  const p = clamp01(progress);
  curve.getTangentAt(p, _tangent);

  _blendedPos.set(0, 0, 0);
  _blendedLook.set(0, 0, 0);
  let blendedFov = 0;
  let blendedPosStrength = 0;
  let blendedLookStrength = 0;
  let blendedFovStrength = 0;
  let totalWeight = 0;
  let activeMode: CameraMode = experienceSections[0].cameraMode;
  let bestWeight = -1;
  const weights = sectionBlendWeights(p);

  for (let i = 0; i < experienceSections.length; i += 1) {
    const section = experienceSections[i];
    const mode = cameraModes[section.cameraMode];
    const weight = weights[i];
    if (weight > bestWeight) {
      bestWeight = weight;
      activeMode = section.cameraMode;
    }
    if (weight <= 0) {
      continue;
    }

    _offset.set(...mode.positionOffset).applyQuaternion(aircraftQuaternion);
    _desiredPos.copy(aircraftPosition).add(_offset);
    _desiredLook
      .copy(aircraftPosition)
      .addScaledVector(_tangent, mode.lookAhead)
      .add(_offset.set(...mode.lookAtOffset));

    _blendedPos.addScaledVector(_desiredPos, weight);
    _blendedLook.addScaledVector(_desiredLook, weight);
    blendedFov += mode.fov * weight;
    blendedPosStrength += mode.positionStrength * weight;
    blendedLookStrength += mode.lookStrength * weight;
    blendedFovStrength += mode.fovStrength * weight;
    totalWeight += weight;
  }

  if (totalWeight > 0) {
    _blendedPos.divideScalar(totalWeight);
    _blendedLook.divideScalar(totalWeight);
    blendedFov /= totalWeight;
    blendedPosStrength /= totalWeight;
    blendedLookStrength /= totalWeight;
    blendedFovStrength /= totalWeight;
  }

  if (!state.initialized || deltaTime <= 0) {
    state.position.copy(_blendedPos);
    state.lookAt.copy(_blendedLook);
    state.fov = blendedFov;
    state.initialized = true;
  } else {
    state.position.lerp(_blendedPos, dampRate(blendedPosStrength, deltaTime));
    state.lookAt.lerp(_blendedLook, dampRate(blendedLookStrength, deltaTime));
    state.fov += (blendedFov - state.fov) * dampRate(blendedFovStrength, deltaTime);
  }

  return { position: state.position, lookAt: state.lookAt, fov: state.fov, activeMode };
}
