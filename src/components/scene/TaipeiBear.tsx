// ============================================================
// COMPONENT — TaipeiBear (Bravo the Formosan Black Bear in 3D Three.js)
// Dibuat murni dari geometri 3D Three.js (mesh primitives):
// 1. Balon dialog diperlebar horizontal (minWidth 300px, maxWidth 420px),
//    teks hanya 2-3 baris dan pas di atas kepala, TIDAK menutupi wajah beruang
// 2. Dialog suara asli Indonesia:
//    - "Bravoo, welcome to taipee capy !!! 🎉✨"
//    - "Ini adalah perjalanan terakhir di website ini... Namun di realita nantinya, akan ada orang yang selalu mengusahakan kamu untuk tetap bisa menikmati perjalanan yang lain. 💖"
//    - "Kamu juga mendapatkan pesan loh dari si pembuat website, yok dibaca! 💌"
// 3. Setelah dialog selesai, beruang jalan ke POJOK KANAN [3.15, -1.6, 0.8]
//    Saat mulai menarik kertas, Capy otomatis berjalan ke POJOK KIRI [-2.8, -1.6, 0.8]
// 4. Beruang menarik kertas membentang ke arah kiri (tengah panggung):
//    Beruang BERDIRI BEBAS DI POJOK KANAN dan sama sekali TIDAK tertutupi kertas!
// 5. Kertas memiliki tombol CLOSE (✕) & info petunjuk untuk menutup surat.
// 6. Pesawat perjalanan selanjutnya HANYA muncul setelah surat di-close!
// ============================================================

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface TaipeiBearProps {
  isActive?: boolean;
  startPosition?: [number, number, number];
  dialoguePosition?: [number, number, number];
  pullPosition?: [number, number, number];
  scale?: number;
  onStartPullingPaper?: () => void;
  onLetterRevealed?: () => void;
  onLetterClosed?: () => void;
  onReopenLetter?: () => void;
  isVoicePlaying?: boolean;
  onToggleVoice?: () => void;
  onClick?: () => void;
}

// Palet warna resmi Bravo Bear (Formosan Black Bear)
const BEAR_BLACK = '#22262e';
const BEAR_MUZZLE = '#f8fafc';
const BEAR_CHEST_V = '#ffffff';
const BEAR_NOSE = '#00cec9';
const BEAR_TONGUE = '#ff6b81';
const BEAR_MOUTH = '#341f20';
const BEAR_PAD = '#94a3b8';
const EYE_BLACK = '#090d16';
const EYE_SHINE = '#ffffff';

const BEAR_DIALOGUES = [
  {
    id: 1,
    text: 'Bravoo, welcome to taipee capy !!! 🎉✨',
    audio: '/audio/dialogue/taipei_bear_1.mp3',
    duration: 4600,
  },
  {
    id: 2,
    text: 'Ini adalah perjalanan terakhir di website ini... Namun di realita nantinya, akan ada orang yang selalu mengusahakan kamu untuk tetap bisa menikmati perjalanan yang lain. 💖',
    audio: '/audio/dialogue/taipei_bear_2.mp3',
    duration: 9600,
  },
  {
    id: 3,
    text: 'Kamu juga mendapatkan pesan loh dari si pembuat website, yok dibaca! 💌',
    audio: '/audio/dialogue/taipei_bear_3.mp3',
    duration: 4600,
  },
];

type BearPhase = 'entering' | 'dialogue' | 'walking_to_right' | 'pulling_paper' | 'paper_revealed';

export function TaipeiBear({
  isActive = false,
  startPosition = [-4.5, -1.6, 0.8],
  dialoguePosition = [-0.15, -1.6, 0.8],
  pullPosition = [3.15, -1.6, 0.8],
  scale = 0.52,
  onStartPullingPaper,
  onLetterRevealed,
  onLetterClosed,
  onReopenLetter,
  isVoicePlaying = false,
  onToggleVoice,
  onClick,
}: TaipeiBearProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const wavingArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const leftRodRef = useRef<THREE.Group>(null);
  const paperMeshRef = useRef<THREE.Mesh>(null);
  const htmlLetterRef = useRef<THREE.Group>(null);

  const [phase, setPhase] = useState<BearPhase>('entering');
  const [hovered, setHovered] = useState(false);

  // Dialog State
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState<number>(-1);
  const [isDialoguePlaying, setIsDialoguePlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Paper Pulling & Reveal State
  const [isLetterCardVisible, setIsLetterCardVisible] = useState<boolean>(false);
  const [isLetterClosed, setIsLetterClosed] = useState<boolean>(false);
  const pullProgress = useRef<number>(0);
  const hasRevealedCallbackFired = useRef<boolean>(false);

  // Animasi spin 360° saat di-klik
  const spinRef = useRef<{ active: boolean; angle: number }>({
    active: false,
    angle: 0,
  });

  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(...startPosition));

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Memutar audio dialog sekuensial
  const playDialogueStep = (index: number) => {
    if (index >= BEAR_DIALOGUES.length) {
      // Selesai dialog: Beruang jalan ke pojok kanan & Capy otomatis jalan ke pojok kiri!
      setCurrentDialogueIndex(-1);
      setIsDialoguePlaying(false);
      onStartPullingPaper?.();
      setTimeout(() => {
        setPhase('walking_to_right');
      }, 400);
      return;
    }

    const item = BEAR_DIALOGUES[index];
    setCurrentDialogueIndex(index);
    setIsDialoguePlaying(true);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(item.audio);
    audio.volume = 0.95;
    audioRef.current = audio;

    audio.onended = () => {
      setIsDialoguePlaying(false);
      setTimeout(() => {
        playDialogueStep(index + 1);
      }, 700);
    };

    audio.onerror = () => {
      setIsDialoguePlaying(false);
      setTimeout(() => {
        playDialogueStep(index + 1);
      }, item.duration);
    };

    audio.play().catch(() => {
      setTimeout(() => {
        playDialogueStep(index + 1);
      }, item.duration);
    });
  };

  const handleDialogueSkip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsDialoguePlaying(false);
    playDialogueStep(currentDialogueIndex + 1);
  };

  const handleCloseLetter = () => {
    setIsLetterClosed(true);
    setIsLetterCardVisible(false);
    onLetterClosed?.();
  };

  const handleReopenLetter = () => {
    setIsLetterClosed(false);
    setIsLetterCardVisible(true);
    onReopenLetter?.();
  };

  const handleBearClick = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    spinRef.current = { active: true, angle: 0 };
    if (phase === 'dialogue' && currentDialogueIndex >= 0 && currentDialogueIndex < BEAR_DIALOGUES.length) {
      playDialogueStep(currentDialogueIndex);
    }
    onClick?.();
  };

  useFrame((state, delta) => {
    if (!rootGroupRef.current || !modelRef.current || !isActive) return;
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    // ── FASE 1: BERJALAN MASUK DARI KIRI KE TITIK DIALOG ──
    if (phase === 'entering') {
      const targetVec = new THREE.Vector3(...dialoguePosition);
      const dist = currentPos.current.distanceTo(targetVec);

      if (dist > 0.06) {
        currentPos.current.lerp(targetVec, dt * 2.8);
        rootGroupRef.current.position.copy(currentPos.current);

        const walkCycle = time * 9.5;
        const hop = Math.abs(Math.sin(walkCycle)) * 0.16;
        modelRef.current.position.y = hop;
        modelRef.current.rotation.z = Math.sin(walkCycle) * 0.1;

        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.45 + 0.2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.45;

        modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, 0.35, dt * 8);

        if (shadowRef.current) {
          const s = 1.0 - hop * 1.5;
          shadowRef.current.scale.set(s, s, s);
        }
      } else {
        setPhase('dialogue');
        rootGroupRef.current.position.copy(targetVec);
        setTimeout(() => {
          playDialogueStep(0);
        }, 400);
      }
    }

    // ── FASE 2: DIALOG DI DEPAN CAPY ──
    else if (phase === 'dialogue') {
      const targetVec = new THREE.Vector3(...dialoguePosition);
      rootGroupRef.current.position.copy(targetVec);

      const idleHop = Math.sin(time * 3.2) * 0.035;
      modelRef.current.position.y = idleHop;
      modelRef.current.rotation.z = Math.sin(time * 2.0) * 0.03;
      modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, -0.2, dt * 5);

      if (wavingArmRef.current) {
        wavingArmRef.current.rotation.z = 0.65 + Math.sin(time * 7.0) * 0.28;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -0.45 + Math.sin(time * 3.0) * 0.08;
      }
    }

    // ── FASE 3: BERUANG BERJALAN KE POJOK KANAN ──
    else if (phase === 'walking_to_right') {
      const targetVec = new THREE.Vector3(...pullPosition);
      const dist = currentPos.current.distanceTo(targetVec);

      if (dist > 0.08) {
        currentPos.current.lerp(targetVec, dt * 2.7);
        rootGroupRef.current.position.copy(currentPos.current);

        const walkCycle = time * 10.0;
        const hop = Math.abs(Math.sin(walkCycle)) * 0.16;
        modelRef.current.position.y = hop;
        modelRef.current.rotation.z = Math.sin(walkCycle) * 0.1;

        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.45 + 0.2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.45;

        modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, Math.PI * 0.45, dt * 8);

        if (shadowRef.current) {
          const s = 1.0 - hop * 1.5;
          shadowRef.current.scale.set(s, s, s);
        }
      } else {
        setPhase('pulling_paper');
        rootGroupRef.current.position.copy(targetVec);
      }
    }

    // ── FASE 4: BERUANG BERDIRI DI POJOK KANAN, MENARIK KERTAS KE KIRI ──
    else if (phase === 'pulling_paper' || phase === 'paper_revealed') {
      const targetVec = new THREE.Vector3(...pullPosition);
      rootGroupRef.current.position.copy(targetVec);

      // Beruang berdiri bebas di pojok kanan, menghadap serong ke kiri
      modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, -1.2, dt * 6);
      modelRef.current.position.y = Math.sin(time * 2.5) * 0.025;

      const rightEdgeX = -1.25;
      const totalWidth = 2.6;
      const leftEdgeX = rightEdgeX - totalWidth; // -3.85
      const centerX = (rightEdgeX + leftEdgeX) / 2; // -2.55

      if (phase === 'pulling_paper') {
        pullProgress.current = Math.min(1.0, pullProgress.current + dt * 0.65);
        const p = pullProgress.current;

        // Tangan kiri beruang merentang ke kiri memegang & menarik ujung kertas
        if (wavingArmRef.current) {
          wavingArmRef.current.rotation.z = 0.3 - p * 0.85;
          wavingArmRef.current.rotation.x = 0.25 * Math.sin(p * Math.PI);
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -0.4;
        }

        const currentW = totalWidth * p;
        const curLeftEdge = rightEdgeX - currentW;
        const curCenter = (rightEdgeX + curLeftEdge) / 2;

        if (leftRodRef.current) {
          leftRodRef.current.position.x = curLeftEdge;
        }

        if (paperMeshRef.current) {
          paperMeshRef.current.position.x = curCenter;
          paperMeshRef.current.scale.set(Math.max(0.01, p), 1.0, 1.0);
        }

        if (htmlLetterRef.current) {
          htmlLetterRef.current.position.x = curCenter;
        }

        if (p >= 0.85 && !isLetterClosed) {
          setIsLetterCardVisible(true);
        }

        if (p >= 0.95 && !hasRevealedCallbackFired.current) {
          hasRevealedCallbackFired.current = true;
          setPhase('paper_revealed');
          // Menyalakan video & kembang api otomatis!
          onLetterRevealed?.();
        }
      } else if (phase === 'paper_revealed') {
        // Pastikan saat surat terbuka atau dibuka kembali, posisi batang kiri, kertas, dan HTML surat tetap di posisi terbuka penuh
        if (leftRodRef.current) {
          leftRodRef.current.position.x = leftEdgeX;
        }
        if (paperMeshRef.current) {
          paperMeshRef.current.position.x = centerX;
          paperMeshRef.current.scale.set(1.0, 1.0, 1.0);
        }
        if (htmlLetterRef.current) {
          htmlLetterRef.current.position.x = centerX;
        }
      }
    }

    // Spin 360° saat di-klik
    if (spinRef.current.active) {
      const spinSpeed = Math.PI * 4.0;
      spinRef.current.angle += spinSpeed * dt;
      modelRef.current.rotation.y += spinSpeed * dt;

      if (spinRef.current.angle >= Math.PI * 2) {
        spinRef.current.active = false;
      }
    }
  });

  if (!isActive) return null;

  const currentDialogue = currentDialogueIndex >= 0 ? BEAR_DIALOGUES[currentDialogueIndex] : null;

  return (
    <group
      ref={rootGroupRef}
      position={startPosition}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── BAYANGAN DI TANAH ── */}
      <mesh
        ref={shadowRef}
        position={[0, -0.42, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* ── 3D MESH MODEL BRAVO BEAR ── */}
      <group
        ref={modelRef}
        scale={[scale, scale, scale]}
        onClick={handleBearClick}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* 1. BADAN GEMOY BERUANG */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} metalness={0.08} />
        </mesh>
        <mesh position={[0, -0.15, 0.05]} castShadow>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} metalness={0.08} />
        </mesh>

        {/* 2. TANDA V PUTIH DI DADA */}
        <group position={[0, 0.02, 0.52]}>
          <mesh position={[-0.15, 0.12, 0]} rotation={[0, 0, -0.65]} castShadow>
            <boxGeometry args={[0.22, 0.09, 0.05]} />
            <meshStandardMaterial color={BEAR_CHEST_V} roughness={0.5} />
          </mesh>
          <mesh position={[0.15, 0.12, 0]} rotation={[0, 0, 0.65]} castShadow>
            <boxGeometry args={[0.22, 0.09, 0.05]} />
            <meshStandardMaterial color={BEAR_CHEST_V} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={BEAR_CHEST_V} roughness={0.5} />
          </mesh>
        </group>

        {/* 3. KEPALA BULAT GEMOY */}
        <group position={[0, 0.58, 0.1]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} metalness={0.08} />
          </mesh>

          {/* Telinga Kiri & Kanan */}
          <group position={[-0.38, 0.44, -0.05]} rotation={[0, 0, 0.4]}>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} />
            </mesh>
            <mesh position={[0, 0, 0.06]} scale={[0.8, 0.8, 0.4]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color={BEAR_PAD} roughness={0.8} />
            </mesh>
          </group>
          <group position={[0.38, 0.44, -0.05]} rotation={[0, 0, -0.4]}>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} />
            </mesh>
            <mesh position={[0, 0, 0.06]} scale={[0.8, 0.8, 0.4]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color={BEAR_PAD} roughness={0.8} />
            </mesh>
          </group>

          {/* Moncong Putih & Hidung Cyan */}
          <group position={[0, -0.06, 0.38]}>
            <mesh scale={[1.15, 0.85, 0.9]} castShadow>
              <sphereGeometry args={[0.25, 24, 24]} />
              <meshStandardMaterial color={BEAR_MUZZLE} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.09, 0.22]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={BEAR_NOSE} roughness={0.3} metalness={0.15} />
            </mesh>
            <group position={[0, -0.07, 0.21]}>
              <mesh rotation={[0.2, 0, 0]} scale={[0.85, 1.0, 0.4]}>
                <sphereGeometry args={[0.16, 16, 16]} />
                <meshStandardMaterial color={BEAR_MOUTH} roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.04, 0.05]} scale={[1.0, 0.65, 0.6]}>
                <sphereGeometry args={[0.11, 16, 16]} />
                <meshStandardMaterial color={BEAR_TONGUE} roughness={0.5} />
              </mesh>
            </group>
          </group>

          {/* Mata Hitam Berkilau */}
          <group position={[-0.22, 0.12, 0.52]}>
            <mesh scale={[0.85, 1.05, 0.6]}>
              <sphereGeometry args={[0.14, 20, 20]} />
              <meshStandardMaterial color={EYE_BLACK} roughness={0.1} />
            </mesh>
            <mesh position={[-0.035, 0.05, 0.09]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial color={EYE_SHINE} />
            </mesh>
          </group>
          <group position={[0.22, 0.12, 0.52]}>
            <mesh scale={[0.85, 1.05, 0.6]}>
              <sphereGeometry args={[0.14, 20, 20]} />
              <meshStandardMaterial color={EYE_BLACK} roughness={0.1} />
            </mesh>
            <mesh position={[-0.035, 0.05, 0.09]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial color={EYE_SHINE} />
            </mesh>
          </group>
        </group>

        {/* 4. TANGAN KIRI (MELAMBAI SAAT DIALOG, MERENTANG MENARIK KERTAS SAAT PULLING) */}
        <group ref={wavingArmRef} position={[-0.52, 0.25, 0.1]} rotation={[0, 0, 0.65]}>
          <mesh position={[-0.22, 0.15, 0]} rotation={[0, 0, 0.8]} castShadow>
            <capsuleGeometry args={[0.18, 0.38, 12, 16]} />
            <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} />
          </mesh>
          <group position={[-0.38, 0.35, 0.06]}>
            <mesh>
              <sphereGeometry args={[0.21, 16, 16]} />
              <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} />
            </mesh>
            <mesh position={[0, -0.02, 0.14]}>
              <circleGeometry args={[0.11, 16]} />
              <meshStandardMaterial color={BEAR_PAD} roughness={0.8} />
            </mesh>
          </group>
        </group>

        {/* 5. TANGAN KANAN */}
        <group ref={rightArmRef} position={[0.52, 0.12, 0.08]} rotation={[0, 0, -0.45]}>
          <mesh position={[0.22, 0.05, 0]} rotation={[0, 0, -0.8]} castShadow>
            <capsuleGeometry args={[0.18, 0.38, 12, 16]} />
            <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} />
          </mesh>
          <group position={[0.38, 0.12, 0.04]}>
            <mesh>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} />
            </mesh>
          </group>
        </group>

        {/* 6. KAKI KIRI & KANAN */}
        <group ref={leftLegRef} position={[-0.28, -0.42, 0.22]} rotation={[0.35, 0, 0.15]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.2, 0.28, 12, 16]} />
            <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.28, -0.42, 0.22]} rotation={[0.35, 0, -0.15]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.2, 0.28, 12, 16]} />
            <meshStandardMaterial color={BEAR_BLACK} roughness={0.65} />
          </mesh>
        </group>

        <pointLight position={[0, 0.8, 1.2]} intensity={hovered ? 2.8 : 1.8} color="#fff6eb" distance={4.5} />
      </group>

      {/* ── 💬 BALON PERCAKAPAN BERUANG (LEBAR & PAS DI ATAS KEPALA) ── */}
      {currentDialogue && phase === 'dialogue' && (
        <Html
          position={[0, 1.05, 0.1]}
          center
          distanceFactor={4.2}
          style={{ pointerEvents: 'auto', userSelect: 'none', zIndex: 100 }}
        >
          <div
            onClick={handleDialogueSkip}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'rgba(8, 16, 32, 0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '2px solid #38bdf8',
              borderRadius: '16px',
              padding: '0.45rem clamp(0.75rem, 2.5vw, 1.05rem)',
              width: 'max-content',
              minWidth: 'min(86vw, 280px)',
              maxWidth: 'min(92vw, 410px)',
              color: '#ffffff',
              fontFamily: "'Quicksand', 'Outfit', sans-serif",
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.75), 0 0 18px rgba(56, 189, 248, 0.45)',
              cursor: 'pointer',
              userSelect: 'none',
              animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'center',
            }}
          >
            {/* Header Balon */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>🐻</span>
                <span>Bravo (Taipei Bear)</span>
              </span>
              <span style={{
                fontSize: '0.62rem',
                color: isDialoguePlaying ? '#2ed573' : '#ffd166',
                fontWeight: 700,
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                {isDialoguePlaying ? '🎙️ Bicara' : 'Klik lanjut ⏩'}
              </span>
            </div>

            {/* Isi Percakapan (Lebar & Hanya 2-3 baris) */}
            <div style={{
              fontSize: '12px',
              lineHeight: '1.4',
              fontWeight: 700,
              color: '#f8fafc',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
            }}>
              {currentDialogue.text}
            </div>

            {/* Indikator progress dialog */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '0.35rem' }}>
              {BEAR_DIALOGUES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentDialogueIndex ? '16px' : '5px',
                    height: '3.5px',
                    borderRadius: '9999px',
                    backgroundColor: i === currentDialogueIndex ? '#38bdf8' : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            {/* Panah Balon Menunjuk ke Kepala Beruang */}
            <div
              style={{
                position: 'absolute',
                bottom: '-7px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '7px solid #38bdf8',
              }}
            />
          </div>
        </Html>
      )}

      {/* ── 📜 3D KERTAS MEMANJANG: HANYA TAMPIL SAAT SURAT DIBUKA (!isLetterClosed) ── */}
      {(phase === 'pulling_paper' || phase === 'paper_revealed') && !isLetterClosed && (
        <group position={[0, 0.35, 0.35]}>
          {/* Batang Gulungan Emas Kanan (Berjarak 1.25 unit di sebelah kiri beruang, TIDAK MENUTUPI BERUANG) */}
          <mesh position={[-1.25, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.25, 16]} />
            <meshStandardMaterial color="#f1c40f" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[-1.25, 0.65, 0]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[-1.25, -0.65, 0]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Batang Gulungan Emas Kiri (Leading Edge yang Bergerak ke Kiri) */}
          <group ref={leftRodRef} position={[-3.85, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 1.25, 16]} />
              <meshStandardMaterial color="#f1c40f" metalness={0.85} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.65, 0]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.65, 0]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

          {/* Lembaran Kertas 3D Horizontal (HANYA saat menarik pertama kali sebelum kartu HTML tampil) */}
          {phase === 'pulling_paper' && !isLetterCardVisible && (
            <mesh ref={paperMeshRef} position={[-2.55, 0, -0.01]} receiveShadow>
              <planeGeometry args={[2.6, 1.2]} />
              <meshStandardMaterial color="#fffdf8" roughness={0.75} />
            </mesh>
          )}

          {/* ── TAMPILAN SURAT UCAPAN ULANG TAHUN DENGAN TOMBOL CLOSE ✕ ── */}
          <group ref={htmlLetterRef} position={[-2.55, 0, 0.04]}>
            {isLetterCardVisible && (
              <Html center distanceFactor={4.2}>
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  style={{
                    width: 'min(92vw, 520px)',
                    maxHeight: 'min(76vh, 520px)',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    background: 'linear-gradient(145deg, #fffdf8 0%, #fef7ed 100%)',
                    borderRadius: '16px',
                    border: '3px solid #d4af37',
                    padding: 'clamp(0.75rem, 2.5vw, 1.0rem) clamp(0.85rem, 3vw, 1.25rem)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 40px rgba(241, 196, 15, 0.45)',
                    color: '#2c3e50',
                    fontFamily: 'Georgia, serif',
                    userSelect: 'none',
                    animation: 'fadeIn 0.4s ease',
                    position: 'relative',
                  }}
                >
                  {/* Tombol Close (✕) di Pojok Kanan Atas */}
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseLetter();
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '10px',
                      zIndex: 25,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(231, 76, 60, 0.95)',
                      border: '2px solid #ffffff',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                    }}
                    title="Tutup Surat"
                  >
                    ✕
                  </button>

                  {/* Segel Lilin Romantis Merah */}
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '18px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #e74c3c 40%, #c0392b 100%)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                  }}>
                    ❤️
                  </div>

                  {/* Header Kartu: Judul, Salam & Kontrol Audio */}
                  <div style={{ textAlign: 'center', marginBottom: '0.65rem' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      color: '#b7791f',
                      fontWeight: 700,
                      display: 'block',
                      marginBottom: '0.15rem',
                    }}>
                      Pesan Dari Si Pembuat Website 💌
                    </span>
                    <h3 style={{
                      margin: '0.15rem 0',
                      fontSize: '1.25rem',
                      color: '#854d0e',
                      fontWeight: 800,
                      letterSpacing: '-0.3px',
                      lineHeight: 1.2,
                    }}>
                      Happy Birthday! 🎂✨
                    </h3>
                    <p style={{
                      margin: '0.2rem 0 0.4rem',
                      fontSize: '0.78rem',
                      fontStyle: 'italic',
                      color: '#78350f',
                      fontWeight: 700,
                    }}>
                      — With love, always. ❤️
                    </p>

                    {/* Tombol & Status Rekaman Suara Pemilik Website */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVoice?.();
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: isVoicePlaying ? 'rgba(244, 114, 182, 0.2)' : 'rgba(254, 243, 199, 0.85)',
                        border: isVoicePlaying ? '1px solid #ec4899' : '1px solid #d97706',
                        borderRadius: '9999px',
                        padding: '0.22rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        color: isVoicePlaying ? '#be185d' : '#92400e',
                        userSelect: 'none',
                        transition: 'all 0.25s ease',
                        boxShadow: isVoicePlaying ? '0 0 12px rgba(236, 72, 153, 0.4)' : 'none',
                      }}
                      title="Klik untuk memutar atau menjeda pesan suara mas"
                    >
                      <span style={{ animation: isVoicePlaying ? 'pulse 1.2s infinite' : 'none' }}>
                        {isVoicePlaying ? '🔊' : '🎙️'}
                      </span>
                      <span>
                        {isVoicePlaying ? 'Memutar Pesan Suara Mas...' : 'Dengarkan Pesan Suara Mas'}
                      </span>
                      <span style={{
                        fontSize: '0.66rem',
                        background: '#ffffff',
                        padding: '0.08rem 0.38rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        fontWeight: 800,
                      }}>
                        {isVoicePlaying ? '⏸️ Jeda' : '▶️ Putar'}
                      </span>
                    </div>
                  </div>

                  {/* Isi Pesan Romantis (Teks Asli dengan Emot Romantis) */}
                  <div style={{
                    fontSize: '0.80rem',
                    lineHeight: '1.6',
                    color: '#3f3a36',
                    textAlign: 'justify',
                    fontStyle: 'italic',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    padding: '0 0.35rem',
                  }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#92400e', fontSize: '0.83rem' }}>
                      Haiiii…cantiknya mas 🥰💖, gimana kabarnya saat ini ? 🌸, selalu happy kan ✨, harus tetap happy ya meskipun ngenratau 🫂🏡.
                    </p>

                    <p style={{ margin: 0 }}>
                      mas mau bilang, dihari yang spesial ini 🎂✨, barokallah fi umrik sayang 🤲🤍, sehat selalu dimanapun sampean berada 🌷, di lancarkan selalu juga kegiatan yang sampean kerjakan 💼✨, dan tentu di lancarkan juga rejeki nya sampean 🤲💸✨.
                    </p>

                    <div style={{
                      margin: '0.15rem 0',
                      fontWeight: 700,
                      color: '#854d0e',
                      background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(253, 230, 138, 0.7) 100%)',
                      borderLeft: '3.5px solid #d97706',
                      padding: '0.38rem 0.65rem',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.79rem',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.1)',
                    }}>
                      Selain itu mas juga berdoa semoga di hubungan kita bisa menuju sampai ke jenjang yang lebih serius 💍🕊️ dan lebih langgeng lagi sampai akhir hayat nanti. 👵👴❤️
                    </div>

                    <p style={{ margin: 0 }}>
                      Mas juga mau bilang terima kasih ya sayang sudah mau menerima mas 🥺💐, mas akan terus berusaha untuk memberikan yang terbaik bu sampean 💪❤️,
                    </p>

                    <p style={{
                      margin: '0.2rem 0 0',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      color: '#dc2626',
                      textAlign: 'right',
                    }}>
                      mas sayang anggun, I love you 💖💌🌹
                    </p>
                  </div>

                  {/* Petunjuk & Tombol Tutup Surat */}
                  <div style={{
                    marginTop: '0.65rem',
                    borderTop: '1px solid rgba(212, 175, 55, 0.35)',
                    paddingTop: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}>
                    <div style={{
                      background: 'rgba(254, 243, 199, 0.95)',
                      border: '1px dashed #d97706',
                      borderRadius: '6px',
                      padding: '0.25rem 0.55rem',
                      fontSize: '0.72rem',
                      color: '#92400e',
                      textAlign: 'center',
                    }}>
                      💡 <strong>Selesai membaca?</strong> Klik tombol <strong style={{ color: '#dc2626' }}>✕ Tutup Surat</strong> untuk membuka pesawat perjalanan selanjutnya! ✈️
                    </div>

                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseLetter();
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #e17055, #d63031)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '0.38rem 1.0rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(214, 48, 49, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span>✕</span>
                      <span>Tutup Surat & Buka Pesawat ✈️</span>
                    </button>
                  </div>
                </div>
              </Html>
            )}
          </group>
        </group>
      )}

      {/* ── 💌 TOMBOL MENGAMBANG BERSIH UNTUK BACA KEMBALI SURAT (KETIKA SURAT DITUTUP) ── */}
      {(phase === 'pulling_paper' || phase === 'paper_revealed') && isLetterClosed && (
        <Html position={[-2.2, 0.2, 0.1]} center distanceFactor={4.2}>
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleReopenLetter();
              }}
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f39c12)',
                color: '#1a1a1a',
                border: '2px solid #ffffff',
                borderRadius: '9999px',
                padding: '0.45rem clamp(0.75rem, 2.5vw, 1.25rem)',
                fontSize: 'clamp(0.75rem, 2.2vw, 0.86rem)',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.65), 0 0 20px rgba(241, 196, 15, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span>💌</span>
              <span>Baca Kembali Surat Ucapan</span>
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
