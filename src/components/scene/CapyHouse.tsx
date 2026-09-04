// ============================================================
// COMPONENT — CapyHouse (Cozy 3D Miniature House for Capy)
// Rumah pertama kapibara / Rumah keluar
// ============================================================

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface CapyHouseProps {
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
  showLabel?: boolean;
  highlight?: boolean;
  label?: string;
}

export function CapyHouse({
  position = [2.2, -0.4, 0.5],
  scale = 0.85,
  onClick,
  showLabel = true,
  highlight = false,
  label = '🏡 Rumah Pertama',
}: CapyHouseProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Subtle gentle breathing/floating
    groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.02;

    // Hover or highlight pulse
    const targetScale = hovered ? scale * 1.08 : highlight ? scale * (1 + Math.sin(t * 4) * 0.04) : scale;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
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
      {/* Label Rumah di Atas */}
      {showLabel && (
        <Html position={[0, 1.25, 0]} center distanceFactor={4.5}>
          <div
            style={{
              background: highlight ? 'rgba(230, 126, 34, 0.95)' : 'rgba(10, 15, 28, 0.85)',
              border: highlight ? '1.5px solid #f1c40f' : '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '9999px',
              padding: '0.28rem 0.75rem',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: highlight
                ? '0 0 15px rgba(241, 196, 15, 0.6), 0 4px 12px rgba(0,0,0,0.5)'
                : '0 4px 12px rgba(0,0,0,0.4)',
              cursor: 'pointer',
              userSelect: 'none',
              animation: highlight ? 'pulse 1.5s infinite' : 'none',
              letterSpacing: '0.02em',
            }}
          >
            {label}
          </div>
        </Html>
      )}

      {/* 1. Alas Tanah / Rumput Mini */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 0.95, 0.1, 16]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.8} />
      </mesh>

      {/* 2. Dinding Rumah Kayu Cozy */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.8, 0.8]} />
        <meshStandardMaterial color="#c08a58" roughness={0.7} />
      </mesh>

      {/* 3. Atap Segitiga Merah Bata Hangat */}
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.85, 0.55, 4]} />
        <meshStandardMaterial color="#b33939" roughness={0.6} />
      </mesh>

      {/* 4. Cerobong Asap Kecil */}
      <mesh position={[0.25, 1.2, -0.15]} castShadow>
        <boxGeometry args={[0.14, 0.35, 0.14]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>

      {/* 5. Pintu Masuk Kapibara (Berongga Gelap) */}
      <mesh position={[0, 0.28, 0.41]}>
        <boxGeometry args={[0.34, 0.48, 0.05]} />
        <meshStandardMaterial color="#332014" roughness={0.9} />
      </mesh>

      {/* 6. Jendela Bercahaya Kuning Hangat */}
      <mesh position={[-0.46, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.26, 0.26]} />
        <meshStandardMaterial
          color="#f6e58d"
          emissive="#f9ca24"
          emissiveIntensity={1.8}
        />
      </mesh>
      <mesh position={[0.46, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.26, 0.26]} />
        <meshStandardMaterial
          color="#f6e58d"
          emissive="#f9ca24"
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Cahaya hangat dari dalam rumah */}
      <pointLight position={[0, 0.5, 0.6]} intensity={1.2} color="#f9ca24" distance={2.5} />
    </group>
  );
}
