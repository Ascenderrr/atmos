import type { CameraMode } from './scene';

// Experience sections: the journey's editorial structure. Boundaries live ONLY
// here — never scattered across components. Titles are original placeholders.
// Phases 6+ consume copy, camera, atmosphere, and effects from this table.

export interface ExperienceSection {
  id: string;
  start: number;
  end: number;
  title: string;
  subtitle: string;
  cameraMode: CameraMode;
}

export const experienceSections: ExperienceSection[] = [
  {
    id: 'intro',
    start: 0.0,
    end: 0.1,
    title: 'Still Air',
    subtitle: 'The sky before the journey.',
    cameraMode: 'wide',
  },
  {
    id: 'takeoff',
    start: 0.1,
    end: 0.25,
    title: 'First Light',
    subtitle: 'Wheels leave the quiet earth.',
    cameraMode: 'chase',
  },
  {
    id: 'flight-1',
    start: 0.25,
    end: 0.45,
    title: 'Open Blue',
    subtitle: 'Nothing but distance ahead.',
    cameraMode: 'elevated',
  },
  {
    id: 'flight-2',
    start: 0.45,
    end: 0.65,
    title: 'Crosswind',
    subtitle: 'The route bends; the wings answer.',
    cameraMode: 'side',
  },
  {
    id: 'flight-3',
    start: 0.65,
    end: 0.82,
    title: 'Close Air',
    subtitle: 'Near enough to hear the wind.',
    cameraMode: 'close',
  },
  {
    id: 'ending',
    start: 0.82,
    end: 1.0,
    title: 'Meridian',
    subtitle: 'Arrival is a direction, not a place.',
    cameraMode: 'finale',
  },
];

/** Section containing the given normalized progress. */
export function sectionAtProgress(progress: number): ExperienceSection {
  const clamped = Math.min(Math.max(progress, 0), 1);
  for (const section of experienceSections) {
    if (clamped < section.end || section === experienceSections[experienceSections.length - 1]) {
      return section;
    }
  }
  return experienceSections[0];
}
