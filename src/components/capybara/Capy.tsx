// ============================================================
// COMPONENT — Capy (Cute Plushie Capybara Mascot in Three.js)
// Sesuai referensi gambar: gemoy, bulat, moncong cokelat khas,
// mata hitam berkilau, bisa berputar 360°, dan berjalan mengikuti klik mouse!
// ============================================================

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { CapyOutfit } from '../../data/capybara';

interface CapyProps {
  outfit?: CapyOutfit;
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
  isAnimating?: boolean; // dance di bollywood, walk dll
  targetPosition?: [number, number, number] | null; // target posisi berjalan jika diklik di scene
  speechBubble?: string | null; // Balon pesan nempel di atas kepala Capy
  onSpeechBubbleClick?: () => void;
}

// Color palette sesuai gambar referensi kapibara
const FUR_MAIN = '#e49a58';      // oranye madu kapibara hangat
const FUR_BELLY = '#f7deca';     // krem pastel lembut di perut
const SNOUT_COLOR = '#724b35';   // cokelat taupe khas moncong kapibara
const EYE_COLOR = '#140d08';     // hitam pekat mengkilap
const EYE_SHINE = '#ffffff';     // kilau mata
const NOSTRIL_COLOR = '#3a2015'; // celah hidung
const EAR_INNER = '#cf856b';     // bagian dalam telinga agak pinkish

export function Capy({
  outfit = 'normal',
  position = [0, 0, 0],
  scale = 0.6,
  onClick,
  isAnimating = false,
  targetPosition = null,
  speechBubble = null,
  onSpeechBubbleClick,
}: CapyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const leftFrontLegRef = useRef<THREE.Group>(null);
  const rightFrontLegRef = useRef<THREE.Group>(null);
  const leftBackLegRef = useRef<THREE.Group>(null);
  const rightBackLegRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);

  // Animasi spin 360° saat di-klik
  const spinRef = useRef<{ active: boolean; angle: number }>({
    active: false,
    angle: 0,
  });

  // Animasi lompat saat menekan Spacebar
  const jumpRef = useRef<{ active: boolean; time: number; duration: number }>({
    active: false,
    time: 0,
    duration: 0.55,
  });

  // Listener tombol Spacebar untuk lompat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        // Trigger lompatan jika belum sedang melompat
        if (!jumpRef.current.active) {
          jumpRef.current.active = true;
          jumpRef.current.time = 0;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Posisi aktual yang di-lerp secara halus menuju targetPosition
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const isWalking = useRef(false);
  const walkCycle = useRef(0);
  const legTransition = useRef(0); // 0 (idle) to 1 (walking)

  // Update target bila prop targetPosition berubah
  useEffect(() => {
    if (targetPosition) {
      targetPos.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    }
  }, [targetPosition]);

  // Handler klik pada Capy — Murni memutar 360° tanpa memicu dialog
  const handleCapyClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    // Trigger spin 360°
    spinRef.current = {
      active: true,
      angle: 0,
    };
    onClick?.();
  };

  useFrame((state, delta) => {
    if (!groupRef.current || !modelRef.current) return;

    // Batasi delta agar animasi tetap mulus jika ada frame drop
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    // 1. Logika Berjalan Menuju Target dengan Smooth Dampening
    const distToTarget = currentPos.current.distanceTo(targetPos.current);

    if (distToTarget > 0.04) {
      isWalking.current = true;
      legTransition.current = THREE.MathUtils.lerp(legTransition.current, 1, dt * 8);

      // Kecepatan dinamis: cepat saat jauh, mengerem lembut saat dekat
      const moveSpeed = Math.min(distToTarget * 2.8 + 0.6, 2.8);
      currentPos.current.lerp(targetPos.current, dt * moveSpeed);
      groupRef.current.position.copy(currentPos.current);

      // Rotasi terpendek (Shortest Angle Slerp) agar tidak berputar liar
      const dirX = targetPos.current.x - currentPos.current.x;
      const dirZ = targetPos.current.z - currentPos.current.z;
      const targetAngle = Math.atan2(dirX, dirZ);

      let diffAngle = targetAngle - groupRef.current.rotation.y;
      while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
      while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

      groupRef.current.rotation.y += diffAngle * Math.min(dt * 9.0, 1.0);

      // Animasi langkah kaki berkaki empat (Quadruped Gait)
      walkCycle.current += dt * 9.5;
      const cycle = walkCycle.current;

      // Pasangan kaki diagonal (kiri depan + kanan belakang, vs kanan depan + kiri belakang)
      const swing1 = Math.sin(cycle) * 0.55 * legTransition.current;
      const lift1 = Math.max(0, Math.cos(cycle)) * 0.04 * legTransition.current;

      const swing2 = Math.sin(cycle + Math.PI) * 0.55 * legTransition.current;
      const lift2 = Math.max(0, Math.cos(cycle + Math.PI)) * 0.04 * legTransition.current;

      if (leftFrontLegRef.current) {
        leftFrontLegRef.current.rotation.x = swing1;
        leftFrontLegRef.current.position.y = 0.12 + lift1;
      }
      if (rightBackLegRef.current) {
        rightBackLegRef.current.rotation.x = swing1 * 0.85;
        rightBackLegRef.current.position.y = 0.14 + lift1;
      }
      if (rightFrontLegRef.current) {
        rightFrontLegRef.current.rotation.x = swing2;
        rightFrontLegRef.current.position.y = 0.12 + lift2;
      }
      if (leftBackLegRef.current) {
        leftBackLegRef.current.rotation.x = swing2 * 0.85;
        leftBackLegRef.current.position.y = 0.14 + lift2;
      }

      // Goyang pinggul/waddle lembut saat melangkah
      modelRef.current.rotation.z = Math.sin(cycle) * 0.06 * legTransition.current;
      modelRef.current.position.y = Math.abs(Math.sin(cycle * 2)) * 0.035 * legTransition.current;
    } else {
      isWalking.current = false;
      legTransition.current = THREE.MathUtils.lerp(legTransition.current, 0, dt * 6);

      // Kembalikan kaki ke pose netral secara lembut
      if (leftFrontLegRef.current) {
        leftFrontLegRef.current.rotation.x = THREE.MathUtils.lerp(leftFrontLegRef.current.rotation.x, 0, dt * 10);
        leftFrontLegRef.current.position.y = THREE.MathUtils.lerp(leftFrontLegRef.current.position.y, 0.12, dt * 10);
      }
      if (rightFrontLegRef.current) {
        rightFrontLegRef.current.rotation.x = THREE.MathUtils.lerp(rightFrontLegRef.current.rotation.x, 0, dt * 10);
        rightFrontLegRef.current.position.y = THREE.MathUtils.lerp(rightFrontLegRef.current.position.y, 0.12, dt * 10);
      }
      if (leftBackLegRef.current) {
        leftBackLegRef.current.rotation.x = THREE.MathUtils.lerp(leftBackLegRef.current.rotation.x, 0, dt * 10);
        leftBackLegRef.current.position.y = THREE.MathUtils.lerp(leftBackLegRef.current.position.y, 0.14, dt * 10);
      }
      if (rightBackLegRef.current) {
        rightBackLegRef.current.rotation.x = THREE.MathUtils.lerp(rightBackLegRef.current.rotation.x, 0, dt * 10);
        rightBackLegRef.current.position.y = THREE.MathUtils.lerp(rightBackLegRef.current.position.y, 0.14, dt * 10);
      }

      // Bernapas santai (idle breathing)
      modelRef.current.rotation.z = Math.sin(time * 1.5) * 0.015;
      modelRef.current.position.y = Math.sin(time * 2) * 0.02;
    }

    // 2. Animasi Spin 360° saat di-klik (Buttery Smooth 360 Spin)
    if (spinRef.current.active) {
      const spinSpeed = 9.0;
      spinRef.current.angle += dt * spinSpeed;
      groupRef.current.rotation.y += dt * spinSpeed;

      // Lompat kecil lucu saat berputar
      const hopProgress = spinRef.current.angle / (Math.PI * 2);
      const hop = Math.sin(hopProgress * Math.PI) * 0.22;
      modelRef.current.position.y += hop;

      if (spinRef.current.angle >= Math.PI * 2) {
        spinRef.current.active = false;
      }
    }

    // 2b. Animasi Lompat saat tombol Spasi ditekan (Spacebar Jump)
    if (jumpRef.current.active) {
      jumpRef.current.time += dt;
      const jumpProgress = jumpRef.current.time / jumpRef.current.duration;

      if (jumpProgress <= 1.0) {
        // Kurva lonjakan melambung tinggi & mulus
        const jumpHeight = Math.sin(jumpProgress * Math.PI) * 0.75;
        modelRef.current.position.y += jumpHeight;

        // Kaki sedikit menekuk lucu saat di udara
        const airTuck = Math.sin(jumpProgress * Math.PI) * 0.4;
        if (leftFrontLegRef.current) leftFrontLegRef.current.rotation.x = airTuck;
        if (rightFrontLegRef.current) rightFrontLegRef.current.rotation.x = airTuck;
        if (leftBackLegRef.current) leftBackLegRef.current.rotation.x = -airTuck;
        if (rightBackLegRef.current) rightBackLegRef.current.rotation.x = -airTuck;
      } else {
        jumpRef.current.active = false;
      }
    }

    // 3. Dance Animation (Bollywood & Concert Goyang NDX A.K.A)
    if (isAnimating && !isWalking.current && !spinRef.current.active) {
      if (outfit === 'bollywood') {
        modelRef.current.rotation.y = Math.sin(time * 5) * 0.35;
        modelRef.current.position.y = Math.abs(Math.sin(time * 6)) * 0.08;
        modelRef.current.rotation.z = Math.sin(time * 4) * 0.1;
      } else {
        // Konser NDX A.K.A — Goyang & Melompat Berirama Heboh
        const concertBpm = 8.8;
        const jumpY = Math.abs(Math.sin(time * concertBpm)) * 0.32;
        modelRef.current.position.y = jumpY;
        modelRef.current.rotation.z = Math.sin(time * (concertBpm * 0.5)) * 0.15;
        modelRef.current.rotation.y = Math.sin(time * (concertBpm * 0.5)) * 0.20;

        // Kaki melangkah berirama di tempat
        const legSwing = Math.sin(time * concertBpm) * 0.35;
        if (leftFrontLegRef.current) leftFrontLegRef.current.rotation.x = legSwing;
        if (rightFrontLegRef.current) rightFrontLegRef.current.rotation.x = -legSwing;
        if (leftBackLegRef.current) leftBackLegRef.current.rotation.x = -legSwing;
        if (rightBackLegRef.current) rightBackLegRef.current.rotation.x = legSwing;
      }
    }

    // 4. Hover Scale Effect
    const targetScale = hovered ? scale * 1.08 : scale;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), dt * 10);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={handleCapyClick}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <group ref={modelRef}>
        {/* ── Balon Pesan Mungil & Imut Nempel di Atas Kepala Kapibara ── */}
        {speechBubble && (
          <Html position={[0, 1.25, 0.1]} center distanceFactor={3.6}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSpeechBubbleClick?.();
              }}
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(238, 82, 83, 0.98), rgba(255, 159, 67, 0.98))',
                border: '2px solid rgba(254, 202, 87, 0.95)',
                borderRadius: '9999px',
                padding: '0.45rem 1.15rem',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 25px rgba(238, 82, 83, 0.65), 0 0 20px rgba(254, 202, 87, 0.5)',
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
                pointerEvents: 'auto',
                animation: 'bounceSlow 2s infinite',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
              title="Klik untuk lanjut ke Rumah Kedua"
            >
              <span>🚪</span>
              <span>{speechBubble}</span>
              <span>↙</span>
              {/* Ekor Balon Chat Menunjuk ke Kepala Capy */}
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
                  borderTop: '6px solid rgba(254, 202, 87, 0.95)',
                }}
              />
            </div>
          </Html>
        )}

        {/* ── 1. Tubuh Utama (Bulat Gemoy Chonky) ── */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color={FUR_MAIN} roughness={0.75} metalness={0.05} />
        </mesh>

        {/* Dada & Perut Krem Lembut ── */}
        <mesh position={[0, 0.35, 0.32]} scale={[0.82, 0.9, 0.5]}>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial color={FUR_BELLY} roughness={0.85} metalness={0.0} />
        </mesh>

        {/* ── 2. Bagian Kepala & Moncong Ikonik (Snout) ── */}
        {/* Kepala atas */}
        <mesh position={[0, 0.65, 0.28]} scale={[0.9, 0.95, 1.05]} castShadow>
          <sphereGeometry args={[0.42, 28, 28]} />
          <meshStandardMaterial color={FUR_MAIN} roughness={0.75} />
        </mesh>

        {/* Moncong Besar Bulat Khas Kapibara (Cokelat Taupe seperti di gambar) */}
        <mesh position={[0, 0.58, 0.58]} scale={[0.95, 1.05, 1.15]} castShadow>
          <sphereGeometry args={[0.34, 24, 24]} />
          <meshStandardMaterial color={SNOUT_COLOR} roughness={0.8} />
        </mesh>

        {/* Garis Mulut Vertikal (Khas bibir kapibara) */}
        <mesh position={[0, 0.44, 0.86]} scale={[1, 1, 1]}>
          <boxGeometry args={[0.02, 0.12, 0.02]} />
          <meshBasicMaterial color="#22120b" />
        </mesh>

        {/* Garis Senyum Bawah Horizontal */}
        <mesh position={[0, 0.38, 0.84]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.16, 0.018, 0.02]} />
          <meshBasicMaterial color="#22120b" />
        </mesh>

        {/* Lubang Hidung Kiri & Kanan (Nostrils miring imut) */}
        <mesh position={[-0.08, 0.62, 0.85]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.04, 0.015, 0.02]} />
          <meshBasicMaterial color={NOSTRIL_COLOR} />
        </mesh>
        <mesh position={[0.08, 0.62, 0.85]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.04, 0.015, 0.02]} />
          <meshBasicMaterial color={NOSTRIL_COLOR} />
        </mesh>

        {/* ── 3. Mata Bulat Hitam Besar (Shiny Eyes) ── */}
        {/* Mata Kiri */}
        <group position={[-0.28, 0.72, 0.44]}>
          <mesh rotation={[0, -0.4, 0]}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color={EYE_COLOR} roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Highlight putih berkilau */}
          <mesh position={[-0.02, 0.025, 0.05]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color={EYE_SHINE} />
          </mesh>
        </group>

        {/* Mata Kanan */}
        <group position={[0.28, 0.72, 0.44]}>
          <mesh rotation={[0, 0.4, 0]}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color={EYE_COLOR} roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Highlight putih berkilau */}
          <mesh position={[0.02, 0.025, 0.05]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color={EYE_SHINE} />
          </mesh>
        </group>

        {/* ── 4. Telinga Kecil Mungil Membulat ── */}
        {/* Telinga Kiri */}
        <group position={[-0.32, 0.95, 0.12]} rotation={[0.2, -0.3, -0.4]}>
          <mesh>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={SNOUT_COLOR} roughness={0.8} />
          </mesh>
          {/* Bagian dalam telinga */}
          <mesh position={[0, 0, 0.03]} scale={[0.65, 0.65, 0.3]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color={EAR_INNER} roughness={0.9} />
          </mesh>
        </group>

        {/* Telinga Kanan */}
        <group position={[0.32, 0.95, 0.12]} rotation={[0.2, 0.3, 0.4]}>
          <mesh>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={SNOUT_COLOR} roughness={0.8} />
          </mesh>
          {/* Bagian dalam telinga */}
          <mesh position={[0, 0, 0.03]} scale={[0.65, 0.65, 0.3]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color={EAR_INNER} roughness={0.9} />
          </mesh>
        </group>

        {/* ── 5. Kaki Pendek Mungil Gemoy ── */}
        {/* Kaki Depan Kiri */}
        <group ref={leftFrontLegRef} position={[-0.22, 0.12, 0.28]}>
          <mesh position={[0, -0.06, 0]}>
            <capsuleGeometry args={[0.075, 0.12, 8, 8]} />
            <meshStandardMaterial color={SNOUT_COLOR} roughness={0.85} />
          </mesh>
          {/* Jari kaki kecil */}
          <mesh position={[0, -0.12, 0.03]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={SNOUT_COLOR} roughness={0.85} />
          </mesh>
        </group>

        {/* Kaki Depan Kanan */}
        <group ref={rightFrontLegRef} position={[0.22, 0.12, 0.28]}>
          <mesh position={[0, -0.06, 0]}>
            <capsuleGeometry args={[0.075, 0.12, 8, 8]} />
            <meshStandardMaterial color={SNOUT_COLOR} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.12, 0.03]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={SNOUT_COLOR} roughness={0.85} />
          </mesh>
        </group>

        {/* Kaki Belakang Kiri */}
        <group ref={leftBackLegRef} position={[-0.26, 0.14, -0.22]}>
          <mesh position={[0, -0.06, 0]}>
            <capsuleGeometry args={[0.09, 0.12, 8, 8]} />
            <meshStandardMaterial color={FUR_MAIN} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.12, 0.04]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color={SNOUT_COLOR} roughness={0.85} />
          </mesh>
        </group>

        {/* Kaki Belakang Kanan */}
        <group ref={rightBackLegRef} position={[0.26, 0.14, -0.22]}>
          <mesh position={[0, -0.06, 0]}>
            <capsuleGeometry args={[0.09, 0.12, 8, 8]} />
            <meshStandardMaterial color={FUR_MAIN} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.12, 0.04]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color={SNOUT_COLOR} roughness={0.85} />
          </mesh>
        </group>

        {/* Ekor Mungil */}
        <mesh position={[0, 0.32, -0.52]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={FUR_MAIN} roughness={0.85} />
        </mesh>

        {/* ── 6. Aksesori Khas Per World ── */}
        {outfit === 'backpack' && <BackpackAccessory />}
        {outfit === 'camera' && <CameraAccessory />}
        {outfit === 'bollywood' && <BollywoodAccessory />}
        {outfit === 'cake' && <CakeAccessory />}
      </group>
    </group>
  );
}

/* ── Aksesori ── */

function BackpackAccessory() {
  return (
    <group position={[0, 0.52, -0.42]}>
      {/* Tas ransel merah imut */}
      <mesh castShadow>
        <capsuleGeometry args={[0.16, 0.22, 8, 8]} />
        <meshStandardMaterial color="#d63031" roughness={0.6} />
      </mesh>
      {/* Kantong depan */}
      <mesh position={[0, -0.04, -0.12]}>
        <boxGeometry args={[0.18, 0.14, 0.08]} />
        <meshStandardMaterial color="#e17055" roughness={0.7} />
      </mesh>
      {/* Tali ransel */}
      <mesh position={[-0.14, 0.08, 0.18]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.03, 0.35, 0.02]} />
        <meshStandardMaterial color="#2d3436" />
      </mesh>
      <mesh position={[0.14, 0.08, 0.18]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.03, 0.35, 0.02]} />
        <meshStandardMaterial color="#2d3436" />
      </mesh>
    </group>
  );
}

function CameraAccessory() {
  return (
    <group position={[0, 0.32, 0.52]}>
      {/* Tali gantungan */}
      <mesh position={[0, 0.22, -0.1]} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.22, 0.012, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#636e72" />
      </mesh>
      {/* Bodi kamera */}
      <mesh castShadow>
        <boxGeometry args={[0.18, 0.13, 0.1]} />
        <meshStandardMaterial color="#2d3436" roughness={0.4} />
      </mesh>
      {/* Aksen strip perak/kayu */}
      <mesh position={[0, 0.03, 0.052]}>
        <boxGeometry args={[0.18, 0.04, 0.01]} />
        <meshStandardMaterial color="#b2bec3" metalness={0.6} />
      </mesh>
      {/* Lensa kamera */}
      <mesh position={[0, -0.01, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.06, 16]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Kilau lensa kaca */}
      <mesh position={[0, -0.01, 0.102]}>
        <circleGeometry args={[0.035, 16]} />
        <meshBasicMaterial color="#74b9ff" />
      </mesh>
    </group>
  );
}

function BollywoodAccessory() {
  return (
    <group position={[0, 0.98, 0.26]}>
      {/* Mahkota Emas Berkilau khas Bollywood */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.08, 16]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Hiasan mahkota */}
      {[-0.1, -0.04, 0.04, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0.08]}>
          <coneGeometry args={[0.025, 0.08, 8]} />
          <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Permata merah di tengah mahkota */}
      <mesh position={[0, 0.02, 0.14]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#e74c3c" emissive="#c0392b" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function CakeAccessory() {
  return (
    <group position={[0.42, 0.15, 0.35]}>
      {/* Piring kue */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.02, 16]} />
        <meshStandardMaterial color="#dfe6e9" metalness={0.3} />
      </mesh>
      {/* Roti kue bertingkat */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.1, 16]} />
        <meshStandardMaterial color="#ffeaa7" roughness={0.9} />
      </mesh>
      {/* Krim strawberry pink di atas */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.135, 0.135, 0.03, 16]} />
        <meshStandardMaterial color="#fd79a8" roughness={0.5} />
      </mesh>
      {/* Lilin ultah */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.09, 8]} />
        <meshStandardMaterial color="#00cec9" />
      </mesh>
      {/* Nyala api lilin berkedip */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ff9f43" emissive="#ff793f" emissiveIntensity={2.5} />
      </mesh>
      {/* Cahaya hangat dari lilin */}
      <pointLight position={[0, 0.28, 0]} intensity={1.5} color="#ff9f43" distance={1.5} />
    </group>
  );
}
