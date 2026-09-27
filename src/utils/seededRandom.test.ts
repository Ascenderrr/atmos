import { describe, expect, it } from 'vitest';
import { mulberry32 } from './seededRandom';

describe('mulberry32', () => {
  it('reproduces the same sequence for a seed', () => {
    const a = mulberry32(1337);
    const b = mulberry32(1337);
    for (let i = 0; i < 50; i += 1) {
      expect(a()).toBe(b());
    }
  });

  it('stays in [0, 1) and differs across seeds', () => {
    const rng = mulberry32(7);
    let varied = false;
    let prev = rng();
    for (let i = 0; i < 50; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      varied = varied || value !== prev;
      prev = value;
    }
    expect(varied).toBe(true);
    expect(mulberry32(7)()).not.toBe(mulberry32(8)());
  });
});
