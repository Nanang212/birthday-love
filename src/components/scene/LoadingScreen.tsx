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
    <div className="loading-screen">
      {/* Stars */}
      <div className="loading-stars">
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

      <div className="loading-title">🦫 Capy & You</div>

      <div className="loading-subtitle">{message}</div>

      <div className="loading-bar-container">
        <div
          className="loading-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
