import { useEffect, useState } from 'react';

// Tracks document visibility. Audio (now) and rendering (Phase 13) use this
// to pause work in background tabs; progress deltas are already clamped, so
// returning never launches the aircraft across the scene.
export function usePageVisibility(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  );

  useEffect(() => {
    const onChange = () => {
      setVisible(document.visibilityState !== 'hidden');
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}
