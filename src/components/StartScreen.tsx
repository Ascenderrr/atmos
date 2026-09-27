import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { siteContent } from '../config/content';

interface StartScreenProps {
  onCommit: () => void;
  onSkip: () => void;
}

// READY gate: the required user gesture (autoplay-safe audio start) plus the
// skip path. Entrance and exit run through one gsap context that always
// reverts — no orphaned tweens after unmount.
export default function StartScreen({ onCommit, onSkip }: StartScreenProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.start-kicker', { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.start-title', { y: 56, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.1 });
      gsap.from('.start-lede', {
        y: 32,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.25,
      });
      gsap.from('.start-actions', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.4,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const begin = () => {
    if (!root.current) {
      onCommit();
      return;
    }
    gsap.to(root.current, { opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: onCommit });
  };

  return (
    <div ref={root} className="start-screen">
      <main className="start-inner">
        <p className="start-kicker kicker">{siteContent.kicker}</p>
        <h1 className="start-title">{siteContent.heroTitle}</h1>
        <p className="start-lede lede">{siteContent.heroLede}</p>
        <div className="start-actions">
          <button type="button" className="primary" autoFocus onClick={begin}>
            {siteContent.beginLabel}
          </button>
          <button type="button" className="quiet" onClick={onSkip}>
            {siteContent.skipLabel}
          </button>
        </div>
      </main>
    </div>
  );
}
