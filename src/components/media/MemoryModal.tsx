// ============================================================
// COMPONENT — MemoryModal
// ============================================================

import { useState } from 'react';
import type { Memory } from '../../types';
import { DialogueController } from '../dialogue/DialogueController';

interface MemoryModalProps {
  memory: Memory;
  onClose: () => void;
}

export function MemoryModal({ memory, onClose }: MemoryModalProps) {
  const [imgError, setImgError] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);

  return (
    <div className="memory-overlay" role="dialog" aria-modal="true" aria-label={memory.title}>
      {/* Close button */}
      <button
        id="btn-memory-close"
        className="memory-close"
        style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 60 }}
        onClick={onClose}
        aria-label="Close memory"
      >
        ✕
      </button>

      <div className="memory-modal">
        {/* Media */}
        {memory.type === 'photo' ? (
          imgError ? (
            <div className="memory-media-placeholder">
              <span>📷</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {memory.title ?? 'Photo memory'}
              </span>
            </div>
          ) : (
            <img
              src={memory.src}
              alt={memory.title ?? 'Memory photo'}
              className="memory-media"
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <video
            src={memory.src}
            controls
            className="memory-media"
            playsInline
            onError={() => setImgError(true)}
          />
        )}

        {/* Content */}
        <div className="memory-content">
          {memory.title && (
            <h2 className="memory-title">{memory.title}</h2>
          )}
          {memory.caption && (
            <p className="memory-caption">{memory.caption}</p>
          )}

          {/* Start dialogue about this memory */}
          {!showDialogue && memory.dialogues && memory.dialogues.length > 0 && (
            <button
              id="btn-memory-recall"
              className="btn-ghost"
              onClick={() => setShowDialogue(true)}
            >
              💭 Kenang momen ini
            </button>
          )}
        </div>
      </div>

      {/* Dialogue overlay about this memory */}
      {showDialogue && memory.dialogues && (
        <DialogueController
          lines={memory.dialogues}
          onFinished={onClose}
        />
      )}
    </div>
  );
}
