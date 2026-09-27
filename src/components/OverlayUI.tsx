import { useEffect, useRef } from 'react';
import { siteContent } from '../config/content';
import type { ProgressStore } from '../animation/progressStore';
import type { AudioManager } from '../audio/AudioManager';
import SoundToggle from './SoundToggle';

interface OverlayUIProps {
  store: ProgressStore;
  audio: AudioManager;
  onSkip: () => void;
}

// Persistent experience chrome: journey hint (progress-faded), skip control,
// and sound (hidden in zero-audio mode). Read-only mirror of the store.
export default function OverlayUI({ store, audio, onSkip }: OverlayUIProps) {
  const hint = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (hint.current) {
        const opacity = Math.max(0, 1 - store.current / 0.04);
        hint.current.style.opacity = opacity.toFixed(3);
        hint.current.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [store]);

  return (
    <div className="overlay-ui">
      <p ref={hint} className="scroll-hint">
        {siteContent.scrollHint}
      </p>
      <div className="overlay-controls">
        <SoundToggle audio={audio} />
        <button type="button" className="quiet" onClick={onSkip}>
          {siteContent.skipLabel}
        </button>
      </div>
    </div>
  );
}
