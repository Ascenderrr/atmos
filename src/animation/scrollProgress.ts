import { clamp } from '../utils/clamp';
import type { ProgressInputConfig } from '../config/scene';

// Pure input→progress converters. All device quirks (wheel delta modes,
// runaway spikes, key maps) are normalized here so the hook stays thin and
// every mapping is unit-testable without a browser.

export const LINE_HEIGHT_PX = 16;

/** Convert a wheel delta to pixels, honoring deltaMode (pixel/line/page). */
export function normalizeWheelDeltaPx(
  deltaY: number,
  deltaMode: number,
  viewportHeight: number,
): number {
  if (deltaMode === 1) {
    return deltaY * LINE_HEIGHT_PX;
  }
  if (deltaMode === 2) {
    return deltaY * viewportHeight;
  }
  return deltaY;
}

/** Wheel pixels → clamped progress delta. Positive scrolls the journey forward. */
export function wheelDeltaToProgress(
  deltaY: number,
  deltaMode: number,
  viewportHeight: number,
  config: ProgressInputConfig,
): number {
  const px = clamp(
    normalizeWheelDeltaPx(deltaY, deltaMode, viewportHeight),
    -config.maxWheelDeltaPx,
    config.maxWheelDeltaPx,
  );
  return px / config.wheelPixelsForFullJourney;
}

export type KeyAction = { kind: 'delta'; value: number } | { kind: 'set'; value: number };

/** Keyboard key → progress action. Unknown keys return null (unhandled). */
export function keyToProgressAction(key: string, config: ProgressInputConfig): KeyAction | null {
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return { kind: 'delta', value: config.keyboardStep };
    case 'ArrowUp':
    case 'ArrowLeft':
      return { kind: 'delta', value: -config.keyboardStep };
    case 'PageDown':
      return { kind: 'delta', value: config.keyboardPageStep };
    case 'PageUp':
      return { kind: 'delta', value: -config.keyboardPageStep };
    case 'Home':
      return { kind: 'set', value: 0 };
    case 'End':
      return { kind: 'set', value: 1 };
    default:
      return null;
  }
}

/** Touch swipe (px, lastY − y so swipe-up travels forward) → progress delta. */
export function touchSwipeToProgress(
  lastY: number,
  y: number,
  config: ProgressInputConfig,
): number {
  const px = clamp(lastY - y, -config.maxWheelDeltaPx, config.maxWheelDeltaPx);
  return px / config.touchPixelsForFullJourney;
}
