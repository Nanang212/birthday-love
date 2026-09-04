// ============================================================
// WORLD 2 — Romantic Taipei Journey (Perjalanan Terakhir & Surat Cinta)
// Nuansa: Malam Romantis di Taipei
// 1. Awal: Lentera Langit Pingxi (Sky Lanterns) Three.js, Siluet Taipei 101, Bintang & Suasana Romantis
// 2. Capy turun dari pesawat kedatangan, pesawat kedatangan terbang pergi
// 3. Bravo (Taipei Bear) datang menyapa dengan suara asli Indonesia:
//    - "Bravoo, welcome to taipee capy !!!"
//    - "Ini adalah perjalanan terakhir di website ini... Namun di realita nantinya, akan ada orang yang mengusahakan kamu untuk tetap bisa menikmati perjalanan yang lain."
//    - "Kamu juga mendapatkan pesan loh dari si pembuat website, yok dibaca!"
// 4. Animasi Three.js Taipei Bear menarik kertas ucapan ulang tahun dari samping
// 5. Begitu kertas ucapan terbuka: OTOMATIS video petasan menyala & kembang api Three.js meletus meriah!
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Capy } from '../../components/capybara/Capy';
import { TravelAirplane3D } from '../../components/scene/TravelAirplane3D';
import { TaipeiBear } from '../../components/scene/TaipeiBear';
import { Fireworks } from '../../components/scene/Fireworks';
import { RomanticTaipeiDecor } from '../../components/scene/RomanticTaipeiDecor';
import { ResponsiveCamera } from '../../components/scene/ResponsiveCamera';
import { useStory } from '../../hooks/useStory';

/* ── Komponen Bunga-bunga & Rumput di Kebun Bawah ── */
function GardenDecor() {
  const flowerColors = ['#ff7675', '#fd79a8', '#ffeaa7', '#a29bfe', '#fab1a0', '#55efc4'];

  return (
    <group position={[0, -2.1, 0]}>
      {/* 1. Hamparan Rumput Kebun */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 6]} />
        <meshStandardMaterial color="#1e3d2f" roughness={0.9} />
      </mesh>

      {/* Bukit-bukit rumput hijau malam lembut */}
      <mesh position={[-2.5, 0.2, -1.2]} scale={[2.5, 0.7, 1.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.85} />
      </mesh>
      <mesh position={[2.2, 0.25, -1.0]} scale={[2.2, 0.8, 1.4]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#40916c" roughness={0.85} />
      </mesh>
      <mesh position={[0.2, 0.15, -1.5]} scale={[3.0, 0.6, 1.8]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#1e3d2f" roughness={0.85} />
      </mesh>

      {/* Semak-semak hijau mini */}
      <mesh position={[-1.2, 0.3, 0.2]} scale={[0.4, 0.35, 0.4]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color="#52b788" />
      </mesh>
      <mesh position={[1.4, 0.28, 0.3]} scale={[0.45, 0.38, 0.4]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color="#40916c" />
      </mesh>

      {/* Bunga-bunga kecil mekar bercahaya lembut */}
      {flowerColors.map((color, idx) => {
        const xPos = -3.2 + idx * 1.3;
        const zPos = 0.2 + (idx % 2) * 0.35;
        return (
          <group key={idx} position={[xPos, 0.35, zPos]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
              <meshBasicMaterial color="#2d6a4f" />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function JourneyWorld() {
  const { goToWorld } = useStory();

  const [hasExitedHouse, setHasExitedHouse] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [targetPos, setTargetPos] = useState<[number, number, number] | null>(null);
  const [isAirplaneFlying, setIsAirplaneFlying] = useState(false);
  const [isArrivalPlaneFlying, setIsArrivalPlaneFlying] = useState(false);
  const [isArrivalPlaneGone, setIsArrivalPlaneGone] = useState(false);
  const [isBearActive, setIsBearActive] = useState(false);
  const [isNextFlightReady, setIsNextFlightReady] = useState(false);

  // Kembang api Three.js & video petasan dimulai HANYA setelah kertas ditarik & terbuka
  const [isFireworksActive, setIsFireworksActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Guard agar Capy hanya otomatis berjalan ke pojok kiri satu kali di awal
  const hasAutoMovedCapy = useRef(false);

  // Audio ucapan si pemilik website & timer 3 detik setelah surat dibuka
  const ucapanAudioRef = useRef<HTMLAudioElement | null>(null);
  const ucapanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLetterClosedRef = useRef(false);
  const resumeOnClickRef = useRef<(() => void) | null>(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  // Fungsi memutar audio ucapan dari folder public/audio/memories/ucapan
  const playUcapanVoice = useCallback(() => {
    // JIKA SURAT SUDAH DITUTUP, JANGAN PERNAH PUTAR AUDIO UCAPAN
    if (isLetterClosedRef.current) return;

    if (!ucapanAudioRef.current) {
      const audio = new Audio('/audio/memories/ucapan/ucapan.m4a');
      audio.volume = 1.0;
      audio.onplay = () => setIsVoicePlaying(true);
      audio.onpause = () => setIsVoicePlaying(false);
      audio.onended = () => {
        setIsVoicePlaying(false);
        // Naikkan kembali volume petasan perlahan setelah rekaman ucapan selesai
        if (videoRef.current && !videoRef.current.muted) {
          videoRef.current.volume = 0.55;
        }
      };
      audio.onerror = () => {
        if (isLetterClosedRef.current) return;
        // Fallback ke file aac jika diperlukan
        const fallback = new Audio('/audio/memories/ucapan/WhatsApp Audio 2026-09-04 at 23.19.51.aac');
        fallback.volume = 1.0;
        fallback.onplay = () => setIsVoicePlaying(true);
        fallback.onpause = () => setIsVoicePlaying(false);
        fallback.play().catch(() => {});
        ucapanAudioRef.current = fallback;
      };
      ucapanAudioRef.current = audio;
    }

    ucapanAudioRef.current.currentTime = 0;
    ucapanAudioRef.current.play().then(() => {
      if (isLetterClosedRef.current) {
        ucapanAudioRef.current?.pause();
        return;
      }
      setIsVoicePlaying(true);
    }).catch(() => {
      if (isLetterClosedRef.current) return;
      // Jika autoplay diblokir browser, pasang listener satu kali klik
      const resumeOnClick = () => {
        if (isLetterClosedRef.current) {
          window.removeEventListener('click', resumeOnClick);
          resumeOnClickRef.current = null;
          return;
        }
        ucapanAudioRef.current?.play().catch(() => {});
        window.removeEventListener('click', resumeOnClick);
        resumeOnClickRef.current = null;
      };
      resumeOnClickRef.current = resumeOnClick;
      window.addEventListener('click', resumeOnClick, { once: true });
    });
  }, []);

  const toggleVoiceAudio = useCallback(() => {
    if (isLetterClosedRef.current) return;
    if (!ucapanAudioRef.current) {
      playUcapanVoice();
      return;
    }
    if (ucapanAudioRef.current.paused) {
      if (videoRef.current) videoRef.current.volume = 0.18;
      ucapanAudioRef.current.play().catch(() => {});
    } else {
      ucapanAudioRef.current.pause();
    }
  }, [playUcapanVoice]);

  // Cleanup audio dan timer saat unmount
  useEffect(() => {
    return () => {
      isLetterClosedRef.current = true;
      if (ucapanTimerRef.current) clearTimeout(ucapanTimerRef.current);
      if (resumeOnClickRef.current) {
        window.removeEventListener('click', resumeOnClickRef.current);
        resumeOnClickRef.current = null;
      }
      if (ucapanAudioRef.current) {
        ucapanAudioRef.current.pause();
        ucapanAudioRef.current.src = '';
        ucapanAudioRef.current = null;
      }
    };
  }, []);

  // Trigger saat mulai menarik kertas: Capy otomatis bergeser ke pojok kiri (hanya pertama kali)
  const handleStartPullingPaper = useCallback(() => {
    if (!hasAutoMovedCapy.current) {
      hasAutoMovedCapy.current = true;
      setTargetPos([-2.8, -1.6, 0.8]);
    }
  }, []);

  // Trigger saat surat ucapan Three.js selesai ditarik oleh beruang:
  // Kembang api & petasan menyala, lalu selang 3 detik suara petasan diturunkan menjadi backsound lembut
  // dan audio ucapan dari si pemilik website mulai diputar
  const handleLetterRevealed = useCallback(() => {
    isLetterClosedRef.current = false;
    setIsFireworksActive(true);

    if (videoRef.current) {
      videoRef.current.volume = 0.85;
      videoRef.current.muted = false;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMuted(false);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play();
            }
          });
      }
    }

    // Selang 3 detik: jika surat masih terbuka, suara petasan dijadikan backsound lembut dan audio ucapan diputar
    if (ucapanTimerRef.current) clearTimeout(ucapanTimerRef.current);
    ucapanTimerRef.current = setTimeout(() => {
      if (isLetterClosedRef.current) return;
      if (videoRef.current) {
        videoRef.current.volume = 0.18; // Backsound petasan lembut
      }
      playUcapanVoice();
    }, 3000);
  }, [playUcapanVoice]);

  // Trigger saat surat ditutup: HENTIKAN TOTAL suara ucapan & timer apapun, pesawat siap ditampilkan
  const handleLetterClosed = useCallback(() => {
    isLetterClosedRef.current = true;
    setIsNextFlightReady(true);
    if (ucapanTimerRef.current) {
      clearTimeout(ucapanTimerRef.current);
      ucapanTimerRef.current = null;
    }
    if (resumeOnClickRef.current) {
      window.removeEventListener('click', resumeOnClickRef.current);
      resumeOnClickRef.current = null;
    }
    if (ucapanAudioRef.current) {
      ucapanAudioRef.current.pause();
      ucapanAudioRef.current.currentTime = 0;
      setIsVoicePlaying(false);
    }
    // Kembalikan volume normal petasan
    if (videoRef.current && !videoRef.current.muted) {
      videoRef.current.volume = 0.55;
    }
  }, []);

  // Trigger saat surat dibuka kembali
  const handleReopenLetterInJourney = useCallback(() => {
    isLetterClosedRef.current = false;
    if (videoRef.current) {
      videoRef.current.volume = 0.18;
    }
    playUcapanVoice();
  }, [playUcapanVoice]);

  // Trigger Capy keluar dari Pesawat Kedatangan ke kebun
  const handleTriggerExit = (point?: [number, number, number]) => {
    if (isReturning || isAirplaneFlying) return;

    if (!hasExitedHouse) {
      setHasExitedHouse(true);
      // Capy berjalan anggun ke posisi kiri-tengah menyongsong Taipei
      setTargetPos(point ?? [-1.1, -1.6, 0.8]);

      // Pesawat kedatangan terbang kembali ke angkasa
      setTimeout(() => {
        setIsArrivalPlaneFlying(true);
      }, 700);
    } else if (point) {
      setTargetPos(point);
    }
  };

  // Handler klik menuju Pesawat 3D & terbang ke Perjalanan Selanjutnya (kembali ke awal/rumah)
  const handleBoardAirplane = () => {
    if (isReturning || isAirplaneFlying) return;
    setIsReturning(true);
    setHasExitedHouse(true);

    // Hentikan suara ucapan & timer secara instan agar tidak bersuara saat kembali ke Opening
    if (ucapanTimerRef.current) {
      clearTimeout(ucapanTimerRef.current);
      ucapanTimerRef.current = null;
    }
    if (ucapanAudioRef.current) {
      ucapanAudioRef.current.pause();
      ucapanAudioRef.current.currentTime = 0;
      ucapanAudioRef.current.src = '';
      ucapanAudioRef.current = null;
      setIsVoicePlaying(false);
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }

    // Arahkan Capy berjalan menuju pesawat di kiri
    setTargetPos([-3.1, -1.75, 0.4]);

    setTimeout(() => {
      setIsAirplaneFlying(true);
    }, 1100);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#070a14' }}>
      {/* 1. 3D Canvas Background (Langit Malam Romantis + Sky Lanterns + Taipei 101 + Fireworks + Kebun) */}
      <div className="scene-container" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 0.6, 5.2], fov: 55 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          {/* Kontrol Kamera Responsif Otomatis untuk HP & iPad */}
          <ResponsiveCamera baseY={0.6} baseZ={5.2} targetWidth={8.8} />

          {/* Pencahayaan Malam Romantis Bernuansa Lavender & Warm Gold */}
          <ambientLight intensity={0.75} color="#dbe4ff" />
          <directionalLight position={[5, 8, 5]} intensity={1.1} color="#ffd8a8" />
          <pointLight position={[3.8, -0.8, 1.2]} intensity={1.4} color="#f9ca24" distance={8} />
          <pointLight position={[-3.8, -0.8, 1.2]} intensity={1.4} color="#ff7675" distance={8} />

          {/* Bintang-bintang malam berkerlap-kerlip */}
          <Stars radius={80} depth={50} count={2200} factor={3} saturation={0} fade speed={0.6} />

          {/* Nuansa Romantis Khas Taipei (Lentera Langit Pingxi, Siluet Taipei 101, Bokeh Hangat) */}
          <RomanticTaipeiDecor />

          {/* Pertunjukan Kembang Api Three.js — Menyala saat isFireworksActive = true */}
          <Fireworks active={isFireworksActive} />

          {/* Dekorasi Kebun Hijau Bawah */}
          <GardenDecor />

          {/* Pesawat Kedatangan di Pojok Kanan Bawah — Terbang pergi saat Capy sudah turun! */}
          {!isArrivalPlaneGone && (
            <TravelAirplane3D
              position={[3.5, -1.8, 0.4]}
              scale={0.58}
              direction="left"
              label="✈️ Pesawat Kedatangan"
              highlight={!hasExitedHouse}
              isTakingOff={isArrivalPlaneFlying}
              showPilot={false}
              onClick={() => handleTriggerExit([-1.1, -1.6, 0.8])}
              onFlightComplete={() => {
                setIsArrivalPlaneGone(true);
                setIsBearActive(true);
              }}
            />
          )}

          {/* Maskot Beruang Taipei (Bravo Bear) dengan Dialog Suara Asli Indonesia & Tarik Kertas 3D */}
          <TaipeiBear
            isActive={isBearActive}
            startPosition={[-4.5, -1.6, 0.8]}
            dialoguePosition={[-0.15, -1.6, 0.8]}
            pullPosition={[3.15, -1.6, 0.8]}
            scale={0.52}
            onStartPullingPaper={handleStartPullingPaper}
            onLetterRevealed={handleLetterRevealed}
            onLetterClosed={handleLetterClosed}
            onReopenLetter={handleReopenLetterInJourney}
            isVoicePlaying={isVoicePlaying}
            onToggleVoice={toggleVoiceAudio}
          />

          {/* Pesawat 3D: "✈️ Perjalanan Selanjutnya" — Siap setelah ucapan surat terbuka */}
          {(isNextFlightReady || isReturning) && (
            <TravelAirplane3D
              position={[-3.5, -1.8, 0.4]}
              scale={0.58}
              direction="right"
              label="✈️ Perjalanan Selanjutnya (Realita)"
              highlight={isReturning || isNextFlightReady}
              isTakingOff={isAirplaneFlying}
              onClick={handleBoardAirplane}
              onFlightComplete={() => {
                if (ucapanTimerRef.current) clearTimeout(ucapanTimerRef.current);
                if (ucapanAudioRef.current) {
                  ucapanAudioRef.current.pause();
                  ucapanAudioRef.current.src = '';
                  ucapanAudioRef.current = null;
                }
                goToWorld('opening');
              }}
            />
          )}

          {/* Maskot Kapibara (Capy) */}
          <Capy
            outfit="backpack"
            position={[3.5, -1.8, 0.4]}
            scale={isAirplaneFlying ? 0.001 : hasExitedHouse ? 0.52 : 0.001}
            targetPosition={targetPos}
            speechBubble={
              isNextFlightReady && !isReturning && !isAirplaneFlying
                ? 'Terbang ke Perjalanan Selanjutnya! ✈️'
                : null
            }
            onSpeechBubbleClick={handleBoardAirplane}
          />

          {/* Invisible Click Plane untuk mengarahkan Capy jalan santai di kebun */}
          <mesh
            position={[0, -1.0, 0]}
            visible={false}
            onPointerDown={(e) => {
              const p = e.point;
              const clampedX = Math.min(Math.max(p.x, -3.6), 3.6);
              const clampedY = Math.min(Math.max(p.y, -1.8), -1.0);
              handleTriggerExit([clampedX, clampedY, 0.8]);
            }}
          >
            <planeGeometry args={[25, 12]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </Canvas>
      </div>

      {/* 2. Setengah Layar Atas: Frame Video Elegan (Menampilkan Video Memori & Kembang Api) */}
      <div style={{
        position: 'absolute',
        top: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        left: 0,
        right: 0,
        height: 'clamp(170px, 31vh, 300px)',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 clamp(0.75rem, 2.5vw, 1.5rem)',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'relative',
          maxHeight: '100%',
          maxWidth: 'min(88vw, 720px)',
          height: '100%',
          aspectRatio: '16/9',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: isFireworksActive
            ? '0 16px 45px rgba(0, 0, 0, 0.9), 0 0 40px rgba(240, 194, 127, 0.5)'
            : '0 12px 35px rgba(0, 0, 0, 0.75), 0 0 25px rgba(108, 92, 231, 0.25)',
          border: isFireworksActive
            ? '2px solid rgba(240, 194, 127, 0.65)'
            : '2px solid rgba(162, 155, 254, 0.4)',
          background: 'linear-gradient(135deg, #0f1423 0%, #1a1b35 100%)',
          pointerEvents: 'auto',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <video
            ref={videoRef}
            src="/video/garden_memory.mp4"
            loop
            muted={isMuted}
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: isFireworksActive ? 'block' : 'none',
            }}
          />

          {/* Banner Romantis Pra-Kembang Api (Sebelum Kertas Surat Terbuka) */}
          {!isFireworksActive && (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center',
              background: 'radial-gradient(circle at center, rgba(30, 27, 75, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%)',
              color: '#ffffff',
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '0.4rem',
                filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.7))',
                animation: 'pulse 2s infinite ease-in-out',
              }}>
                🏮✨
              </div>
              <h2 style={{
                margin: '0 0 0.4rem',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}>
                Malam Romantis di Taipei
              </h2>
              <p style={{
                margin: 0,
                fontSize: '0.86rem',
                color: '#d1d5db',
                maxWidth: '420px',
                lineHeight: 1.5,
              }}>
                Capy telah tiba di kota Taipei yang indah bersama lentera malam... 
                Dengarkan sambutan manis dari <strong>Bravo si Beruang Taipei</strong>! 🐻💌
              </p>
            </div>
          )}

          {/* Tombol Unmute Audio Video Kembang Api */}
          {isFireworksActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '9999px',
                padding: '0.35rem 0.75rem',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              {isMuted ? '🔇 Suara Mati' : '🔊 Suara Aktif'}
            </button>
          )}
        </div>
      </div>

      {/* 3. UI Overlay & Petunjuk Interaksi */}
      <div className="ui-overlay" style={{ zIndex: 20 }}>
        {/* World indicator */}
        <div className="world-indicator">
          <div className="world-indicator-pill">
            {isFireworksActive ? '🎆 Taipei: Pesta Kembang Api Ulang Tahun' : '🏮 Taipei: Malam Romantis Lentera'}
          </div>
        </div>

        {/* Petunjuk Interaksi Atas */}
        <div style={{
          position: 'fixed',
          top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          maxWidth: 'min(92vw, 620px)',
          width: 'max-content',
          background: 'rgba(7, 11, 22, 0.94)',
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
          <span>{isFireworksActive ? '🎆' : isArrivalPlaneFlying ? '🛫' : '🏮'}</span>
          <span>
            {!hasExitedHouse ? (
              <>
                Capy sudah mendarat di Taipei! <strong style={{ color: '#ffd166' }}>Klik pesawat kedatangan ↘</strong> untuk mengajak Capy turun! ✈️🏮
              </>
            ) : isArrivalPlaneFlying && !isArrivalPlaneGone ? (
              <>
                🛫 <strong style={{ color: '#ffd166' }}>Pesawat kedatangan kembali ke angkasa!</strong> Selamat datang di malam romantis Taipei... ✨
              </>
            ) : isAirplaneFlying ? (
              <>
                🛫 <strong style={{ color: '#ffd166' }}>Pesawat Capy lepas landas!</strong> Menuju realita dan petualangan indah berikutnya... 💖
              </>
            ) : isReturning ? (
              <>
                Capy sedang bersiap naik ke pesawat... ✈️
              </>
            ) : isBearActive && !isFireworksActive ? (
              <>
                🐻 <strong style={{ color: '#ffd166' }}>Bravo si Beruang Taipei</strong> sedang menyapa Capy! Dengarkan pesan spesialnya... 💌
              </>
            ) : isNextFlightReady ? (
              <>
                ✈️ <strong style={{ color: '#ffd166' }}>Pesawat Perjalanan Selanjutnya telah siap di pojok kiri ↙!</strong> Klik pesawat atau Capy untuk terbang! ✨
              </>
            ) : isFireworksActive ? (
              <>
                🎆 <strong style={{ color: '#ffd166' }}>Pesta Kembang Api Dimulai!</strong> Baca pesan di surat cinta... Klik <strong style={{ color: '#ff7675' }}>✕ Tutup Surat</strong> jika sudah selesai untuk membuka pesawat! ✈️
              </>
            ) : (
              <>
                <strong style={{ color: '#ffd166' }}>Klik kebun</strong> untuk jalan •{' '}
                <strong style={{ color: '#ffd166' }}>Klik Capy/Beruang</strong> putar 360°
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
