// ============================================================
// HOOK — useAudio (Background Music)
// ============================================================

import { useEffect, useRef } from 'react';
import { useStory } from './useStory';

export function useAudio() {
  const { state, dispatch } = useStory();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/background.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
    }

    if (state.audioEnabled) {
      audioRef.current.play().catch(() => {
        // Browser may block autoplay, handled silently
      });
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [state.audioEnabled]);

  const toggle = () => dispatch({ type: 'TOGGLE_AUDIO' });

  return { audioEnabled: state.audioEnabled, toggle };
}
