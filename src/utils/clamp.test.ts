import { describe, expect, it } from 'vitest';
import { clamp, clamp01 } from './clamp';

describe('clamp', () => {
  it('returns values inside the range unchanged', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('clamps values below the range to min', () => {
    expect(clamp(-3, 0, 1)).toBe(0);
  });

  it('clamps values above the range to max', () => {
    expect(clamp(42, 0, 1)).toBe(1);
  });

  it('treats boundaries as inclusive', () => {
    expect(clamp(0, 0, 1)).toBe(0);
    expect(clamp(1, 0, 1)).toBe(1);
  });
});

describe('clamp01', () => {
  it('constrains progress values to 0..1', () => {
    expect(clamp01(-0.2)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(1.7)).toBe(1);
  });
});
