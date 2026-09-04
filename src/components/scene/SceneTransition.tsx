// ============================================================
// COMPONENT — SceneTransition (fade overlay between worlds)
// ============================================================

interface SceneTransitionProps {
  isVisible: boolean;
}

export function SceneTransition({ isVisible }: SceneTransitionProps) {
  return (
    <div
      className={`scene-transition ${isVisible ? 'scene-transition--visible' : 'scene-transition--hidden'}`}
      aria-hidden="true"
    />
  );
}
