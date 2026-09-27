import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import EndScreen from './components/EndScreen';
import { ExperienceErrorBoundary } from './components/ExperienceErrorBoundary';
import JourneyText from './components/JourneyText';
import LoadingScreen from './components/LoadingScreen';
import OverlayUI from './components/OverlayUI';
import StartScreen from './components/StartScreen';
import StaticFallback from './components/StaticFallback';
import { createProgressStore, type ProgressStore } from './animation/progressStore';
import { AudioManager } from './audio/AudioManager';
import { assetUrl, findAsset } from './config/assets';
import { useExperienceState } from './hooks/useExperienceState';
import { usePageVisibility } from './hooks/usePageVisibility';
import { getExperienceFlags } from './utils/searchParams';
import { isWebGL2Available } from './renderer/webglSupport';

const Experience = lazy(() => import('./app/Experience'));

// Phase 10 shell: capability gate → loading → ready → intro → active →
// ending → completed, with skipped/fallback/error exits to static content.
// The state machine owns every transition; this component only renders them.
export default function App() {
  const [flags] = useState(getExperienceFlags);
  const [store] = useState<ProgressStore>(() => {
    const initial = createProgressStore();
    if (flags.progress !== null) {
      initial.target = flags.progress;
      initial.current = flags.progress;
    }
    return initial;
  });
  const [audio] = useState(() => {
    const entry = findAsset('music');
    return new AudioManager(entry ? assetUrl(entry) : null);
  });
  const {
    status: machineStatus,
    begin,
    skip,
    replay,
    notifyInput,
  } = useExperienceState(store, audio, flags.progress);
  const visible = usePageVisibility();
  const [webglSupported] = useState(() => !flags.forceFallback && isWebGL2Available());
  const [contextLost, setContextLost] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const experienceRegion = useRef<HTMLDivElement>(null);

  useEffect(() => () => audio.dispose(), [audio]);

  const wasVisible = useRef(true);
  useEffect(() => {
    if (!visible) {
      audio.handleVisibilityHidden();
    } else if (!wasVisible.current) {
      audio.handleVisibilityVisible();
    }
    wasVisible.current = visible;
  }, [visible, audio]);

  const handleContextLost = useCallback(() => setContextLost(true), []);
  const handleCrash = useCallback(() => setCrashed(true), []);
  const handleBeginCommit = useCallback(() => {
    begin();
    requestAnimationFrame(() => experienceRegion.current?.focus({ preventScroll: true }));
  }, [begin]);

  const status = crashed ? 'error' : !webglSupported || contextLost ? 'fallback' : machineStatus;
  const inputActive = status === 'intro' || status === 'active';

  if (status === 'skipped' || status === 'fallback' || status === 'error') {
    return <StaticFallback contextLost={contextLost || status === 'error'} />;
  }

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'ready') {
    return <StartScreen onCommit={handleBeginCommit} onSkip={skip} />;
  }

  return (
    <div
      ref={experienceRegion}
      className="experience"
      role="region"
      aria-label="Cinematic flight experience"
      tabIndex={-1}
    >
      <JourneyText store={store} />
      {(status === 'intro' || status === 'active') && (
        <OverlayUI store={store} audio={audio} onSkip={skip} />
      )}
      <ExperienceErrorBoundary onError={handleCrash}>
        <Suspense fallback={<LoadingScreen />}>
          <Experience
            store={store}
            inputActive={inputActive}
            onActivity={notifyInput}
            onContextLost={handleContextLost}
          />
        </Suspense>
      </ExperienceErrorBoundary>
      {status === 'completed' && <EndScreen onReplay={replay} />}
    </div>
  );
}
