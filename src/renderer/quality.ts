import type { QualityOverride } from '../utils/searchParams';

export type QualityTier = 'high' | 'medium' | 'low';

export interface QualityEnvironment {
  coarsePointer: boolean;
  smallestViewportPx: number;
}

export function detectQualityEnvironment(): QualityEnvironment {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
    return { coarsePointer: false, smallestViewportPx: 1440 };
  }
  return {
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    smallestViewportPx: Math.min(window.innerWidth, window.innerHeight),
  };
}

/** Explicit ?quality= wins; touch/small screens start at medium; desktops at high. */
export function resolveQualityTier(
  override: QualityOverride | null,
  env: QualityEnvironment,
): QualityTier {
  if (override === 'low' || override === 'medium' || override === 'high') {
    return override;
  }
  if (env.coarsePointer || env.smallestViewportPx < 700) {
    return 'medium';
  }
  return 'high';
}

export interface TierEffects {
  bloom: boolean;
  vignette: boolean;
}

/**
 * Effect selection per tier — the documented visual purpose of each effect:
 * - bloom: sun-disc and bright-cloud glow (lowlights the light source)
 * - vignette: cinematic frame focus (cheap single pass)
 * LOW skips the composer entirely (direct render, fastest path).
 */
export const EFFECTS_FOR_TIER: Record<QualityTier, TierEffects> = {
  high: { bloom: true, vignette: true },
  medium: { bloom: false, vignette: true },
  low: { bloom: false, vignette: false },
};
