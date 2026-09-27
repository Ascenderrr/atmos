import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getFlightCurve } from './FlightPath';
import { createCameraRigState } from './cameraKinematics';
import { evaluateCameraRig } from './cameraKinematics';
import type { AircraftKinematicState } from './aircraftKinematics';
import type { ProgressStore } from '../animation/progressStore';

interface CameraRigProps {
  store: ProgressStore;
  kinematicState: AircraftKinematicState;
}

// Dedicated camera rig: never parented to the aircraft. Each frame it blends
// the section modes at the shared progress, damps toward the result, and aims
// at the look-ahead point. Priority 0 runs after the aircraft's -1, so the
// rig reads this frame's pose (a one-frame lag would be invisible anyway,
// both ends are damped).
export default function CameraRig({ store, kinematicState }: CameraRigProps) {
  const rigState = useMemo(() => createCameraRigState(), []);
  const curve = useMemo(() => getFlightCurve(), []);

  useFrame(({ camera }, rawDelta) => {
    const pose = evaluateCameraRig(
      curve,
      store.current,
      kinematicState.outPosition,
      kinematicState.outQuaternion,
      Math.min(rawDelta, 0.1),
      rigState,
    );
    camera.position.copy(pose.position);
    camera.lookAt(pose.lookAt);
    if (camera instanceof THREE.PerspectiveCamera) {
      const nextFov = Math.round(pose.fov * 100) / 100;
      if (Math.abs(camera.fov - nextFov) > 1e-4) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    }
  }, 0);

  return null;
}
