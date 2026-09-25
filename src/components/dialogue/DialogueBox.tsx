// ============================================================
// COMPONENT — DialogueBox with typewriter effect
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { DialogueLine, Speaker } from '../../types';

interface DialogueBoxProps {
  line: DialogueLine;
  onComplete?: () => void;
  onContinue?: () => void;
  showContinue?: boolean;
}

const SPEAKER_LABELS: Record<Speaker, string> = {
  me: 'Aku',
  her: '[HER_NAME]',
  capy: 'Capy 🦫',
};

const SPEAKER_AVATARS: Record<Speaker, string> = {
  me: '💙',
  her: '💖',
  capy: '🦫',
};

const TYPEWRITER_SPEED = 32; // ms per character

export function DialogueBox({ line, onComplete, onContinue, showContinue = false }: DialogueBoxProps) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  // Reset when line changes
  useEffect(() => {
    setDisplayed('');
    setIsDone(false);
  }, [line.id]);

  // Typewriter effect
  useEffect(() => {
    if (isDone) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(line.text.slice(0, i));
      if (i >= line.text.length) {
        clearInterval(interval);
        setIsDone(true);
        onComplete?.();
      }
    }, TYPEWRITER_SPEED);

    return () => clearInterval(interval);
  }, [line.id, line.text, isDone, onComplete]);

  // Skip typewriter on click
  const handleSkip = useCallback(() => {
    if (!isDone) {
      setDisplayed(line.text);
      setIsDone(true);
      onComplete?.();
    }
  }, [isDone, line.text, onComplete]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-6 bg-gradient-to-t from-[rgba(8,12,20,0.97)] via-[rgba(8,12,20,0.8)] to-transparent"
      onClick={handleSkip}
      role="dialog"
      aria-label="Story dialogue"
    >
      <div className="max-w-xl mx-auto">
        {/* Speaker */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`dialogue-avatar--${line.speaker} w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0`}
          >
            {SPEAKER_AVATARS[line.speaker]}
          </div>
          <span className={`dialogue-name--${line.speaker} text-xs font-semibold tracking-widest uppercase`}>
            {SPEAKER_LABELS[line.speaker]}
          </span>
        </div>

        {/* Text */}
        <p className="text-[clamp(0.92rem,2.5vw,1.15rem)] leading-relaxed text-[var(--color-text)] min-h-[2.4em] cursor-pointer select-none">
          {displayed}
          {!isDone && <span className="dialogue-cursor" aria-hidden="true" />}
        </p>

        {/* Continue button */}
        {isDone && showContinue && (
          <div className="flex items-center justify-end mt-4 gap-2 animate-[fadeIn_0.4s_ease]">
            <button
              id="btn-dialogue-continue"
              className="flex items-center gap-1 px-5 py-2 bg-[var(--color-accent-soft)] border border-[rgba(232,150,106,0.3)] rounded-full text-[var(--color-accent)] text-sm font-medium font-[var(--font-body)] cursor-pointer transition-all duration-200 hover:bg-[rgba(232,150,106,0.28)] hover:translate-x-1 active:scale-95 min-h-[44px] sm:min-h-0"
              onClick={(e) => {
                e.stopPropagation();
                onContinue?.();
              }}
              aria-label="Continue to next line"
            >
              Lanjut
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
