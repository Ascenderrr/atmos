// Deterministic debug/test query parameters. Parsed once per page load from
// `window.location.search`. Testing-only switches, never production UI.
import { clamp01 } from './clamp';

export type QualityOverride = 'low' | 'medium' | 'high';

export interface ExperienceFlags {
  forceFallback: boolean;
  reducedMotion: boolean;
  showPath: boolean;
  debug: boolean;
  quality: QualityOverride | null;
  /** Deterministic test-only progress override (0..1). Never production UI. */
  progress: number | null;
}

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

function isTruthy(value: string | null): boolean {
  return value !== null && TRUTHY.has(value.toLowerCase());
}

export function parseExperienceFlags(search: string): ExperienceFlags {
  const params = new URLSearchParams(search);
  const qualityRaw = params.get('quality')?.toLowerCase();
  const quality: QualityOverride | null =
    qualityRaw === 'low' || qualityRaw === 'medium' || qualityRaw === 'high' ? qualityRaw : null;
  const progressRaw = params.get('progress');
  const progressValue = progressRaw === null ? NaN : Number(progressRaw);
  return {
    forceFallback: isTruthy(params.get('forceFallback')),
    reducedMotion: isTruthy(params.get('reducedMotion')),
    showPath: isTruthy(params.get('showPath')),
    debug: isTruthy(params.get('debug')),
    quality,
    progress: Number.isFinite(progressValue) ? clamp01(progressValue) : null,
  };
}

export function getExperienceFlags(): ExperienceFlags {
  if (typeof window === 'undefined') {
    return {
      forceFallback: false,
      reducedMotion: false,
      showPath: false,
      debug: false,
      quality: null,
      progress: null,
    };
  }
  return parseExperienceFlags(window.location.search);
}
