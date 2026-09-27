import { describe, expect, it } from 'vitest';
import { progressInputConfig } from '../config/scene';
import {
  keyToProgressAction,
  normalizeWheelDeltaPx,
  touchSwipeToProgress,
  wheelDeltaToProgress,
} from './scrollProgress';

const cfg = progressInputConfig;

describe('normalizeWheelDeltaPx', () => {
  it('passes pixel deltas through', () => {
    expect(normalizeWheelDeltaPx(120, 0, 900)).toBe(120);
  });

  it('converts line deltas (Firefox-style) to pixels', () => {
    expect(normalizeWheelDeltaPx(3, 1, 900)).toBe(48);
  });

  it('converts page deltas to viewport pixels', () => {
    expect(normalizeWheelDeltaPx(1, 2, 900)).toBe(900);
  });
});

describe('wheelDeltaToProgress', () => {
  it('clamps each event but accumulates to a full journey over time', () => {
    const maxStep = cfg.maxWheelDeltaPx / cfg.wheelPixelsForFullJourney;
    expect(wheelDeltaToProgress(cfg.wheelPixelsForFullJourney, 0, 900, cfg)).toBeCloseTo(maxStep);
    expect(maxStep * 25).toBeCloseTo(1);
  });

  it('clamps a giant spike to the per-event maximum', () => {
    const maxStep = cfg.maxWheelDeltaPx / cfg.wheelPixelsForFullJourney;
    expect(wheelDeltaToProgress(100000, 0, 900, cfg)).toBeCloseTo(maxStep);
    expect(wheelDeltaToProgress(-100000, 0, 900, cfg)).toBeCloseTo(-maxStep);
  });

  it('keeps backward scrolling negative', () => {
    expect(wheelDeltaToProgress(-120, 0, 900, cfg)).toBeLessThan(0);
  });
});

describe('keyToProgressAction', () => {
  it('maps arrows, pages, Home, and End', () => {
    expect(keyToProgressAction('ArrowDown', cfg)).toEqual({
      kind: 'delta',
      value: cfg.keyboardStep,
    });
    expect(keyToProgressAction('ArrowUp', cfg)).toEqual({
      kind: 'delta',
      value: -cfg.keyboardStep,
    });
    expect(keyToProgressAction('PageDown', cfg)).toEqual({
      kind: 'delta',
      value: cfg.keyboardPageStep,
    });
    expect(keyToProgressAction('Home', cfg)).toEqual({ kind: 'set', value: 0 });
    expect(keyToProgressAction('End', cfg)).toEqual({ kind: 'set', value: 1 });
  });

  it('ignores unhandled keys', () => {
    expect(keyToProgressAction('a', cfg)).toBeNull();
    expect(keyToProgressAction('Tab', cfg)).toBeNull();
  });
});

describe('touchSwipeToProgress', () => {
  it('moves forward on swipe-up and clamps flicks', () => {
    expect(touchSwipeToProgress(500, 400, cfg)).toBeCloseTo(100 / cfg.touchPixelsForFullJourney);
    expect(touchSwipeToProgress(400, 500, cfg)).toBeLessThan(0);
    const maxStep = cfg.maxWheelDeltaPx / cfg.touchPixelsForFullJourney;
    expect(touchSwipeToProgress(2000, 0, cfg)).toBeCloseTo(maxStep);
  });
});
