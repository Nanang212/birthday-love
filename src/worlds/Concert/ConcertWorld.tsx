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
    setIsCapyDancing(false);
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
  const handleDisembark = useCallback((point?: [number, number, number]) => {
    if (hasExitedArrivalPlane) return;
    setHasExitedArrivalPlane(true);
    setTargetPos(point ?? [1.2, -1.95, 0.4]);

    setTimeout(() => {
      setIsArrivalPlaneFlyingAway(true);
    }, 700);

    setTimeout(() => {
      setIsMascotsStarted(true);
    }, 1200);
  }, [hasExitedArrivalPlane]);

  // ── 4. HANDLER: PRE-CONCERT DIALOGUE SELESAI -> MULAI KONSER & YOUTUBE ──
  const handlePreConcertFinished = useCallback(() => {
    setIsConcertActive(true);

    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(159, true);
        ytPlayerRef.current.playVideo();
      } catch {
        // ignore
      }
    }

    let elapsed = 0;
    const totalDuration = 42;

    if (concertTimerRef.current) clearInterval(concertTimerRef.current);
    concertTimerRef.current = setInterval(() => {
      elapsed += 1;
      setSongProgressSec(elapsed);

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
    setIsDeparturePlaneReady(true);
  }, []);

  // ── 6. HANDLER: NAIK PESAWAT KEBERANGKATAN ──
  const handleBoardDeparturePlane = useCallback(() => {
    if (isCapyBoarding || isDeparturePlaneFlying) return;
    setIsCapyBoarding(true);
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

  const handleStageClick = useCallback((point?: [number, number, number]) => {
    if (isCapyBoarding) return;
    if (!hasExitedArrivalPlane) {
      handleDisembark(point ?? [1.2, -1.95, 0.4]);
      return;
    }
    if (point) {
      setTargetPos(point);
    }
  }, [hasExitedArrivalPlane, isCapyBoarding, handleDisembark]);

  return (
    <div
      onClick={() => {
        if (!hasExitedArrivalPlane) {
          handleDisembark();
        }
      }}
      className="relative w-screen h-screen overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#1c0a35_0%,#080415_70%,#030108_100%)]"
    >
      {/* ── 1. CONCERT UI: Video Panel + Hint Banner (Stacked, no overlap) ── */}
      <div className="fixed top-[calc(env(safe-area-inset-top,0px)+0.5rem)] left-1/2 -translate-x-1/2 z-[40]
        w-[min(92vw,480px)] flex flex-col items-center gap-1.5">

        {/* GIANT LED CONCERT STAGE SCREEN (YOUTUBE EMBED) */}
        <div
          className={`w-full flex flex-col items-center transition-all duration-500
            ${isConcertActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {/* Stage Marquee Header */}
          <div className="w-full bg-gradient-to-r from-[#ff007f] via-[#7928ca] to-[#00f0ff]
            px-3 py-0.5 rounded-t-xl text-white
            font-['Quicksand','Outfit',sans-serif] font-extrabold text-[10px] sm:text-[11px]
            tracking-[1.5px] uppercase flex items-center justify-center gap-2
            shadow-[0_0_20px_rgba(255,0,127,0.6)]"
          >
            <span>🔥</span>
            <span className="hidden sm:inline">NDX A.K.A LIVE CONCERT STAGE</span>
            <span className="sm:hidden">NDX A.K.A LIVE</span>
            <span>{isConcertActive ? '🔴 LIVE (2:39-3:21)' : '⏳ SIAP'}</span>
          </div>

          {/* Video Player Container — max height capped so it doesn't eat the screen */}
          <div
            className={`relative w-full bg-black rounded-b-xl overflow-hidden
              ${isConcertActive
                ? 'border-[3px] border-[#00f0ff] shadow-[0_0_45px_rgba(0,240,255,0.5),0_0_20px_rgba(255,0,127,0.4)]'
                : 'border-2 border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
              }`}
            style={{ aspectRatio: '16/9', maxHeight: 'min(40vh, 270px)' }}
          >
            <div id="concert-yt-player" className="w-full h-full" />

            {/* Overlay saat musik belum mulai */}
            {!isConcertActive && !isConcertEnded && (
              <div className="absolute inset-0 bg-[rgba(10,6,22,0.82)] backdrop-blur-sm
                flex flex-col items-center justify-center text-white px-4 py-3 text-center pointer-events-none
                font-['Quicksand','Outfit',sans-serif]"
              >
                <div className="text-2xl sm:text-3xl mb-1 animate-bounce">🎤</div>
                <div className="text-[12px] sm:text-[15px] font-bold text-[#feca57]">Panggung Konser NDX A.K.A Siap!</div>
                <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 max-w-[280px]">
                  Musik otomatis (menit 2:39–3:21) setelah Capy menyapa Sura &amp; Baya!
                </div>
              </div>
            )}

            {/* Overlay setelah konser selesai (3:21) */}
            {isConcertEnded && (
              <div className="absolute inset-0 bg-[rgba(10,6,22,0.88)] backdrop-blur-md
                flex flex-col items-center justify-center text-white p-4 text-center pointer-events-none
                font-['Quicksand','Outfit',sans-serif]"
              >
                <div className="text-[26px] mb-1">✨🎉</div>
                <div className="text-[13px] sm:text-[14.5px] font-extrabold text-[#00f0ff]">Konser Selesai!</div>
                <div className="text-[10px] sm:text-xs text-yellow-200 mt-1 font-semibold">
                  Full-nya lanjut di Part 2 Offline 13 Desember 2026! 💖
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar Lagu Konser (42 detik) */}
          {isConcertActive && (
            <div className="w-full h-1 bg-white/20 mt-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f0ff] to-[#ff007f] transition-[width] duration-1000 ease-linear"
                style={{ width: `${Math.min(100, (songProgressSec / 42) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* ── HINT BANNER — naturally below the video ── */}
        <div
          className="w-full bg-[rgba(12,8,26,0.92)] backdrop-blur-md
            border border-white/15 rounded-xl
            px-3 py-1.5
            text-slate-200 font-['Quicksand','Outfit',sans-serif]
            text-[clamp(10px,2.2vw,12px)] font-semibold
            flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.6)]
            text-center justify-center leading-snug
            pointer-events-none"
        >
          {!hasExitedArrivalPlane ? (
            <span>
              🛬 Capy mendarat di Konser NDX!{' '}
              <strong
                className="text-[#ffd166] pointer-events-auto cursor-pointer"
                onClick={() => handleDisembark()}
              >
                Klik pesawat ↘ atau layar
              </strong>{' '}
              untuk ajak Capy turun! ✨
            </span>
          ) : !isConcertActive && !isConcertEnded ? (
            <span>🦈🐊 Sura &amp; Baya menyapa Capy! Klik balon untuk lanjut... 💬</span>
          ) : isConcertActive ? (
            <span>
              🔥 <strong className="text-[#00f0ff]">KONSER LIVE!</strong>{' '}
              <strong
                className="text-[#ffd166] pointer-events-auto cursor-pointer underline"
                onClick={handleCapyClick}
              >
                {isCapyDancing ? 'Klik Capy: istirahat ⏸️' : 'Klik Capy: ikut goyang 🕺'}
              </strong>
            </span>
          ) : !isDeparturePlaneReady ? (
            <span>🎉 Konser selesai! Mendengarkan pesan dari Sura &amp; Baya... 💖</span>
          ) : (
            <span>
              ✈️{' '}
              <strong
                className="text-[#ffd166] pointer-events-auto cursor-pointer"
                onClick={handleBoardDeparturePlane}
              >
                Pesawat tiba di pojok kiri ↙
              </strong>{' '}
              – klik pesawat atau Capy! ✨
            </span>
          )}
        </div>
      </div>

      {/* ── 2. THREE.JS 3D CONCERT STAGE CANVAS (background, behind UI) ── */}
      <div className="absolute inset-0 z-[5]">
        <Canvas
          camera={{ position: [0, 0.2, 5.2], fov: 52 }}
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
        >
          {/* Kontrol Kamera Responsif Otomatis untuk HP & iPad */}
          <ResponsiveCamera baseY={0.2} baseZ={5.2} targetWidth={8.8} />

          {/* Panggung, Lampu Moving Head, Rigging & Crowd Glowsticks */}
          <ConcertStage3D isConcertActive={isConcertActive} />

          {/* Pesawat Kedatangan */}
          {!hasExitedArrivalPlane || isArrivalPlaneFlyingAway ? (
            <TravelAirplane3D
              position={[3.2, -1.8, 0.4]}
              scale={0.58}
              direction="left"
              showPilot={false}
              label={!hasExitedArrivalPlane ? '✈️ Klik untuk Turun!' : ''}
              highlight={!hasExitedArrivalPlane}
              isTakingOff={isArrivalPlaneFlyingAway}
              onClick={() => handleDisembark()}
              onFlightComplete={() => {
                // Pesawat kedatangan sudah hilang di angkasa
              }}
            />
          ) : null}

          {/* Pesawat Keberangkatan */}
          {(isDeparturePlaneReady || isDeparturePlaneFlying) && (
            <TravelAirplane3D
              position={[-3.5, -1.8, 0.4]}
              scale={0.58}
              label="✈️ Perjalanan Selanjutnya"
              highlight={isDeparturePlaneReady}
              isTakingOff={isDeparturePlaneFlying}
              onClick={handleBoardDeparturePlane}
              onFlightComplete={() => {
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
            onPointerDown={(e) => {
              e.stopPropagation();
              handleStageClick([
                Math.max(-2.8, Math.min(3.5, e.point.x)),
                -1.95,
                Math.max(-0.6, Math.min(1.4, e.point.z)),
              ]);
            }}
          >
            <planeGeometry args={[16, 10]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* Invisible Full-Screen Plane untuk deteksi klik di mana saja */}
          <mesh
            position={[0, 0, -1]}
            visible={false}
            onPointerDown={(e) => {
              const p = e.point;
              const clampedX = Math.min(Math.max(p.x, -2.8), 3.5);
              const clampedY = -1.95;
              const clampedZ = Math.min(Math.max((p.y + 1.2) * 0.5 + 0.4, -0.6), 1.4);
              handleStageClick([clampedX, clampedY, clampedZ]);
            }}
          >
            <planeGeometry args={[30, 20]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </Canvas>
      </div>
    </div>
  );
};

