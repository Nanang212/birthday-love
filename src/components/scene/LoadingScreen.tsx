// ============================================================
// COMPONENT — LoadingScreen
// ============================================================

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_MESSAGES = [
  'Mempersiapkan perjalanan kecil untukmu...',
  'Mengumpulkan bintang-bintang...',
  'Menata kenangan dengan rapi...',
  'Hampir selesai... ✨',
];

// Generate stars once
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 4}s`,
  duration: `${2 + Math.random() * 3}s`,
}));

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += Math.random() * 18 + 4;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(onComplete, 600);
      }
      setProgress(current);
      const idx = Math.floor((current / 100) * (LOADING_MESSAGES.length - 1));
      setMessage(LOADING_MESSAGES[Math.min(idx, LOADING_MESSAGES.length - 1)]);
    }, 350);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center gap-6 z-[100] animate-[fadeIn_0.4s_ease]">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STARS.map((s) => (
          <div
            key={s.id}
            className="loading-star"
            style={{
              left: s.left,
              top: s.top,
              '--delay': s.delay,
              '--duration': s.duration,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Title */}
      <div
        className="font-[var(--font-script)] text-[clamp(2rem,6vw,3.5rem)] text-[var(--color-gold)] [text-shadow:0_0_30px_rgba(240,194,127,0.5)] animate-[pulse_2s_ease-in-out_infinite] relative z-10"
      >
        🦫 Capy &amp; You
      </div>

      {/* Subtitle */}
      <p className="font-[var(--font-body)] text-xs sm:text-sm text-[var(--color-text-muted)] tracking-[0.15em] uppercase relative z-10 text-center px-4">
        {message}
      </p>

      {/* Loading bar */}
      <div className="w-[min(280px,80vw)] h-0.5 bg-[var(--color-border)] rounded-full overflow-hidden relative z-10">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
