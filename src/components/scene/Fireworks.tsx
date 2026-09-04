// ============================================================
// COMPONENT — Fireworks (Three.js Festive Particle Firework Show)
// Kembang api meriah warna-warni yang langsung meletus saat masuk!
// ============================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FireworkParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  alpha: number;
  life: number;
  maxLife: number;
}

const PALETTE = [
  '#ff4757', // Ruby Red
  '#ffa502', // Golden Amber
  '#f1c40f', // Bright Gold
  '#2ed573', // Emerald Green
  '#00d2d3', // Turquoise / Cyan
  '#54a0ff', // Electric Blue
  '#ff6b81', // Rose Pink
  '#9b59b6', // Amethyst Purple
];

const MAX_PARTICLES = 2500;

// Tekstur radial glow bercahaya untuk partikel kembang api
function createSparkleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 240, 200, 0.9)');
    grad.addColorStop(0.5, 'rgba(255, 180, 80, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

interface FireworksProps {
  active?: boolean;
}

export function Fireworks({ active = true }: FireworksProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);

  // Pool partikel
  const particles = useRef<FireworkParticle[]>([]);
  // Timer jeda peluncuran berikutnya
  const nextLaunchTime = useRef(0);
  const hasTriggeredInitial = useRef(false);

  // Tekstur bulat bercahaya
  const sparkleMap = useMemo(() => createSparkleTexture(), []);

  // Buffer posisi dan warna
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const col = new Float32Array(MAX_PARTICLES * 3);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = -100; // Sembunyikan partikel tidur di luar layar
      pos[i * 3 + 2] = 0;

      col[i * 3] = 1;
      col[i * 3 + 1] = 1;
      col[i * 3 + 2] = 1;
    }

    return { positions: pos, colors: col };
  }, []);

  // Fungsi meletuskan kembang api di koordinat tertentu
  const explode = (pos: THREE.Vector3, colorHex: string, burstCount = 90) => {
    const baseColor = new THREE.Color(colorHex);

    // Kilatan cahaya sesaat di langit
    if (flashLightRef.current) {
      flashLightRef.current.position.set(pos.x, pos.y, pos.z + 0.6);
      flashLightRef.current.color = baseColor;
      flashLightRef.current.intensity = 4.0;
    }

    for (let i = 0; i < burstCount; i++) {
      if (particles.current.length >= MAX_PARTICLES) break;

      // Ledakan bola 3D (spherical dispersion)
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(Math.random() * 2 - 1);
      const speed = 1.4 + Math.random() * 3.2;

      const vel = new THREE.Vector3(
        speed * Math.sin(theta) * Math.cos(phi),
        speed * Math.sin(theta) * Math.sin(phi),
        speed * Math.cos(theta) * 0.4
      );

      const pColor = baseColor.clone();
      pColor.offsetHSL((Math.random() - 0.5) * 0.08, 0, (Math.random() - 0.5) * 0.15);

      particles.current.push({
        pos: pos.clone(),
        vel,
        color: pColor,
        alpha: 1.0,
        life: 0,
        maxLife: 1.1 + Math.random() * 0.9,
      });
    }
  };

  // Meletus saat active bernilai true
  useEffect(() => {
    if (!active || hasTriggeredInitial.current) return;
    hasTriggeredInitial.current = true;

    // Salvo awal seketika di berbagai titik di sekitar video
    explode(new THREE.Vector3(-3.2, 1.4, 0.5), '#ff4757', 120);
    explode(new THREE.Vector3(3.2, 1.5, 0.5), '#ffa502', 120);
    explode(new THREE.Vector3(-1.8, 2.2, 0.5), '#2ed573', 100);
    explode(new THREE.Vector3(1.8, 2.1, 0.5), '#54a0ff', 100);
    explode(new THREE.Vector3(0, 2.4, 0.5), '#f1c40f', 130);

    // Rentetan kedua sesaat setelahnya
    const t1 = setTimeout(() => {
      explode(new THREE.Vector3(-2.8, 1.8, 0.5), '#9b59b6', 100);
      explode(new THREE.Vector3(2.8, 1.9, 0.5), '#ff6b81', 100);
    }, 250);

    const t2 = setTimeout(() => {
      explode(new THREE.Vector3(-3.6, 1.2, 0.5), '#00d2d3', 110);
      explode(new THREE.Vector3(3.6, 1.3, 0.5), '#f1c40f', 110);
    }, 550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Peluncuran berkala kembang api baru hanya jika active
    if (active && time > nextLaunchTime.current) {
      // Pilih titik di kiri, kanan, atau atas video
      const side = Math.random();
      let x = 0;
      let y = 1.2 + Math.random() * 1.4;

      if (side < 0.42) {
        // Area kiri video
        x = -4.0 + Math.random() * 1.8;
      } else if (side < 0.84) {
        // Area kanan video
        x = 2.2 + Math.random() * 1.8;
      } else {
        // Area atas video
        x = -1.5 + Math.random() * 3.0;
        y = 2.0 + Math.random() * 0.8;
      }

      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      explode(new THREE.Vector3(x, y, (Math.random() - 0.5) * 1.0), color, 80 + Math.floor(Math.random() * 40));

      nextLaunchTime.current = time + 0.35 + Math.random() * 0.35;
    }

    // Redupkan kilatan cahaya
    if (flashLightRef.current && flashLightRef.current.intensity > 0) {
      flashLightRef.current.intensity = Math.max(0, flashLightRef.current.intensity - delta * 5);
    }

    // Update partikel ledakan
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        particles.current.splice(i, 1);
        continue;
      }

      // Gravitasi lembut & gesekan udara
      p.vel.y -= 1.8 * delta;
      p.vel.multiplyScalar(0.97);

      p.pos.addScaledVector(p.vel, delta);
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);
    }

    // Tulis ke Float32Array Three.js
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = geom.getAttribute('color') as THREE.BufferAttribute;

    const count = Math.min(particles.current.length, MAX_PARTICLES);

    for (let i = 0; i < count; i++) {
      const p = particles.current[i];
      positions[i * 3] = p.pos.x;
      positions[i * 3 + 1] = p.pos.y;
      positions[i * 3 + 2] = p.pos.z;

      // Efek kelap-kelip berkilau
      const twinkle = 0.85 + Math.sin(time * 20 + i) * 0.15;
      colors[i * 3] = p.color.r * p.alpha * twinkle;
      colors[i * 3 + 1] = p.color.g * p.alpha * twinkle;
      colors[i * 3 + 2] = p.color.b * p.alpha * twinkle;
    }

    // Sembunyikan sisa partikel yang tidak aktif
    for (let i = count; i < MAX_PARTICLES; i++) {
      positions[i * 3 + 1] = -100;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <>
      <pointLight ref={flashLightRef} intensity={0} distance={10} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          map={sparkleMap}
          size={0.42}
          vertexColors
          transparent
          opacity={1.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  );
}
