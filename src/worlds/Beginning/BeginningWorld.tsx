// ============================================================
// WORLD 1 — Jalan Tunjungan (Our Beginning)
// Background full looping video Jalan Tunjungan 2160p 4K dengan speed 0.5x sinematik
// Pojok Kanan Bawah: "🏡 Rumah Pertama" (tempat Capy keluar)
// Pojok Kiri Bawah: "🚪 Keluar Rumah" (kembali ke tampilan utama)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Capy } from '../../components/capybara/Capy';
import { TravelAirplane3D } from '../../components/scene/TravelAirplane3D';
import { SurabayaMascots } from '../../components/scene/SurabayaMascots';
import { ResponsiveCamera } from '../../components/scene/ResponsiveCamera';
import { useStory } from '../../hooks/useStory';

import type { YouTubePlayerEvent, YouTubePlayerInstance } from '../../types/youtube';

export function BeginningWorld() {
  const { goToWorld } = useStory();

  // State: apakah Kapibara sudah keluar dari rumah
  const [hasExitedHouse, setHasExitedHouse] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  // Target posisi jalan Kapibara
  const [targetPos, setTargetPos] = useState<[number, number, number] | null>(null);

  // Counter jalan Capy & State tombol Ready untuk kemunculan maskot
  const [walkClicks, setWalkClicks] = useState(0);
  const [isReadyForMascots, setIsReadyForMascots] = useState(false);
  const [areMascotsDoneFarewell, setAreMascotsDoneFarewell] = useState(false);
  const [isAirplaneFlying, setIsAirplaneFlying] = useState(false);
  const [isArrivalPlaneFlying, setIsArrivalPlaneFlying] = useState(false);
  const [isArrivalPlaneGone, setIsArrivalPlaneGone] = useState(false);

  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Fungsi mengecilkan volume lagu Rek Ayo Rek otomatis menjadi backsound lembut
  const duckBacksound = useCallback(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const fadeInterval = setInterval(() => {
      if (audio.volume > 0.16) {
        audio.volume = Math.max(0.14, audio.volume - 0.05);
      } else {
        clearInterval(fadeInterval);
      }
    }, 80);
  }, []);

  // Handler stabil saat maskot Sura & Baya selesai berpamitan
  const handleMascotsFinished = useCallback(() => {
    setAreMascotsDoneFarewell(true);
  }, []);

  // Inisialisasi Audio Lagu Rek Ayo Rek (Khas Surabaya)
  useEffect(() => {
    const audio = new Audio('/audio/rek_ayo_rek.mp3');
    audio.loop = true;
    audio.volume = 0.55;
    audioRef.current = audio;

    const startAudio = () => {
      audio.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(() => {
        // Autoplay browser memerlukan gesture user
      });
    };

    // Coba putar otomatis saat masuk
    startAudio();

    // Fallback: Jika diblokir oleh browser sebelum ada interaksi klik
    const onUserInteraction = () => {
      if (audio.paused) {
        audio.play().then(() => setIsPlayingMusic(true)).catch(() => {});
      }
    };
    window.addEventListener('click', onUserInteraction, { once: true });
    window.addEventListener('touchstart', onUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    } else {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    }
  };

  // Inisialisasi YouTube Player API untuk kontrol 2160p 4K & Kecepatan 0.5x
  useEffect(() => {
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      playerRef.current = new window.YT.Player('yt-tunjungan-player', {
        videoId: 'kHivqQ1LOxE',
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: 'kHivqQ1LOxE',
          controls: 0,
          showinfo: 0,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          cc_load_policy: 0,
          cc_lang_pref: 'off',
          vq: 'hd2160', // Request 2160p 4K
        },
        events: {
          onReady: (event: YouTubePlayerEvent) => {
            // Set kecepatan video ke 0.5x
            event.target.setPlaybackRate?.(0.5);
            // Set kualitas tertinggi 2160p 4K
            if (event.target.setPlaybackQuality) {
              event.target.setPlaybackQuality('hd2160');
            }
            // Matikan subtitle/captions jika ada modul CC YouTube aktif
            try {
              event.target.unloadModule?.('captions');
              event.target.unloadModule?.('cc');
            } catch {
              // ignore
            }

            // Mulai lagu Rek Ayo Rek ketika video sudah siap
            if (audioRef.current && audioRef.current.paused) {
              audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
            }
          },
          onStateChange: (event: YouTubePlayerEvent) => {
            // Pastikan kecepatan 0.5x tetap aktif saat loop/play
            if (event.data === window.YT?.PlayerState.PLAYING) {
              event.target.setPlaybackRate?.(0.5);
              if (event.target.setPlaybackQuality) {
                event.target.setPlaybackQuality('hd2160');
              }
              if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
              }
            }
          },
          onPlaybackRateChange: (event: YouTubePlayerEvent) => {
            // Jika berubah, kembalikan ke 0.5
            if (event.data !== 0.5) {
              event.target.setPlaybackRate?.(0.5);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Load YouTube Iframe API script jika belum ada
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore
      }
    };
  }, []);

  // Handler klik di mana saja pada layar atau pada pesawat kedatangan
  const handleTriggerExit = (point?: [number, number, number]) => {
    if (isReturning) return;

    if (!hasExitedHouse) {
      setHasExitedHouse(true);
      setTargetPos(point ?? [0.2, -0.8, 1.0]);

      // Begitu Capy melangkah turun ke jalan, pesawat kedatangan terbang pergi!
      setTimeout(() => {
        setIsArrivalPlaneFlying(true);
      }, 700);
    } else if (point) {
      setTargetPos(point);
      setWalkClicks((prev) => prev + 1);
    }
  };

  // Handler klik menuju Pesawat 3D & terbang ke Perjalanan Selanjutnya
  const handleBoardAirplane = () => {
    if (isReturning || isAirplaneFlying) return;
    setIsReturning(true);
    setHasExitedHouse(true);

    setTargetPos([-3.1, -1.75, 0.4]);

    setTimeout(() => {
      setIsAirplaneFlying(true);
    }, 1100);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 1. Background Video YouTube Jalan Tunjungan Full Screen Looping (2160p 4K @ 0.5x Speed) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          id="yt-tunjungan-player"
          className="absolute border-none"
          style={{
            top: '38%',
            left: '50%',
            width: '100vw',
            height: '100vh',
            minWidth: '185vh',
            minHeight: '60vw',
            transform: 'translate(-50%, -38%) scale(1.42)',
          }}
        />
      </div>

      {/* 3. 3D Canvas di atas Video */}
      <div className="scene-container z-10">
        <Canvas
          camera={{ position: [0, 0.8, 5.2], fov: 55 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          {/* Kontrol Kamera Responsif Otomatis untuk HP & iPad */}
          <ResponsiveCamera baseY={0.8} baseZ={5.2} targetWidth={8.8} />

          {/* Pencahayaan hangat suasana malam kota */}
          <ambientLight intensity={1.1} color="#ffeaa7" />
          <directionalLight position={[4, 6, 4]} intensity={1.4} color="#ffd194" />
          <pointLight position={[3.8, -0.8, 1.2]} intensity={1.5} color="#f9ca24" distance={8} />
          <pointLight position={[-3.8, -0.8, 1.2]} intensity={1.5} color="#00d2d3" distance={8} />

          {/* Pesawat Kedatangan di Pojok Kanan Bawah - Terbang pergi saat Capy sudah turun! */}
          {!isArrivalPlaneGone && (
            <TravelAirplane3D
              position={[3.5, -1.8, 0.4]}
              scale={0.58}
              direction="left"
              label="✈️ Pesawat Kedatangan"
              highlight={!hasExitedHouse}
              isTakingOff={isArrivalPlaneFlying}
              showPilot={false}
              onClick={() => handleTriggerExit([0.5, -0.8, 1.0])}
              onFlightComplete={() => {
                setIsArrivalPlaneGone(true);
              }}
            />
          )}

          {/* Pesawat 3D: "✈️ Perjalanan Selanjutnya" di Pojok Kiri Bawah */}
          {(areMascotsDoneFarewell || isReturning) && (
            <TravelAirplane3D
              position={[-3.5, -1.8, 0.4]}
              scale={0.58}
              label="✈️ Perjalanan Selanjutnya"
              highlight={isReturning || areMascotsDoneFarewell}
              isTakingOff={isAirplaneFlying}
              onClick={handleBoardAirplane}
              onFlightComplete={() => {
                goToWorld('concert');
              }}
            />
          )}

          {/* Maskot Kapibara */}
          <Capy
            outfit="normal"
            position={[3.8, -1.95, 0.4]}
            scale={isAirplaneFlying ? 0.001 : hasExitedHouse ? 0.52 : 0.001}
            targetPosition={targetPos}
            speechBubble={
              areMascotsDoneFarewell && !isReturning && !isAirplaneFlying
                ? 'Terbang ke Perjalanan Selanjutnya!'
                : null
            }
            onSpeechBubbleClick={handleBoardAirplane}
          />

          {/* Maskot Surabaya: Sura (Hiu) & Baya (Buaya) */}
          {!areMascotsDoneFarewell && (
            <SurabayaMascots
              isStarted={isReadyForMascots}
              onArrived={duckBacksound}
              onMascotsFinished={handleMascotsFinished}
            />
          )}

          {/* Invisible Click Plane untuk menggerakkan Capy di seluruh layar */}
          <mesh
            position={[0, 0, 0]}
            visible={false}
            onPointerDown={(e) => {
              const p = e.point;
              const clampedX = Math.min(Math.max(p.x, -3.6), 3.6);
              const clampedY = Math.min(Math.max(p.y, -1.8), 0.5);
              handleTriggerExit([clampedX, clampedY, 1.0]);
            }}
          >
            <planeGeometry args={[25, 18]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="ui-overlay z-20">
        {/* Tombol Kontrol Musik Lagu Daerah Surabaya: Rek Ayo Rek */}
        <button
          id="btn-music-rek-ayo-rek"
          onClick={toggleMusic}
          className={`fixed top-[calc(0.75rem+env(safe-area-inset-top,0px))] left-[clamp(0.6rem,2vw,1.5rem)] z-[35]
            flex items-center gap-1.5 px-[clamp(0.6rem,1.5vw,1.0rem)] py-2 rounded-full
            backdrop-blur-md text-white text-[clamp(0.72rem,1.8vw,0.84rem)] font-semibold
            cursor-pointer transition-all duration-200
            ${isPlayingMusic
              ? 'bg-[rgba(255,159,67,0.35)] border border-[rgba(254,202,87,0.8)] shadow-[0_0_20px_rgba(254,202,87,0.4)]'
              : 'bg-[rgba(20,20,25,0.75)] border border-[rgba(255,255,255,0.25)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
            }`}
          title={isPlayingMusic ? 'Klik untuk jeda lagu' : 'Klik untuk putar lagu'}
        >
          <span className="text-lg">{isPlayingMusic ? '🎶' : '🔇'}</span>
          <span>{isPlayingMusic ? 'Rek Ayo Rek' : 'Putar Musik'}</span>
        </button>

        {/* Petunjuk Interaksi Atas */}
        <div className="fixed top-[calc(3.25rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-[25]
          w-[min(94vw,620px)] bg-[rgba(7,11,22,0.92)] backdrop-blur-md
          border border-[rgba(240,194,127,0.5)] rounded-2xl
          px-[clamp(0.75rem,2.5vw,1.3rem)] py-2
          text-[clamp(0.68rem,2.2vw,0.86rem)] leading-snug text-white
          flex items-center justify-center text-center gap-2
          shadow-[0_8px_32px_rgba(0,0,0,0.75)] pointer-events-none
          [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]"
        >
          <span>🦫</span>
          <span>
            {!hasExitedHouse ? (
              <>
                Capy sudah mendarat di pesawat kedatangan! <strong className="text-[#ffd166]">Klik pesawat atau layar ↘</strong> untuk mengajak Capy turun &amp; jalan-jalan! ✈️✨
              </>
            ) : isArrivalPlaneFlying && !isArrivalPlaneGone ? (
              <>
                🛫 <strong className="text-[#ffd166]">Pesawat kedatangan terbang kembali ke angkasa!</strong> Capy siap menjelajahi Tunjungan... ✨
              </>
            ) : isAirplaneFlying ? (
              <>
                🛫 <strong className="text-[#ffd166]">Pesawat Capy lepas landas!</strong> Terbang menuju perjalanan selanjutnya... ✨
              </>
            ) : isReturning ? (
              <>
                Capy sedang bersiap naik ke pesawat... ✈️
              </>
            ) : areMascotsDoneFarewell ? (
              <>
                ✈️ <strong className="text-[#ffd166]">Pesawat Perjalanan Selanjutnya telah tiba!</strong> Klik balon Capy atau pesawat di pojok kiri ↙ untuk terbang! ✨
              </>
            ) : !isReadyForMascots && walkClicks >= 4 ? (
              <>
                🏃‍♂️ <strong className="text-[#ffd166]">Kalau sudah capek jalan-jalannya</strong>, jangan lupa klik tombol <strong className="text-[#ffd166]">Ready! ✨</strong>
              </>
            ) : !isReadyForMascots ? (
              <>
                <strong className="text-[#ffd166]">Ajak Capy jalan-jalan ({walkClicks}/4)</strong> • Klik layar untuk berjalan
              </>
            ) : isReadyForMascots && !areMascotsDoneFarewell ? (
              <>
                🐊🦈 <strong className="text-[#ffd166]">Sura &amp; Baya sedang menyapa Capy...</strong> Dengarkan cerita hangat mereka! ✨
              </>
            ) : (
              <>
                <strong className="text-[#ffd166]">Klik layar</strong> untuk jalan •{' '}
                <strong className="text-[#ffd166]">Klik Capy</strong> untuk putar 360° •{' '}
                <strong className="text-[#ffd166]">SPASI</strong> lompat
              </>
            )}
          </span>
        </div>

        {/* Tombol Ready yang muncul di tengah bawah setelah Capy jalan-jalan minimal 4 kali */}
        {hasExitedHouse && walkClicks >= 4 && !isReadyForMascots && (
          <div className="fixed bottom-[calc(2.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[35] animate-[fadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)]">
            <button
              id="btn-ready-mascots"
              onClick={(e) => {
                e.stopPropagation();
                setIsReadyForMascots(true);
              }}
              className="flex items-center gap-3 px-9 py-3.5 rounded-full
                border-2 border-white/85
                bg-gradient-to-br from-[#feca57] via-[#ff9f43] to-[#ee5253]
                text-white text-base font-extrabold tracking-wide
                cursor-pointer shadow-[0_8px_30px_rgba(238,82,83,0.6),0_0_25px_rgba(254,202,87,0.5)]
                [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200
                hover:scale-105 active:scale-95 min-h-[52px]"
            >
              <span>✨</span>
              <span>Aku Sudah Siap (Ready!)</span>
              <span>🦈🐊</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
