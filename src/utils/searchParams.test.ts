import { describe, expect, it } from 'vitest';
import { parseExperienceFlags } from './searchParams';

describe('parseExperienceFlags', () => {
  it('returns all-false defaults for an empty query', () => {
    expect(parseExperienceFlags('')).toEqual({
      forceFallback: false,
      reducedMotion: false,
      showPath: false,
      debug: false,
      quality: null,
    });
  });

  it('parses boolean switches', () => {
    const flags = parseExperienceFlags('?forceFallback=1&reducedMotion=true&showPath=on&debug=yes');
    expect(flags.forceFallback).toBe(true);
    expect(flags.reducedMotion).toBe(true);
    expect(flags.showPath).toBe(true);
    expect(flags.debug).toBe(true);
  });

  it('treats unknown quality values as no override', () => {
    expect(parseExperienceFlags('?quality=ultra').quality).toBeNull();
    expect(parseExperienceFlags('?quality=low').quality).toBe('low');
    expect(parseExperienceFlags('?quality=MEDIUM').quality).toBe('medium');
  });

  it('ignores unrelated parameters', () => {
    const flags = parseExperienceFlags('?foo=bar&debug=1');
    expect(flags.debug).toBe(true);
    expect(flags.forceFallback).toBe(false);
  });
});
