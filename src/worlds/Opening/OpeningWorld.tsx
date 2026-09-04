// ============================================================
// WORLD 0 — Opening
// Fase 1: Capy di balik bumi → Klik 4x → Muncul Rumah Pertama di kanan bawah
// Fase 2 (Setelah keluar Rumah Pertama): Capy di depan Rumah Pertama → Rumah Kedua langsung muncul di kiri bawah!
// Fase 3 (Setelah keluar Rumah Kedua): Capy keluar dari depan Rumah Kedua di kiri bawah!
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Capy } from '../../components/capybara/Capy';
import { useStory } from '../../hooks/useStory';
import { DialogueController } from '../../components/dialogue/DialogueController';

import { EarthGlobe } from '../../components/scene/EarthGlobe';
import { WarpStarfield } from '../../components/scene/WarpStarfield';
import { TravelAirplane3D } from '../../components/scene/TravelAirplane3D';
import { ResponsiveCamera } from '../../components/scene/ResponsiveCamera';

/* ── 3D Scene ── */
function OpeningScene({
  targetPos,
  onSceneClick,
  onCapyClick,
  onHouse1Click,
  showHouse1,
  house1Highlighted,
  speechBubbleText,
  initialCapyPos,
  isAirplane1Flying,
  onFlight1Complete,
}: {
  targetPos: [number, number, number] | null;
  onSceneClick: (point: [number, number, number]) => void;
  onCapyClick: () => void;
  onHouse1Click: () => void;
  showHouse1: boolean;
  house1Highlighted: boolean;
  speechBubbleText: string | null;
  initialCapyPos: [number, number, number];
  isAirplane1Flying: boolean;
  onFlight1Complete: () => void;
}) {
  return (
    <>
      {/* 0. Kontrol Kamera Responsif (Otomatis menyesuaikan FOV & Z untuk HP & iPad) */}
      <ResponsiveCamera baseY={0.8} baseZ={5.2} targetWidth={8.8} />

      {/* 1. Latar Belakang Bintang Kosmik Bergerak Perlahan (Slow Warp Starfield) */}
      <WarpStarfield count={10000} baseSpeed={0.7} />

      {/* 2. Pencahayaan Kosmik Hangat */}
      <ambientLight intensity={0.9} color="#fff6eb" />
      <directionalLight position={[6, 5, 5]} intensity={1.5} color="#fff1db" castShadow />
      <pointLight position={[3, 3, 3]} intensity={1.2} color="#ffd194" distance={15} />
      <pointLight position={[-4, 1, 2]} intensity={0.9} color="#70d6ff" distance={12} />
      <pointLight position={[3.8, -0.8, 1.0]} intensity={1.2} color="#f9ca24" distance={5} />
      <pointLight position={[-3.8, -0.8, 1.0]} intensity={1.2} color="#a29bfe" distance={5} />

      {/* 3. Planet Bumi di Tengah Layar */}
      <EarthGlobe radius={1.22} position={[0, 0.25, 0]} />

      {/* 4. Pesawat Perjalanan Pertama (Satu-satunya Pintu Perjalanan) */}
      {showHouse1 && (
        <TravelAirplane3D
          position={[3.5, -1.8, 0.4]}
          scale={0.58}
          direction="left"
          label="✈️ Perjalanan Pertama"
          highlight={house1Highlighted}
          isTakingOff={isAirplane1Flying}
          onClick={onHouse1Click}
          onFlightComplete={onFlight1Complete}
        />
      )}

      {/* 5. Maskot Kapibara dengan Balon Pesan Mungil di Atas Kepala */}
      <Capy
        outfit="normal"
        position={initialCapyPos}
        scale={isAirplane1Flying ? 0.001 : 0.52}
        onClick={onCapyClick}
        targetPosition={targetPos}
        speechBubble={speechBubbleText}
        onSpeechBubbleClick={onHouse1Click}
      />

      {/* Invisible Click Plane untuk Menangkap Klik di Mana Saja */}
      <mesh
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        visible={false}
        onPointerDown={(e) => {
          const p = e.point;
          const clampedY = Math.min(Math.max(p.y, -1.8), 0.8);
          const clampedX = Math.min(Math.max(p.x, -3.6), 3.6);
          onSceneClick([clampedX, clampedY, 1.1]);
        }}
      >
        <planeGeometry args={[25, 18]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

/* ── World Component ── */
export function OpeningWorld() {
  const { state, goToWorld } = useStory();

  // Deteksi world asal keluar
  const hasVisitedHouse1 = state.visitedWorlds.includes('beginning') || state.visitedWorlds.includes('concert');
  const hasVisitedHouse2 = state.visitedWorlds.includes('journey');
  const exitedFromHouse2 = state.lastExitedWorld === 'journey';
  const exitedFromHouse1 = state.lastExitedWorld === 'beginning' || state.lastExitedWorld === 'concert' || (!exitedFromHouse2 && hasVisitedHouse1);

  const [phase, setPhase] = useState<'capy-intro' | 'active'>(
    hasVisitedHouse1 || hasVisitedHouse2 ? 'active' : 'capy-intro'
  );
  const [targetPos, setTargetPos] = useState<[number, number, number] | null>(null);

  // Audio Backsound Khusus Opening (Dreamy Music Box & Harp yang hangat, magis, dan menenangkan)
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/audio/opening_theme.mp3');
    audio.loop = true;
    audio.volume = 0.35; // Volume lembut & menenangkan
    bgmRef.current = audio;

    let hasInteracted = false;
    const startOnInteraction = () => {
      if (hasInteracted) return;
      hasInteracted = true;
      audio.play().catch(() => {});
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('pointerdown', startOnInteraction);
      window.removeEventListener('keydown', startOnInteraction);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay browser policy: mulai saat interaksi user pertama kali di opening world
        window.addEventListener('click', startOnInteraction, { once: true });
        window.addEventListener('pointerdown', startOnInteraction, { once: true });
        window.addEventListener('keydown', startOnInteraction, { once: true });
      });
    }

    return () => {
      cleanupListeners();
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      bgmRef.current = null;
    };
  }, []);

  // Counter klik untuk fase awal
  const [clickCount, setClickCount] = useState(0);
  const [isEnteringHouse, setIsEnteringHouse] = useState(false);
  const [isAirplane1Flying, setIsAirplane1Flying] = useState(false);

  const isInitialThresholdMet = clickCount >= 4;

  const registerAnyClick = () => {
    if (isEnteringHouse || isAirplane1Flying) return;
    setClickCount((prev) => prev + 1);
  };

  const handleSceneClick = (point: [number, number, number]) => {
    if (isEnteringHouse || isAirplane1Flying) return;
    registerAnyClick();
    setTargetPos(point);
  };

  const handleCapyClick = () => {
    if (isEnteringHouse || isAirplane1Flying) return;
    registerAnyClick();
  };

  // Klik Pesawat Perjalanan Pertama (Pojok Kanan Bawah) -> Terbang ke Jalan Tunjungan
  const handleHouse1Click = () => {
    if (isEnteringHouse || isAirplane1Flying) return;
    setIsEnteringHouse(true);

    // Hentikan BGM Opening saat Capy naik pesawat menuju Perjalanan Pertama
    if (bgmRef.current) {
      bgmRef.current.pause();
    }

    // Arahkan Capy berjalan menuju pesawat di pojok kanan bawah [3.1, -1.75, 0.4]
    setTargetPos([3.1, -1.75, 0.4]);
    setTimeout(() => {
      setIsAirplane1Flying(true);
    }, 1100);
  };

  const handleFlight1Complete = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.src = '';
      bgmRef.current = null;
    }
    goToWorld('beginning');
  };

  // Hanya 1 Pesawat (Pintu Tunggal Perjalanan Pertama)
  const showHouse1 = hasVisitedHouse1 || hasVisitedHouse2 || isInitialThresholdMet || isEnteringHouse;

  // Teks balon pesan di atas kepala Capy:
  let speechBubbleText: string | null = null;
  if (!isEnteringHouse && !isAirplane1Flying) {
    if (isInitialThresholdMet || hasVisitedHouse1 || hasVisitedHouse2) {
      speechBubbleText = 'Ayo terbang ke Perjalanan Pertama! ✈️';
    }
  }

  // Posisi awal Capy:
  // 1. Jika baru kembali dari perjalanan -> berdiri di depan bumi [0, -1.6, 0.8]
  // 2. Jika pertama kali buka web -> di balik bumi [0, 0.25, -2.5]
  let initialCapyPos: [number, number, number] = [0, 0.25, -2.5];
  if (exitedFromHouse2 || exitedFromHouse1 || hasVisitedHouse1 || hasVisitedHouse2) {
    initialCapyPos = [0, -1.6, 0.8];
  }

  return (
    <>
      <div className="scene-container">
        <Canvas
          camera={{ position: [0, 0.8, 5.2], fov: 55 }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <OpeningScene
            targetPos={targetPos}
            onSceneClick={handleSceneClick}
            onCapyClick={handleCapyClick}
            onHouse1Click={handleHouse1Click}
            showHouse1={showHouse1}
            house1Highlighted={isInitialThresholdMet || hasVisitedHouse1 || hasVisitedHouse2}
            speechBubbleText={speechBubbleText}
            initialCapyPos={initialCapyPos}
            isAirplane1Flying={isAirplane1Flying}
            onFlight1Complete={handleFlight1Complete}
          />
        </Canvas>
      </div>

      <div className="ui-overlay">
        {/* Petunjuk Interaksi Atas */}
        <div style={{
          position: 'fixed',
          top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          maxWidth: 'min(92vw, 640px)',
          width: 'max-content',
          background: 'rgba(7, 11, 22, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: speechBubbleText ? '2px solid #f1c40f' : '1px solid rgba(240, 194, 127, 0.5)',
          borderRadius: '9999px',
          padding: '0.45rem clamp(0.75rem, 2.5vw, 1.3rem)',
          fontSize: 'clamp(0.72rem, 2.2vw, 0.86rem)',
          lineHeight: '1.35',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.5rem',
          boxShadow: speechBubbleText
            ? '0 0 25px rgba(241, 196, 15, 0.6), 0 8px 32px rgba(0, 0, 0, 0.8)'
            : '0 8px 32px rgba(0, 0, 0, 0.75)',
          pointerEvents: 'none',
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
          transition: 'all 0.4s ease',
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{isAirplane1Flying ? '🛫' : '✈️'}</span>
          <span>
            {isAirplane1Flying ? (
              <>
                🛫 <strong style={{ color: '#ffd166' }}>Pesawat Capy lepas landas!</strong> Terbang menuju Perjalanan Pertama... ✨
              </>
            ) : isEnteringHouse ? (
              <>
                ✈️ Capy sedang bersiap naik ke pesawat... Siap-siap terbang! 🛫✨
              </>
            ) : (exitedFromHouse2 || hasVisitedHouse2 || hasVisitedHouse1) ? (
              // Baru kembali dari perjalanan realita
              <>
                🌸 Capy baru saja kembali dari perjalanannya! <strong style={{ color: '#ffd166' }}>Klik Pesawat</strong> untuk jalan-jalan lagi! • <strong style={{ color: '#ffd166' }}>SPASI</strong> lompat
              </>
            ) : isInitialThresholdMet ? (
              // Pertama kali buka & sudah klik 4x
              <>
                ✈️ Pesawat Perjalanan Pertama siap di pojok kanan bawah! <strong style={{ color: '#ffd166' }}>Klik Pesawatnya ↘</strong> untuk mengajak Capy terbang! 🛫✨
              </>
            ) : (
              // Pertama kali buka & belum klik 4x
              <>
                <strong style={{ color: '#ffd166' }}>Klik layar ({4 - Math.min(clickCount, 4)}x lagi)</strong> untuk panggil Capy & siapkan Pesawat Perjalanan Pertama •{' '}
                <strong style={{ color: '#ffd166' }}>Klik Capy</strong> putar 360° •{' '}
                <strong style={{ color: '#ffd166' }}>SPASI</strong> lompat
              </>
            )}
          </span>
        </div>

        {/* Info Capy di balik bumi (hanya saat pertama kali sebelum pernah mengunjungi rumah) */}
        {!hasVisitedHouse1 && !hasVisitedHouse2 && phase === 'capy-intro' && (
          <DialogueController
            lines={[
              { id: 'capy-open-1', speaker: 'capy', text: '✨ ✨ ✨', autoAdvance: true, delay: 1800 },
              { id: 'capy-open-2', speaker: 'capy', text: 'Psst... Aku di balik bumi!', autoAdvance: true, delay: 2000 },
              { id: 'capy-open-3', speaker: 'capy', text: 'Klik layarnya untuk memanggilku keluar! 🦫', autoAdvance: true, delay: 2500 },
            ]}
            onFinished={() => setPhase('active')}
          />
        )}
      </div>
    </>
  );
}
