// ============================================================
// COMPONENT — TravelAirplane3D (Stylized 3D Flight in Three.js)
// Pesawat 3D petualang estetik & ekspresif di panggung Three.js:
// - Badan pesawat ramping (fuselage), sayap dengan lampu navigasi
// - Kokpit kaca, baling-baling 3D berputar (idle & high-speed)
// - Landasan pacu (runway) malam hari dengan lampu LED berpendar
// - Animasi take-off spektakuler meluncur dan terbang naik ke langit malam!
// ============================================================

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface TravelAirplane3DProps {
  position?: [number, number, number];
  scale?: number;
  direction?: 'left' | 'right';
  isTakingOff?: boolean;
  showPilot?: boolean;
  highlight?: boolean;
  label?: string;
  onClick?: () => void;
  onFlightComplete?: () => void;
}

export function TravelAirplane3D({
  position = [-3.6, -1.8, 0.4],
  scale = 0.65,
  direction = 'right',
  isTakingOff = false,
  showPilot = true,
  highlight = false,
  label = '✈️ Perjalanan Selanjutnya',
  onClick,
  onFlightComplete,
}: TravelAirplane3DProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const airplaneGroupRef = useRef<THREE.Group>(null);
  const propellerRef = useRef<THREE.Group>(null);
  const platformRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Status progres take-off terbang
  const flightProgress = useRef(0);
  const hasTriggeredComplete = useRef(false);

  const isLeft = direction === 'left';
  const sign = isLeft ? -1 : 1;

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    // 1. Putaran Baling-baling Depan
    if (propellerRef.current) {
      const propSpeed = isTakingOff ? 55 : 12;
      propellerRef.current.rotation.z += dt * propSpeed;
    }

    if (!airplaneGroupRef.current) return;

    // 2. Animasi Saat Diam di Landasan vs Saat Terbang (Take-off)
    if (!isTakingOff) {
      // Idle: Bergoyang anggun & bernapas santai di atas landasan
      const idleHover = Math.sin(time * 2.2) * 0.025;
      const idleBank = Math.sin(time * 1.5) * 0.015;
      airplaneGroupRef.current.position.y = idleHover;
      airplaneGroupRef.current.rotation.z = idleBank * sign;
      airplaneGroupRef.current.rotation.x = 0;
      airplaneGroupRef.current.rotation.y = isLeft ? Math.PI - 0.28 : 0.28;
    } else {
      // Take-off: Meluncur maju, mengangkat hidung ke atas (pitch up), dan terbang ke langit!
      flightProgress.current += dt * 0.65;
      const p = flightProgress.current;

      // Platform menyusut dan menghilang halus saat pesawat terbang
      if (platformRef.current) {
        const platScale = Math.max(0.001, 1 - Math.max(0, p - 0.2) * 2.0);
        platformRef.current.scale.set(platScale, platScale, platScale);
      }

      // Lintasan terbang parabola naik (arah dinamis kiri/kanan)
      const flightX = sign * Math.pow(p, 1.35) * 11.0;
      const flightY = Math.pow(p, 1.45) * 7.5;
      const flightZ = -p * 2.5;

      airplaneGroupRef.current.position.x = flightX;
      airplaneGroupRef.current.position.y = flightY;
      airplaneGroupRef.current.position.z = flightZ;

      // Orientasi kemiringan terbang dinamis (Pitch Up & Banking)
      const pitchUp = Math.min(p * 0.55, 0.45);
      const bankRoll = Math.sin(p * Math.PI) * -0.22 * sign;
      airplaneGroupRef.current.rotation.x = -pitchUp;
      airplaneGroupRef.current.rotation.z = bankRoll;
      airplaneGroupRef.current.rotation.y = isLeft ? Math.PI - 0.28 - p * 0.35 : 0.28 + p * 0.35;

      // Sedikit efek getaran mesin saat kecepatan tinggi
      airplaneGroupRef.current.position.y += Math.sin(time * 45) * 0.012;

      // Selesai terbang keluar layar (p >= 1.2)
      if (p >= 1.25 && !hasTriggeredComplete.current) {
        hasTriggeredComplete.current = true;
        onFlightComplete?.();
      }
    }
  });

  return (
    <group ref={rootGroupRef} position={position} scale={[scale, scale, scale]}>
      {/* ── 🛬 LANDASAN PACU MINI (RUNWAY PLATFORM) ── */}
      <group ref={platformRef} position={[0, -0.36, 0]} rotation={[0, isLeft ? Math.PI - 0.28 : 0.28, 0]}>
        {/* Plat Landasan Aspal Halus */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <cylinderGeometry args={[1.35, 1.45, 0.12, 32]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.8}
            metalness={0.15}
          />
        </mesh>

        {/* Garis Marka Kuning Landasan Pacu */}
        <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 1.8]} />
          <meshBasicMaterial color="#feca57" />
        </mesh>

        {/* Lampu Pendar Runway LED Hijau & Emas (Malam Hari) */}
        {[-0.9, -0.3, 0.3, 0.9].map((posZ, i) => (
          <React.Fragment key={i}>
            {/* Lampu Kiri */}
            <mesh position={[-0.85, 0.09, posZ]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial color={highlight ? '#10b981' : '#00d2d3'} />
            </mesh>
            {/* Lampu Kanan */}
            <mesh position={[0.85, 0.09, posZ]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial color={highlight ? '#feca57' : '#ffd166'} />
            </mesh>
          </React.Fragment>
        ))}

        {/* Cahaya Sorot Lembut Landasan */}
        <pointLight position={[0, 0.4, 0]} intensity={highlight ? 2.2 : 0.8} color="#00d2d3" distance={3.5} />
      </group>

      {/* ── ✈️ BADAN PESAWAT 3D (INTERACTIVE FLIGHT AIRPLANE) ── */}
      <group
        ref={airplaneGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* 1. Badan Utama Pesawat (Streamlined Fuselage) */}
        <mesh position={[0, 0.18, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.32, 1.25, 12, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>

        {/* Strip Dekorasi Emas & Toska di Badan Pesawat */}
        <mesh position={[0, 0.18, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.325, 0.325, 0.45, 24]} />
          <meshStandardMaterial
            color={hovered || highlight ? '#feca57' : '#00d2d3'}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* 2. Kaca Kokpit Pesawat (Tinted Aerodynamic Windshield) */}
        <mesh position={[0.42, 0.32, 0]} rotation={[0, 0, -0.45]}>
          <boxGeometry args={[0.36, 0.22, 0.38]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>

        {/* 3. Sayap Utama (Aerodynamic Wings) */}
        <mesh position={[0.08, 0.16, 0]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.48, 0.05, 2.35]} />
          <meshStandardMaterial
            color="#f1f5f9"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Lampu Navigasi Ujung Sayap (Merah Kiri, Hijau Kanan) */}
        <mesh position={[0.08, 0.16, -1.18]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#ee5253" />
        </mesh>
        <mesh position={[0.08, 0.16, 1.18]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>

        {/* 4. Ekor Vertikal (Tail Rudder Fin) */}
        <mesh position={[-0.72, 0.52, 0]} rotation={[0, 0, -0.28]} castShadow>
          <boxGeometry args={[0.38, 0.45, 0.05]} />
          <meshStandardMaterial
            color={highlight ? '#ff9f43' : '#00d2d3'}
            roughness={0.35}
          />
        </mesh>

        {/* Stabilizer Horizontal Ekor Belakang */}
        <mesh position={[-0.75, 0.32, 0]}>
          <boxGeometry args={[0.26, 0.035, 0.88]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>

        {/* 5. Moncong Depan & Baling-baling 3D (Propeller Hub) */}
        <group position={[0.96, 0.18, 0]}>
          {/* Spinner Kerucut Depan */}
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.13, 0.22, 16]} />
            <meshStandardMaterial color="#ee5253" roughness={0.3} metalness={0.2} />
          </mesh>

          {/* Baling-baling Berputar */}
          <group ref={propellerRef}>
            {/* Bilah 1 */}
            <mesh position={[0, 0.32, 0]}>
              <boxGeometry args={[0.02, 0.62, 0.08]} />
              <meshStandardMaterial
                color={isTakingOff ? '#feca57' : '#334155'}
                roughness={0.4}
                transparent={isTakingOff}
                opacity={isTakingOff ? 0.65 : 1.0}
              />
            </mesh>
            {/* Bilah 2 */}
            <mesh position={[0, -0.32, 0]}>
              <boxGeometry args={[0.02, 0.62, 0.08]} />
              <meshStandardMaterial
                color={isTakingOff ? '#feca57' : '#334155'}
                roughness={0.4}
                transparent={isTakingOff}
                opacity={isTakingOff ? 0.65 : 1.0}
              />
            </mesh>
          </group>
        </group>

        {/* 6. Roda Pendaratan Depan & Belakang */}
        <group position={[0.32, -0.15, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        </group>
        <group position={[-0.22, -0.15, 0]}>
          {/* Roda Kiri & Kanan */}
          <mesh position={[0, 0, -0.32]}>
            <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.32]}>
            <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Gandar Roda */}
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.68, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        </group>

        {/* 7. Capy Imut Naik di Dalam Kokpit saat Take-off */}
        {isTakingOff && showPilot && (
          <group position={[0.22, 0.38, 0]} scale={[0.45, 0.45, 0.45]}>
            {/* Kepala Capy Kecil */}
            <mesh>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
            </mesh>
            {/* Hidung Capy */}
            <mesh position={[0.18, -0.04, 0]}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial color="#4A2F13" roughness={0.8} />
            </mesh>
            {/* Kacamata Pilot Capy Lucu */}
            <mesh position={[0.12, 0.08, 0]}>
              <boxGeometry args={[0.06, 0.12, 0.32]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          </group>
        )}

        {/* 8. Partikel Asap / Jejak Bintang saat Terbang */}
        {isTakingOff && (
          <group position={[-1.0, 0.18, 0]}>
            <mesh>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshBasicMaterial color="#ffd166" transparent opacity={0.7} />
            </mesh>
            <mesh position={[-0.3, 0, 0]}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
            </mesh>
          </group>
        )}
      </group>

      {/* ── 🏷️ LABEL HTML MENGAMBANG DI ATAS PESAWAT (Hanya saat di darat) ── */}
      {!isTakingOff && (
        <Html position={[0, 1.25, 0]} center distanceFactor={4.2}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            style={{
              background: highlight
                ? 'linear-gradient(135deg, rgba(254, 202, 87, 0.96), rgba(255, 159, 67, 0.96))'
                : 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `2px solid ${highlight ? '#ffffff' : 'rgba(0, 210, 211, 0.8)'}`,
              borderRadius: '9999px',
              padding: '0.42rem 1.05rem',
              color: highlight ? '#0f172a' : '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              boxShadow: highlight
                ? '0 8px 25px rgba(255, 159, 67, 0.65), 0 0 20px rgba(254, 202, 87, 0.5)'
                : '0 4px 18px rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.25s ease',
              animation: highlight ? 'bounceSlow 2s infinite' : 'none',
            }}
          >
            <span>✈️</span>
            <span>{label}</span>
            {highlight && <span>✨</span>}
          </div>
        </Html>
      )}
    </group>
  );
}
