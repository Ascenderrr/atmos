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

/** Damping rate for currentProgress → targetProgress. Inputs arrive in Phase 4. */
export const progressSmoothing = 4.5;
