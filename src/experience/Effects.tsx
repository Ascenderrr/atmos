import { memo } from 'react';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { EFFECTS_FOR_TIER, type QualityTier } from '../renderer/quality';

// Only effects with a documented visual purpose (see renderer/quality.ts):
// bloom lifts the sun and bright clouds; vignette focuses the frame. LOW
// renders direct (no composer) as the fastest path.
function Effects({ tier }: { tier: QualityTier }) {
  const selection = EFFECTS_FOR_TIER[tier];
  if (!selection.bloom && !selection.vignette) {
    return null;
  }
  return (
    <EffectComposer>
      {selection.bloom && (
        <Bloom mipmapBlur intensity={0.35} luminanceThreshold={0.85} luminanceSmoothing={0.1} />
      )}
      {selection.vignette && <Vignette darkness={0.55} offset={0.25} />}
    </EffectComposer>
  );
}

export default memo(Effects);
