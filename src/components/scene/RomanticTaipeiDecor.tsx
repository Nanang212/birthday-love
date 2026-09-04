// ============================================================
// COMPONENT — RomanticTaipeiDecor (Three.js Romantic Taipei Ambiance)
// Menghadirkan nuansa malam romantis khas Taipei:
// 1. Lentera Langit Pingxi (Sky Lanterns) melayang lembut ke angkasa
// 2. Siluet Menara Ikonik Taipei 101 di kejauhan dengan lampu malam
// 3. Partikel cahaya romantis / kunang-kunang hangat di udara
// ============================================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── 1. Lentera Langit Pingxi (Pingxi Sky Lanterns) ──
interface LanternData {
  initialX: number;
  initialY: number;
  initialZ: number;
  speedY: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
  scale: number;
  color: string;
}

export function SkyLanterns() {
  const lanternsRef = useRef<THREE.Group>(null);

  const lanternColors = ['#ff9f43', '#f39c12', '#e67e22', '#ffbe76', '#ff7675', '#f8c291'];

  const lanterns = useMemo<LanternData[]>(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      initialX: -4.5 + Math.random() * 9.0,
      initialY: -2.0 + Math.random() * 5.5,
      initialZ: -1.0 - Math.random() * 4.0,
      speedY: 0.18 + Math.random() * 0.22,
      wobbleSpeed: 0.8 + Math.random() * 1.2,
      wobbleAmp: 0.12 + Math.random() * 0.18,
      phase: i * 0.7,
      scale: 0.55 + Math.random() * 0.45,
      color: lanternColors[i % lanternColors.length],
    }));
  }, []);

  useFrame((state, delta) => {
    if (!lanternsRef.current) return;
    const time = state.clock.getElapsedTime();

    lanternsRef.current.children.forEach((child, idx) => {
      const data = lanterns[idx];
      if (!data) return;

      // Naik ke atas perlahan
      child.position.y += data.speedY * delta;
      // Goyang lembut tertiup angin malam
      child.position.x = data.initialX + Math.sin(time * data.wobbleSpeed + data.phase) * data.wobbleAmp;
      child.rotation.z = Math.sin(time * 0.8 + data.phase) * 0.08;
      child.rotation.y = time * 0.2 + data.phase;

      // Wrap-around saat melewati atas layar
      if (child.position.y > 4.2) {
        child.position.y = -2.2;
        data.initialX = -4.5 + Math.random() * 9.0;
      }
    });
  });

  return (
    <group ref={lanternsRef}>
      {lanterns.map((l, i) => (
        <group key={i} position={[l.initialX, l.initialY, l.initialZ]} scale={[l.scale, l.scale, l.scale]}>
          {/* Badan Lentera (Silinder menggembung hangat) */}
          <mesh castShadow>
            <cylinderGeometry args={[0.13, 0.18, 0.38, 12]} />
            <meshStandardMaterial
              color={l.color}
              emissive={l.color}
              emissiveIntensity={0.85}
              roughness={0.4}
              transparent
              opacity={0.88}
            />
          </mesh>
          {/* Cahaya Api di Dalam Lentera */}
          <mesh position={[0, -0.1, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Titik Cahaya Hangat Lentera */}
          <pointLight color={l.color} intensity={0.45} distance={1.8} />
        </group>
      ))}
    </group>
  );
}

// ── 2. Siluet Elegan Menara Taipei 101 di Kejauhan ──
export function Taipei101Silhouette() {
  return (
    <group position={[4.0, -0.6, -5.5]} scale={[0.62, 0.62, 0.62]}>
      {/* Dasar Menara */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.8, 0.8]} />
        <meshStandardMaterial color="#1a1d2e" roughness={0.9} />
      </mesh>

      {/* 8 Segmen Bertingkat Khas Pagoda Modern Taipei 101 */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((tier) => (
        <group key={tier} position={[0, 0.65 + tier * 0.45, 0]}>
          <mesh>
            <cylinderGeometry args={[0.68, 0.52, 0.42, 4]} />
            <meshStandardMaterial
              color="#22263d"
              roughness={0.8}
            />
          </mesh>
          {/* Lampu strip neon per tingkat */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.72, 0.04, 0.72]} />
            <meshBasicMaterial color="#00cec9" />
          </mesh>
        </group>
      ))}

      {/* Puncak Menara & Jarum Antena Taipei 101 */}
      <mesh position={[0, 4.4, 0]}>
        <cylinderGeometry args={[0.2, 0.42, 0.5, 8]} />
        <meshStandardMaterial color="#2d3436" />
      </mesh>
      <mesh position={[0, 5.1, 0]}>
        <cylinderGeometry args={[0.03, 0.08, 0.9, 8]} />
        <meshStandardMaterial color="#dfe6e9" metalness={0.8} />
      </mesh>
      {/* Lampu Merah Kedip di Puncak Antena */}
      <mesh position={[0, 5.6, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff4757" />
      </mesh>
      <pointLight position={[0, 5.6, 0]} color="#ff4757" intensity={0.8} distance={2.5} />
    </group>
  );
}

// ── 3. Partikel Suasana Malam Romantis (Warm Romantic Bokeh) ──
export function RomanticBokeh() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 90;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = -2.0 + Math.random() * 5.0;
      pos[i * 3 + 2] = -2.5 + Math.random() * 4.0;
    }

    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;

    const count = 90;
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i);
      y += 0.003;
      if (y > 3.5) y = -2.0;
      posAttr.setY(i, y);

      let x = posAttr.getX(i);
      x += Math.sin(time * 0.5 + i) * 0.0015;
      posAttr.setX(i, x);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#ffccd5"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function RomanticTaipeiDecor() {
  return (
    <group>
      <SkyLanterns />
      <Taipei101Silhouette />
      <RomanticBokeh />
    </group>
  );
}
