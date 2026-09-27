import { experienceSections } from './sections';

// Per-section typography timing (normalized progress). Explicit values beat
// derivation magic: each window is readable and tunable in one place.
// `exitStart >= exitEnd` means the chapter never exits (the ending stays).

export interface TypographyTiming {
  enterStart: number;
  enterEnd: number;
  exitStart: number;
  exitEnd: number;
  /** Vertical rise distance (px) for the DOM entrance. */
  risePx: number;
}

export const typographyTimings: Record<string, TypographyTiming> = {
  intro: { enterStart: -0.02, enterEnd: 0.03, exitStart: 0.07, exitEnd: 0.095, risePx: 48 },
  takeoff: { enterStart: 0.12, enterEnd: 0.17, exitStart: 0.21, exitEnd: 0.24, risePx: 48 },
  'flight-1': { enterStart: 0.28, enterEnd: 0.34, exitStart: 0.4, exitEnd: 0.44, risePx: 48 },
  'flight-2': { enterStart: 0.48, enterEnd: 0.54, exitStart: 0.6, exitEnd: 0.64, risePx: 48 },
  'flight-3': { enterStart: 0.67, enterEnd: 0.72, exitStart: 0.78, exitEnd: 0.81, risePx: 48 },
  ending: { enterStart: 0.85, enterEnd: 0.9, exitStart: 1, exitEnd: 1, risePx: 48 },
};

function smooth01(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) {
    return x >= edge1 ? 1 : 0;
  }
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

export interface TypographyState {
  /** 0 = hidden, 1 = fully present. */
  opacity: number;
  /** 0 = lowered by risePx, 1 = at rest. */
  rise: number;
}

/** Shared by the DOM chapters and the decorative 3D titles. */
export function evaluateTypography(timing: TypographyTiming, progress: number): TypographyState {
  const enter = smooth01(timing.enterStart, timing.enterEnd, progress);
  const exit =
    timing.exitStart >= timing.exitEnd
      ? 1
      : 1 - smooth01(timing.exitStart, timing.exitEnd, progress);
  return { opacity: enter * exit, rise: enter };
}

/** Every section must have a timing entry. */
export function missingTypographyTimings(): string[] {
  return experienceSections.map((s) => s.id).filter((id) => !(id in typographyTimings));
}
