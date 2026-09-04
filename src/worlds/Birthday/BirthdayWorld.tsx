// ============================================================
// WORLD 6 — Birthday Finale
// Capy bawa kue → letakkan → lampu menyala → birthday card
// ============================================================

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Capy } from '../../components/capybara/Capy';
import { ResponsiveCamera } from '../../components/scene/ResponsiveCamera';
import { useStory } from '../../hooks/useStory';
import { DialogueController } from '../../components/dialogue/DialogueController';
import { birthdayDialogues } from '../../data/dialogues';
import { birthdayData } from '../../data/birthday';

/* ── Confetti ── */
const CONFETTI_COLORS = ['#ff6b6b', '#ffd700', '#6bff6b', '#6bd0ff', '#ff6bdd', '#ffaa6b'];

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${Math.random() * 2}s`,
    duration: `${2.5 + Math.random() * 2}s`,
    size: `${6 + Math.random() * 6}px`,
  }));

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: '-20px',
            background: p.color,
            width: p.size,
            height: p.size,
            '--delay': p.delay,
            '--fall-duration': p.duration,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

/* ── 3D Scene ── */
function BirthdayScene({
  lightsOn,
  capyWalking,
  onCapyClick,
}: {
  lightsOn: boolean;
  capyWalking: boolean;
  onCapyClick: () => void;
}) {
  const capyPosRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;

    if (!capyWalking || !capyPosRef.current) return;
    // Capy walks toward center
    const targetX = 0;
    capyPosRef.current.position.x += (targetX - capyPosRef.current.position.x) * delta * 0.8;
  });

  return (
    <>
      <color attach="background" args={['#050210']} />
      <Stars radius={120} depth={60} count={4000} factor={4} saturation={0.2} fade speed={0.4} />

      <ambientLight intensity={lightsOn ? 0.6 : 0.2} color={lightsOn ? '#ffe8a0' : '#4060a0'} />
      <pointLight position={[0, 4, 0]} intensity={lightsOn ? 2.0 : 0.3} color="#ffd090" distance={20} />
      {lightsOn && <pointLight position={[3, 2, 3]} intensity={0.8} color="#ff88cc" distance={12} />}
      {lightsOn && <pointLight position={[-3, 2, -3]} intensity={0.8} color="#88ccff" distance={12} />}

      {/* Final island */}
      <mesh position={[0, -0.8, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.0, 0.6, 20]} />
        <meshLambertMaterial color={lightsOn ? '#5a8c6e' : '#2a4a3a'} />
      </mesh>
      <mesh position={[0, -0.49, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.04, 20]} />
        <meshLambertMaterial color={lightsOn ? '#6eb87e' : '#3a6050'} />
      </mesh>

      {/* Birthday cake table */}
      <mesh position={[0, -0.45, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 12]} />
        <meshLambertMaterial color="#8a6040" />
      </mesh>

      {/* Birthday message light strings */}
      {lightsOn && [-1.5, -0.75, 0, 0.75, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 1.5, -1]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshLambertMaterial
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            emissive={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}

      {/* Stars/orbs floating around */}
      {lightsOn && [0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh key={i} position={[Math.cos(rad) * 1.8, 0.6, Math.sin(rad) * 1.8]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshLambertMaterial
              color="#ffe060"
              emissive="#ffe060"
              emissiveIntensity={2}
            />
          </mesh>
        );
      })}

      {/* Capy with cake */}
      <group ref={capyPosRef} position={[-1.8, -0.4, 0.5]}>
        <Capy
          outfit="cake"
          position={[0, 0, 0]}
          scale={0.55}
          isAnimating={capyWalking}
          onClick={onCapyClick}
        />
      </group>
    </>
  );
}

/* ── World Component ── */
export function BirthdayWorld() {
  const { clickCapy } = useStory();
  const [phase, setPhase] = useState<'capy-walk' | 'lights-on' | 'dialogue' | 'card'>('capy-walk');

  useEffect(() => {
    if (phase === 'capy-walk') {
      // Capy walks → after 2s lights come on
      setTimeout(() => setPhase('lights-on'), 2200);
    }
    if (phase === 'lights-on') {
      setTimeout(() => setPhase('dialogue'), 1200);
    }
  }, [phase]);

  return (
    <>
      <div className="scene-container">
        <Canvas camera={{ position: [0, 1.5, 5.5], fov: 55 }} dpr={[1, 1.5]}>
          <ResponsiveCamera baseY={1.5} baseZ={5.5} targetWidth={8.5} />
          <BirthdayScene
            lightsOn={phase !== 'capy-walk'}
            capyWalking={phase === 'capy-walk'}
            onCapyClick={clickCapy}
          />
        </Canvas>
      </div>

      <div className="ui-overlay">
        {/* Confetti */}
        {phase === 'card' && <Confetti />}

        {/* Dialogue */}
        {phase === 'dialogue' && (
          <DialogueController
            lines={[
              { id: 'bday-capy-1', speaker: 'capy', text: '🎂 Aku bawa sesuatu...', autoAdvance: true, delay: 2000 },
              { id: 'bday-capy-2', speaker: 'capy', text: 'Selamat ulang tahun ya! ❤️', autoAdvance: true, delay: 2500 },
              ...birthdayDialogues,
            ]}
            onFinished={() => setPhase('card')}
          />
        )}

        {/* Birthday Card */}
        {phase === 'card' && (
          <div className="birthday-overlay">
            <div className="birthday-card">
              <h1 className="birthday-title">Happy Birthday! 🎂</h1>
              <p className="birthday-name">{birthdayData.name}</p>

              <div className="birthday-message">
                {birthdayData.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <ul style={{
                listStyle: 'none',
                marginTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                {birthdayData.wishes.map((wish, i) => (
                  <li key={i} style={{ color: 'var(--color-pink)', fontSize: '0.85rem' }}>
                    🌸 {wish}
                  </li>
                ))}
              </ul>

              <p className="birthday-closing">{birthdayData.closing}</p>

              <div style={{ marginTop: '1.5rem', opacity: 0.5, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                🦫 — Capy & I
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
