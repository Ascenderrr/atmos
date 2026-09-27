import { useEffect } from 'react';
import { setProgressTarget, type ProgressStore } from '../animation/progressStore';
import {
  keyToProgressAction,
  normalizeWheelDeltaPx,
  touchSwipeToProgress,
} from '../animation/scrollProgress';
import { progressInputConfig } from '../config/scene';
import { clamp } from '../utils/clamp';

// Funnels every input device into the shared progress store's target.
// The experience state machine gates `enabled` (Phase 10); until then the
// journey always listens. Listeners are native (non-passive where we must
// preventDefault) and fully cleaned up.
export function useScrollProgress(store: ProgressStore, enabled: boolean): void {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }
    const config = progressInputConfig;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const px = normalizeWheelDeltaPx(event.deltaY, event.deltaMode, window.innerHeight);
      const clamped = clamp(px, -config.maxWheelDeltaPx, config.maxWheelDeltaPx);
      setProgressTarget(store, store.target + clamped / config.wheelPixelsForFullJourney);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      const action = keyToProgressAction(event.key, config);
      if (!action) {
        return;
      }
      event.preventDefault();
      setProgressTarget(store, action.kind === 'set' ? action.value : store.target + action.value);
    };

    let lastTouchY: number | null = null;
    const onTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    };
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length !== 1 || lastTouchY === null) {
        return;
      }
      const y = event.touches[0].clientY;
      setProgressTarget(store, store.target + touchSwipeToProgress(lastTouchY, y, config));
      lastTouchY = y;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [store, enabled]);
}
