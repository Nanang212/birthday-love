// ============================================================
// COMPONENT — SuraModel (Chibi Kawaii 3D Mascot — Hiu Sura)
// Model 3D Procedural Three.js Kawaii Chibi Sura Surabaya
// Dibuat persis sesuai spesifikasi 3D Chibi Three.js WebGL Style:
// - Bodi gemoy bulat montok berbentuk tetesan air (teardrop chubby body)
// - Warna biru pastel cerah (pastel blue) & abu-abu terang / putih lembut
// - Mata bola besar dengan pupil hitam pekat & kilau bintang ganda (anime eyes)
// - Pipi tembem dengan rona pipi pink merona (kawaii cheek blush)
// - Senyum manis ramah dengan gigi-gigi kecil tumpul lucu & lidah pink
// - Sirip punggung, sirip samping & ekor serba pendek, tebal dan bulat (rounded)
// - Floating bobbing animation & putaran 360° saat diklik dengan stopPropagation!
// ============================================================

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Palet Warna Akurat Chibi Sura (Three.js WebGL Style)
const SURA_PASTEL_BLUE = '#5da9db';   // Biru pastel lembut kawaii
const SURA_BLUE_DARK = '#26679e';     // Aksen alis & lubang hidung
const SURA_LIGHT_BELLY = '#f4f7fb';   // Perut & rahang bawah abu-abu terang / putih
const SURA_CHEEK_BLUSH = '#ff8ea3';   // Rona pipi pink merona
const SURA_MOUTH_DARK = '#4d1624';    // Rongga mulut dalam
const SURA_TONGUE_PINK = '#ff758f';   // Lidah pink ceria
const SURA_EYE_DARK = '#14121a';      // Pupil mata hitam pekat
const SURA_EYE_RIM = '#25344d';       // Lingkar iris mata hangat
const SURA_TOOTH_WHITE = '#ffffff';   // Gigi tumpul putih lucu

interface SuraModelProps {
  isWalking?: boolean;
  isSpeaking?: boolean;
  scale?: number;
  facingRight?: boolean;
  onClick?: () => void;
}

export function SuraModel({
  isWalking = false,
  isSpeaking = false,
  scale = 0.52,
  facingRight = true,
  onClick,
}: SuraModelProps) {
  const modelGroupRef = useRef<THREE.Group>(null);
  const wavingFinRef = useRef<THREE.Group>(null);
  const leftFinRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);

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

    // 1. Orientasi Menghadap Kanan/Kiri
    const baseTargetAngle = facingRight ? 0.45 : -0.45;

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
        // Berenang / melangkah gemoy (Chibi Waddle Swim)
        const walkCycle = time * 8.5;
        const hop = Math.abs(Math.sin(walkCycle)) * 0.12;
        modelGroupRef.current.position.y = hop;
        modelGroupRef.current.rotation.z = Math.sin(walkCycle) * 0.08;

        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(walkCycle) * 0.05;
        }
        if (tailRef.current) {
          tailRef.current.rotation.y = Math.sin(walkCycle) * 0.45;
        }
      } else if (isSpeaking) {
        // Gerakan saat berbicara
        modelGroupRef.current.position.y = Math.sin(time * 6.5) * 0.035;
        modelGroupRef.current.rotation.z = Math.sin(time * 4.5) * 0.025;

        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(time * 4.0) * 0.12;
          headRef.current.rotation.x = Math.sin(time * 8.0) * 0.05;
        }
        if (jawRef.current) {
          jawRef.current.rotation.x = Math.sin(time * 12.0) * 0.10 + 0.05;
        }
        if (tailRef.current) {
          tailRef.current.rotation.y = Math.sin(time * 3.5) * 0.2;
        }
      } else {
        // Idle mengambang lembut (Smooth Floating)
        modelGroupRef.current.position.y = Math.sin(time * 2.2) * 0.03;
        modelGroupRef.current.rotation.z = Math.sin(time * 1.8) * 0.02;

        if (headRef.current) {
          headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, dt * 6);
          headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, dt * 6);
        }
        if (jawRef.current) {
          jawRef.current.rotation.x = THREE.MathUtils.lerp(jawRef.current.rotation.x, 0, dt * 6);
        }
        if (tailRef.current) {
          tailRef.current.rotation.y = Math.sin(time * 2.2) * 0.14;
        }
      }
    }

    // 3. Sirip Dada Kanan Melambai Menyapa Ramah
    if (wavingFinRef.current) {
      const waveSpeed = isSpeaking ? 7.5 : 3.5;
      const waveAmp = isSpeaking ? 0.24 : 0.12;
      wavingFinRef.current.rotation.z = 0.45 + Math.sin(time * waveSpeed) * waveAmp;
      wavingFinRef.current.rotation.x = 0.15 + Math.cos(time * waveSpeed * 0.8) * 0.1;
    }

    // 4. Sirip Kiri Gerak Halus
    if (leftFinRef.current) {
      leftFinRef.current.rotation.z = -0.4 + Math.sin(time * 2.5) * 0.08;
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
        {/* 1. BADAN GEMOY BULAT BENTUK TEARDROP (Chubby Shark Body) */}
        {/* ======================================================== */}
        {/* Torso Utama Biru Pastel Bulat Montok */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.64, 32, 32]} />
          <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.52} metalness={0.05} />
        </mesh>

        {/* Torso Bawah Bervolume */}
        <mesh position={[0, 0.20, -0.05]} scale={[0.96, 1.02, 0.92]} castShadow>
          <sphereGeometry args={[0.60, 32, 32]} />
          <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.52} metalness={0.05} />
        </mesh>

        {/* Perut Abu-abu Terang / Putih Lembut (Soft Light Gray Belly) */}
        <mesh position={[0, 0.32, 0.24]} scale={[0.84, 1.05, 0.70]}>
          <sphereGeometry args={[0.56, 28, 28]} />
          <meshStandardMaterial color={SURA_LIGHT_BELLY} roughness={0.5} />
        </mesh>

        {/* Dada Halus Naik ke Bawah Rahang */}
        <mesh position={[0, 0.52, 0.35]} scale={[0.78, 0.75, 0.58]}>
          <sphereGeometry args={[0.48, 24, 24]} />
          <meshStandardMaterial color={SURA_LIGHT_BELLY} roughness={0.5} />
        </mesh>

        {/* ======================================================== */}
        {/* 2. KEPALA CHIBI BULAT & WAJAH IMUT (Cute Chibi Head)     */}
        {/* ======================================================== */}
        <group ref={headRef} position={[0, 0.98, 0.08]}>
          {/* Batok Kepala Bulat Biru Pastel */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.58, 32, 32]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.52} />
          </mesh>

          {/* Pipi Tembem Kiri & Kanan (Chubby Cheeks) */}
          <mesh position={[-0.34, -0.10, 0.24]} scale={[1, 0.88, 0.9]}>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.52} />
          </mesh>
          <mesh position={[0.34, -0.10, 0.24]} scale={[1, 0.88, 0.9]}>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.52} />
          </mesh>

          {/* Rona Pipi Pink Merona Imut (Cute Pink Cheek Blush) */}
          <mesh position={[-0.42, -0.06, 0.38]} rotation={[0, -0.4, 0]} scale={[1.3, 0.75, 0.3]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshBasicMaterial color={SURA_CHEEK_BLUSH} />
          </mesh>
          <mesh position={[0.42, -0.06, 0.38]} rotation={[0, 0.4, 0]} scale={[1.3, 0.75, 0.3]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshBasicMaterial color={SURA_CHEEK_BLUSH} />
          </mesh>

          {/* Moncong Bulat Halus Kartun di Depan */}
          <mesh position={[0, -0.04, 0.44]} scale={[1.15, 0.72, 1.05]} castShadow>
            <sphereGeometry args={[0.34, 28, 28]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.52} />
          </mesh>

          {/* Ujung Hidung Bulat Mancung */}
          <mesh position={[0, 0, 0.72]} scale={[1.15, 0.78, 0.7]}>
            <sphereGeometry args={[0.20, 24, 24]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.52} />
          </mesh>

          {/* Lubang Hidung Imut Kiri & Kanan */}
          <mesh position={[-0.09, 0.08, 0.80]}>
            <sphereGeometry args={[0.026, 12, 12]} />
            <meshStandardMaterial color={SURA_BLUE_DARK} roughness={0.8} />
          </mesh>
          <mesh position={[0.09, 0.08, 0.80]}>
            <sphereGeometry args={[0.026, 12, 12]} />
            <meshStandardMaterial color={SURA_BLUE_DARK} roughness={0.8} />
          </mesh>

          {/* ======================================================== */}
          {/* 3. SENYUM RAMAH DENGAN GIGI TUMPUL LUCU & LIDAH PINK    */}
          {/* ======================================================== */}
          <group ref={jawRef} position={[0, -0.18, 0.48]}>
            {/* Rongga Mulut Dalam */}
            <mesh position={[0, 0.01, 0]} scale={[1.2, 0.65, 0.55]}>
              <sphereGeometry args={[0.24, 20, 20]} />
              <meshStandardMaterial color={SURA_MOUTH_DARK} roughness={0.8} />
            </mesh>

            {/* Lidah Pink Ceria */}
            <mesh position={[0, -0.03, 0.06]} scale={[1.1, 0.4, 0.85]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color={SURA_TONGUE_PINK} roughness={0.35} />
            </mesh>

            {/* Gigi-gigi Tumpul Putih Kecil Lucu yang Muncul di Bibir */}
            {[-0.14, -0.05, 0.05, 0.14].map((x, i) => (
              <mesh key={`sura-top-tooth-${i}`} position={[x, 0.08, 0.12]} rotation={[Math.PI, 0, 0]}>
                <capsuleGeometry args={[0.018, 0.03, 4, 8]} />
                <meshStandardMaterial color={SURA_TOOTH_WHITE} roughness={0.25} />
              </mesh>
            ))}
            {[-0.10, 0, 0.10].map((x, i) => (
              <mesh key={`sura-btm-tooth-${i}`} position={[x, -0.06, 0.13]}>
                <capsuleGeometry args={[0.016, 0.025, 4, 8]} />
                <meshStandardMaterial color={SURA_TOOTH_WHITE} roughness={0.25} />
              </mesh>
            ))}

            {/* Dagu & Rahang Bawah Warna Abu-abu Terang / Putih */}
            <mesh position={[0, -0.10, 0.06]} scale={[1.12, 0.58, 0.95]}>
              <sphereGeometry args={[0.25, 20, 20]} />
              <meshStandardMaterial color={SURA_LIGHT_BELLY} roughness={0.5} />
            </mesh>
          </group>

          {/* ======================================================== */}
          {/* 4. MATA ANIME/CHIBI BESAR BERBINAR (Sangat Persis Baya)  */}
          {/* ======================================================== */}
          {/* MATA KIRI */}
          <group position={[-0.24, 0.18, 0.44]} rotation={[0.04, -0.18, 0.06]}>
            {/* Lingkar Iris Mata Biru Gelap Hangat */}
            <mesh scale={[0.88, 1.15, 0.4]}>
              <sphereGeometry args={[0.19, 24, 24]} />
              <meshStandardMaterial color={SURA_EYE_RIM} roughness={0.2} />
            </mesh>
            {/* Pupil Hitam Pekat Mengkilap */}
            <mesh position={[0.01, 0, 0.04]} scale={[0.86, 1.12, 0.35]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshStandardMaterial color={SURA_EYE_DARK} roughness={0.1} />
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
            {/* Kilau Titik Ketiga */}
            <mesh position={[-0.02, -0.065, 0.11]}>
              <sphereGeometry args={[0.018, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Alis Tipis Biru Ceria di Atas Mata */}
            <mesh position={[0.01, 0.22, 0.02]} rotation={[0, 0, 0.22]}>
              <capsuleGeometry args={[0.02, 0.16, 4, 8]} />
              <meshBasicMaterial color={SURA_BLUE_DARK} />
            </mesh>
          </group>

          {/* MATA KANAN */}
          <group position={[0.24, 0.18, 0.44]} rotation={[0.04, 0.18, -0.06]}>
            {/* Lingkar Iris Mata Biru Gelap Hangat */}
            <mesh scale={[0.88, 1.15, 0.4]}>
              <sphereGeometry args={[0.19, 24, 24]} />
              <meshStandardMaterial color={SURA_EYE_RIM} roughness={0.2} />
            </mesh>
            {/* Pupil Hitam Pekat Mengkilap */}
            <mesh position={[-0.01, 0, 0.04]} scale={[0.86, 1.12, 0.35]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshStandardMaterial color={SURA_EYE_DARK} roughness={0.1} />
            </mesh>
            {/* Kilau Bintang Putih Utama */}
            <mesh position={[-0.045, 0.07, 0.12]}>
              <sphereGeometry args={[0.056, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Kilau Bintang Putih Sekunder */}
            <mesh position={[0.042, -0.05, 0.11]}>
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Kilau Titik Ketiga */}
            <mesh position={[-0.02, -0.065, 0.11]}>
              <sphereGeometry args={[0.018, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Alis Tipis Biru Ceria di Atas Mata */}
            <mesh position={[-0.01, 0.22, 0.02]} rotation={[0, 0, -0.22]}>
              <capsuleGeometry args={[0.02, 0.16, 4, 8]} />
              <meshBasicMaterial color={SURA_BLUE_DARK} />
            </mesh>
          </group>

          {/* ======================================================== */}
          {/* 5. SIRIP PUNGGUNG CHIBI BULAT (Cute Rounded Dorsal Fin)  */}
          {/* ======================================================== */}
          <group position={[0, 0.56, -0.12]} rotation={[-0.32, 0, 0]}>
            {/* Sirip Punggung Gemoy dengan Sudut Membulat */}
            <mesh scale={[0.14, 0.48, 0.36]} castShadow>
              <sphereGeometry args={[0.42, 20, 20]} />
              <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.48} />
            </mesh>
            <mesh position={[0, 0.12, 0.08]} rotation={[0.4, 0, 0]}>
              <capsuleGeometry args={[0.05, 0.36, 6, 12]} />
              <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.48} />
            </mesh>
          </group>
        </group>

        {/* ======================================================== */}
        {/* 6. SIRIP DADA CHIBI GEMOY (Short, Thick Rounded Fins)    */}
        {/* ======================================================== */}
        {/* Sirip Kanan (Melambai Menyapa Ramah) */}
        <group ref={wavingFinRef} position={[0.48, 0.44, 0.08]}>
          <mesh position={[0.18, 0.10, 0]} rotation={[0.1, 0, -0.55]} scale={[1, 0.38, 0.65]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.5} />
          </mesh>
          {/* Ujung Sirip Bulat Imut */}
          <mesh position={[0.34, 0.18, -0.02]} scale={[0.7, 0.3, 0.55]} castShadow>
            <sphereGeometry args={[0.22, 14, 14]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.5} />
          </mesh>
          {/* Sisi Bawah Sirip Abu-abu Terang */}
          <mesh position={[0.18, 0.06, 0.02]} scale={[0.55, 0.2, 0.35]}>
            <sphereGeometry args={[0.20, 12, 12]} />
            <meshStandardMaterial color={SURA_LIGHT_BELLY} roughness={0.5} />
          </mesh>
        </group>

        {/* Sirip Kiri (Short Rounded Left Fin) */}
        <group ref={leftFinRef} position={[-0.48, 0.38, 0.08]}>
          <mesh position={[-0.18, -0.05, 0]} rotation={[0.1, 0, 0.45]} scale={[1, 0.38, 0.65]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.5} />
          </mesh>
          <mesh position={[-0.34, -0.10, -0.02]} scale={[0.7, 0.3, 0.55]} castShadow>
            <sphereGeometry args={[0.22, 14, 14]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.5} />
          </mesh>
        </group>

        {/* 3 Lipatan Insang Halus di Samping Leher */}
        {[-0.035, 0, 0.035].map((offsetZ, i) => (
          <mesh key={`sura-gill-l-${i}`} position={[-0.50, 0.52, 0.18 + offsetZ]} rotation={[0, -0.2, 0.2]}>
            <capsuleGeometry args={[0.012, 0.08, 4, 8]} />
            <meshStandardMaterial color={SURA_BLUE_DARK} roughness={0.8} />
          </mesh>
        ))}
        {[-0.035, 0, 0.035].map((offsetZ, i) => (
          <mesh key={`sura-gill-r-${i}`} position={[0.50, 0.52, 0.18 + offsetZ]} rotation={[0, 0.2, -0.2]}>
            <capsuleGeometry args={[0.012, 0.08, 4, 8]} />
            <meshStandardMaterial color={SURA_BLUE_DARK} roughness={0.8} />
          </mesh>
        ))}

        {/* ======================================================== */}
        {/* 7. EKOR HIU CHIBI GEMOY (Short, Thick Rounded Tail)      */}
        {/* ======================================================== */}
        <group ref={tailRef} position={[0, 0.24, -0.40]}>
          {/* Batang Ekor Pendek Tebal */}
          <mesh position={[0, 0, -0.18]} rotation={[-0.15, 0, 0]} scale={[0.65, 0.75, 1.1]} castShadow>
            <cylinderGeometry args={[0.22, 0.36, 0.45, 16]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.52} />
          </mesh>

          {/* Pangkal Ujung Ekor */}
          <mesh position={[0, 0.06, -0.42]} rotation={[-0.25, 0, 0]} scale={[0.42, 0.55, 0.8]} castShadow>
            <cylinderGeometry args={[0.14, 0.22, 0.40, 12]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.52} />
          </mesh>

          {/* Daun Sirip Ekor Atas Bulat Imut */}
          <mesh position={[0, 0.34, -0.66]} rotation={[-0.55, 0, 0]} scale={[0.14, 0.55, 0.38]} castShadow>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.48} />
          </mesh>

          {/* Daun Sirip Ekor Bawah Bulat Imut */}
          <mesh position={[0, -0.12, -0.60]} rotation={[0.75, 0, 0]} scale={[0.12, 0.38, 0.30]} castShadow>
            <sphereGeometry args={[0.24, 14, 14]} />
            <meshStandardMaterial color={SURA_PASTEL_BLUE} roughness={0.48} />
          </mesh>
        </group>

        {/* Lampu Panggung Lembut Khusus Kawaii Sura */}
        <pointLight
          position={[0, 1.2, 1.4]}
          intensity={hovered ? 2.8 : 1.8}
          color="#f0f9ff"
          distance={5}
        />
      </group>
    </group>
  );
}
