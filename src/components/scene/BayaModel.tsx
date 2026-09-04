// ============================================================
// COMPONENT — BayaModel (Chibi Kawaii 3D Mascot — Buaya Baya)
// Model 3D Procedural Three.js Kawaii Chibi Baya
// Dibuat persis 100% mengikuti ilustrasi Baya_Character Three.js:
// - Bodi gemoy bulat & pipi tembem dengan rona pipi pink (blush)
// - Mata anime/chibi BESAR berbinar dengan kilau ganda & pantulan cahaya
// - Moncong bulat tersenyum manis dengan gigi taring putih kecil lucu
// - Perut & rahang bawah warna krem lembut (pale cream yellow) dengan segmen garis
// - Sisik/duri punggung bulat tumpul hijau lumut di kepala hingga ekor
// - Kaki gemoy dengan bantalan telapak krem & 3 kuku putih imut
// - Tangan memegang kubus Three.js bercahaya / melambai ramah
// - Putaran 360° saat diklik dengan proteksi stopPropagation!
// ============================================================

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Palet Warna Akurat Ilustrasi Kawaii Baya
const BAYA_BODY_GREEN = '#7cb356';     // Hijau cerah lembut kawaii
const BAYA_DARK_GREEN = '#487a2d';     // Duri/sisik bulat punggung
const BAYA_CREAM_BELLY = '#f5e5ba';    // Perut & rahang bawah krem lembut
const BAYA_BELLY_LINE = '#deb87c';     // Garis segmen perut
const BAYA_CHEEK_BLUSH = '#ff8282';    // Pipi merona (blush)
const BAYA_EYE_DARK = '#1a1016';       // Pupil mata hitam pekat
const BAYA_EYE_RIM = '#3d2015';        // Lingkar mata hangat
const BAYA_MOUTH_LINE = '#2c4d1d';     // Garis senyum ramah
const BAYA_CLAW_WHITE = '#ffffff';     // Kuku/cakar putih bersih

interface BayaModelProps {
  isWalking?: boolean;
  isSpeaking?: boolean;
  scale?: number;
  facingRight?: boolean;
  onClick?: () => void;
}

export function BayaModel({
  isWalking = false,
  isSpeaking = false,
  scale = 0.52,
  facingRight = false,
  onClick,
}: BayaModelProps) {
  const modelGroupRef = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);

  // Animasi Putaran 360° saat diklik
  const spinRef = useRef<{ active: boolean; angle: number }>({
    active: false,
    angle: 0,
  });

  const handleClick = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    spinRef.current = { active: true, angle: 0 };
    onClick?.();
  };

  useFrame((state, delta) => {
    if (!modelGroupRef.current) return;
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    // 1. Orientasi Menghadap Kiri/Kanan
    const baseTargetAngle = facingRight ? 0.45 : -0.45;

    // Putaran kubus ikonik Three.js di telapak tangan Baya
    if (cubeRef.current) {
      cubeRef.current.rotation.x = time * 1.5;
      cubeRef.current.rotation.y = time * 2.0;
      cubeRef.current.position.y = 0.28 + Math.sin(time * 3.5) * 0.03;
    }

    // 2. Animasi Putar 360° jika diklik
    if (spinRef.current.active) {
      spinRef.current.angle += dt * 14;
      modelGroupRef.current.rotation.y = baseTargetAngle + spinRef.current.angle;
      modelGroupRef.current.position.y = Math.sin(spinRef.current.angle * 0.5) * 0.35;

      if (spinRef.current.angle >= Math.PI * 2) {
        spinRef.current.active = false;
        modelGroupRef.current.rotation.y = baseTargetAngle;
        modelGroupRef.current.position.y = 0;
      }
    } else {
      modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        modelGroupRef.current.rotation.y,
        baseTargetAngle,
        dt * 8
      );

      if (isWalking) {
        // Melangkah berjalan gemoy (Chibi Waddle Hop)
        const walkCycle = time * 8.5;
        const hop = Math.abs(Math.sin(walkCycle)) * 0.12;
        modelGroupRef.current.position.y = hop;
        modelGroupRef.current.rotation.z = Math.sin(walkCycle) * 0.08;

        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(walkCycle) * 0.05;
        }
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.5;
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.5;
        }
        if (tailRef.current) {
          tailRef.current.rotation.y = Math.sin(walkCycle) * 0.45;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -Math.sin(walkCycle) * 0.35;
        }
      } else if (isSpeaking) {
        // Animasi saat berbicara ramah
        modelGroupRef.current.position.y = Math.sin(time * 6.5) * 0.035;
        modelGroupRef.current.rotation.z = Math.sin(time * 4.5) * 0.025;

        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(time * 4.0) * 0.12;
          headRef.current.rotation.x = Math.sin(time * 8.0) * 0.06;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -0.2 + Math.sin(time * 7.5) * 0.15;
        }
        if (tailRef.current) {
          tailRef.current.rotation.y = Math.sin(time * 3.5) * 0.2;
        }
      } else {
        // Idle bernapas santai
        modelGroupRef.current.position.y = Math.sin(time * 2.0) * 0.02;
        modelGroupRef.current.rotation.z = Math.sin(time * 1.6) * 0.015;

        if (headRef.current) {
          headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, dt * 6);
          headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, dt * 6);
        }
        if (tailRef.current) {
          tailRef.current.rotation.y = Math.sin(time * 2.2) * 0.14;
        }
      }
    }
  });

  return (
    <group
      scale={[scale, scale, scale]}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={handleClick}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <group ref={modelGroupRef}>
        {/* ======================================================== */}
        {/* 1. BADAN & PERUT BULAT GEMOY (Chubby Chibi Body)         */}
        {/* ======================================================== */}
        {/* Torso Bawah Bervolume (Belly Foundation) */}
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} metalness={0.05} />
        </mesh>

        {/* Torso Atas Menuju Leher */}
        <mesh position={[0, 0.65, -0.02]} scale={[0.92, 0.88, 0.88]} castShadow>
          <sphereGeometry args={[0.56, 32, 32]} />
          <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} metalness={0.05} />
        </mesh>

        {/* Perut Krem Lembut (Pale Cream Segmented Belly) */}
        <mesh position={[0, 0.42, 0.24]} scale={[0.82, 1.05, 0.68]}>
          <sphereGeometry args={[0.54, 28, 28]} />
          <meshStandardMaterial color={BAYA_CREAM_BELLY} roughness={0.5} />
        </mesh>

        {/* Garis-garis Segmen Horizontal Perut Buaya yang Rapi */}
        {[-0.04, 0.10, 0.24, 0.38].map((y, i) => (
          <mesh key={`belly-scute-${i}`} position={[0, y, 0.52]}>
            <capsuleGeometry args={[0.014, 0.38 - Math.abs(y - 0.17) * 0.35, 6, 12]} />
            <meshStandardMaterial color={BAYA_BELLY_LINE} roughness={0.6} />
          </mesh>
        ))}

        {/* ======================================================== */}
        {/* 2. KEPALA & WAJAH CHIBI SUPER IMUT (Cute Chibi Head)     */}
        {/* ======================================================== */}
        <group ref={headRef} position={[0, 1.02, 0.08]}>
          {/* Batok Kepala Bulat Hijau */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.58, 32, 32]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.52} />
          </mesh>

          {/* Pipi Tembem Kiri & Kanan (Chubby Cheeks) */}
          <mesh position={[-0.34, -0.12, 0.22]} scale={[1, 0.85, 0.9]}>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.52} />
          </mesh>
          <mesh position={[0.34, -0.12, 0.22]} scale={[1, 0.85, 0.9]}>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.52} />
          </mesh>

          {/* Rona Pipi Pink Merona Imut (Cute Cheek Blush) */}
          <mesh position={[-0.42, -0.06, 0.38]} rotation={[0, -0.4, 0]} scale={[1.3, 0.75, 0.3]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshBasicMaterial color={BAYA_CHEEK_BLUSH} />
          </mesh>
          <mesh position={[0.42, -0.06, 0.38]} rotation={[0, 0.4, 0]} scale={[1.3, 0.75, 0.3]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshBasicMaterial color={BAYA_CHEEK_BLUSH} />
          </mesh>

          {/* ======================================================== */}
          {/* 3. MONCONG & SENYUM BUAYA RAMAH (Alligator Snout & Smile) */}
          {/* ======================================================== */}
          {/* Moncong Atas Hijau yang Melengkung Manis ke Depan */}
          <mesh position={[0, -0.06, 0.42]} scale={[1.15, 0.68, 1.15]} castShadow>
            <sphereGeometry args={[0.36, 28, 28]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.52} />
          </mesh>

          {/* Ujung Hidung Bulat Mancung */}
          <mesh position={[0, -0.02, 0.74]} scale={[1.18, 0.78, 0.7]}>
            <sphereGeometry args={[0.20, 24, 24]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.52} />
          </mesh>

          {/* Lubang Hidung Buaya Bulat Imut Kiri & Kanan */}
          <mesh position={[-0.10, 0.08, 0.82]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color={BAYA_DARK_GREEN} roughness={0.8} />
          </mesh>
          <mesh position={[0.10, 0.08, 0.82]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color={BAYA_DARK_GREEN} roughness={0.8} />
          </mesh>

          {/* Rahang Bawah Warna Krem Lembut (Pale Cream Under-Jaw) */}
          <mesh position={[0, -0.22, 0.38]} scale={[1.08, 0.52, 1.05]}>
            <sphereGeometry args={[0.30, 24, 24]} />
            <meshStandardMaterial color={BAYA_CREAM_BELLY} roughness={0.5} />
          </mesh>

          {/* Garis Senyum Buaya Manis */}
          <mesh position={[0, -0.14, 0.62]} rotation={[0.08, 0, 0]}>
            <torusGeometry args={[0.18, 0.015, 8, 24, Math.PI * 0.85]} />
            <meshBasicMaterial color={BAYA_MOUTH_LINE} />
          </mesh>

          {/* Gigi Taring Kartun Putih Kecil Lucu yang Muncul di Bibir */}
          {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
            <mesh key={`baya-tooth-${i}`} position={[x, -0.12, 0.68 - Math.abs(x) * 0.25]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.024, 0.045, 8]} />
              <meshStandardMaterial color={BAYA_CLAW_WHITE} roughness={0.25} />
            </mesh>
          ))}

          {/* ======================================================== */}
          {/* 4. MATA ANIME/CHIBI BESAR BERBINAR (Sangat Persis Foto)  */}
          {/* ======================================================== */}
          {/* MATA KIRI */}
          <group position={[-0.24, 0.18, 0.44]} rotation={[0.04, -0.18, 0.06]}>
            {/* Lingkar Iris Mata Cokelat Hangat di Tepi Luar */}
            <mesh scale={[0.88, 1.15, 0.4]}>
              <sphereGeometry args={[0.19, 24, 24]} />
              <meshStandardMaterial color={BAYA_EYE_RIM} roughness={0.2} />
            </mesh>
            {/* Pupil Hitam Pekat Mengkilap */}
            <mesh position={[0.01, 0, 0.04]} scale={[0.86, 1.12, 0.35]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshStandardMaterial color={BAYA_EYE_DARK} roughness={0.1} />
            </mesh>
            {/* Kilau Bintang Putih Utama (Besar di Kiri Atas) */}
            <mesh position={[-0.045, 0.07, 0.12]}>
              <sphereGeometry args={[0.056, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Kilau Bintang Putih Sekunder (Sedang di Kanan Bawah) */}
            <mesh position={[0.042, -0.05, 0.11]}>
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Kilau Titik Imut Ketiga */}
            <mesh position={[-0.02, -0.065, 0.11]}>
              <sphereGeometry args={[0.018, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Alis Tipis Ceria di Atas Mata */}
            <mesh position={[0.01, 0.22, 0.02]} rotation={[0, 0, 0.22]}>
              <capsuleGeometry args={[0.02, 0.16, 4, 8]} />
              <meshBasicMaterial color={BAYA_DARK_GREEN} />
            </mesh>
          </group>

          {/* MATA KANAN */}
          <group position={[0.24, 0.18, 0.44]} rotation={[0.04, 0.18, -0.06]}>
            {/* Lingkar Iris Mata Cokelat Hangat */}
            <mesh scale={[0.88, 1.15, 0.4]}>
              <sphereGeometry args={[0.19, 24, 24]} />
              <meshStandardMaterial color={BAYA_EYE_RIM} roughness={0.2} />
            </mesh>
            {/* Pupil Hitam Pekat Mengkilap */}
            <mesh position={[-0.01, 0, 0.04]} scale={[0.86, 1.12, 0.35]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshStandardMaterial color={BAYA_EYE_DARK} roughness={0.1} />
            </mesh>
            {/* Kilau Bintang Putih Utama (Besar di Kiri Atas) */}
            <mesh position={[-0.045, 0.07, 0.12]}>
              <sphereGeometry args={[0.056, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Kilau Bintang Putih Sekunder */}
            <mesh position={[0.042, -0.05, 0.11]}>
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Kilau Titik Imut Ketiga */}
            <mesh position={[-0.02, -0.065, 0.11]}>
              <sphereGeometry args={[0.018, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Alis Tipis Ceria di Atas Mata */}
            <mesh position={[-0.01, 0.22, 0.02]} rotation={[0, 0, -0.22]}>
              <capsuleGeometry args={[0.02, 0.16, 4, 8]} />
              <meshBasicMaterial color={BAYA_DARK_GREEN} />
            </mesh>
          </group>

          {/* Sisik/Duri Bulat Manis di Belakang Kepala */}
          {[
            { pos: [0, 0.54, -0.15], s: 0.14 },
            { pos: [0, 0.42, -0.36], s: 0.15 },
            { pos: [0, 0.20, -0.48], s: 0.16 },
          ].map((sc, i) => (
            <mesh key={`head-scute-${i}`} position={sc.pos as [number, number, number]} scale={[sc.s * 0.8, sc.s, sc.s * 1.1]}>
              <sphereGeometry args={[0.42, 16, 16]} />
              <meshStandardMaterial color={BAYA_DARK_GREEN} roughness={0.65} />
            </mesh>
          ))}
        </group>

        {/* ======================================================== */}
        {/* 5. DURI/SISIK BULAT DI PUNGGUNG (Smooth Dorsal Scutes)   */}
        {/* ======================================================== */}
        {[
          { pos: [0, 0.88, -0.34], s: 0.16 },
          { pos: [0, 0.68, -0.48], s: 0.18 },
          { pos: [0, 0.46, -0.56], s: 0.19 },
          { pos: [0, 0.24, -0.58], s: 0.18 },
          { pos: [0, 0.04, -0.56], s: 0.16 },
        ].map((scute, idx) => (
          <mesh
            key={`back-scute-${idx}`}
            position={scute.pos as [number, number, number]}
            scale={[scute.s * 0.75, scute.s, scute.s * 1.1]}
            castShadow
          >
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshStandardMaterial color={BAYA_DARK_GREEN} roughness={0.65} />
          </mesh>
        ))}

        {/* ======================================================== */}
        {/* 6. LENGAN & TELAPAK TANGAN CHIBI                         */}
        {/* ======================================================== */}
        {/* Lengan Kiri (Sedikit Maju Ramah) */}
        <group ref={leftArmRef} position={[-0.45, 0.48, 0.14]}>
          <mesh position={[-0.10, -0.14, 0.08]} rotation={[0.4, 0, 0.3]} castShadow>
            <capsuleGeometry args={[0.12, 0.24, 8, 12]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>
          {/* Telapak Tangan Bulat */}
          <mesh position={[-0.18, -0.26, 0.18]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>
          {/* 3 Kuku Putih Bulat Imut */}
          {[-0.035, 0, 0.035].map((ox, i) => (
            <mesh key={`claw-l-${i}`} position={[-0.18 + ox, -0.34, 0.22]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial color={BAYA_CLAW_WHITE} roughness={0.25} />
            </mesh>
          ))}
        </group>

        {/* Lengan Kanan (Menopang Kubus Ikonik Three.js Baya) */}
        <group ref={rightArmRef} position={[0.45, 0.48, 0.14]}>
          <mesh position={[0.10, -0.14, 0.08]} rotation={[0.4, 0, -0.3]} castShadow>
            <capsuleGeometry args={[0.12, 0.24, 8, 12]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>
          {/* Telapak Tangan Terbuka Menghadap Atas */}
          <mesh position={[0.18, -0.24, 0.18]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>
          {/* 3 Kuku Putih Bulat Imut */}
          {[-0.035, 0, 0.035].map((ox, i) => (
            <mesh key={`claw-r-${i}`} position={[0.18 + ox, -0.32, 0.22]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial color={BAYA_CLAW_WHITE} roughness={0.25} />
            </mesh>
          ))}

          {/* KUBUS IKONIK THREE.JS MENGAMBANG DI ATAS TANGAN KANAN */}
          <mesh ref={cubeRef} position={[0.22, 0.12, 0.22]} castShadow>
            <boxGeometry args={[0.14, 0.14, 0.14]} />
            <meshStandardMaterial
              color="#00cec9"
              roughness={0.2}
              metalness={0.3}
              emissive="#00cec9"
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>

        {/* ======================================================== */}
        {/* 7. KAKI GEMOY & TELAPAK KREM (Chubby Legs & Foot Pads)   */}
        {/* ======================================================== */}
        {/* Kaki Kiri */}
        <group ref={leftLegRef} position={[-0.32, 0.08, 0.12]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <capsuleGeometry args={[0.14, 0.20, 8, 12]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>
          {/* Telapak Kaki Bulat Gemoy */}
          <mesh position={[0, -0.24, 0.08]} scale={[1.15, 0.48, 1.35]} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>
          {/* Bantalan Telapak Kaki Krem Manis (Foot Pad) */}
          <mesh position={[0, -0.25, 0.10]} scale={[0.85, 0.2, 0.9]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color={BAYA_CREAM_BELLY} roughness={0.6} />
          </mesh>
          {/* 3 Kuku Jari Kaki Putih Bulat */}
          {[-0.08, 0, 0.08].map((ox, i) => (
            <mesh key={`toe-l-${i}`} position={[ox, -0.25, 0.26]}>
              <sphereGeometry args={[0.026, 8, 8]} />
              <meshStandardMaterial color={BAYA_CLAW_WHITE} roughness={0.25} />
            </mesh>
          ))}
        </group>

        {/* Kaki Kanan */}
        <group ref={rightLegRef} position={[0.32, 0.08, 0.12]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <capsuleGeometry args={[0.14, 0.20, 8, 12]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>
          {/* Telapak Kaki Bulat Gemoy */}
          <mesh position={[0, -0.24, 0.08]} scale={[1.15, 0.48, 1.35]} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>
          {/* Bantalan Telapak Kaki Krem Manis */}
          <mesh position={[0, -0.25, 0.10]} scale={[0.85, 0.2, 0.9]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color={BAYA_CREAM_BELLY} roughness={0.6} />
          </mesh>
          {/* 3 Kuku Jari Kaki Putih Bulat */}
          {[-0.08, 0, 0.08].map((ox, i) => (
            <mesh key={`toe-r-${i}`} position={[ox, -0.25, 0.26]}>
              <sphereGeometry args={[0.026, 8, 8]} />
              <meshStandardMaterial color={BAYA_CLAW_WHITE} roughness={0.25} />
            </mesh>
          ))}
        </group>

        {/* ======================================================== */}
        {/* 8. EKOR BUAYA GEMOY MELENGKUNG (Cute Chubby Curved Tail) */}
        {/* ======================================================== */}
        <group ref={tailRef} position={[0, 0.24, -0.42]}>
          {/* Pangkal Ekor Gemoy */}
          <mesh position={[0, -0.02, -0.20]} rotation={[-0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.38, 0.48, 16]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>

          {/* Batang Ekor Melengkung Anggun ke Atas */}
          <mesh position={[0, 0.16, -0.48]} rotation={[0.55, 0, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.22, 0.48, 12]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>

          {/* Ujung Ekor Bulat Imut */}
          <mesh position={[0, 0.44, -0.66]} rotation={[0.95, 0, 0]} castShadow>
            <capsuleGeometry args={[0.11, 0.32, 8, 12]} />
            <meshStandardMaterial color={BAYA_BODY_GREEN} roughness={0.55} />
          </mesh>

          {/* Duri/Sisik Bulat Manis di Sepanjang Ekor */}
          {[
            { pos: [0, 0.18, -0.24], s: 0.13 },
            { pos: [0, 0.38, -0.46], s: 0.12 },
            { pos: [0, 0.62, -0.66], s: 0.10 },
          ].map((sp, idx) => (
            <mesh
              key={`tail-scute-${idx}`}
              position={sp.pos as [number, number, number]}
              scale={[sp.s * 0.75, sp.s, sp.s * 1.1]}
              castShadow
            >
              <sphereGeometry args={[0.32, 12, 12]} />
              <meshStandardMaterial color={BAYA_DARK_GREEN} roughness={0.65} />
            </mesh>
          ))}
        </group>

        {/* Lampu Panggung Lembut Khusus Kawaii Baya */}
        <pointLight
          position={[0, 1.2, 1.4]}
          intensity={hovered ? 2.8 : 1.8}
          color="#fffbeb"
          distance={5}
        />
      </group>
    </group>
  );
}
