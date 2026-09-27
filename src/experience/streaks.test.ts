import { describe, expect, it } from 'vitest';
import { streakFieldConfig } from '../config/scene';
import { streakOpacityForVelocity } from './streaks';

describe('streakOpacityForVelocity', () => {
  it('is invisible at rest and grows with speed', () => {
    expect(streakOpacityForVelocity(0)).toBe(0);
    expect(streakOpacityForVelocity(-3)).toBe(0);
    const gentle = streakOpacityForVelocity(0.5);
    const fast = streakOpacityForVelocity(3);
    expect(gentle).toBeGreaterThan(0);
    expect(fast).toBeGreaterThan(gentle);
  });

  it('caps at the configured maximum', () => {
    expect(streakOpacityForVelocity(100)).toBe(streakFieldConfig.maxOpacity);
    expect(streakOpacityForVelocity(100)).toBeLessThanOrEqual(0.6);
  });
});
