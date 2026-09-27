import * as THREE from 'three';
import { flightPathConfig } from '../config/scene';

// Cinematic flight route. getPointAt / getTangentAt are arc-length
// parameterized, so travel speed stays consistent regardless of how the
// control points are spaced. The curve instance is a module singleton built
// from configuration — reshape the journey in config/scene.ts.

let cachedCurve: THREE.CatmullRomCurve3 | null = null;

export function getFlightCurve(): THREE.CatmullRomCurve3 {
  if (!cachedCurve) {
    const points = flightPathConfig.controlPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    cachedCurve = new THREE.CatmullRomCurve3(
      points,
      flightPathConfig.closed,
      flightPathConfig.curveType,
      flightPathConfig.curveTension,
    );
    cachedCurve.arcLengthDivisions = 400;
  }
  return cachedCurve;
}

/** For tests only: reset the singleton so config changes take effect. */
export function resetFlightCurveForTests(): void {
  cachedCurve = null;
}
