// ============================================================
// COMPONENT — SceneTransition (fade overlay between worlds)
// ============================================================

interface SceneTransitionProps {
  isVisible: boolean;
}

export function SceneTransition({ isVisible }: SceneTransitionProps) {
  return (
    <div
      className={`fixed inset-0 bg-[var(--color-bg)] z-[90] pointer-events-none transition-opacity duration-[800ms] ease-[var(--ease-smooth)] ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    />
  );
}
