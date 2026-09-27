import { useEffect, useRef } from 'react';
import { experienceSections } from '../config/sections';
import { evaluateTypography, typographyTimings } from '../config/typography';
import type { ProgressStore } from '../animation/progressStore';

// Semantic DOM chapters: the accessible source of truth for journey copy.
// Styles are mutated imperatively from the shared progress (never React
// state), in one rAF loop that only reads — the Canvas loop owns writes.
export default function JourneyText({ store }: { store: ProgressStore }) {
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const progress = store.current;
      for (let i = 0; i < experienceSections.length; i += 1) {
        const element = chapterRefs.current[i];
        if (!element) {
          continue;
        }
        const timing = typographyTimings[experienceSections[i].id];
        const state = evaluateTypography(timing, progress);
        element.style.opacity = state.opacity.toFixed(3);
        element.style.transform = `translateY(${((1 - state.rise) * timing.risePx).toFixed(1)}px)`;
        element.style.visibility = state.opacity <= 0.001 ? 'hidden' : 'visible';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [store]);

  return (
    <div className="journey-text">
      {experienceSections.map((section, i) => (
        <section
          key={section.id}
          aria-label={section.title}
          data-chapter={section.id}
          ref={(element) => {
            chapterRefs.current[i] = element;
          }}
          className="chapter"
        >
          <h2>{section.title}</h2>
          <p>{section.subtitle}</p>
        </section>
      ))}
    </div>
  );
}
