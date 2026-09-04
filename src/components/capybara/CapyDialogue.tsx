// ============================================================
// COMPONENT — CapyDialogue (Easter egg popup bubble)
// ============================================================

import { useStory } from '../../hooks/useStory';
import { capyEasterEggDialogues } from '../../data/capybara';

export function CapyDialogue() {
  const { state, dispatch } = useStory();

  if (!state.isCapyDialogueOpen) return null;

  const dialogueIdx = Math.min(state.capyClickCount - 1, capyEasterEggDialogues.length - 1);
  const lines = capyEasterEggDialogues[dialogueIdx];
  const text = lines?.[0]?.text ?? '';

  return (
    <div className="capy-dialogue" role="status" aria-live="polite">
      <div className="capy-bubble">
        <p className="capy-bubble-text">{text}</p>
      </div>
      <button
        id="btn-capy-dialogue-close"
        className="btn-ghost"
        style={{ marginTop: '8px', width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}
        onClick={() => dispatch({ type: 'CLOSE_CAPY_DIALOGUE' })}
      >
        OK
      </button>
    </div>
  );
}
