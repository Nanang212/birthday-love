// ============================================================
// WORLD — ConcertWorld (Konser NDX A.K.A)
// 1. Capy tiba dengan pesawat kedatangan di panggung konser
// 2. Klik untuk turun dari pesawat -> pesawat kedatangan terbang pergi
// 3. Sura & Baya keluar dari sebelah kiri menuju ke tengah
// 4. Dialog Suroboyoan menyapa & mengajak konser bareng (Voice-over)
// 5. YouTube NDX A.K.A otomatis berputar (2:39 – 3:21)
// 6. Sura & Baya goyang loncat-loncat heboh mengikuti lagu konser
// 7. Lagu selesai di 3:21 -> Sura & Baya berhenti loncat, dialog penutup:
//    "Full-nya lanjut di Part 2 Offline 13 Desember 2026!"
// 8. Pesawat keberangkatan tiba di pojok kiri -> Capy naik & terbang
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStory } from '../../hooks/useStory';
import { Capy } from '../../components/capybara/Capy';
import * as THREE from 'three';
import { TravelAirplane3D } from '../../components/scene/TravelAirplane3D';
import { ResponsiveCamera } from '../../components/scene/ResponsiveCamera';
import { ConcertStage3D } from './ConcertStage3D';
import { ConcertMascots } from './ConcertMascots';
import type { YouTubePlayerEvent, YouTubePlayerInstance } from '../../types/youtube';

export const ConcertWorld: React.FC = () => {
  const { goToWorld } = useStory();

  // State alur konser
  const [hasExitedArrivalPlane, setHasExitedArrivalPlane] = useState(false);
  const [isArrivalPlaneFlyingAway, setIsArrivalPlaneFlyingAway] = useState(false);
  const [isMascotsStarted, setIsMascotsStarted] = useState(false);

  // State konser & musik
  const [isConcertActive, setIsConcertActive] = useState(false);
  const [isConcertEnded, setIsConcertEnded] = useState(false);
  const [isCapyDancing, setIsCapyDancing] = useState(false);
  const [songProgressSec, setSongProgressSec] = useState(0);

  // State pesawat keberangkatan (keluar)
  const [isDeparturePlaneReady, setIsDeparturePlaneReady] = useState(false);
  const [isDeparturePlaneFlying, setIsDeparturePlaneFlying] = useState(false);
  const [isCapyBoarding, setIsCapyBoarding] = useState(false);

  // Posisi target jalan Capy di panggung
  const [targetPos, setTargetPos] = useState<[number, number, number] | null>(null);

  // YouTube Player ref & timers
  const ytPlayerRef = useRef<YouTubePlayerInstance | null>(null);
  const concertTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── 1. HANDLER: KONSER SELESAI DI MENIT 3:21 ──
  const handleConcertFinish = useCallback(() => {
    if (concertTimerRef.current) {
      clearInterval(concertTimerRef.current);
      concertTimerRef.current = null;
    }

    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // ignore
      }
    }

    setIsConcertActive(false);
    setIsConcertEnded(true);
    setIsCapyDancing(false); // Capy otomatis berhenti goyang saat musik berakhir!
  }, []);

  // ── 2. INISIALISASI YOUTUBE IFRAME API ──
  useEffect(() => {
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      ytPlayerRef.current = new window.YT.Player('concert-yt-player', {
        videoId: 'JNatjo6ueOs',
        playerVars: {
          start: 159, // Menit 2:39 = 159 detik
          end: 201,   // Menit 3:21 = 201 detik
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            // Player siap
          },
          onStateChange: (event: YouTubePlayerEvent) => {
            if (event.data === window.YT?.PlayerState.ENDED) {
              handleConcertFinish();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existing = document.getElementById('youtube-iframe-api');
      if (!existing) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const first = document.getElementsByTagName('script')[0];
        first?.parentNode?.insertBefore(tag, first);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (concertTimerRef.current) clearInterval(concertTimerRef.current);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
        ytPlayerRef.current = null;
      }
    };
  }, [handleConcertFinish]);

  // ── 3. HANDLER: CAPY TURUN DARI PESAWAT KEDATANGAN ──
  const handleDisembark = useCallback(() => {
    if (hasExitedArrivalPlane) return;
    setHasExitedArrivalPlane(true);

    // Capy melangkah turun ke lantai panggung [1.2, -1.95, 0.4]
    setTargetPos([1.2, -1.95, 0.4]);

    // Pesawat kedatangan terbang kembali ke angkasa
    setTimeout(() => {
      setIsArrivalPlaneFlyingAway(true);
    }, 900);

    // Sura & Baya melangkah keluar dari sebelah kiri
    setTimeout(() => {
      setIsMascotsStarted(true);
    }, 1400);
  }, [hasExitedArrivalPlane]);

  // ── 4. HANDLER: PRE-CONCERT DIALOGUE SELESAI -> MULAI KONSER & YOUTUBE ──
  const handlePreConcertFinished = useCallback(() => {
    setIsConcertActive(true);

    // Putar YouTube mulai dari 2:39 (159 detik)
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(159, true);
        ytPlayerRef.current.playVideo();
      } catch {
        // ignore
      }
    }

    // Timer monitoring durasi lagu (159s s/d 201s = 42 detik)
    let elapsed = 0;
    const totalDuration = 42; // detik

    if (concertTimerRef.current) clearInterval(concertTimerRef.current);
    concertTimerRef.current = setInterval(() => {
      elapsed += 1;
      setSongProgressSec(elapsed);

      // Cek currentTime dari player jika tersedia
      let playerTime = 0;
      try {
        playerTime = ytPlayerRef.current?.getCurrentTime() || 0;
      } catch {
        // ignore
      }

      if (elapsed >= totalDuration || (playerTime >= 201 && playerTime > 159)) {
        if (concertTimerRef.current) clearInterval(concertTimerRef.current);
        handleConcertFinish();
      }
    }, 1000);
  }, [handleConcertFinish]);

  // ── 5. HANDLER: POST-CONCERT DIALOGUE SELESAI -> PESAWAT DATANG ──
  const handlePostConcertFinished = useCallback(() => {
    // Pesawat keberangkatan mendarat di pojok kiri bawah
    setIsDeparturePlaneReady(true);
  }, []);

  // ── 6. HANDLER: NAIK PESAWAT KEBERANGKATAN ──
  const handleBoardDeparturePlane = useCallback(() => {
    if (isCapyBoarding || isDeparturePlaneFlying) return;
    setIsCapyBoarding(true);

    // Capy melangkah menuju kokpit pesawat di pojok kiri [-3.1, -1.75, 0.4]
    setTargetPos([-3.1, -1.75, 0.4]);

    setTimeout(() => {
      setIsDeparturePlaneFlying(true);
    }, 1100);
  }, [isCapyBoarding, isDeparturePlaneFlying]);

  // ── 7. HANDLER: KLIK CAPY UNTUK TOGGLE IKUT GOYANG SAAT KONSER ──
  const handleCapyClick = useCallback(() => {
    if (isConcertActive) {
      setIsCapyDancing((prev) => !prev);
    }
  }, [isConcertActive]);

  // Klik di panggung untuk menggerakkan Capy
  const handleStageClick = (e: { point?: THREE.Vector3 }) => {
    if (!hasExitedArrivalPlane || isCapyBoarding) return;
    if (e.point) {
      setTargetPos([
        Math.max(-2.8, Math.min(3.5, e.point.x)),
        -1.95,
        Math.max(-0.6, Math.min(1.4, e.point.z)),
      ]);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 30%, #1c0a35 0%, #080415 70%, #030108 100%)',
      }}
    >
      {/* ── 1. GIANT LED CONCERT STAGE SCREEN (YOUTUBE EMBED) ── */}
      <div
        style={{
          position: 'fixed',
          top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          width: 'min(92vw, 540px)',
          pointerEvents: isConcertActive ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'all 0.5s ease',
        }}
      >
        {/* Stage Marquee Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #ff007f, #7928ca, #00f0ff)',
            padding: '4px 16px',
            borderRadius: '20px 20px 0 0',
            color: '#fff',
            fontFamily: "'Quicksand', 'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: '11px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(255, 0, 127, 0.6)',
          }}
        >
          <span>🔥</span>
          <span>NDX A.K.A LIVE CONCERT STAGE</span>
          <span>{isConcertActive ? '🔴 LIVE (2:39 - 3:21)' : '⏳ SIAP KONSER'}</span>
        </div>

        {/* Video Player Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            background: '#000',
            borderRadius: '0 0 16px 16px',
            overflow: 'hidden',
            border: isConcertActive
              ? '3px solid #00f0ff'
              : '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isConcertActive
              ? '0 0 45px rgba(0, 240, 255, 0.5), 0 0 20px rgba(255, 0, 127, 0.4)'
              : '0 10px 30px rgba(0,0,0,0.6)',
          }}
        >
          <div
            id="concert-yt-player"
            style={{ width: '100%', height: '100%' }}
          />

          {/* Overlay saat musik belum mulai */}
          {!isConcertActive && !isConcertEnded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10, 6, 22, 0.82)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: "'Quicksand', 'Outfit', sans-serif",
                padding: '20px',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px', animation: 'bounce 1.5s infinite' }}>
                🎤
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#feca57' }}>
                Panggung Konser NDX A.K.A Siap!
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', maxWidth: '300px' }}>
                Musik akan berputar otomatis (menit 2:39 – 3:21) setelah Capy menyapa Sura & Baya!
              </div>
            </div>
          )}

          {/* Overlay setelah konser selesai (3:21) */}
          {isConcertEnded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10, 6, 22, 0.88)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: "'Quicksand', 'Outfit', sans-serif",
                padding: '16px',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>✨🎉</div>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#00f0ff' }}>
                Konser Selesai!
              </div>
              <div style={{ fontSize: '12px', color: '#fef08a', marginTop: '4px', fontWeight: 600 }}>
                Full-nya lanjut di Part 2 Offline 13 Desember 2026! 💖
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar Lagu Konser (42 detik) */}
        {isConcertActive && (
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255,255,255,0.2)',
              marginTop: '4px',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (songProgressSec / 42) * 100)}%`,
                background: 'linear-gradient(90deg, #00f0ff, #ff007f)',
                transition: 'width 1s linear',
              }}
            />
          </div>
        )}
      </div>

      {/* ── 2. THREE.JS 3D CONCERT STAGE CANVAS ── */}
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas
          camera={{ position: [0, 0.2, 5.2], fov: 52 }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          {/* Kontrol Kamera Responsif Otomatis untuk HP & iPad */}
          <ResponsiveCamera baseY={0.2} baseZ={5.2} targetWidth={8.8} />

          {/* Panggung, Lampu Moving Head, Rigging & Crowd Glowsticks */}
          <ConcertStage3D isConcertActive={isConcertActive} />

          {/* Pesawat Kedatangan (Pojok Kanan Bawah): Terbang pergi setelah Capy turun */}
          {!hasExitedArrivalPlane || isArrivalPlaneFlyingAway ? (
            <TravelAirplane3D
              position={[3.2, -1.8, 0.4]}
              scale={0.58}
              label={!hasExitedArrivalPlane ? '✈️ Klik untuk Turun!' : ''}
              highlight={!hasExitedArrivalPlane}
              isTakingOff={isArrivalPlaneFlyingAway}
              onClick={handleDisembark}
              onFlightComplete={() => {
                // Pesawat kedatangan sudah hilang di angkasa
              }}
            />
          ) : null}

          {/* Pesawat Keberangkatan (Pojok Kiri Bawah): Muncul setelah dialog selesai */}
          {(isDeparturePlaneReady || isDeparturePlaneFlying) && (
            <TravelAirplane3D
              position={[-3.5, -1.8, 0.4]}
              scale={0.58}
              label="✈️ Perjalanan Selanjutnya"
              highlight={isDeparturePlaneReady}
              isTakingOff={isDeparturePlaneFlying}
              onClick={handleBoardDeparturePlane}
              onFlightComplete={() => {
                // Selesai terbang -> lanjut ke Taipei (JourneyWorld)
                goToWorld('journey');
              }}
            />
          )}

          {/* Karakter Sura & Baya Konser */}
          <ConcertMascots
            isStarted={isMascotsStarted}
            isConcertActive={isConcertActive}
            isConcertEnded={isConcertEnded}
            onPreConcertFinished={handlePreConcertFinished}
            onPostConcertFinished={handlePostConcertFinished}
          />

          {/* Maskot Kapibara (Capy) */}
          <Capy
            outfit="normal"
            position={[3.2, -1.95, 0.4]}
            scale={isDeparturePlaneFlying ? 0.001 : hasExitedArrivalPlane ? 0.52 : 0.001}
            targetPosition={targetPos}
            isAnimating={isCapyDancing}
            onClick={handleCapyClick}
            speechBubble={
              isDeparturePlaneReady && !isDeparturePlaneFlying && !isCapyBoarding
                ? 'Terbang ke Perjalanan Selanjutnya! ✈️'
                : isConcertActive
                ? isCapyDancing
                  ? 'Goyang NDX Rek! 🎶🕺 (Klik lagi buat istirahat)'
                  : 'Klik aku buat ikut goyang! 🕺✨'
                : null
            }
            onSpeechBubbleClick={
              isDeparturePlaneReady
                ? handleBoardDeparturePlane
                : isConcertActive
                ? handleCapyClick
                : undefined
            }
          />

          {/* Invisible Stage Floor Plane untuk deteksi klik jalan Capy */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2.0, 0]}
            visible={false}
            onClick={(e) => {
              e.stopPropagation();
              handleStageClick(e);
            }}
          >
            <planeGeometry args={[14, 8]} />
            <meshBasicMaterial />
          </mesh>
        </Canvas>
      </div>

      {/* ── 3. TOP BANNER PETUNJUK INTERAKTIF ── */}
      <div
        style={{
          position: 'fixed',
          top: 'calc(3% + min(92vw, 580px) * 0.5625 + 32px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          background: 'rgba(12, 8, 26, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '8px 18px',
          color: '#e2e8f0',
          fontFamily: "'Quicksand', 'Outfit', sans-serif",
          fontSize: '12.5px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          maxWidth: '90vw',
          textAlign: 'center',
        }}
      >
        {!hasExitedArrivalPlane ? (
          <span>
            🛬 Capy sudah mendarat di Konser NDX A.K.A!{' '}
            <strong style={{ color: '#ffd166', pointerEvents: 'auto', cursor: 'pointer' }} onClick={handleDisembark}>
              Klik pesawat atau layar ↘
            </strong>{' '}
            untuk mengajak Capy turun! ✨
          </span>
        ) : !isConcertActive && !isConcertEnded ? (
          <span>
            🦈🐊 Sura dan Baya menyapa Capy! Klik balon dialog untuk mempercepat percakapan... 💬
          </span>
        ) : isConcertActive ? (
          <span>
            🔥 <strong style={{ color: '#00f0ff' }}>Konser NDX A.K.A Sedang Berlangsung!</strong> Sura & Baya asyik
            loncat & goyang!{' '}
            <strong
              style={{ color: '#ffd166', pointerEvents: 'auto', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={handleCapyClick}
            >
              {isCapyDancing ? 'Klik Capy untuk istirahat goyang ⏸️' : 'Klik Capy untuk ikut goyang 🕺✨'}
            </strong>{' '}
            (2:39 – 3:21)
          </span>
        ) : !isDeparturePlaneReady ? (
          <span>
            🎉 Konser selesai! Mendengarkan pesan dari Sura & Baya... 💖
          </span>
        ) : (
          <span>
            ✈️{' '}
            <strong style={{ color: '#ffd166', pointerEvents: 'auto', cursor: 'pointer' }} onClick={handleBoardDeparturePlane}>
              Pesawat Perjalanan Selanjutnya telah tiba di pojok kiri ↙!
            </strong>{' '}
            Klik balon Capy atau pesawat untuk terbang! ✨
          </span>
        )}
      </div>
    </div>
  );
};
