import { describe, expect, it } from 'vitest';
import { experienceSections, sectionAtProgress } from './sections';

describe('experienceSections', () => {
  it('tiles 0..1 with no gaps or overlaps', () => {
    expect(experienceSections[0].start).toBe(0);
    expect(experienceSections[experienceSections.length - 1].end).toBe(1);
    for (let i = 1; i < experienceSections.length; i += 1) {
      expect(experienceSections[i].start).toBe(experienceSections[i - 1].end);
    }
  });

  it('resolves the containing section at boundaries', () => {
    expect(sectionAtProgress(0).id).toBe('intro');
    expect(sectionAtProgress(0.1).id).toBe('takeoff');
    expect(sectionAtProgress(0.5).id).toBe('flight-2');
    expect(sectionAtProgress(1).id).toBe('ending');
  });
});
