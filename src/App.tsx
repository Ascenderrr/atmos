import { Suspense, useCallback, useState } from 'react';
import Experience from './app/Experience';
import JourneyText from './components/JourneyText';
import LoadingScreen from './components/LoadingScreen';
import StaticFallback from './components/StaticFallback';
import { createProgressStore, type ProgressStore } from './animation/progressStore';
import { getExperienceFlags } from './utils/searchParams';
import { isWebGL2Available } from './renderer/webglSupport';

// Phase 6 shell: the progress store is created once here and shared by the
// WebGL scene and the DOM chapters — one source of truth, two renderers.
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
  const [webglSupported] = useState(() => !flags.forceFallback && isWebGL2Available());
  const [contextLost, setContextLost] = useState(false);

  const handleContextLost = useCallback(() => {
    setContextLost(true);
  }, []);

  if (!webglSupported || contextLost) {
    return <StaticFallback contextLost={contextLost} />;
  }

  return (
    <div className="experience">
      <JourneyText store={store} />
      <Suspense fallback={<LoadingScreen />}>
        <Experience store={store} onContextLost={handleContextLost} />
      </Suspense>
    </div>
  );
}
