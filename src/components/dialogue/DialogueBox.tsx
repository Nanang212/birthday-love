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
    <div className="dialogue-box" onClick={handleSkip} role="dialog" aria-label="Story dialogue">
      <div className="dialogue-inner">
        {/* Speaker */}
        <div className="dialogue-speaker">
          <div className={`dialogue-avatar dialogue-avatar--${line.speaker}`}>
            {SPEAKER_AVATARS[line.speaker]}
          </div>
          <span className={`dialogue-name dialogue-name--${line.speaker}`}>
            {SPEAKER_LABELS[line.speaker]}
          </span>
        </div>

        {/* Text */}
        <p className="dialogue-text">
          {displayed}
          {!isDone && <span className="dialogue-cursor" aria-hidden="true" />}
        </p>

        {/* Continue button */}
        {isDone && showContinue && (
          <div className="dialogue-actions">
            <button
              id="btn-dialogue-continue"
              className="btn-continue"
              onClick={(e) => {
                e.stopPropagation();
                onContinue?.();
              }}
              aria-label="Continue to next line"
            >
              Lanjut
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
