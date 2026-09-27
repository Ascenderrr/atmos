import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { aircraftConfig } from '../config/scene';
import { getFlightCurve } from './FlightPath';
import {
  createAircraftState,
  evaluateAircraft,
  type AircraftKinematicState,
} from './aircraftKinematics';

const DT = 1 / 60;

function settle(curve: THREE.Curve<THREE.Vector3>, progress: number, steps = 600) {
  const state = createAircraftState();
  for (let i = 0; i < steps; i += 1) {
    evaluateAircraft(curve, progress, i * DT, DT, aircraftConfig, state);
  }
  return state;
}

function hasNaN(state: AircraftKinematicState): boolean {
  const { position, quaternion } = state;
  return (
    !Number.isFinite(position.x + position.y + position.z) ||
    !Number.isFinite(quaternion.x + quaternion.y + quaternion.z + quaternion.w)
  );
}

describe('aircraft kinematics along the flight path', () => {
  it('travels continuously with no flips or NaN across the whole route', () => {
    const curve = getFlightCurve();
    const state = createAircraftState();
    const prevQuat = new THREE.Quaternion();
    const prevPos = new THREE.Vector3();
    let maxStep = 0;
    let minDot = 1;

    const steps = 240;
    for (let i = 0; i <= steps; i += 1) {
      const pose = evaluateAircraft(curve, i / steps, i * DT, DT, aircraftConfig, state);
      expect(hasNaN(state)).toBe(false);
      if (i > 0) {
        minDot = Math.min(minDot, prevQuat.dot(pose.quaternion));
        maxStep = Math.max(maxStep, prevPos.distanceTo(pose.position));
      }
      prevQuat.copy(pose.quaternion);
      prevPos.copy(pose.position);
    }

    // Consecutive orientations stay nearly identical: no 180° flips.
    expect(minDot).toBeGreaterThan(0.9995);
    // Position advances in small bounded steps (path ≈500 units over 240 steps).
    expect(maxStep).toBeLessThan(12);
  });

  it('keeps bank within the configured maximum', () => {
    const curve = getFlightCurve();
    const state = createAircraftState();
    const maxBank = THREE.MathUtils.degToRad(aircraftConfig.maxBankAngle);
    for (let i = 0; i <= 240; i += 1) {
      const pose = evaluateAircraft(curve, i / 240, i * DT, DT, aircraftConfig, state);
      expect(Math.abs(pose.bank)).toBeLessThanOrEqual(maxBank + 1e-6);
    }
  });

  it('points the model nose along the path tangent', () => {
    const curve = getFlightCurve();
    const nose = new THREE.Vector3(...aircraftConfig.forwardAxis).normalize();
    const tangent = new THREE.Vector3();
    for (const p of [0.05, 0.3, 0.55, 0.8, 0.97]) {
      const state = settle(curve, p);
      curve.getTangentAt(p, tangent);
      const facing = nose.clone().applyQuaternion(state.quaternion);
      // Idle roll perturbs exact alignment slightly; direction must still match.
      expect(facing.dot(tangent)).toBeGreaterThan(0.999);
    }
  });

  it('honors a flipped forward axis without code changes', () => {
    const curve = getFlightCurve();
    const flipped = { ...aircraftConfig, forwardAxis: [0, 0, -1] as [number, number, number] };
    const state = createAircraftState();
    for (let i = 0; i < 600; i += 1) {
      evaluateAircraft(curve, 0.4, i * DT, DT, flipped, state);
    }
    const tangent = curve.getTangentAt(0.4, new THREE.Vector3());
    const facing = new THREE.Vector3(0, 0, -1).applyQuaternion(state.quaternion);
    expect(facing.dot(tangent)).toBeGreaterThan(0.999);
  });

  it('applies the model rotation offset (180° yaw reverses the nose)', () => {
    const curve = getFlightCurve();
    const turned = {
      ...aircraftConfig,
      modelRotationOffset: [0, 180, 0] as [number, number, number],
    };
    const state = createAircraftState();
    for (let i = 0; i < 600; i += 1) {
      evaluateAircraft(curve, 0.4, i * DT, DT, turned, state);
    }
    const tangent = curve.getTangentAt(0.4, new THREE.Vector3());
    const facing = new THREE.Vector3(0, 0, 1).applyQuaternion(state.quaternion);
    expect(facing.dot(tangent)).toBeLessThan(-0.999);
  });

  it('survives a near-vertical path without NaN or flips', () => {
    const vertical = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 10, 0),
      new THREE.Vector3(0, 20, 0),
    ]);
    const state = createAircraftState();
    const prevQuat = new THREE.Quaternion();
    let minDot = 1;
    for (let i = 0; i <= 120; i += 1) {
      const pose = evaluateAircraft(vertical, i / 120, i * DT, DT, aircraftConfig, state);
      expect(hasNaN(state)).toBe(false);
      if (i > 0) {
        minDot = Math.min(minDot, Math.abs(prevQuat.dot(pose.quaternion)));
      }
      prevQuat.copy(pose.quaternion);
    }
    expect(minDot).toBeGreaterThan(0.999);
  });
});
