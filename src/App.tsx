import { Suspense, useCallback, useState } from 'react';
import Experience from './app/Experience';
import LoadingScreen from './components/LoadingScreen';
import StaticFallback from './components/StaticFallback';
import { getExperienceFlags } from './utils/searchParams';
import { isWebGL2Available } from './renderer/webglSupport';

// Phase 2 shell: capability gate → canvas or static fallback. The full
// experience state machine (loading → intro → active → ending) lands in
// Phase 10; context-loss recovery is wired from the start.
export default function App() {
  const [flags] = useState(getExperienceFlags);
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
      <Suspense fallback={<LoadingScreen />}>
        <Experience onContextLost={handleContextLost} />
      </Suspense>
    </div>
  );
}
