// ============================================================
// COMPONENT — ConcertMascots (Sura & Baya di Konser NDX A.K.A)
// Karakter Sura & Baya 3D:
// 1. Muncul dan melangkah masuk dari sebelah kiri menuju ke tengah
// 2. Dialog Suroboyoan mengajak konser bareng (dengan voice-over)
// 3. Saat konser aktif: Goyang & loncat-loncat heboh mengikuti beat musik
// 4. Setelah konser (3:21): Dialog penutup "Part 2 Offline 13 Des 2026"
// ============================================================

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SuraModel } from '../../components/scene/SuraModel';
import { BayaModel } from '../../components/scene/BayaModel';

export interface ConcertDialogueItem {
  id: string;
  speaker: 'hiu' | 'baya' | 'together';
  speakerName: string;
  avatar: string;
  themeColor: string;
  borderColor: string;
  text: string;
  audioSrc: string;
  duration: number;
}

export const PRE_CONCERT_DIALOGUES: ConcertDialogueItem[] = [
  {
    id: 'concert_sura_1',
    speaker: 'hiu',
    speakerName: 'Sura',
    avatar: '🦈',
    themeColor: '#00d2d3',
    borderColor: 'rgba(0, 210, 211, 0.85)',
    text: 'Lho Capy! Ketemu maneh rek nang kene! Pas banget iki, ndelok konser NDX A.K.A rek!',
    audioSrc: '/audio/dialogue/concert_sura_1.mp3',
    duration: 7.5,
  },
  {
    id: 'concert_baya_2',
    speaker: 'baya',
    speakerName: 'Baya',
    avatar: '🐊',
    themeColor: '#1dd1a1',
    borderColor: 'rgba(29, 209, 161, 0.85)',
    text: 'Iyo Capy! Gak nyongko pethuk nang konser ambyar iki! Ayo rek, siap-siap goyang bareng, joget sing paling heboh!',
    audioSrc: '/audio/dialogue/concert_baya_2.mp3',
    duration: 8.5,
  },
  {
    id: 'concert_together_3',
    speaker: 'together',
    speakerName: 'Sura & Baya',
    avatar: '🦈❤️🐊',
    themeColor: '#feca57',
    borderColor: 'rgba(254, 202, 87, 0.95)',
    text: 'Ayok Capy, angkat tanganmu kabeh... Yok konser bareng! Gasss rek!',
    audioSrc: '/audio/dialogue/concert_together_3.mp3',
    duration: 6.4,
  },
];

export const POST_CONCERT_DIALOGUES: ConcertDialogueItem[] = [
  {
    id: 'concert_sura_4',
    speaker: 'hiu',
    speakerName: 'Sura',
    avatar: '🦈',
    themeColor: '#00d2d3',
    borderColor: 'rgba(0, 210, 211, 0.85)',
    text: 'Wah seru pol rek goyange! Wis disik yo konsere Capy...',
    audioSrc: '/audio/dialogue/concert_sura_4.mp3',
    duration: 4.8,
  },
  {
    id: 'concert_baya_5',
    speaker: 'baya',
    speakerName: 'Baya',
    avatar: '🐊',
    themeColor: '#1dd1a1',
    borderColor: 'rgba(29, 209, 161, 0.85)',
    text: 'Iyo bener, full-e lanjut nang Part 2 Offline tanggal 13 Desember 2026 yo!',
    audioSrc: '/audio/dialogue/concert_baya_5.mp3',
    duration: 6.7,
  },
  {
    id: 'concert_together_6',
    speaker: 'together',
    speakerName: 'Sura & Baya',
    avatar: '🦈👋🐊',
    themeColor: '#feca57',
    borderColor: 'rgba(254, 202, 87, 0.95)',
    text: 'Wes ndang lanjut menyang perjalanan selanjutnya! Numpak pesawat nang pojok kiwo kae yo!',
    audioSrc: '/audio/dialogue/concert_together_6.mp3',
    duration: 6.3,
  },
];

interface ConcertMascotsProps {
  isStarted: boolean; // Mulai melangkah masuk dari kiri
  isConcertActive: boolean; // Sedang joget loncat-loncat saat YouTube play
  isConcertEnded: boolean; // Selesai konser -> mulai dialog penutup
  onPreConcertFinished: () => void;
  onPostConcertFinished: () => void;
}

export const ConcertMascots: React.FC<ConcertMascotsProps> = ({
  isStarted,
  isConcertActive,
  isConcertEnded,
  onPreConcertFinished,
  onPostConcertFinished,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const suraGroupRef = useRef<THREE.Group>(null);
  const bayaGroupRef = useRef<THREE.Group>(null);

  // Posisi panggung
  const baseY = -1.6;
  const targetSuraX = -1.25;
  const targetBayaX = -0.25;

  // State berjalan masuk
  const [hasArrived, setHasArrived] = useState(false);

  // Dialog state
  const [activeDialoguePhase, setActiveDialoguePhase] = useState<'none' | 'pre' | 'concert' | 'post' | 'done'>('none');
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop audio utility
  const stopCurrentAudio = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
      audioInstanceRef.current.currentTime = 0;
      audioInstanceRef.current = null;
    }
  }, []);

  // Mulai dialog pre-concert ketika sudah sampai di tengah
  useEffect(() => {
    if (hasArrived && activeDialoguePhase === 'none') {
      setActiveDialoguePhase('pre');
      setCurrentDialogueIndex(0);
    }
  }, [hasArrived, activeDialoguePhase]);

  // Transisi ke dialog post-concert ketika konser selesai
  useEffect(() => {
    if (isConcertEnded && activeDialoguePhase === 'concert') {
      setActiveDialoguePhase('post');
      setCurrentDialogueIndex(0);
    }
  }, [isConcertEnded, activeDialoguePhase]);

  // Handler putar audio dialog saat dialog index berganti
  useEffect(() => {
    if (activeDialoguePhase === 'none' || activeDialoguePhase === 'concert' || activeDialoguePhase === 'done') {
      stopCurrentAudio();
      return;
    }

    const currentList = activeDialoguePhase === 'pre' ? PRE_CONCERT_DIALOGUES : POST_CONCERT_DIALOGUES;
    const item = currentList[currentDialogueIndex];
    if (!item) return;

    stopCurrentAudio();

    const audio = new Audio(item.audioSrc);
    audio.volume = 1.0;
    audioInstanceRef.current = audio;

    audio.play().catch(() => {
      // Browser autoplay policy fallback
    });

    const timeoutDuration = (item.duration + 0.3) * 1000;
    timerRef.current = setTimeout(() => {
      if (currentDialogueIndex < currentList.length - 1) {
        setCurrentDialogueIndex((prev) => prev + 1);
      } else {
        // Fase dialog selesai
        if (activeDialoguePhase === 'pre') {
          setActiveDialoguePhase('concert');
          onPreConcertFinished();
        } else if (activeDialoguePhase === 'post') {
          setActiveDialoguePhase('done');
          onPostConcertFinished();
        }
      }
    }, timeoutDuration);

    return () => {
      stopCurrentAudio();
    };
  }, [activeDialoguePhase, currentDialogueIndex, stopCurrentAudio, onPreConcertFinished, onPostConcertFinished]);

  // Handler klik skip dialog
  const handleNextDialogue = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopCurrentAudio();
    const currentList = activeDialoguePhase === 'pre' ? PRE_CONCERT_DIALOGUES : POST_CONCERT_DIALOGUES;
    if (currentDialogueIndex < currentList.length - 1) {
      setCurrentDialogueIndex((prev) => prev + 1);
    } else {
      if (activeDialoguePhase === 'pre') {
        setActiveDialoguePhase('concert');
        onPreConcertFinished();
      } else if (activeDialoguePhase === 'post') {
        setActiveDialoguePhase('done');
        onPostConcertFinished();
      }
    }
  };

  // Frame animation: Melangkah masuk dari kiri & Goyang loncat-loncat saat konser
  useFrame((state, delta) => {
    if (!isStarted) return;
    const time = state.clock.getElapsedTime();

    // 1. Melangkah masuk dari kiri
    if (!hasArrived) {
      let arrivedCount = 0;

      if (suraGroupRef.current) {
        suraGroupRef.current.position.x = THREE.MathUtils.damp(
          suraGroupRef.current.position.x,
          targetSuraX,
          2.6,
          delta
        );
        // Bobbing while walking
        suraGroupRef.current.position.y = baseY + Math.sin(time * 6) * 0.05;
        if (Math.abs(suraGroupRef.current.position.x - targetSuraX) < 0.08) {
          arrivedCount++;
        }
      }

      if (bayaGroupRef.current) {
        bayaGroupRef.current.position.x = THREE.MathUtils.damp(
          bayaGroupRef.current.position.x,
          targetBayaX,
          2.4,
          delta
        );
        // Step bounce while walking
        bayaGroupRef.current.position.y = baseY + Math.abs(Math.sin(time * 6.5)) * 0.06;
        if (Math.abs(bayaGroupRef.current.position.x - targetBayaX) < 0.08) {
          arrivedCount++;
        }
      }

      if (arrivedCount === 2) {
        setHasArrived(true);
      }
    } else if (isConcertActive) {
      // 2. CONCERT JUMPING & DANCING ANIMATION (Goyang & Loncat-loncat heboh)
      const bpmSpeed = 9.0; // Dynamic concert rhythm

      if (suraGroupRef.current) {
        // Sura melompat tinggi dan meliuk berirama
        const jumpY = Math.abs(Math.sin(time * bpmSpeed)) * 0.42;
        suraGroupRef.current.position.y = baseY + jumpY;
        suraGroupRef.current.rotation.z = Math.sin(time * (bpmSpeed * 0.5)) * 0.18;
        suraGroupRef.current.rotation.x = Math.sin(time * bpmSpeed) * 0.12;
      }

      if (bayaGroupRef.current) {
        // Baya melompat bergantian sedikit offset (pogo concert jump)
        const jumpY = Math.abs(Math.sin(time * bpmSpeed + 0.5)) * 0.40;
        bayaGroupRef.current.position.y = baseY + jumpY;
        bayaGroupRef.current.rotation.z = Math.cos(time * (bpmSpeed * 0.5)) * 0.18;
        bayaGroupRef.current.rotation.x = Math.cos(time * bpmSpeed) * 0.14;
      }
    } else {
      // 3. Idle breathing gentle stance
      if (suraGroupRef.current) {
        suraGroupRef.current.position.y = baseY + Math.sin(time * 2.5) * 0.03;
        suraGroupRef.current.rotation.z = THREE.MathUtils.damp(suraGroupRef.current.rotation.z, 0, 4, delta);
        suraGroupRef.current.rotation.x = THREE.MathUtils.damp(suraGroupRef.current.rotation.x, 0, 4, delta);
      }
      if (bayaGroupRef.current) {
        bayaGroupRef.current.position.y = baseY + Math.sin(time * 2.2 + 1) * 0.02;
        bayaGroupRef.current.rotation.z = THREE.MathUtils.damp(bayaGroupRef.current.rotation.z, 0, 4, delta);
        bayaGroupRef.current.rotation.x = THREE.MathUtils.damp(bayaGroupRef.current.rotation.x, 0, 4, delta);
      }
    }
  });

  // Ambil dialog aktif
  const currentList = activeDialoguePhase === 'pre' ? PRE_CONCERT_DIALOGUES : POST_CONCERT_DIALOGUES;
  const currentDialogue =
    activeDialoguePhase === 'pre' || activeDialoguePhase === 'post'
      ? currentList[currentDialogueIndex]
      : null;

  const isSpeakingHiu = currentDialogue?.speaker === 'hiu' || currentDialogue?.speaker === 'together';
  const isSpeakingBaya = currentDialogue?.speaker === 'baya' || currentDialogue?.speaker === 'together';

  return (
    <group ref={rootGroupRef}>
      {/* ── 🦈 SURA (HIU) — Masuk dari kiri (x = -6.5 -> -1.25) ── */}
      <group
        ref={suraGroupRef}
        position={[-6.5, baseY, 0.2]}
        rotation={[0, 0.18, 0]}
      >
        <SuraModel isSpeaking={isSpeakingHiu} scale={0.48} />

        {/* Balon Dialog Sura (Kecil di Atas Kepala) */}
        {currentDialogue?.speaker === 'hiu' && (
          <Html
            position={[0, 0.95, 0.1]}
            center
            distanceFactor={4.2}
            style={{ pointerEvents: 'auto', userSelect: 'none', zIndex: 100 }}
          >
            <div
              onClick={handleNextDialogue}
              style={{
                position: 'relative',
                background: 'rgba(6, 14, 28, 0.88)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: `1.5px solid ${currentDialogue.borderColor}`,
                borderRadius: '14px',
                padding: '0.38rem 0.75rem',
                maxWidth: '220px',
                minWidth: '150px',
                color: '#ffffff',
                fontFamily: "'Quicksand', 'Outfit', sans-serif",
                fontSize: '11.5px',
                lineHeight: '1.4',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.55), 0 0 15px rgba(0, 210, 211, 0.35)',
                cursor: 'pointer',
                textAlign: 'center',
                animation: 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              }}
            >
              {/* Header Balon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.35rem',
                  marginBottom: '0.2rem',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#00d2d3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>🦈</span>
                  <span>Sura</span>
                </span>
                <span
                  style={{
                    fontSize: '8.5px',
                    padding: '1px 5px',
                    borderRadius: '5px',
                    background: 'rgba(0, 210, 211, 0.2)',
                    color: '#2ed573',
                    fontWeight: 700,
                  }}
                >
                  🎙️ Bicara
                </span>
              </div>
              {/* Teks Pesan */}
              <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '11px', lineHeight: '1.35' }}>
                "{currentDialogue.text}"
              </div>
              {/* Ekor Segitiga Balon Menunjuk ke Kepala Sura */}
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
                  borderTop: `6px solid ${currentDialogue.borderColor}`,
                }}
              />
            </div>
          </Html>
        )}
      </group>

      {/* ── 🐊 BAYA (BUAYA) — Masuk dari kiri (x = -5.5 -> -0.25) ── */}
      <group
        ref={bayaGroupRef}
        position={[-5.5, baseY, 0.2]}
        rotation={[0, -0.15, 0]}
      >
        <BayaModel isSpeaking={isSpeakingBaya} scale={0.48} />

        {/* Balon Dialog Baya (Kecil di Atas Kepala) */}
        {currentDialogue?.speaker === 'baya' && (
          <Html
            position={[0, 0.95, 0.1]}
            center
            distanceFactor={4.2}
            style={{ pointerEvents: 'auto', userSelect: 'none', zIndex: 100 }}
          >
            <div
              onClick={handleNextDialogue}
              style={{
                position: 'relative',
                background: 'rgba(8, 22, 16, 0.88)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: `1.5px solid ${currentDialogue.borderColor}`,
                borderRadius: '14px',
                padding: '0.38rem 0.75rem',
                maxWidth: '220px',
                minWidth: '150px',
                color: '#ffffff',
                fontFamily: "'Quicksand', 'Outfit', sans-serif",
                fontSize: '11.5px',
                lineHeight: '1.4',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.55), 0 0 15px rgba(29, 209, 161, 0.35)',
                cursor: 'pointer',
                textAlign: 'center',
                animation: 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              }}
            >
              {/* Header Balon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.35rem',
                  marginBottom: '0.2rem',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#1dd1a1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>🐊</span>
                  <span>Baya</span>
                </span>
                <span
                  style={{
                    fontSize: '8.5px',
                    padding: '1px 5px',
                    borderRadius: '5px',
                    background: 'rgba(29, 209, 161, 0.2)',
                    color: '#2ed573',
                    fontWeight: 700,
                  }}
                >
                  🎙️ Bicara
                </span>
              </div>
              {/* Teks Pesan */}
              <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '11px', lineHeight: '1.35' }}>
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
                  borderTop: `6px solid ${currentDialogue.borderColor}`,
                }}
              />
            </div>
          </Html>
        )}
      </group>

      {/* ── 🦈❤️🐊 DIALOG BERSAMA (TOGETHER) ── */}
      {currentDialogue?.speaker === 'together' && (
        <Html
          position={[(targetSuraX + targetBayaX) / 2, baseY + 1.05, 0.1]}
          center
          distanceFactor={4.2}
          style={{ pointerEvents: 'auto', userSelect: 'none', zIndex: 110 }}
        >
          <div
            onClick={handleNextDialogue}
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.92), rgba(36, 20, 52, 0.92))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1.5px solid ${currentDialogue.borderColor}`,
              borderRadius: '16px',
              padding: '0.42rem 0.9rem',
              maxWidth: '260px',
              minWidth: '180px',
              color: '#fff',
              fontFamily: "'Quicksand', 'Outfit', sans-serif",
              fontSize: '11.5px',
              lineHeight: '1.4',
              boxShadow: '0 8px 25px rgba(254, 202, 87, 0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
              cursor: 'pointer',
              textAlign: 'center',
              animation: 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: currentDialogue.themeColor,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                marginBottom: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>{currentDialogue.avatar}</span>
              <span>{currentDialogue.speakerName}</span>
              <span
                style={{
                  fontSize: '8.5px',
                  padding: '1px 5px',
                  borderRadius: '5px',
                  background: 'rgba(254, 202, 87, 0.25)',
                }}
              >
                🎉 Kompak
              </span>
            </div>
            <div style={{ fontWeight: 600, color: '#fef3c7', fontSize: '11px', lineHeight: '1.35' }}>
              "{currentDialogue.text}"
            </div>
            {/* Ekor Segitiga Balon */}
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
                borderTop: `6px solid ${currentDialogue.borderColor}`,
              }}
            />
          </div>
        </Html>
      )}
    </group>
  );
};
