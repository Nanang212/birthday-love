// ============================================================
// COMPONENT — ConcertStage3D
// Panggung Konser 3D Mewah & Meriah:
// - Lantai panggung reflektif dengan LED edge neon glow
// - Rigging truss panggung di kiri, kanan, dan atas
// - Moving head spotlights yang menyapu panggung dengan warna konser
// - Sweeping laser beams & crowd glowstick particles
// ============================================================

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ConcertStage3DProps {
  isConcertActive: boolean;
}

export const ConcertStage3D: React.FC<ConcertStage3DProps> = ({ isConcertActive }) => {
  const spotLightsRef = useRef<THREE.Group>(null);
  const lasersRef = useRef<THREE.Group>(null);
  const glowsticksRef = useRef<THREE.Points>(null);

  // Generate crowd glowstick particles
  const glowsticksData = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const initialPhases = new Float32Array(count);

    const palette = [
      new THREE.Color('#ff007f'), // Hot pink
      new THREE.Color('#00f0ff'), // Neon cyan
      new THREE.Color('#ffe600'), // Electric yellow
      new THREE.Color('#7928ca'), // Electric purple
      new THREE.Color('#00ff88'), // Neon green
    ];

    for (let i = 0; i < count; i++) {
      // Crowd spans x: -7 to +7, y: -2.1 to -1.3, z: 0.5 to 3.2
      const x = (Math.random() - 0.5) * 14;
      const y = -2.1 + Math.random() * 0.9;
      const z = 0.5 + Math.random() * 2.7;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      initialPhases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, initialPhases };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = isConcertActive ? 3.2 : 1.0;

    // Animate moving head spotlights
    if (spotLightsRef.current) {
      spotLightsRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.SpotLight) {
          const offset = index * 1.1;
          child.target.position.x = Math.sin(time * speed + offset) * 3.5;
          child.target.position.z = Math.cos(time * speed * 0.8 + offset) * 2.0;
          child.target.updateMatrixWorld();

          // Flash intensity during concert
          if (isConcertActive) {
            child.intensity = 4.0 + Math.sin(time * 8 + offset) * 2.5;
          } else {
            child.intensity = 2.5 + Math.sin(time * 2 + offset) * 0.5;
          }
        }
      });
    }

    // Animate laser beams
    if (lasersRef.current) {
      lasersRef.current.children.forEach((mesh, index) => {
        const offset = index * 0.8;
        mesh.rotation.z = Math.sin(time * speed * 0.7 + offset) * 0.45;
        mesh.rotation.y = Math.cos(time * speed * 0.5 + offset) * 0.35;
      });
    }

    // Animate crowd glowsticks swaying
    if (glowsticksRef.current) {
      const positions = glowsticksRef.current.geometry.attributes.position.array as Float32Array;
      const phases = glowsticksData.initialPhases;
      const waveFreq = isConcertActive ? 6.0 : 2.5;
      const waveAmp = isConcertActive ? 0.08 : 0.03;

      for (let i = 0; i < phases.length; i++) {
        // Subtle vertical bounce & side sway
        positions[i * 3 + 1] = glowsticksData.positions[i * 3 + 1] + Math.sin(time * waveFreq + phases[i]) * waveAmp;
        positions[i * 3] = glowsticksData.positions[i * 3] + Math.cos(time * (waveFreq * 0.7) + phases[i]) * (waveAmp * 0.6);
      }
      glowsticksRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ── 1. AMBIENT & STAGE GENERAL LIGHTING ── */}
      <ambientLight intensity={isConcertActive ? 0.9 : 0.65} color="#2b1b54" />
      <directionalLight position={[0, 5, 4]} intensity={isConcertActive ? 1.4 : 0.9} color="#ffd4ee" />

      {/* ── 2. MOVING HEAD CONCERT SPOTLIGHTS ── */}
      <group ref={spotLightsRef}>
        {/* Spotlight 1: Neon Cyan */}
        <spotLight
          position={[-3.8, 3.8, 1]}
          color="#00f0ff"
          intensity={2.8}
          angle={0.42}
          penumbra={0.65}
          distance={12}
        />
        {/* Spotlight 2: Hot Magenta */}
        <spotLight
          position={[-1.5, 4.2, 1.2]}
          color="#ff007f"
          intensity={3.2}
          angle={0.45}
          penumbra={0.7}
          distance={12}
        />
        {/* Spotlight 3: Electric Amber/Gold */}
        <spotLight
          position={[1.5, 4.2, 1.2]}
          color="#ffe600"
          intensity={3.2}
          angle={0.45}
          penumbra={0.7}
          distance={12}
        />
        {/* Spotlight 4: Neon Violet */}
        <spotLight
          position={[3.8, 3.8, 1]}
          color="#a855f7"
          intensity={2.8}
          angle={0.42}
          penumbra={0.65}
          distance={12}
        />
      </group>

      {/* ── 3. GLOSSY CONCERT STAGE PLATFORM ── */}
      <group position={[0, -2.15, 0]}>
        {/* Main Stage Deck */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[11.5, 0.45, 5.5]} />
          <meshStandardMaterial
            color="#0d081a"
            roughness={0.25}
            metalness={0.7}
          />
        </mesh>

        {/* Glossy Top Finish */}
        <mesh position={[0, 0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[11.4, 5.4]} />
          <meshStandardMaterial
            color="#18112e"
            roughness={0.15}
            metalness={0.8}
          />
        </mesh>

        {/* LED Strip Neon Glow Edge Depan */}
        <mesh position={[0, 0.24, 2.72]}>
          <boxGeometry args={[11.45, 0.06, 0.06]} />
          <meshBasicMaterial color={isConcertActive ? '#ff007f' : '#00f0ff'} />
        </mesh>
        {/* LED Strip Kiri */}
        <mesh position={[-5.72, 0.24, 0]}>
          <boxGeometry args={[0.06, 0.06, 5.45]} />
          <meshBasicMaterial color={isConcertActive ? '#00f0ff' : '#a855f7'} />
        </mesh>
        {/* LED Strip Kanan */}
        <mesh position={[5.72, 0.24, 0]}>
          <boxGeometry args={[0.06, 0.06, 5.45]} />
          <meshBasicMaterial color={isConcertActive ? '#00f0ff' : '#a855f7'} />
        </mesh>
      </group>

      {/* ── 4. STAGE TRUSS RIGGING (TIANG & PALANG LAMPU) ── */}
      <group position={[0, 0, -1.8]}>
        {/* Tiang Truss Kiri */}
        <mesh position={[-5.2, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 5.4, 8]} />
          <meshStandardMaterial color="#4a4d5a" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[-5.5, 0.8, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 5.4, 8]} />
          <meshStandardMaterial color="#3a3d4a" metalness={0.85} roughness={0.35} />
        </mesh>

        {/* Tiang Truss Kanan */}
        <mesh position={[5.2, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 5.4, 8]} />
          <meshStandardMaterial color="#4a4d5a" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[5.5, 0.8, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 5.4, 8]} />
          <meshStandardMaterial color="#3a3d4a" metalness={0.85} roughness={0.35} />
        </mesh>

        {/* Palang Truss Horizontal Atas */}
        <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 10.8, 8]} />
          <meshStandardMaterial color="#4a4d5a" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[0, 3.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 10.8, 8]} />
          <meshStandardMaterial color="#3a3d4a" metalness={0.85} roughness={0.35} />
        </mesh>

        {/* Lampu Rigging Par Can Atas */}
        {[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((x, i) => (
          <group key={i} position={[x, 3.35, 0]}>
            <mesh rotation={[Math.PI / 6, 0, 0]}>
              <cylinderGeometry args={[0.16, 0.12, 0.35, 12]} />
              <meshStandardMaterial color="#222" metalness={0.9} />
            </mesh>
            <mesh position={[0, -0.16, 0.06]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshBasicMaterial
                color={
                  isConcertActive
                    ? i % 2 === 0
                      ? '#ff007f'
                      : '#00f0ff'
                    : i % 3 === 0
                    ? '#ffe600'
                    : '#a855f7'
                }
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── 5. SWEEPING LASER BEAMS ── */}
      <group ref={lasersRef} position={[0, 3.4, -1.6]}>
        {[-3.5, -1.8, 0, 1.8, 3.5].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, -2.2, 1.2]}
            rotation={[Math.PI / 3.8, 0, 0]}
          >
            <cylinderGeometry args={[0.015, 0.12, 6.2, 8]} />
            <meshBasicMaterial
              color={idx % 2 === 0 ? '#00f0ff' : '#ff007f'}
              transparent
              opacity={isConcertActive ? 0.35 : 0.12}
            />
          </mesh>
        ))}
      </group>

      {/* ── 6. CROWD GLOWSTICKS / LIGHTSTICKS IN THE FRONT ── */}
      <points ref={glowsticksRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={glowsticksData.positions.length / 3}
            array={glowsticksData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={glowsticksData.colors.length / 3}
            array={glowsticksData.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
