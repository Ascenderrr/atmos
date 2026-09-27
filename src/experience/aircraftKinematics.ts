import * as THREE from 'three';
import type { AircraftConfig } from '../config/scene';
import { clamp, clamp01 } from '../utils/clamp';

// Pure aircraft kinematics: position, orientation, and banking are derived
// from the spline at a normalized progress. No React, no allocation per call
// (module scratch only) — safe to run every frame and fully unit-testable.

export interface AircraftKinematicState {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  bank: number;
  lastStableUp: THREE.Vector3;
  outPosition: THREE.Vector3;
  outQuaternion: THREE.Quaternion;
  initialized: boolean;
}

export function createAircraftState(): AircraftKinematicState {
  return {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    bank: 0,
    lastStableUp: new THREE.Vector3(0, 1, 0),
    outPosition: new THREE.Vector3(),
    outQuaternion: new THREE.Quaternion(),
    initialized: false,
  };
}

export interface AircraftPose {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  bank: number;
}

const WORLD_Y = new THREE.Vector3(0, 1, 0);
const _targetPos = new THREE.Vector3();
const _t0 = new THREE.Vector3();
const _t1 = new THREE.Vector3();
const _modelForward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _trueUp = new THREE.Vector3();
const _cross = new THREE.Vector3();
const _offsetEuler = new THREE.Euler();
const _qAlign = new THREE.Quaternion();
const _qOffset = new THREE.Quaternion();
const _qRoll = new THREE.Quaternion();
const _qTarget = new THREE.Quaternion();

function smoothingAlpha(rate: number, deltaTime: number): number {
  if (rate <= 0 || deltaTime <= 0) {
    return 1;
  }
  return 1 - Math.exp(-rate * deltaTime);
}

export function evaluateAircraft(
  curve: THREE.Curve<THREE.Vector3>,
  progress: number,
  time: number,
  deltaTime: number,
  config: AircraftConfig,
  state: AircraftKinematicState,
): AircraftPose {
  const p = clamp01(progress);

  curve.getPointAt(p, _targetPos);
  curve.getTangentAt(p, _t0);
  curve.getTangentAt(Math.min(p + config.lookAheadDistance, 1), _t1);

  // Roll reference: world up, or the last stable up when the tangent is
  // near-vertical (avoids flips and jitter on steep path segments).
  const stable = Math.abs(_t0.y) < 0.999;
  const upRef = stable ? WORLD_Y : state.lastStableUp;
  if (stable) {
    state.lastStableUp.copy(WORLD_Y);
  }

  // Signed turn angle around the up reference → bank into the turn.
  _cross.crossVectors(_t0, _t1);
  const sinAngle = _cross.dot(upRef);
  const cosAngle = clamp(_t0.dot(_t1), -1, 1);
  const signedAngle = Math.atan2(sinAngle, cosAngle);
  const maxBank = THREE.MathUtils.degToRad(config.maxBankAngle);
  const bankTarget = clamp(signedAngle * config.bankGain, -maxBank, maxBank);

  const snap = !state.initialized || deltaTime <= 0;
  state.bank += (bankTarget - state.bank) * smoothingAlpha(config.bankSmoothing, deltaTime);
  if (snap) {
    state.bank = bankTarget;
    state.position.copy(_targetPos);
  } else {
    state.position.lerp(_targetPos, smoothingAlpha(config.positionSmoothing, deltaTime));
  }

  // Align the configurable model forward axis to the path tangent, apply the
  // model-space orientation correction, then roll about the tangent.
  _modelForward.set(...config.forwardAxis);
  if (_modelForward.lengthSq() < 1e-8) {
    _modelForward.set(0, 0, 1);
  }
  _modelForward.normalize();
  _qAlign.setFromUnitVectors(_modelForward, _t0);
  _offsetEuler.set(
    THREE.MathUtils.degToRad(config.modelRotationOffset[0]),
    THREE.MathUtils.degToRad(config.modelRotationOffset[1]),
    THREE.MathUtils.degToRad(config.modelRotationOffset[2]),
  );
  _qOffset.setFromEuler(_offsetEuler);
  _qTarget.copy(_qAlign).multiply(_qOffset);

  const renderedBank =
    state.bank + config.idleRollAmplitude * Math.sin(time * config.idleFrequency * 1.31 + 1.0);
  _qRoll.setFromAxisAngle(_t0, renderedBank);
  _qTarget.premultiply(_qRoll);

  if (snap) {
    state.quaternion.copy(_qTarget);
  } else {
    state.quaternion.slerp(_qTarget, smoothingAlpha(config.orientationSmoothing, deltaTime));
  }

  // Deterministic low-amplitude idle bob along the true up, applied after
  // smoothing so it never fights the path follow.
  _right.crossVectors(_t0, upRef);
  if (_right.lengthSq() < 1e-8) {
    _right.set(1, 0, 0);
  } else {
    _right.normalize();
  }
  _trueUp.crossVectors(_right, _t0).normalize();
  state.outPosition
    .copy(state.position)
    .addScaledVector(_trueUp, config.idlePositionAmplitude * Math.sin(time * config.idleFrequency));
  state.outQuaternion.copy(state.quaternion);
  state.initialized = true;

  return { position: state.outPosition, quaternion: state.outQuaternion, bank: state.bank };
}
