import { describe, expect, it } from 'vitest';
import { createProgressStore, setProgressTarget, updateProgress } from './progressStore';

describe('progressStore', () => {
  it('starts clamped at the initial value', () => {
    expect(createProgressStore(1.4)).toEqual({ target: 1, current: 1 });
    expect(createProgressStore(-0.2)).toEqual({ target: 0, current: 0 });
  });

  it('clamps targets to 0..1', () => {
    const store = createProgressStore();
    setProgressTarget(store, 3);
    expect(store.target).toBe(1);
    setProgressTarget(store, -1);
    expect(store.target).toBe(0);
  });

  it('converges current toward target and never overshoots', () => {
    const store = createProgressStore();
    setProgressTarget(store, 1);
    for (let i = 0; i < 600; i += 1) {
      updateProgress(store, 1 / 60, 4.5);
      expect(store.current).toBeGreaterThanOrEqual(0);
      expect(store.current).toBeLessThanOrEqual(1);
    }
    expect(store.current).toBeCloseTo(1, 3);
  });

  it('ignores non-positive deltas (background-tab jump protection)', () => {
    const store = createProgressStore(0.2);
    setProgressTarget(store, 0.9);
    updateProgress(store, 0, 4.5);
    updateProgress(store, -5, 4.5);
    expect(store.current).toBe(0.2);
  });
});
