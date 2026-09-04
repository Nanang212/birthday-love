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

  // Handler klik di mana saja pada layar atau pada rumah kanan
  // Handler klik di mana saja pada layar atau pada pesawat kedatangan
  const handleTriggerExit = (point?: [number, number, number]) => {
    if (isReturning) return;

    if (!hasExitedHouse) {
      setHasExitedHouse(true);
      // Pertama kali keluar, arahkan Capy berjalan ke arah tengah-bawah layar
      setTargetPos(point ?? [0.2, -0.8, 1.0]);

      // Begitu Capy melangkah turun ke jalan, pesawat kedatangan terbang pergi!
      setTimeout(() => {
        setIsArrivalPlaneFlying(true);
      }, 700);
    } else if (point) {
      // Jika sudah keluar, Capy berjalan ke titik klik baru & counter bertambah
      setTargetPos(point);
      setWalkClicks((prev) => prev + 1);
    }
  };

  // Handler klik menuju Pesawat 3D & terbang ke Perjalanan Selanjutnya
  const handleBoardAirplane = () => {
    if (isReturning || isAirplaneFlying) return;
    setIsReturning(true);
    setHasExitedHouse(true);

    // Arahkan Capy berjalan menuju tangga pesawat di pojok kiri bawah [-3.1, -1.75, 0.4]
    setTargetPos([-3.1, -1.75, 0.4]);

    // Begitu Capy mendekati pesawat (~1100ms), Capy naik ke dalam kokpit dan pesawat lepas landas!
    setTimeout(() => {
      setIsAirplaneFlying(true);
    }, 1100);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 1. Background Video YouTube Jalan Tunjungan Full Screen Looping (2160p 4K @ 0.5x Speed) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        <div
          id="yt-tunjungan-player"
          style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            width: '100vw',
            height: '100vh',
            minWidth: '185vh',
            minHeight: '60vw',
            transform: 'translate(-50%, -38%) scale(1.42)',
            border: 'none',
          }}
        />

      </div>

      {/* 3. 3D Canvas di atas Video */}
      <div className="scene-container" style={{ zIndex: 10 }}>
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

          {/* Pesawat Kedatangan di Pojok Kanan Bawah Sendiri - Terbang pergi saat Capy sudah turun! */}
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

          {/* Pesawat 3D: "✈️ Perjalanan Selanjutnya" di Pojok Kiri Bawah - HANYA tampil setelah maskot selesai pamitan */}
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

          {/* Maskot Kapibara: Awalnya di pintu rumah kanan, melangkah keluar saat diklik */}
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

          {/* Maskot Surabaya: Sura (Hiu) dari kiri & Baya (Buaya) dari kanan - pergi & hilang setelah pamitan selesai */}
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
      <div className="ui-overlay" style={{ zIndex: 20 }}>
        {/* Tombol Kontrol Musik Lagu Daerah Surabaya: Rek Ayo Rek */}
        <button
          id="btn-music-rek-ayo-rek"
          onClick={toggleMusic}
          style={{
            position: 'fixed',
            top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
            left: 'clamp(0.6rem, 2vw, 1.5rem)',
            zIndex: 35,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem clamp(0.6rem, 1.5vw, 1.0rem)',
            borderRadius: '9999px',
            background: isPlayingMusic ? 'rgba(255, 159, 67, 0.35)' : 'rgba(20, 20, 25, 0.75)',
            border: isPlayingMusic ? '1.5px solid rgba(254, 202, 87, 0.8)' : '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#ffffff',
            fontSize: 'clamp(0.72rem, 1.8vw, 0.84rem)',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: isPlayingMusic ? '0 0 20px rgba(254, 202, 87, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.25s ease',
          }}
          title={isPlayingMusic ? 'Klik untuk jeda lagu' : 'Klik untuk putar lagu'}
        >
          <span style={{ fontSize: '1.05rem' }}>{isPlayingMusic ? '🎶' : '🔇'}</span>
          <span>{isPlayingMusic ? 'Rek Ayo Rek' : 'Putar Musik'}</span>
        </button>

        {/* Petunjuk Interaksi Atas */}
        <div style={{
          position: 'fixed',
          top: 'calc(3.25rem + env(safe-area-inset-top, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          maxWidth: 'min(92vw, 620px)',
          width: 'max-content',
          background: 'rgba(7, 11, 22, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(240, 194, 127, 0.5)',
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
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.75)',
          pointerEvents: 'none',
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
        }}>
          <span>🦫</span>
          <span>
            {!hasExitedHouse ? (
              <>
                Capy sudah mendarat di pesawat kedatangan! <strong style={{ color: '#ffd166' }}>Klik pesawat atau layar ↘</strong> untuk mengajak Capy turun & jalan-jalan! ✈️✨
              </>
            ) : isArrivalPlaneFlying && !isArrivalPlaneGone ? (
              <>
                🛫 <strong style={{ color: '#ffd166' }}>Pesawat kedatangan terbang kembali ke angkasa!</strong> Capy siap menjelajahi Tunjungan... ✨
              </>
            ) : isAirplaneFlying ? (
              <>
                🛫 <strong style={{ color: '#ffd166' }}>Pesawat Capy lepas landas!</strong> Terbang menuju perjalanan selanjutnya... ✨
              </>
            ) : isReturning ? (
              <>
                Capy sedang bersiap naik ke pesawat... ✈️
              </>
            ) : areMascotsDoneFarewell ? (
              <>
                ✈️ <strong style={{ color: '#ffd166' }}>Pesawat Perjalanan Selanjutnya telah tiba!</strong> Klik balon Capy atau pesawat di pojok kiri ↙ untuk terbang! ✨
              </>
            ) : !isReadyForMascots && walkClicks >= 4 ? (
              <>
                🏃‍♂️ <strong style={{ color: '#ffd166' }}>Kalau sudah capek jalan-jalannya</strong>, jangan lupa klik tombol <strong style={{ color: '#ffd166' }}>Ready! ✨</strong>
              </>
            ) : !isReadyForMascots ? (
              <>
                <strong style={{ color: '#ffd166' }}>Ajak Capy jalan-jalan ({walkClicks}/4)</strong> • Klik layar untuk berjalan
              </>
            ) : isReadyForMascots && !areMascotsDoneFarewell ? (
              <>
                🐊🦈 <strong style={{ color: '#ffd166' }}>Sura & Baya sedang menyapa Capy...</strong> Dengarkan cerita hangat mereka! ✨
              </>
            ) : (
              <>
                <strong style={{ color: '#ffd166' }}>Klik layar</strong> untuk jalan •{' '}
                <strong style={{ color: '#ffd166' }}>Klik Capy</strong> untuk putar 360° •{' '}
                <strong style={{ color: '#ffd166' }}>SPASI</strong> lompat
              </>
            )}
          </span>
        </div>

        {/* Tombol Ready yang muncul di tengah bawah setelah Capy jalan-jalan minimal 4 kali */}
        {hasExitedHouse && walkClicks >= 4 && !isReadyForMascots && (
          <div
            style={{
              position: 'fixed',
              bottom: '2.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 35,
              animation: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <button
              id="btn-ready-mascots"
              onClick={(e) => {
                e.stopPropagation();
                setIsReadyForMascots(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 2.2rem',
                borderRadius: '9999px',
                border: '2px solid rgba(255, 255, 255, 0.85)',
                background: 'linear-gradient(135deg, #feca57, #ff9f43, #ee5253)',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(238, 82, 83, 0.6), 0 0 25px rgba(254, 202, 87, 0.5)',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.25s ease',
              }}
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
