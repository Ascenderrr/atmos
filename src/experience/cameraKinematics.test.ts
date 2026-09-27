import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { cameraModes } from '../config/scene';
import { experienceSections, sectionAtProgress } from '../config/sections';
import { getFlightCurve } from './FlightPath';
import { createAircraftState, evaluateAircraft } from './aircraftKinematics';
import { aircraftConfig } from '../config/scene';
import { createCameraRigState, evaluateCameraRig, sectionBlendWeights } from './cameraKinematics';

const DT = 1 / 60;

function settledAircraftPose(progress: number) {
  const curve = getFlightCurve();
  const state = createAircraftState();
  let pose = evaluateAircraft(curve, progress, 0, 0, aircraftConfig, state);
  for (let i = 1; i <= 240; i += 1) {
    pose = evaluateAircraft(curve, progress, i * DT, DT, aircraftConfig, state);
  }
  return pose;
}

describe('sectionBlendWeights', () => {
  it('sums to 1 everywhere, including ends and boundaries', () => {
    const probes = [0, 1];
    for (const section of experienceSections) {
      probes.push(section.start, section.end, (section.start + section.end) / 2);
    }
    for (const p of probes) {
      const total = sectionBlendWeights(p).reduce((sum, w) => sum + w, 0);
      expect(total).toBeCloseTo(1, 6);
    }
  });

  it('hands over cleanly at boundaries', () => {
    const weights = sectionBlendWeights(0.1);
    const takeoff = experienceSections.findIndex((s) => s.id === 'takeoff');
    expect(weights[takeoff - 1]).toBeCloseTo(0.5, 2);
    expect(weights[takeoff]).toBeCloseTo(0.5, 2);
  });
});

describe('evaluateCameraRig', () => {
  it('moves continuously with no NaN and bounded fov across the route', () => {
    const curve = getFlightCurve();
    const rig = createCameraRigState();
    const prevPos = new THREE.Vector3();
    const prevLook = new THREE.Vector3();
    const fovs = Object.values(cameraModes).map((m) => m.fov);
    let maxPosStep = 0;
    let maxLookStep = 0;

    const steps = 160;
    for (let i = 0; i <= steps; i += 1) {
      const pose = settledAircraftPose(i / steps);
      const cam = evaluateCameraRig(curve, i / steps, pose.position, pose.quaternion, DT, rig);
      for (const v of [cam.position.x, cam.position.y, cam.position.z, cam.fov]) {
        expect(Number.isFinite(v)).toBe(true);
      }
      expect(cam.fov).toBeGreaterThanOrEqual(Math.min(...fovs) - 1);
      expect(cam.fov).toBeLessThanOrEqual(Math.max(...fovs) + 1);
      if (i > 0) {
        maxPosStep = Math.max(maxPosStep, prevPos.distanceTo(cam.position));
        maxLookStep = Math.max(maxLookStep, prevLook.distanceTo(cam.lookAt));
      }
      prevPos.copy(cam.position);
      prevLook.copy(cam.lookAt);
    }

    expect(maxPosStep).toBeLessThan(14);
    expect(maxLookStep).toBeLessThan(14);
  });

  it('reports the section mode away from boundaries', () => {
    const curve = getFlightCurve();
    const rig = createCameraRigState();
    for (const p of [0.05, 0.2, 0.35, 0.55, 0.73, 0.9]) {
      const pose = settledAircraftPose(p);
      const cam = evaluateCameraRig(curve, p, pose.position, pose.quaternion, 0, rig);
      expect(cam.activeMode).toBe(sectionAtProgress(p).cameraMode);
    }
  });

  it('snaps exactly on first evaluation', () => {
    const curve = getFlightCurve();
    const rig = createCameraRigState();
    const pose = settledAircraftPose(0.3);
    const first = evaluateCameraRig(curve, 0.3, pose.position, pose.quaternion, 0, rig);
    const second = evaluateCameraRig(curve, 0.3, pose.position, pose.quaternion, DT, rig);
    expect(second.position.distanceTo(first.position)).toBeLessThan(1e-6);
  });
});
