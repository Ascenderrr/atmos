// Single source of truth for cinematic progress. User input writes `target`
// (Phase 4); every frame `current` damps toward it and the whole scene
// evaluates from `current`. Mutable refs — never React state — because these
// values change every frame.

import { clamp01 } from '../utils/clamp';

export interface ProgressStore {
  target: number;
  current: number;
}

export function createProgressStore(initial = 0): ProgressStore {
  const clamped = clamp01(initial);
  return { target: clamped, current: clamped };
}

export function setProgressTarget(store: ProgressStore, value: number): void {
  store.target = clamp01(value);
}

/** Snap both ends of the model (replay/reset). The only writer besides damping. */
export function snapProgress(store: ProgressStore, value: number): void {
  const clamped = clamp01(value);
  store.target = clamped;
  store.current = clamped;
}

/** Advance `current` toward `target` with frame-rate-independent damping. */
export function updateProgress(
  store: ProgressStore,
  deltaTime: number,
  smoothingRate: number,
): void {
  if (deltaTime <= 0) {
    return;
  }
  const alpha = 1 - Math.exp(-smoothingRate * deltaTime);
  store.current += (store.target - store.current) * alpha;
  store.current = clamp01(store.current);
}
