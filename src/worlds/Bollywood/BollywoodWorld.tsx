// ============================================================
// WORLD 3 — Bollywood World
// Indian palace courtyard, warm night, Capy dancing
// ============================================================

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Capy } from '../../components/capybara/Capy';
import { useStory } from '../../hooks/useStory';
import { DialogueController } from '../../components/dialogue/DialogueController';
import { bollywoodDialogues } from '../../data/dialogues';

function BollywoodScene({ capyDancing, onCapyClick }: { capyDancing: boolean; onCapyClick: () => void }) {
  const archRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (archRef.current) {
      archRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  return (
    <>
      {/* Warm night sky */}
      <color attach="background" args={['#0a0515']} />
      <Stars radius={80} depth={40} count={1500} factor={2} saturation={0.3} fade speed={0.4} />

      <ambientLight intensity={0.4} color="#ff9966" />
      <pointLight position={[0, 4, 0]} intensity={1.5} color="#ffc080" distance={12} />
      <pointLight position={[3, 1, 3]} intensity={0.8} color="#ff8844" distance={8} />
      <pointLight position={[-3, 1, -3]} intensity={0.6} color="#cc44ff" distance={8} />

      <group ref={archRef}>
        {/* Ground / courtyard */}
        <mesh position={[0, -0.85, 0]} receiveShadow>
          <cylinderGeometry args={[3, 3, 0.1, 16]} />
          <meshLambertMaterial color="#3a2510" />
        </mesh>
        {/* Marble tiles pattern */}
        {[-1, 0, 1].map(x =>
          [-1, 0, 1].map(z => (
            <mesh key={`${x}${z}`} position={[x * 0.9, -0.79, z * 0.9]}>
              <boxGeometry args={[0.85, 0.01, 0.85]} />
              <meshLambertMaterial color={(x + z) % 2 === 0 ? '#5a3a20' : '#4a2e16'} />
            </mesh>
          ))
        )}

        {/* Main arch left pillar */}
        <mesh position={[-1.4, 0.2, -1]} castShadow>
          <boxGeometry args={[0.25, 2.2, 0.25]} />
          <meshLambertMaterial color="#c8a46a" />
        </mesh>
        {/* Main arch right pillar */}
        <mesh position={[1.4, 0.2, -1]} castShadow>
          <boxGeometry args={[0.25, 2.2, 0.25]} />
          <meshLambertMaterial color="#c8a46a" />
        </mesh>
        {/* Arch top */}
        <mesh position={[0, 1.35, -1]}>
          <boxGeometry args={[3.1, 0.35, 0.3]} />
          <meshLambertMaterial color="#c8a46a" />
        </mesh>
        {/* Arch dome */}
        <mesh position={[0, 1.7, -1]}>
          <sphereGeometry args={[0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshLambertMaterial color="#d4b070" />
        </mesh>

        {/* Decorative lamps */}
        {[-1.0, 0, 1.0].map((x, i) => (
          <group key={i} position={[x, 0.5, -0.9]}>
            <mesh>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshLambertMaterial color="#ffcc44" emissive="#ff8800" emissiveIntensity={2} />
            </mesh>
          </group>
        ))}

        {/* Decorative fabrics / curtains */}
        <mesh position={[-1.0, 0.8, -1]}>
          <planeGeometry args={[0.6, 1.6]} />
          <meshLambertMaterial color="#c0184a" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
        <mesh position={[1.0, 0.8, -1]}>
          <planeGeometry args={[0.6, 1.6]} />
          <meshLambertMaterial color="#4040c0" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>

        {/* Moon */}
        <mesh position={[0, 3.5, -3]}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshLambertMaterial color="#fff8e0" emissive="#ffeeaa" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Capy dancing with Bollywood outfit */}
      <Float speed={capyDancing ? 2 : 0.8} floatIntensity={capyDancing ? 0.5 : 0.2}>
        <Capy
          outfit="bollywood"
          position={[-1.8, -0.5, 0.5]}
          scale={0.52}
          isAnimating={capyDancing}
          onClick={onCapyClick}
        />
      </Float>

      {/* Floating petals */}
      <FloatingPetals />
    </>
  );
}

function FloatingPetals() {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(60 * 3);
  for (let i = 0; i < 60; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 6;
    positions[i * 3 + 1] = Math.random() * 4 - 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }

  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < 60; i++) {
      pos.array[i * 3 + 1] -= delta * 0.12;
      pos.array[i * 3]     += Math.sin(state.clock.elapsedTime * 0.5 + i) * delta * 0.05;
      if ((pos.array[i * 3 + 1] as number) < -1) (pos.array as Float32Array)[i * 3 + 1] = 4;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ff9988" transparent opacity={0.7} />
    </points>
  );
}

export function BollywoodWorld() {
  const { goToWorld, clickCapy } = useStory();
  const [phase, setPhase] = useState<'dialogue' | 'dance' | 'done'>('dialogue');

  return (
    <>
      <div className="scene-container">
        <Canvas camera={{ position: [0, 1, 5], fov: 58 }} dpr={[1, 1.5]}>
          <BollywoodScene capyDancing={phase === 'dance'} onCapyClick={clickCapy} />
        </Canvas>
      </div>

      <div className="ui-overlay">
        <div className="world-indicator">
          <div className="world-indicator-pill">🇮🇳 Bollywood World</div>
        </div>

        {phase === 'dialogue' && (
          <DialogueController
            lines={bollywoodDialogues}
            onFinished={() => setPhase('dance')}
          />
        )}

        {phase === 'dance' && (
          <>
            <DialogueController
              lines={[
                { id: 'bw-dance-1', speaker: 'capy', text: '✨ Namasté! 🕺', autoAdvance: true, delay: 1500 },
                { id: 'bw-dance-2', speaker: 'capy', text: 'shake → spin → pose... 💃', autoAdvance: true, delay: 2500 },
                { id: 'bw-dance-3', speaker: 'capy', text: 'Gimana? Keren kan? 😏', autoAdvance: false },
              ]}
              onFinished={() => setPhase('done')}
            />
          </>
        )}

        {phase === 'done' && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            animation: 'fadeUp 0.6s ease',
          }}>
            <button
              id="btn-bollywood-continue"
              className="btn-primary"
              onClick={() => goToWorld('memories')}
            >
              ✨ Ke Kenangan Kita →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
