import { useCallback, useEffect, useRef, useState } from 'react';
import { setProgressTarget, snapProgress, type ProgressStore } from '../animation/progressStore';
import type { AudioManager } from '../audio/AudioManager';

export type ExperienceStatus =
  | 'loading'
  | 'ready'
  | 'intro'
  | 'active'
  | 'ending'
  | 'completed'
  | 'skipped'
  | 'fallback'
  | 'error';

export const ENDING_BEGIN = 0.985;
export const ENDING_DONE = 0.999;
const FONT_READY_TIMEOUT_MS = 2500;

// Explicit experience state machine — the only place status changes. No
// scattered booleans: every transition below is the full list. Audio follows
// the same transitions (fade in on begin/replay, fade out on skip/ending).
export function useExperienceState(
  store: ProgressStore,
  audio: AudioManager,
  testOverride: number | null,
) {
  const [status, setStatus] = useState<ExperienceStatus>(() =>
    testOverride !== null ? 'active' : 'loading',
  );
  const statusRef = useRef<ExperienceStatus>(status);
  const audioRef = useRef(audio);

  const commit = useCallback((next: ExperienceStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  // LOADING → READY once the required webfonts arrive (best-effort, capped).
  useEffect(() => {
    if (testOverride !== null) {
      return;
    }
    let cancelled = false;
    const ready = () => {
      if (!cancelled && statusRef.current === 'loading') {
        commit('ready');
      }
    };
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(ready).catch(ready);
    } else {
      ready();
    }
    const cap = globalThis.setTimeout(ready, FONT_READY_TIMEOUT_MS);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(cap);
    };
  }, [testOverride, commit]);

  // ACTIVE → ENDING → COMPLETED as damped progress reaches the route end.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const current = statusRef.current;
      if (current === 'active' && store.current >= ENDING_BEGIN) {
        setProgressTarget(store, 1);
        void audioRef.current.fadeOut(2500);
        commit('ending');
      } else if (current === 'ending' && store.current >= ENDING_DONE) {
        audioRef.current.stop();
        commit('completed');
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [store, commit]);

  const begin = useCallback(() => {
    if (statusRef.current !== 'ready') {
      return;
    }
    void audioRef.current.fadeIn();
    commit('intro');
  }, [commit]);

  const notifyInput = useCallback(() => {
    if (statusRef.current === 'intro') {
      commit('active');
    }
  }, [commit]);

  const skip = useCallback(() => {
    const current = statusRef.current;
    if (current !== 'ready' && current !== 'intro' && current !== 'active') {
      return;
    }
    void audioRef.current.fadeOut();
    commit('skipped');
  }, [commit]);

  const replay = useCallback(() => {
    if (statusRef.current !== 'completed') {
      return;
    }
    snapProgress(store, 0);
    void audioRef.current.fadeIn();
    commit('active');
  }, [store, commit]);

  return { status, begin, skip, replay, notifyInput };
}
