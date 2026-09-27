import { describe, expect, it } from 'vitest';
import { EFFECTS_FOR_TIER, detectQualityEnvironment, resolveQualityTier } from './quality';

describe('resolveQualityTier', () => {
  it('honors explicit overrides', () => {
    const desktop = { coarsePointer: false, smallestViewportPx: 1440 };
    expect(resolveQualityTier('low', desktop)).toBe('low');
    expect(resolveQualityTier('medium', desktop)).toBe('medium');
    expect(resolveQualityTier('high', desktop)).toBe('high');
  });

  it('starts touch and small screens at medium, desktops at high', () => {
    expect(resolveQualityTier(null, { coarsePointer: true, smallestViewportPx: 1440 })).toBe(
      'medium',
    );
    expect(resolveQualityTier(null, { coarsePointer: false, smallestViewportPx: 390 })).toBe(
      'medium',
    );
    expect(resolveQualityTier(null, { coarsePointer: false, smallestViewportPx: 1440 })).toBe(
      'high',
    );
  });

  it('detects an environment without throwing (SSR-safe)', () => {
    expect(detectQualityEnvironment().smallestViewportPx).toBeGreaterThan(0);
  });
});

describe('EFFECTS_FOR_TIER', () => {
  it('scales cost down the ladder: bloom only on high, nothing on low', () => {
    expect(EFFECTS_FOR_TIER.high).toEqual({ bloom: true, vignette: true });
    expect(EFFECTS_FOR_TIER.medium).toEqual({ bloom: false, vignette: true });
    expect(EFFECTS_FOR_TIER.low).toEqual({ bloom: false, vignette: false });
  });
});
