import { describe, expect, it } from 'vitest';
import { evaluateTypography, missingTypographyTimings, typographyTimings } from './typography';

describe('typography timing', () => {
  it('covers every section', () => {
    expect(missingTypographyTimings()).toEqual([]);
  });

  it('hides before, shows during, hides after a middle chapter', () => {
    const timing = typographyTimings['flight-2'];
    expect(evaluateTypography(timing, 0.4).opacity).toBe(0);
    expect(evaluateTypography(timing, 0.57).opacity).toBeCloseTo(1);
    expect(evaluateTypography(timing, 0.7).opacity).toBe(0);
  });

  it('keeps the ending visible once entered', () => {
    const timing = typographyTimings['ending'];
    expect(evaluateTypography(timing, 0.8).opacity).toBe(0);
    expect(evaluateTypography(timing, 0.95).opacity).toBeCloseTo(1);
    expect(evaluateTypography(timing, 1).opacity).toBeCloseTo(1);
  });

  it('rises monotonically through the entrance', () => {
    const timing = typographyTimings['takeoff'];
    let last = -1;
    for (let p = timing.enterStart; p <= timing.enterEnd + 1e-9; p += 0.005) {
      const rise = evaluateTypography(timing, p).rise;
      expect(rise).toBeGreaterThanOrEqual(last);
      last = rise;
    }
    expect(last).toBeCloseTo(1);
  });
});
