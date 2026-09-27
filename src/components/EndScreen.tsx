import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { siteContent } from '../config/content';

interface EndScreenProps {
  onReplay: () => void;
}

// COMPLETED overlay: the crew sign-off plus a way back into the sky.
// Entrance only, through a reverting gsap context.
export default function EndScreen({ onReplay }: EndScreenProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.end-title', { y: 48, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from('.end-message', {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.2,
      });
      gsap.from('.end-actions', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.35,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="end-screen">
      <main className="end-inner">
        <h2 className="end-title">Arrived</h2>
        <p className="end-message">{siteContent.endingMessage}</p>
        <div className="end-actions">
          <button type="button" className="primary" autoFocus onClick={onReplay}>
            {siteContent.replayLabel}
          </button>
        </div>
      </main>
    </div>
  );
}
