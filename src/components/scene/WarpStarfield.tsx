// ============================================================
// COMPONENT — WarpStarfield (Cosmic Light-Speed Starfield)
// Terinspirasi dari CodePen referensi:
// - Ribuan partikel bintang terbang di ruang angkasa
// - Kecepatan dibuat tenang & lambat (slow & majestic)
// - Efek akselerasi halus saat mouse diklik / ditahan
// ============================================================

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WarpStarfieldProps {
  count?: number;
  baseSpeed?: number; // kecepatan lambat
}

export function WarpStarfield({ count = 12000, baseSpeed = 1.2 }: WarpStarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const currentSpeed = useRef(baseSpeed);

  // Deteksi mousedown / mouseup global seperti di Codepen
  useEffect(() => {
    const handleDown = () => setIsMouseDown(true);
    const handleUp = () => setIsMouseDown(false);

    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchstart', handleDown);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  // Inisialisasi posisi bintang menyebar di ruang luas
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorChoices = [
      new THREE.Color('#ffffff'), // Putih terang
      new THREE.Color('#e0f2fe'), // Cyan es
      new THREE.Color('#fef08a'), // Emas hangat
      new THREE.Color('#fed7aa'), // Peach lembut
      new THREE.Color('#93c5fd'), // Biru pastel
    ];

    for (let i = 0; i < count; i++) {
      // Menyebar di volume luas (X: -120 to 120, Y: -50 to 50, Z: -80 to 80)
      pos[i * 3]     = (Math.random() - 0.5) * 160;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 90;

      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    // Batasi delta
    const dt = Math.min(delta, 0.05);

    // Kecepatan lambat yang diminta ("agak slow ya speed bintangnya")
    // Saat klik ditahan, ada akselerasi sedikit lebih cepat
    const targetSpeed = isMouseDown ? baseSpeed * 2.8 : baseSpeed;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, dt * 3.5);

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    const moveStep = currentSpeed.current * dt * 8.0;

    for (let i = 0; i < count; i++) {
      // Partikel meluncur perlahan ke arah depan kamera (Z axis)
      array[i * 3 + 2] += moveStep;

      // Jika bintang sudah lewat di belakang kamera, wrap ke paling belakang
      if (array[i * 3 + 2] > 25) {
        array[i * 3 + 2] = -65;
        array[i * 3]     = (Math.random() - 0.5) * 160;
        array[i * 3 + 1] = (Math.random() - 0.5) * 70;
      }
    }

    posAttr.needsUpdate = true;

    // Rotasi pelan kosmik
    pointsRef.current.rotation.z += dt * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={0.88}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
