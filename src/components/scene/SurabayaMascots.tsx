// ============================================================
// COMPONENT — Surabaya Mascots (Sura & Baya)
// Karakter REAL 3D Procedural Three.js (SuraModel & BayaModel)
// Berjalan masuk ke tengah panggung dengan animasi langkah kaki,
// lambaian sirip, ekor meliuk, dan mulut bergerak saat berbicara.
// Raycast tembus agar Capy tetap bisa diklik bebas ke mana saja!
// ============================================================

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SuraModel } from './SuraModel';
import { BayaModel } from './BayaModel';
import { PhotoAlbum3D } from './PhotoAlbum3D';

export interface MascotDialogueItem {
  id: string;
  speaker: 'hiu' | 'baya' | 'together';
  speakerName: string;
  avatar: string;
  themeColor: string;
  borderColor: string;
  text: string;
  audioSrc: string;
  duration: number; // Durasi audio dalam detik
}

export const SURABAYA_DIALOGUES: MascotDialogueItem[] = [
  {
    id: 'hiu_1',
    speaker: 'hiu',
    speakerName: 'Sura',
    avatar: '🦈',
    themeColor: '#00d2d3',
    borderColor: 'rgba(0, 210, 211, 0.75)',
    text: 'Wah, Baya! Deloken rek... Iki lho dalan Tunjungan sing biyen kerep diparani!',
    audioSrc: '/audio/dialogue/hiu_1.mp3',
    duration: 6.8,
  },
  {
    id: 'baya_2',
    speaker: 'baya',
    speakerName: 'Baya',
    avatar: '🐊',
    themeColor: '#1dd1a1',
    borderColor: 'rgba(29, 209, 161, 0.75)',
    text: 'Iyo Sura... Gemerlap lampune sek podo kaya pas awake dhewe mlaku-mlaku sore terus antri photobooth lucu kae.',
    audioSrc: '/audio/dialogue/baya_2.mp3',
    duration: 7.9,
  },
  {
    id: 'hiu_3',
    speaker: 'hiu',
    speakerName: 'Sura',
    avatar: '🦈',
    themeColor: '#00d2d3',
    borderColor: 'rgba(0, 210, 211, 0.75)',
    text: 'Hahaha! Eling wae kon, Bay! Foto photobooth kae gaya-mu kaku banget koyo kayu, tapi tetep tak simpen nang dompet lho!',
    audioSrc: '/audio/dialogue/hiu_3.mp3',
    duration: 9.5,
  },
  {
    id: 'baya_4',
    speaker: 'baya',
    speakerName: 'Baya',
    avatar: '🐊',
    themeColor: '#1dd1a1',
    borderColor: 'rgba(29, 209, 161, 0.75)',
    text: 'Lha piye, grogi jejer arek ayu... Mari foto kan awake dhewe mlipir mangan sego goreng nang Taman Apsari.',
    audioSrc: '/audio/dialogue/baya_4.mp3',
    duration: 7.8,
  },
  {
    id: 'hiu_5',
    speaker: 'hiu',
    speakerName: 'Sura',
    avatar: '🦈',
    themeColor: '#00d2d3',
    borderColor: 'rgba(0, 210, 211, 0.75)',
    text: 'Uenak tenan sego goreng Apsari bengi-bengi iku! Hawa adem Surabaya dadi anget mergo mangan bareng berdua.',
    audioSrc: '/audio/dialogue/hiu_5.mp3',
    duration: 7.6,
  },
  {
    id: 'baya_6',
    speaker: 'baya',
    speakerName: 'Baya',
    avatar: '🐊',
    themeColor: '#1dd1a1',
    borderColor: 'rgba(29, 209, 161, 0.75)',
    text: 'Terus eling gak, pas awake dhewe mampir nang Mumuso? Nulis sakpirang-pirang wishlist impian masa depan bareng...',
    audioSrc: '/audio/dialogue/baya_6.mp3',
    duration: 7.3,
  },
  {
    id: 'hiu_7',
    speaker: 'hiu',
    speakerName: 'Sura',
    avatar: '🦈',
    themeColor: '#00d2d3',
    borderColor: 'rgba(0, 210, 211, 0.75)',
    text: 'Iyo! Sampek tuku gantungan kunci boneka kapibara kembaran kae lho! Lucu pol, persis koyo Capy sing melu mlaku nang kene!',
    audioSrc: '/audio/dialogue/hiu_7.mp3',
    duration: 9.7,
  },
  {
    id: 'baya_8',
    speaker: 'baya',
    speakerName: 'Baya',
    avatar: '🐊',
    themeColor: '#1dd1a1',
    borderColor: 'rgba(29, 209, 161, 0.75)',
    text: 'Jujur yo Sur, senajan kutho Surabaya iki rame lan padang lampune... tapi sing marai kangen sejatine yo mergo ono sliramu.',
    audioSrc: '/audio/dialogue/baya_8.mp3',
    duration: 8.4,
  },
  {
    id: 'hiu_9',
    speaker: 'hiu',
    speakerName: 'Sura',
    avatar: '🦈',
    themeColor: '#00d2d3',
    borderColor: 'rgba(0, 210, 211, 0.75)',
    text: 'Aduh Baya... Ojo marai baper ngene ta lah, atiku ambyar koyo es campur! Tapi suwun yo, wes dadi pasangan paling setia.',
    audioSrc: '/audio/dialogue/hiu_9.mp3',
    duration: 9.9,
  },
  {
    id: 'baya_10',
    speaker: 'baya',
    speakerName: 'Baya',
    avatar: '🐊',
    themeColor: '#1dd1a1',
    borderColor: 'rgba(29, 209, 161, 0.75)',
    text: 'Tenan lho Sur... Senajan buaya jare seneng nglarani ati, tapi buaya siji iki setyo mung gawe arek Suroboyo!',
    audioSrc: '/audio/dialogue/baya_10.mp3',
    duration: 8.2,
  },
  {
    id: 'together_11',
    speaker: 'together',
    speakerName: 'Sura & Baya',
    avatar: '🦈❤️🐊',
    themeColor: '#feca57',
    borderColor: 'rgba(254, 202, 87, 0.85)',
    text: 'Sugeng Ambal Warsa ya rek! Mugo kabeh wishlist nang Mumuso kae kelakon, bahagia terus, lan tresnane langgeng!',
    audioSrc: '/audio/dialogue/together_11.mp3',
    duration: 8.4,
  },
  // --- 📸 AJAKAN MELIHAT ALBUM FOTO KENANGAN TUNJUNGAN ---
  {
    id: 'baya_12',
    speaker: 'baya',
    speakerName: 'Baya',
    avatar: '🐊',
    themeColor: '#1dd1a1',
    borderColor: 'rgba(29, 209, 161, 0.75)',
    text: 'Eh Sura... Aku nduwe album foto kenangan pas awake dhewe mlaku-mlaku nang Tunjungan lho! Ayok didelok bareng-bareng!',
    audioSrc: '/audio/dialogue/baya_12.mp3',
    duration: 8.6,
  },
  {
    id: 'hiu_13',
    speaker: 'hiu',
    speakerName: 'Sura',
    avatar: '🦈',
    themeColor: '#00d2d3',
    borderColor: 'rgba(0, 210, 211, 0.75)',
    text: 'Wah tenanan ta, Bay? Ayok ndang dibuka rek, wis gak sabar pengen ndelok foto-fotone!',
    audioSrc: '/audio/dialogue/hiu_13.mp3',
    duration: 6.6,
  },
  // --- 🚪 DIALOG PAMITAN SETELAH MELIHAT FOTO KENANGAN ---
  {
    id: 'hiu_14',
    speaker: 'hiu',
    speakerName: 'Sura',
    avatar: '🦈',
    themeColor: '#00d2d3',
    borderColor: 'rgba(0, 210, 211, 0.75)',
    text: 'Kenangane apik tenan yo Bay... Nah, saiki wayahe Capy nerusno petualangan menyang perjalanan selanjutnya!',
    audioSrc: '/audio/dialogue/hiu_14.mp3',
    duration: 7.7,
  },
  {
    id: 'baya_15',
    speaker: 'baya',
    speakerName: 'Baya',
    avatar: '🐊',
    themeColor: '#1dd1a1',
    borderColor: 'rgba(29, 209, 161, 0.75)',
    text: 'Iyo bener Sur! Ayo Capy, ndang munggah pesawat ✈️ nang pojok kiwo kae yo, ayo budhal nang perjalanan selanjutnya!',
    audioSrc: '/audio/dialogue/baya_15.mp3',
    duration: 8.1,
  },
  {
    id: 'together_16',
    speaker: 'together',
    speakerName: 'Sura & Baya',
    avatar: '🦈👋🐊',
    themeColor: '#feca57',
    borderColor: 'rgba(254, 202, 87, 0.85)',
    text: 'Dadah Capy! Sampai ketemu maneh rek! Mugi lancar lan seneng terus yo! 👋✨',
    audioSrc: '/audio/dialogue/together_16.mp3',
    duration: 6.5,
  },
];

interface SurabayaMascotsProps {
  isStarted?: boolean;
  onArrived?: () => void;
  onMascotsFinished?: () => void;
}

export const SurabayaMascots = React.memo(function SurabayaMascots({
  isStarted = false,
  onArrived,
  onMascotsFinished,
}: SurabayaMascotsProps) {
  const hiuGroupRef = useRef<THREE.Group>(null);
  const bayaGroupRef = useRef<THREE.Group>(null);
  const shadowHiuRef = useRef<THREE.Mesh>(null);
  const shadowBayaRef = useRef<THREE.Mesh>(null);

  const [hasArrived, setHasArrived] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [dialogueStarted, setDialogueStarted] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [canOpenAlbum, setCanOpenAlbum] = useState(false);

  const [isHiuWalking, setIsHiuWalking] = useState(false);
  const [isBayaWalking, setIsBayaWalking] = useState(false);

  // Status berjalan keluar panggung setelah pamitan
  const [isExiting, setIsExiting] = useState(false);
  const [isGone, setIsGone] = useState(false);

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  const onArrivedRef = useRef(onArrived);
  onArrivedRef.current = onArrived;

  const onMascotsFinishedRef = useRef(onMascotsFinished);
  onMascotsFinishedRef.current = onMascotsFinished;

  // Posisi target di tengah panggung (saat masuk / album terbuka / berjalan keluar)
  const targetHiuX = isExiting ? -7.2 : isAlbumOpen ? -3.2 : -1.45;
  const targetBayaX = isExiting ? 7.2 : isAlbumOpen ? 3.2 : 1.45;
  const baseY = -1.6;
  const baseZ = 0.8;

  // Sura menghadap kanan saat di panggung / masuk (ke arah Baya), berbalik ke kiri saat keluar
  const isHiuFacingRight = !isExiting;
  // Baya menghadap kiri saat di panggung / masuk (ke arah Sura), berbalik ke kanan saat keluar
  const isBayaFacingRight = isExiting;

  // Dialog yang sedang aktif
  const currentDialogue = dialogueStarted && dialogueIndex < SURABAYA_DIALOGUES.length
    ? SURABAYA_DIALOGUES[dialogueIndex]
    : null;
  const currentSpeaker = currentDialogue?.speaker ?? null;

  const handleCloseAlbum = () => {
    setIsAlbumOpen(false);
    // Setelah selesai melihat album, lanjut ke dialog pamitan (index 13: hiu_14)
    if (dialogueIndex <= 12) {
      setTimeout(() => {
        setDialogueIndex(13);
      }, 500);
    }
  };

  // Alur dialog otomatis & sinkron dengan audio (TIDAK terpengaruh klik/gerakan Capy)
  useEffect(() => {
    if (!dialogueStarted || dialogueIndex >= SURABAYA_DIALOGUES.length) return;

    // Jangan mainkan dialog pamitan saat album sedang dibuka
    if (isAlbumOpen && dialogueIndex >= 13) return;

    const item = SURABAYA_DIALOGUES[dialogueIndex];

    // Mainkan audio suara karakter
    const audio = new Audio(item.audioSrc);
    audio.volume = 1.0;
    voiceAudioRef.current = audio;

    audio.play()
      .then(() => setIsVoicePlaying(true))
      .catch(() => setIsVoicePlaying(false));

    audio.onended = () => {
      setIsVoicePlaying(false);
    };
    audio.onerror = () => {
      setIsVoicePlaying(false);
    };

    // JIKA INI DIALOG KE-13 (index 12: hiu_13):
    // Setelah Sura selesai mengajak buka album, buka Album Foto 3D!
    if (dialogueIndex === 12) {
      const openAlbumTimer = setTimeout(() => {
        setCanOpenAlbum(true);
        setIsAlbumOpen(true);
      }, (item.duration + 0.8) * 1000);

      return () => {
        clearTimeout(openAlbumTimer);
        audio.pause();
        audio.src = '';
        voiceAudioRef.current = null;
        setIsVoicePlaying(false);
      };
    }

    // JIKA INI DIALOG TERAKHIR (index 15: together_16):
    // Setelah selesai berpamitan, mulai berjalan keluar panggung ke arah luar dan hilang
    if (dialogueIndex === SURABAYA_DIALOGUES.length - 1) {
      const exitTimer = setTimeout(() => {
        setDialogueIndex((prev) => prev + 1);
        setIsExiting(true);
      }, (item.duration + 0.4) * 1000);

      const finishTimer = setTimeout(() => {
        setIsGone(true);
        onMascotsFinishedRef.current?.();
      }, (item.duration + 2.5) * 1000);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(finishTimer);
        audio.pause();
        audio.src = '';
        voiceAudioRef.current = null;
        setIsVoicePlaying(false);
      };
    }

    // Timer maju ke dialog berikutnya setelah audio selesai + jeda wajar
    const advanceDelay = Math.max(2500, (item.duration + 1.1) * 1000);
    const advanceTimer = setTimeout(() => {
      setDialogueIndex((prev) => prev + 1);
    }, advanceDelay);

    return () => {
      clearTimeout(advanceTimer);
      audio.pause();
      audio.src = '';
      voiceAudioRef.current = null;
      setIsVoicePlaying(false);
    };
  }, [dialogueStarted, dialogueIndex]);

  // Bersihkan audio saat unmount
  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current = null;
      }
    };
  }, []);

  // Reset posisi saat mulai / belum mulai
  useEffect(() => {
    if (!isStarted) {
      if (hiuGroupRef.current) {
        hiuGroupRef.current.position.x = -5.8;
        hiuGroupRef.current.position.y = baseY;
        hiuGroupRef.current.rotation.y = 0.18;
      }
      if (bayaGroupRef.current) {
        bayaGroupRef.current.position.x = 5.8;
        bayaGroupRef.current.position.y = baseY;
        bayaGroupRef.current.rotation.y = -0.18;
      }
      setHasArrived(false);
      setDialogueStarted(false);
      setDialogueIndex(0);
      setIsHiuWalking(false);
      setIsBayaWalking(false);
      setIsExiting(false);
      setIsGone(false);
    } else {
      if (hiuGroupRef.current) {
        hiuGroupRef.current.position.x = -5.8;
        hiuGroupRef.current.rotation.y = 0.18;
      }
      if (bayaGroupRef.current) {
        bayaGroupRef.current.position.x = 5.8;
        bayaGroupRef.current.rotation.y = -0.18;
      }
      setHasArrived(false);
      setIsExiting(false);
      setIsGone(false);
    }
  }, [isStarted]);

  useFrame((state, delta) => {
    if (!isStarted || isGone) return;
    const time = state.clock.getElapsedTime();

    // 1. Pergerakan Hiu (masuk dari kiri ke -1.45, atau berjalan keluar ke -7.2)
    if (hiuGroupRef.current) {
      const currentX = hiuGroupRef.current.position.x;
      const dist = Math.abs(currentX - targetHiuX);
      const walking = dist > 0.08;
      if (walking !== isHiuWalking) setIsHiuWalking(walking);

      if (walking) {
        hiuGroupRef.current.position.x = THREE.MathUtils.damp(currentX, targetHiuX, isExiting ? 3.6 : 2.0, delta);
        // Condong ke arah jalan (-0.18 saat keluar ke kiri, 0.18 saat masuk ke kanan)
        const tilt = isExiting ? -0.18 : 0.18;
        hiuGroupRef.current.rotation.y = THREE.MathUtils.damp(hiuGroupRef.current.rotation.y, tilt, 4.0, delta);
        const walkBounce = Math.abs(Math.sin(time * 8.5)) * 0.08;
        hiuGroupRef.current.position.y = baseY + walkBounce;

        if (shadowHiuRef.current) {
          const s = 1.0 - walkBounce * 0.4;
          shadowHiuRef.current.scale.set(s, s, s);
        }
      } else {
        // Setelah sampai di panggung
        const idleRot = isAlbumOpen ? 0.32 : 0.08;
        hiuGroupRef.current.rotation.y = THREE.MathUtils.damp(hiuGroupRef.current.rotation.y, idleRot, 3.5, delta);
        const isSpeaking = currentSpeaker === 'hiu' || currentSpeaker === 'together';
        const bounceRate = isSpeaking ? 5.5 : 2.2;
        const bounceHeight = isSpeaking ? 0.035 : 0.015;
        const idleY = baseY + Math.sin(time * bounceRate) * bounceHeight;
        hiuGroupRef.current.position.y = idleY;
      }
    }

    // 2. Pergerakan Baya (masuk dari kanan ke 1.45, atau berjalan keluar ke 7.2)
    if (bayaGroupRef.current) {
      const currentX = bayaGroupRef.current.position.x;
      const dist = Math.abs(currentX - targetBayaX);
      const walking = dist > 0.08;
      if (walking !== isBayaWalking) setIsBayaWalking(walking);

      if (walking) {
        bayaGroupRef.current.position.x = THREE.MathUtils.damp(currentX, targetBayaX, isExiting ? 3.6 : 2.0, delta);
        // Condong ke arah jalan (0.18 saat keluar ke kanan, -0.18 saat masuk ke kiri)
        const tilt = isExiting ? 0.18 : -0.18;
        bayaGroupRef.current.rotation.y = THREE.MathUtils.damp(bayaGroupRef.current.rotation.y, tilt, 4.0, delta);
        const walkBounce = Math.abs(Math.sin(time * 8.5 + 0.3)) * 0.08;
        bayaGroupRef.current.position.y = baseY + walkBounce;

        if (shadowBayaRef.current) {
          const s = 1.0 - walkBounce * 0.4;
          shadowBayaRef.current.scale.set(s, s, s);
        }
      } else {
        // Setelah sampai di panggung
        const idleRot = isAlbumOpen ? -0.32 : -0.08;
        bayaGroupRef.current.rotation.y = THREE.MathUtils.damp(bayaGroupRef.current.rotation.y, idleRot, 3.5, delta);
        const isSpeaking = currentSpeaker === 'baya' || currentSpeaker === 'together';
        const bounceRate = isSpeaking ? 5.5 : 2.0;
        const bounceHeight = isSpeaking ? 0.035 : 0.015;
        const idleY = baseY + Math.sin(time * bounceRate + 0.5) * bounceHeight;
        bayaGroupRef.current.position.y = idleY;
      }
    }

    // 3. Trigger kedatangan awal & mulai dialog
    if (!hasArrived && !isExiting && hiuGroupRef.current && bayaGroupRef.current) {
      const distH = Math.abs(hiuGroupRef.current.position.x - targetHiuX);
      const distB = Math.abs(bayaGroupRef.current.position.x - targetBayaX);
      if (distH < 0.1 && distB < 0.1) {
        setHasArrived(true);
        onArrivedRef.current?.();
        setTimeout(() => {
          setDialogueStarted(true);
        }, 700);
      }
    }

    // 4. Cek apakah sudah selesai berjalan keluar (Off-screen)
    if (isExiting && !isGone && hiuGroupRef.current && bayaGroupRef.current) {
      if (hiuGroupRef.current.position.x <= -5.2 || bayaGroupRef.current.position.x >= 5.2) {
        setIsGone(true);
        onMascotsFinishedRef.current?.();
      }
    }
  });

  if (isGone || !isStarted) return null;

  return (
    <group position={[0, 0, baseZ]} visible={isStarted && !isGone}>
      {/* 🦈 1. MASKOT SURA (HIU 3D ANIMATED) */}
      <group
        ref={hiuGroupRef}
        position={[-5.8, baseY, 0]}
        rotation={[0, 0.18, 0]}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Model 3D Hiu Real Three.js */}
        <SuraModel
          isWalking={isHiuWalking}
          isSpeaking={currentSpeaker === 'hiu' || currentSpeaker === 'together'}
          facingRight={isHiuFacingRight}
          scale={0.52}
        />

        {/* Bayangan Halus Hiu di Lantai */}
        <mesh
          ref={shadowHiuRef}
          position={[0, -0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        >
          <circleGeometry args={[0.34, 32]} />
          <meshBasicMaterial
            color="#02050b"
            transparent={true}
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>

        {/* 💬 BALON PERCAKAPAN HIU */}
        {currentDialogue && currentSpeaker === 'hiu' && (
          <Html position={[0, 1.18, 0.1]} center distanceFactor={4.5} style={{ pointerEvents: 'none' }}>
            <div
              style={{
                position: 'relative',
                background: 'rgba(6, 14, 28, 0.52)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(0, 210, 211, 0.8)',
                borderRadius: '16px',
                padding: '0.45rem 0.85rem',
                color: '#ffffff',
                width: 'max-content',
                maxWidth: '240px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.55), 0 0 15px rgba(0, 210, 211, 0.35)',
                userSelect: 'none',
                pointerEvents: 'none',
                animation: 'fadeUp 0.3s ease',
              }}
            >
              {/* Header Balon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#00d2d3', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>🦈</span>
                  <span>Sura (Hiu)</span>
                </span>
                <span style={{ fontSize: '0.65rem', color: isVoicePlaying ? '#2ed573' : '#94a3b8', fontWeight: 600 }}>
                  {isVoicePlaying ? '🎙️ Bicara' : ''}
                </span>
              </div>

              {/* Teks Pesan */}
              <div style={{ fontSize: '0.78rem', lineHeight: 1.4, fontWeight: 500, color: '#f1f5f9', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                "{currentDialogue.text}"
              </div>

              {/* Ekor Segitiga Balon Menunjuk ke Kepala Hiu */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid rgba(0, 210, 211, 0.85)',
                }}
              />
            </div>
          </Html>
        )}
      </group>

      {/* 🐊 2. MASKOT BAYA (BUAYA 3D ANIMATED) */}
      <group
        ref={bayaGroupRef}
        position={[5.8, baseY, 0]}
        rotation={[0, -0.18, 0]}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Model 3D Buaya Real Three.js */}
        <BayaModel
          isWalking={isBayaWalking}
          isSpeaking={currentSpeaker === 'baya' || currentSpeaker === 'together'}
          facingRight={isBayaFacingRight}
          scale={0.52}
        />

        {/* Bayangan Halus Baya di Lantai */}
        <mesh
          ref={shadowBayaRef}
          position={[0, -0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        >
          <circleGeometry args={[0.34, 32]} />
          <meshBasicMaterial
            color="#02050b"
            transparent={true}
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>

        {/* 💬 BALON PERCAKAPAN BAYA */}
        {currentDialogue && currentSpeaker === 'baya' && (
          <Html position={[0, 1.18, 0.1]} center distanceFactor={4.5} style={{ pointerEvents: 'none' }}>
            <div
              style={{
                position: 'relative',
                background: 'rgba(8, 22, 16, 0.52)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(29, 209, 161, 0.8)',
                borderRadius: '16px',
                padding: '0.45rem 0.85rem',
                color: '#ffffff',
                width: 'max-content',
                maxWidth: '240px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.55), 0 0 15px rgba(29, 209, 161, 0.35)',
                userSelect: 'none',
                pointerEvents: 'none',
                animation: 'fadeUp 0.3s ease',
              }}
            >
              {/* Header Balon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1dd1a1', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>🐊</span>
                  <span>Baya (Buaya)</span>
                </span>
                <span style={{ fontSize: '0.65rem', color: isVoicePlaying ? '#2ed573' : '#94a3b8', fontWeight: 600 }}>
                  {isVoicePlaying ? '🎙️ Bicara' : ''}
                </span>
              </div>

              {/* Teks Pesan */}
              <div style={{ fontSize: '0.78rem', lineHeight: 1.4, fontWeight: 500, color: '#f1f5f9', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                "{currentDialogue.text}"
              </div>

              {/* Ekor Segitiga Balon Menunjuk ke Kepala Baya */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid rgba(29, 209, 161, 0.85)',
                }}
              />
            </div>
          </Html>
        )}
      </group>

      {/* 🎉 BALON BERSAMA (Sura & Baya saat ucapan ultah terakhir) */}
      {currentDialogue && currentSpeaker === 'together' && (
        <Html position={[0, baseY + 1.18, 0.1]} center distanceFactor={4.5} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'relative',
              background: 'rgba(25, 20, 8, 0.58)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(254, 202, 87, 0.85)',
              borderRadius: '16px',
              padding: '0.5rem 0.95rem',
              color: '#ffffff',
              width: 'max-content',
              maxWidth: '260px',
              boxShadow: '0 6px 22px rgba(0, 0, 0, 0.6), 0 0 18px rgba(254, 202, 87, 0.4)',
              userSelect: 'none',
              pointerEvents: 'none',
              animation: 'fadeUp 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#feca57', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>🦈❤️🐊</span>
                <span>Sura & Baya</span>
              </span>
              <span style={{ fontSize: '0.65rem', color: isVoicePlaying ? '#2ed573' : '#94a3b8', fontWeight: 600 }}>
                {isVoicePlaying ? '🎙️ Bicara' : ''}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', lineHeight: 1.4, fontWeight: 500, color: '#fef3c7', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
              "{currentDialogue.text}"
            </div>
          </div>
        </Html>
      )}

      {/* 📸 ALBUM FOTO KENANGAN 3D TUNJUNGAN */}
      <PhotoAlbum3D
        isOpen={isAlbumOpen}
        onClose={handleCloseAlbum}
      />

      {/* 📖 Tombol Pemicu Buka Album Foto 3D (Hanya muncul sebelum pamitan, hilang saat keluar/selesai) */}
      {canOpenAlbum && !isAlbumOpen && !isExiting && !isGone && dialogueIndex <= 13 && (
        <Html position={[0, 0.45, 0.2]} center distanceFactor={4.5}>
          <button
            id="btn-open-album-3d"
            onClick={(e) => {
              e.stopPropagation();
              setIsAlbumOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'linear-gradient(135deg, #feca57, #ff9f43)',
              color: '#0f172a',
              border: '2px solid rgba(255, 255, 255, 0.95)',
              borderRadius: '9999px',
              padding: '0.65rem 1.6rem',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 26px rgba(255, 159, 67, 0.65), 0 0 20px rgba(254, 202, 87, 0.5)',
              pointerEvents: 'auto',
              whiteSpace: 'nowrap',
              animation: 'bounceSlow 2.5s infinite',
            }}
          >
            <span>📖</span>
            <span>Buka Album Kenangan Tunjungan</span>
            <span>📸</span>
          </button>
        </Html>
      )}
    </group>
  );
});
