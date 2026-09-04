// ============================================================
// WORLD 4 — Our Memories
// Night sky + floating photos + Capy with camera
// ============================================================

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Capy } from '../../components/capybara/Capy';
import { useStory } from '../../hooks/useStory';
import { DialogueController } from '../../components/dialogue/DialogueController';
import { MemoryModal } from '../../components/media/MemoryModal';
import { memoriesDialogues } from '../../data/dialogues';
import { memories } from '../../data/memories';

function MemoriesScene({ onCapyClick }: { onCapyClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <>
      <color attach="background" args={['#050810']} />
      <Stars radius={120} depth={80} count={4000} factor={3.5} saturation={0.1} fade speed={0.3} />

      <ambientLight intensity={0.25} color="#8080ff" />
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#c8a0ff" distance={15} />
      <pointLight position={[3, 0, 3]} intensity={0.5} color="#ff88cc" distance={10} />

      {/* Slowly rotating memory frames */}
      <group ref={groupRef}>
        {memories.map((mem, i) => {
          const angle = (i / memories.length) * Math.PI * 2;
          const radius = 1.6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = Math.sin(i * 1.3) * 0.4;

          return (
            <Float key={mem.id} speed={0.6 + i * 0.2} floatIntensity={0.25}>
              <group position={[x, y, z]}>
                {/* Photo frame */}
                <mesh castShadow>
                  <boxGeometry args={[0.32, 0.32, 0.02]} />
                  <meshLambertMaterial color="#e8d5b0" />
                </mesh>
                {/* Photo placeholder */}
                <mesh position={[0, 0, 0.012]}>
                  <planeGeometry args={[0.26, 0.26]} />
                  <meshLambertMaterial
                    color={['#6090c0', '#c06090', '#90c060', '#c09060'][i % 4]}
                  />
                </mesh>
                {/* Glow */}
                <pointLight position={[0, 0, 0.1]} intensity={0.3} color="#ffffff" distance={1} />
              </group>
            </Float>
          );
        })}
      </group>

      {/* Capy with camera */}
      <Float speed={1} floatIntensity={0.3}>
        <Capy
          outfit="camera"
          position={[-2, -0.5, 0.5]}
          scale={0.52}
          onClick={onCapyClick}
        />
      </Float>

      {/* Particle nebula */}
      <NebulaParticles />
    </>
  );
}

function NebulaParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      (ref.current.material as THREE.PointsMaterial).opacity = 0.2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#cc88ff" transparent opacity={0.25} />
    </points>
  );
}

export function MemoriesWorld() {
  const { goToWorld, clickCapy, openMemory, closeMemory, state } = useStory();
  const [phase, setPhase] = useState<'capy-intro' | 'dialogue' | 'explore'>('capy-intro');
  const [capyFunScene, setCapyFunScene] = useState(false);

  return (
    <>
      <div className="scene-container">
        <Canvas camera={{ position: [0, 0.5, 5], fov: 60 }} dpr={[1, 1.5]}>
          <MemoriesScene onCapyClick={() => { clickCapy(); }} />
        </Canvas>
      </div>

      <div className="ui-overlay">
        <div className="world-indicator">
          <div className="world-indicator-pill">Our Memories ✨</div>
        </div>

        {/* Capy photo moment */}
        {phase === 'capy-intro' && (
          <DialogueController
            lines={[
              { id: 'mem-capy-1', speaker: 'capy', text: '📷 Senyum dulu!', autoAdvance: true, delay: 1800 },
              { id: 'mem-capy-2', speaker: 'capy', text: '*click* 📸', autoAdvance: true, delay: 1500 },
            ]}
            onFinished={() => setPhase('dialogue')}
          />
        )}

        {phase === 'dialogue' && (
          <DialogueController
            lines={memoriesDialogues}
            onFinished={() => setPhase('explore')}
          />
        )}

        {/* Explore: memory thumbnails */}
        {phase === 'explore' && (
          <>
            {/* Fun scene Capy easter egg */}
            {!capyFunScene && (
              <div style={{
                position: 'fixed',
                bottom: '10rem',
                right: '1.5rem',
                zIndex: 20,
              }}>
                <button
                  id="btn-capy-fun-scene"
                  className="btn-ghost"
                  onClick={() => setCapyFunScene(true)}
                  title="Tanya Capy sesuatu..."
                >
                  🦫 Tanya Capy
                </button>
              </div>
            )}

            {/* Fun scene dialogue */}
            {capyFunScene && !state.currentMemory && (
              <DialogueController
                lines={[
                  { id: 'fun-1', speaker: 'capy', text: '...', autoAdvance: true, delay: 1500 },
                  { id: 'fun-2', speaker: 'capy', text: 'Kamu mau lihat sesuatu?', autoAdvance: true, delay: 2000 },
                  { id: 'fun-3', speaker: 'capy', text: '... Dia cantik ya. 🥰❤️', autoAdvance: false },
                  { id: 'fun-4', speaker: 'me', text: 'Iya.', autoAdvance: false },
                  { id: 'fun-5', speaker: 'capy', text: 'Beruntung banget kamu.', autoAdvance: false },
                  { id: 'fun-6', speaker: 'me', text: '...iya. 😄', autoAdvance: false },
                ]}
                onFinished={() => setCapyFunScene(false)}
              />
            )}

            {/* Memory thumbnails */}
            {!capyFunScene && (
              <div className="memories-grid">
                {memories.map((mem) => (
                  <button
                    key={mem.id}
                    id={`btn-memory-${mem.id}`}
                    className="memory-thumb"
                    onClick={() => openMemory(mem)}
                    title={mem.title}
                    aria-label={`View memory: ${mem.title}`}
                  >
                    <div className="memory-thumb-placeholder">
                      {mem.type === 'video' ? '🎬' : '📷'}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Continue */}
            {!capyFunScene && (
              <div style={{ position: 'fixed', top: '4rem', right: '1.5rem', zIndex: 20 }}>
                <button
                  id="btn-memories-continue"
                  className="btn-ghost"
                  onClick={() => goToWorld('never-said')}
                >
                  Lanjutkan →
                </button>
              </div>
            )}
          </>
        )}

        {/* Memory Modal */}
        {state.currentMemory && (
          <MemoryModal memory={state.currentMemory} onClose={closeMemory} />
        )}
      </div>
    </>
  );
}
