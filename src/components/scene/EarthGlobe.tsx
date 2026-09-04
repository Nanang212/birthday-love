// ============================================================
// COMPONENT — EarthGlobe (Realistic & Beautiful Planet Earth)
// Menggantikan bola hijau aneh dengan planet Bumi yang sesungguhnya:
// - Peta benua & samudra beresolusi tinggi
// - Lapisan awan atmosferik 3D berputar
// - Glow atmosfer luar biru berpendar
// ============================================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural texture canvas untuk permukaan Bumi yang realistis
function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Samudra Biru Dalam
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0a2342');
  oceanGrad.addColorStop(0.5, '#124578');
  oceanGrad.addColorStop(1, '#081d38');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Arus samudra / kedalaman laut
  ctx.fillStyle = 'rgba(25, 95, 155, 0.35)';
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 120 + 40;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Benua-benua (Stylized Realistic Earth Continents)
  const drawContinent = (
    centerX: number,
    centerY: number,
    w: number,
    h: number,
    color: string,
    detail = 24
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < detail; i++) {
      const angle = (i / detail) * Math.PI * 2;
      const noise = 0.75 + Math.sin(i * 3.7) * 0.25 + Math.cos(i * 2.1) * 0.15;
      const x = centerX + Math.cos(angle) * (w * noise);
      const y = centerY + Math.sin(angle) * (h * noise);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  };

  const W = canvas.width;
  const H = canvas.height;

  // Warna daratan
  const GREEN_FOREST = '#2e7d32';
  const GREEN_LIGHT = '#388e3c';
  const EARTH_BROWN = '#8d6e63';
  const DESERT_GOLD = '#d4ac0d';

  // Eurasia (Eropa & Asia)
  drawContinent(W * 0.62, H * 0.32, 280, 160, GREEN_FOREST, 36);
  drawContinent(W * 0.68, H * 0.36, 220, 130, GREEN_LIGHT, 28);
  drawContinent(W * 0.58, H * 0.38, 140, 90, DESERT_GOLD, 24); // Timur Tengah

  // Afrika
  drawContinent(W * 0.52, H * 0.55, 130, 180, DESERT_GOLD, 30);
  drawContinent(W * 0.53, H * 0.62, 110, 140, GREEN_FOREST, 24); // Savanna/hutan Afrika

  // Asia Tenggara & Kepulauan Indonesia
  drawContinent(W * 0.78, H * 0.58, 120, 45, GREEN_LIGHT, 20);
  drawContinent(W * 0.82, H * 0.62, 90, 35, GREEN_FOREST, 18); // Indonesia / Nusantara

  // Australia
  drawContinent(W * 0.84, H * 0.75, 130, 95, DESERT_GOLD, 24);
  drawContinent(W * 0.86, H * 0.74, 100, 75, EARTH_BROWN, 20);

  // Amerika Utara
  drawContinent(W * 0.24, H * 0.32, 190, 150, GREEN_LIGHT, 32);
  drawContinent(W * 0.22, H * 0.28, 140, 100, GREEN_FOREST, 24);

  // Amerika Selatan
  drawContinent(W * 0.32, H * 0.68, 120, 190, GREEN_FOREST, 28);
  drawContinent(W * 0.30, H * 0.65, 80, 150, GREEN_LIGHT, 20); // Amazon basin

  // Kutub Es Utara & Selatan (Ice caps)
  ctx.fillStyle = '#e8f4f8';
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.05, W * 0.45, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.96, W * 0.48, 75, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural texture canvas untuk lapisan Awan (Clouds)
function createCloudsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gumpalan awan putih organik
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
    const rx = Math.random() * 80 + 30;
    const ry = Math.random() * 35 + 15;

    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Awan siklon/pusaran
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 50 + 20, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function EarthGlobe({
  radius = 1.15,
  position = [0, 0.2, 0],
}: {
  radius?: number;
  position?: [number, number, number];
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Buat tekstur sekali saja
  const earthTexture = useMemo(() => createEarthTexture(), []);
  const cloudsTexture = useMemo(() => createCloudsTexture(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Rotasi Bumi yang anggun
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.08;
    }
    // Awan berputar sedikit lebih cepat untuk parallax realistis
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.11;
    }
    // Floating lembut
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0.2, 0, 0.35]}>
      {/* 1. Permukaan Planet Bumi */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.45}
          metalness={0.1}
          emissive="#061c33"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 2. Lapisan Awan 3D Berputar */}
      <mesh ref={cloudsRef} scale={[1.025, 1.025, 1.025]}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Atmosfer Luar Glowing (Atmospheric Halo / Haze) */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#38b6ff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glow highlight atmosfer tipis di tepi */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#70d6ff"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
