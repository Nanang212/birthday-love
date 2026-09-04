// ============================================================
// WORLD 5 — Things I Never Said
// Minimal path, stars, Capy diam (silent companion)
// ============================================================

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Capy } from '../../components/capybara/Capy';
import { useStory } from '../../hooks/useStory';
import { DialogueController } from '../../components/dialogue/DialogueController';
import { neverSaidDialogues } from '../../data/dialogues';

function NeverSaidScene({ onCapyClick }: { onCapyClick: () => void }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 0.7) * 0.15;
    }
  });

  return (
    <>
      <color attach="background" args={['#020408']} />
      <Stars radius={150} depth={80} count={5000} factor={4} saturation={0} fade speed={0.2} />

      <ambientLight intensity={0.15} color="#a0c0ff" />
      {/* Warm distant light */}
      <pointLight ref={lightRef} position={[0, 1.5, -8]} intensity={0.9} color="#ffd090" distance={20} />
      <pointLight position={[0, 0.5, 0]} intensity={0.3} color="#8080ff" distance={10} />

      {/* Long path of stones */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0, -0.9, -i * 0.9]}>
          <cylinderGeometry args={[0.12, 0.14, 0.08, 8]} />
          <meshLambertMaterial color="#3a3050" />
        </mesh>
      ))}

      {/* Ground plane */}
      <mesh position={[0, -0.96, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 12]} />
        <meshLambertMaterial color="#0a0818" />
      </mesh>

      {/* Distant warm light source (like a lantern) */}
      <mesh position={[0, 1.4, -9]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshLambertMaterial color="#ffd090" emissive="#ff9900" emissiveIntensity={1.5} />
      </mesh>

      {/* Floating subtle particles */}
      <NightParticles />

      {/* Capy sits silently beside the path */}
      <Capy
        outfit="normal"
        position={[-0.9, -0.7, 0.3]}
        scale={0.45}
        onClick={onCapyClick}
      />
    </>
  );
}

function NightParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 6;
    positions[i * 3 + 1] = Math.random() * 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3;
  }

  useFrame((state) => {
    if (ref.current) {
      (ref.current.material as THREE.PointsMaterial).opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#a0c0ff" transparent opacity={0.2} />
    </points>
  );
}

export function NeverSaidWorld() {
  const { goToWorld, clickCapy } = useStory();
  const [done, setDone] = useState(false);

  return (
    <>
      <div className="scene-container">
        <Canvas camera={{ position: [0, 0.5, 3.5], fov: 58 }} dpr={[1, 1.5]}>
          <NeverSaidScene onCapyClick={clickCapy} />
        </Canvas>
      </div>

      <div className="ui-overlay">
        <div className="world-indicator">
          <div className="world-indicator-pill">Things I Never Said</div>
        </div>

        {!done && (
          <DialogueController
            lines={neverSaidDialogues}
            onFinished={() => setDone(true)}
          />
        )}

        {done && (
          <div style={{
            position: 'fixed',
            bottom: '3rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            textAlign: 'center',
            animation: 'fadeUp 0.8s ease',
          }}>
            <p style={{
              fontFamily: 'var(--font-script)',
              fontSize: '1.2rem',
              color: 'var(--color-gold)',
              marginBottom: '1.5rem',
              textShadow: '0 0 20px rgba(240,194,127,0.4)',
            }}>
              ...dan ada satu hal lagi yang ingin aku tunjukkan.
            </p>
            <button
              id="btn-neversaid-continue"
              className="btn-primary"
              onClick={() => goToWorld('birthday')}
            >
              🎂 Lihat Sekarang
            </button>
          </div>
        )}
      </div>
    </>
  );
}
