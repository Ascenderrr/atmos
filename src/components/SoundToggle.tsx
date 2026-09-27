import { useEffect, useState } from 'react';
import type { AudioManager } from '../audio/AudioManager';

// Hidden unless an audio asset is configured: in zero-audio mode this renders
// nothing and the rest of the application works normally.
export default function SoundToggle({ audio }: { audio: AudioManager }) {
  const [snapshot, setSnapshot] = useState(() => audio.snapshot());

  useEffect(() => audio.subscribe(() => setSnapshot(audio.snapshot())), [audio]);

  if (!snapshot.configured) {
    return null;
  }

  const playing = snapshot.status === 'playing';
  const busy = snapshot.status === 'loading';

  return (
    <div className="sound-toggle" role="group" aria-label="Music">
      <button
        type="button"
        aria-pressed={playing}
        disabled={busy}
        onClick={() => {
          if (playing) {
            audio.pause();
          } else {
            void audio.play();
          }
        }}
      >
        {playing ? 'Pause music' : 'Play music'}
      </button>
      <button
        type="button"
        aria-pressed={snapshot.muted}
        onClick={() => audio.setMuted(!snapshot.muted)}
      >
        {snapshot.muted ? 'Unmute' : 'Mute'}
      </button>
    </div>
  );
}
