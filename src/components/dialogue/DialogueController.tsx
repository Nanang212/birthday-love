// ============================================================
// COMPONENT — DialogueController
// Drives dialogue sequence from a list of DialogueLine[]
// ============================================================

import { useState, useCallback } from 'react';
import type { DialogueLine } from '../../types';
import { DialogueBox } from './DialogueBox';

interface DialogueControllerProps {
  lines: DialogueLine[];
  onFinished?: () => void;
}

export function DialogueController({ lines, onFinished }: DialogueControllerProps) {
  const [index, setIndex] = useState(0);
  const [lineComplete, setLineComplete] = useState(false);

  const currentLine = lines[index];
  const isLast = index >= lines.length - 1;

  const advance = useCallback(() => {
    if (isLast) {
      onFinished?.();
    } else {
      setIndex((i) => i + 1);
      setLineComplete(false);
    }
  }, [isLast, onFinished]);

  const handleComplete = useCallback(() => {
    setLineComplete(true);
    const line = lines[index];
    if (line?.autoAdvance) {
      setTimeout(() => advance(), line.delay ?? 2000);
    }
  }, [lines, index, advance]);

  if (!currentLine) return null;

  return (
    <DialogueBox
      line={currentLine}
      onComplete={handleComplete}
      onContinue={advance}
      showContinue={lineComplete && !currentLine.autoAdvance}
    />
  );
}
