// Numeric helpers for the normalized progress model (targetProgress /
// currentProgress in 0..1). Kept here so input handling, camera work, and
// typography timing all share one clamping implementation.

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}
