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
import { ThreeLoveHeart3D } from '../../components/scene/ThreeLoveHeart3D';
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

  // State untuk alur Voice Note selesai -> Tanya Happy -> Icon Love 3D -> WhatsApp
  const [autoCloseTrigger, setAutoCloseTrigger] = useState(0);
  const [reopenTrigger, setReopenTrigger] = useState(0);
  const [dialogueTriggerIndex, setDialogueTriggerIndex] = useState<number | undefined>(undefined);
  const [isLovePromptActive, setIsLovePromptActive] = useState(false);
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  const [isFlatLetterMode, setIsFlatLetterMode] = useState(false);
  const [missClicksCount, setMissClicksCount] = useState(0);
  const [guideCursor, setGuideCursor] = useState<{
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    key: number;
  } | null>(null);

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
          videoRef.current.volume = 0.45;
        }
        // Otomatis menutup surat ucapan di TaipeiBear
        // Beruang akan otomatis berjalan ke tengah dan memutar dialog bertanya happy!
        setAutoCloseTrigger((prev) => prev + 1);
      };
      audio.onerror = () => {
        if (isLetterClosedRef.current) return;
        // Fallback ke file aac jika diperlukan
        const fallback = new Audio('/audio/memories/ucapan/WhatsApp Audio 2026-09-04 at 23.19.51.aac');
        fallback.volume = 1.0;
        fallback.onplay = () => setIsVoicePlaying(true);
        fallback.onpause = () => setIsVoicePlaying(false);
        fallback.onended = () => {
          setIsVoicePlaying(false);
          setAutoCloseTrigger((prev) => prev + 1);
        };
        fallback.play().catch(() => { });
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
        ucapanAudioRef.current?.play().catch(() => { });
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
      ucapanAudioRef.current.play().catch(() => { });
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

  // Trigger saat surat ditutup: HENTIKAN TOTAL suara ucapan & timer apapun
  const handleLetterClosed = useCallback(() => {
    isLetterClosedRef.current = true;
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

  // Trigger saat surat dibuka kembali: Buka surat di TaipeiBear, selang 3 detik putar VN, setelah VN selesai otomatis tutup
  const handleReopenLetterInJourney = useCallback(() => {
    isLetterClosedRef.current = false;
    setReopenTrigger((prev) => prev + 1);
    if (videoRef.current) {
      videoRef.current.volume = 0.18;
    }
    if (ucapanTimerRef.current) clearTimeout(ucapanTimerRef.current);
    ucapanTimerRef.current = setTimeout(() => {
      if (isLetterClosedRef.current) return;
      playUcapanVoice();
    }, 3000);
  }, [playUcapanVoice]);

  // Handler callback saat dialog beruang selesai
  const handleBearDialogueFinished = useCallback((index: number) => {
    if (index === 4) {
      // Selesai dialog "Dan apakah kamu happy di hari yang spesial ini?"
      // Munculkan icon Love 3D Three.js di panggung!
      setIsLovePromptActive(true);
      setMissClicksCount(0);
    } else if (index === 5) {
      // Selesai dialog pamitan / pilihan baca lagi atau naik pesawat
      setIsNextFlightReady(true);
    }
  }, []);

  // Handler saat cairan merah Love 3D telah terisi penuh (100%)
  const handleHeartFilled = useCallback(() => {
    setIsHeartFilled(true);
    setIsLovePromptActive(false);
    setGuideCursor(null);
    setIsFlatLetterMode(true);
    setIsNextFlightReady(true);

    // Otomatis buka WhatsApp ke nomer 085790663367 dengan pesan bahagia
    const phoneNumber = '6285790663367';
    const message = 'Happy bangett sayang 🥰❤️✨';
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    // Beruang langsung melanjutkan dialog ke-6 sambil mendekap icon love merah!
    setTimeout(() => {
      setDialogueTriggerIndex(5);
    }, 500);

    // Saat user kembali ke website (window focus / visibility visible), pastikan dialog 5 tetap terpicu jika tertunda
    let hasTriggeredReturnDialogue = false;
    const triggerReturnDialogue = () => {
      if (hasTriggeredReturnDialogue) return;
      hasTriggeredReturnDialogue = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      setDialogueTriggerIndex(5);
    };

    const onFocus = () => triggerReturnDialogue();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerReturnDialogue();
      }
    };

    window.addEventListener('focus', onFocus, { once: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // Listener deteksi klik di luar icon Love saat diminta klik love
  useEffect(() => {
    if (!isLovePromptActive || isHeartFilled) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Jangan hitung miss-click jika mengklik icon love atau balon petunjuknya
      if (target?.closest?.('.love-heart-container') || target?.closest?.('#btn-love-heart')) {
        return;
      }

      // Posisi icon Love 3D di dekat tangan kanan Taipei Bear
      const targetX = window.innerWidth * 0.55;
      const targetY = window.innerHeight * 0.74;

      setMissClicksCount((prev) => prev + 1);
      setGuideCursor({
        startX: e.clientX,
        startY: e.clientY,
        targetX,
        targetY,
        key: Date.now(),
      });
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isLovePromptActive, isHeartFilled]);

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
    <div className="relative w-screen h-screen overflow-hidden bg-[#070a14]">
      {/* 1. 3D Canvas Background (Langit Malam Romantis + Sky Lanterns + Taipei 101 + Fireworks + Kebun) */}
      <div className="scene-container absolute inset-0 z-[1]">
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
            autoCloseTrigger={autoCloseTrigger}
            reopenTrigger={reopenTrigger}
            dialogueTriggerIndex={dialogueTriggerIndex}
            onDialogueFinished={handleBearDialogueFinished}
            isFlatLetterMode={isFlatLetterMode}
            isCarryingHeart={isHeartFilled}
          />

          {/* Icon Love 3D Three.js: Muncul saat diminta klik cinta (sebelum diklik & terisi) */}
          {(isLovePromptActive && !isHeartFilled) && (
            <ThreeLoveHeart3D
              position={[0.48, -1.20, 1.1]}
              scale={0.36}
              isFilled={isHeartFilled}
              onFilled={handleHeartFilled}
            />
          )}

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
            onPointerDown={(e) => {
              if (isLovePromptActive) return;
              const p = e.point;
              const clampedX = Math.min(Math.max(p.x, -3.6), 3.6);
              const clampedY = Math.min(Math.max(p.y, -1.8), -1.0);
              handleTriggerExit([clampedX, clampedY, 0.8]);
            }}
            onClick={(e) => {
              if (isLovePromptActive) return;
              const p = e.point;
              const clampedX = Math.min(Math.max(p.x, -3.6), 3.6);
              const clampedY = Math.min(Math.max(p.y, -1.8), -1.0);
              handleTriggerExit([clampedX, clampedY, 0.8]);
            }}
          >
            <planeGeometry args={[25, 12]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </Canvas>
      </div>

      {/* 2. UI TOP STACK: Video Panel + Hint Panel (stacked, no overlap) */}
      <div className="fixed top-[env(safe-area-inset-top,0px)] left-1/2 -translate-x-1/2 z-[25]
        w-[min(92vw,680px)] flex flex-col items-center gap-1 pt-1.5">

        {/* World Indicator Badge */}
        <div className="px-3 py-0.5 bg-[rgba(12,8,32,0.88)] border border-[var(--color-border)] rounded-full
          text-[10px] text-[var(--color-text-muted)] tracking-[0.12em] uppercase backdrop-blur-md self-center">
          {isFireworksActive ? '🎆 Taipei: Pesta Kembang Api' : '🏮 Taipei: Malam Romantis Lentera'}
        </div>

        {/* Video Memory Frame */}
        <div className="w-full pointer-events-auto">
          <div
            className={`relative w-full rounded-2xl overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-br from-[#0f1423] to-[#1a1b35]
              ${isFireworksActive
                ? 'border-2 border-[rgba(240,194,127,0.65)] shadow-[0_16px_45px_rgba(0,0,0,0.9),0_0_40px_rgba(240,194,127,0.5)]'
                : 'border-2 border-[rgba(162,155,254,0.4)] shadow-[0_12px_35px_rgba(0,0,0,0.75),0_0_25px_rgba(108,92,231,0.25)]'
              }`}
            style={{ aspectRatio: '16/9', maxHeight: 'min(35vh, 240px)' }}
          >
            <video
              ref={videoRef}
              src="/video/garden_memory.mp4"
              loop
              muted={isMuted}
              playsInline
              className={`w-full h-full object-contain ${isFireworksActive ? 'block' : 'hidden'}`}
            />

            {/* Banner Romantis Pra-Kembang Api */}
            {!isFireworksActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white bg-[radial-gradient(circle_at_center,rgba(30,27,75,0.85)_0%,rgba(10,15,30,0.95)_100%)]">
                <div className="text-2xl sm:text-3xl mb-1 [filter:drop-shadow(0_0_12px_rgba(255,215,0,0.7))] animate-[pulse_2s_ease-in-out_infinite]">
                  🏮✨
                </div>
                <h2 className="m-0 text-base sm:text-xl font-extrabold bg-gradient-to-br from-[#ffeaa7] to-[#fab1a0] bg-clip-text text-transparent">
                  Malam Romantis di Taipei
                </h2>
                <p className="m-0 mt-0.5 text-[10px] sm:text-[0.86rem] text-gray-300 max-w-[320px] leading-snug">
                  Dengarkan sambutan manis dari <strong>Bravo si Beruang Taipei</strong>! 🐻💌
                </p>
              </div>
            )}

            {/* Tombol Unmute */}
            {isFireworksActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="absolute bottom-2 right-2 z-10 bg-black/75 border border-white/30 rounded-full px-2.5 py-1 text-white text-[10px] font-semibold cursor-pointer flex items-center gap-1 backdrop-blur-sm hover:bg-black/90 transition-all"
              >
                {isMuted ? '🔇 Suara Mati' : '🔊 Suara Aktif'}
              </button>
            )}
          </div>
        </div>

        {/* Hint Banner — naturally below the video, no overlap */}
        <div className="w-full bg-[rgba(7,11,22,0.94)] backdrop-blur-md
          border border-[rgba(240,194,127,0.5)] rounded-xl
          px-3 py-1.5 text-[clamp(10px,2.2vw,12px)] leading-snug text-white
          flex items-center justify-center text-center gap-2
          shadow-[0_4px_20px_rgba(0,0,0,0.75)] pointer-events-none
          [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
          <span>{isFireworksActive ? '🎆' : isArrivalPlaneFlying ? '🛫' : '🏮'}</span>
          <span className="font-semibold">
            {!hasExitedHouse ? (
              <>Capy mendarat di Taipei! <strong className="text-[#ffd166]">Klik pesawat ↘</strong> turunkan Capy! ✈️🏮</>
            ) : isArrivalPlaneFlying && !isArrivalPlaneGone ? (
              <>🛫 <strong className="text-[#ffd166]">Pesawat kembali ke angkasa!</strong> Selamat datang di Taipei... ✨</>
            ) : isAirplaneFlying ? (
              <>🛫 <strong className="text-[#ffd166]">Pesawat Capy lepas landas!</strong> Menuju realita... 💖</>
            ) : isReturning ? (
              <>Capy bersiap naik ke pesawat... ✈️</>
            ) : isLovePromptActive ? (
              <>💖 <strong className="text-[#ff4d6d]">Apakah kamu happy?</strong> Klik <strong className="text-[#ff4d6d]">Icon Cinta 3D</strong> untuk kirim pesan via WhatsApp! 🥰💌</>
            ) : isHeartFilled ? (
              <>💌 <strong className="text-[#ffd166]">Pesan terkirim!</strong> Baca lagi ↘ atau terbang ↙! ✈️✨</>
            ) : isBearActive && !isFireworksActive ? (
              <>🐻 <strong className="text-[#ffd166]">Bravo si Beruang Taipei</strong> menyapa Capy! 💌</>
            ) : isNextFlightReady ? (
              <>✈️ <strong className="text-[#ffd166]">Pesawat siap di pojok kiri ↙!</strong> Klik pesawat atau Capy! ✨</>
            ) : isFireworksActive ? (
              <>🎆 <strong className="text-[#ffd166]">Kembang Api Dimulai!</strong> Dengarkan pesan suara sampai selesai! 🎙️✨</>
            ) : (
              <><strong className="text-[#ffd166]">Klik kebun</strong> untuk jalan • <strong className="text-[#ffd166]">Klik Capy/Beruang</strong> putar 360°</>
            )}
          </span>
        </div>
      </div>


      {/* 4. Animated Simulated Cursor Guide & "Harus happy yaa!" Balloon */}
      {isLovePromptActive && guideCursor && (
        <div
          key={guideCursor.key}
          className="fixed left-0 top-0 pointer-events-none z-[9999] animate-[guideGlide_0.75s_cubic-bezier(0.25,1,0.5,1)_forwards]"
          style={{
            '--startX': `${guideCursor.startX}px`,
            '--startY': `${guideCursor.startY}px`,
            '--targetX': `${guideCursor.targetX}px`,
            '--targetY': `${guideCursor.targetY}px`,
          } as React.CSSProperties}
        >
          <div className="relative">
            <div className="text-[2.4rem] [filter:drop-shadow(0_4px_12px_rgba(255,77,109,0.85))] [transform:translate(-25%,-25%)_rotate(-15deg)]">
              👉
            </div>

            {/* Balon pesan "Harus happy yaa! 🥺💖✨" jika >= 3 kali klik yang lain */}
            {missClicksCount >= 3 && (
              <div className="absolute bottom-[46px] left-1/2 -translate-x-1/2
                bg-gradient-to-br from-[#ff4d6d] to-[#e63946] text-white
                px-4 py-2 rounded-2xl border-2 border-white
                shadow-[0_8px_25px_rgba(230,57,70,0.75),0_0_16px_rgba(255,255,255,0.85)]
                text-[0.85rem] font-extrabold whitespace-nowrap
                animate-[bounceBalloon_0.8s_infinite_alternate_ease-in-out]">
                Harus happy yaa! 🥺💖✨
                <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-[#e63946]" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Tombol Buka Pesan Pembuat Website (Pojok Kanan Bawah) */}
      {(isHeartFilled || dialogueTriggerIndex === 5) && !isReturning && !isAirplaneFlying && (
        <div className="fixed bottom-[calc(1.4rem+env(safe-area-inset-bottom,0px))] right-[clamp(1rem,3.5vw,2.5rem)] z-[30] flex gap-3 items-center">
          <button
            id="btn-reopen-letter"
            onClick={(e) => {
              e.stopPropagation();
              handleReopenLetterInJourney();
            }}
            className="bg-gradient-to-br from-[rgba(15,23,42,0.96)] to-[rgba(30,41,59,0.96)] backdrop-blur-md
              border-2 border-[#d4af37] text-[#fef3c7] rounded-full
              px-6 py-2 text-[clamp(0.78rem,2.3vw,0.92rem)] font-extrabold cursor-pointer
              shadow-[0_8px_25px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.45)]
              flex items-center gap-2 transition-all duration-200 select-none
              hover:scale-105 active:scale-95 min-h-[44px]"
          >
            <span>💌</span>
            <span>Buka Pesan Pembuat Website</span>
            <span>✨</span>
          </button>
        </div>
      )}
    </div>
  );
}
