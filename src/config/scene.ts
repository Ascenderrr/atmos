// Scene configuration: flight path control points, curve behavior, aircraft
// tuning, and progress smoothing. Edit these values to reshape the journey —
// no component code changes needed. All angles in degrees, distances in
// world units, progress in 0..1.

export type Vec3Tuple = [number, number, number];

export interface FlightPathConfig {
  controlPoints: Vec3Tuple[];
  /** CatmullRom curve type. 'centripetal' avoids loops and overshoot. */
  curveType: 'centripetal' | 'chordal' | 'catmullrom';
  curveTension: number;
  closed: boolean;
}

export type AircraftForwardAxis = Vec3Tuple;

export interface AircraftConfig {
  /** 'placeholder' renders procedural geometry; 'gltf' loads a GLB (falls back on error). */
  mode: 'placeholder' | 'gltf';
  /** Local GLB path used only in 'gltf' mode. Optional asset — never blocks startup. */
  gltfUrl: string | null;
  aircraftScale: number;
  /** Model-space direction the craft's nose points along. Never assume +Z/-Z for imports. */
  forwardAxis: AircraftForwardAxis;
  /** Euler XYZ correction applied in model space to align imports. */
  modelRotationOffset: Vec3Tuple;
  maxBankAngle: number;
  /** Maps signed turn angle (radians per look-ahead step) to target bank. */
  bankGain: number;
  /** Exponential smoothing rates (per second). positionSmoothing 0 snaps to the path. */
  bankSmoothing: number;
  positionSmoothing: number;
  orientationSmoothing: number;
  /** Progress distance ahead used for tangent comparison and banking. */
  lookAheadDistance: number;
  /** Subtle deterministic idle motion (amplitude in units / radians). */
  idlePositionAmplitude: number;
  idleRollAmplitude: number;
  idleFrequency: number;
}

export const flightPathConfig: FlightPathConfig = {
  // Route starts near the foundation camera so the craft is framed before the
  // camera rig lands (Phase 5 follows the aircraft everywhere after that).
  controlPoints: [
    [0, 5, -8],
    [45, 23, -38],
    [85, 39, -78],
    [125, 27, -113],
    [165, 9, -128],
    [200, 17, -103],
    [235, 45, -73],
    [260, 67, -33],
    [290, 52, 12],
  ],
  curveType: 'centripetal',
  curveTension: 0.5,
  closed: false,
};

export const aircraftConfig: AircraftConfig = {
  mode: 'placeholder',
  gltfUrl: null,
  aircraftScale: 1,
  forwardAxis: [0, 0, 1],
  modelRotationOffset: [0, 0, 0],
  maxBankAngle: 28,
  bankGain: 2.2,
  bankSmoothing: 3.2,
  positionSmoothing: 8,
  orientationSmoothing: 5,
  lookAheadDistance: 0.012,
  idlePositionAmplitude: 0.08,
  idleRollAmplitude: 0.02,
  idleFrequency: 0.9,
};

/** Damping rate for currentProgress → targetProgress. */
export const progressSmoothing = 4.5;

export interface ProgressInputConfig {
  /** Wheel travel (px) for a full 0→1 journey. Trackpads work through the same mapping. */
  wheelPixelsForFullJourney: number;
  /** Per-event clamp (px): one accidental spike can never jump the journey. */
  maxWheelDeltaPx: number;
  keyboardStep: number;
  keyboardPageStep: number;
  /** Touch travel (px) for a full journey. */
  touchPixelsForFullJourney: number;
}

export const progressInputConfig: ProgressInputConfig = {
  wheelPixelsForFullJourney: 6000,
  maxWheelDeltaPx: 240,
  keyboardStep: 0.045,
  keyboardPageStep: 0.16,
  touchPixelsForFullJourney: 3000,
};

export type CameraMode = 'wide' | 'chase' | 'elevated' | 'side' | 'close' | 'finale';

export interface CameraModeConfig {
  /** Aircraft-local offset (nose = +Z): right, up, forward. */
  positionOffset: Vec3Tuple;
  /** World-space offset added to the look target. */
  lookAtOffset: Vec3Tuple;
  /** Distance ahead of the aircraft along the tangent that the camera anticipates. */
  lookAhead: number;
  fov: number;
  positionStrength: number;
  lookStrength: number;
  fovStrength: number;
  /** Blend half-width (progress units) shared with the neighboring mode. */
  transitionRange: number;
}

export const cameraModes: Record<CameraMode, CameraModeConfig> = {
  wide: {
    positionOffset: [0, 6, -20],
    lookAtOffset: [0, 1.5, 0],
    lookAhead: 14,
    fov: 60,
    positionStrength: 2.2,
    lookStrength: 3,
    fovStrength: 2.5,
    transitionRange: 0.05,
  },
  chase: {
    positionOffset: [0, 2.4, -8],
    lookAtOffset: [0, 1, 0],
    lookAhead: 12,
    fov: 55,
    positionStrength: 3,
    lookStrength: 4,
    fovStrength: 2.5,
    transitionRange: 0.04,
  },
  elevated: {
    positionOffset: [-6, 9, -12],
    lookAtOffset: [0, 1, 0],
    lookAhead: 10,
    fov: 55,
    positionStrength: 2.6,
    lookStrength: 3.5,
    fovStrength: 2.5,
    transitionRange: 0.04,
  },
  side: {
    positionOffset: [11, 1.2, -1],
    lookAtOffset: [0, 0.8, 0],
    lookAhead: 1.5,
    fov: 50,
    positionStrength: 2.6,
    lookStrength: 3.5,
    fovStrength: 2.5,
    transitionRange: 0.05,
  },
  close: {
    positionOffset: [3.2, 1.1, 4.5],
    lookAtOffset: [0, 0.4, 0],
    lookAhead: 1,
    fov: 58,
    positionStrength: 3.2,
    lookStrength: 4.5,
    fovStrength: 2.5,
    transitionRange: 0.04,
  },
  finale: {
    positionOffset: [0, 3, 14],
    lookAtOffset: [0, 1, 0],
    lookAhead: 10,
    fov: 52,
    positionStrength: 2.4,
    lookStrength: 3.2,
    fovStrength: 2.5,
    transitionRange: 0.06,
  },
};
