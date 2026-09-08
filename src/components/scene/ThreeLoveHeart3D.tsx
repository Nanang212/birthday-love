// ============================================================
// COMPONENT — ThreeLoveHeart3D (Interactive Three.js 3D Love Heart)
// - Dibuat murni dengan Three.js ExtrudeGeometry dari THREE.Shape
// - Awalnya transparan/kristal kaca (glass-like crystal heart)
// - Saat diklik: terisi cairan merah dari bawah ke atas (0% -> 100%)
// - Saat penuh warna merah merona, meletup partikel cinta dan
//   otomatis membuka WhatsApp mengirim pesan ke 085790663367
// ============================================================

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface ThreeLoveHeart3DProps {
  position?: [number, number, number];
  scale?: number;
  onFilled?: () => void;
  onHeartClick?: () => void;
  isFilled?: boolean;
}

// Membuat kurva bentuk Hati (Heart Shape) 3D simetris
export function createHeartShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Mulai dari lekukan atas tengah
  shape.moveTo(0, 0.35);
  // Lekukan kiri atas
  shape.bezierCurveTo(-0.05, 0.65, -0.55, 0.65, -0.55, 0.25);
  // Turun ke ujung bawah hati
  shape.bezierCurveTo(-0.55, -0.05, -0.3, -0.35, 0, -0.65);
  // Naik ke lekukan kanan atas
  shape.bezierCurveTo(0.3, -0.35, 0.55, -0.05, 0.55, 0.25);
  // Kembali ke lekukan atas tengah
  shape.bezierCurveTo(0.55, 0.65, 0.05, 0.65, 0, 0.35);
  return shape;
}

export function ThreeLoveHeart3D({
  position = [0, -0.45, 1.2],
  scale = 0.95,
  onFilled,
  onHeartClick,
  isFilled = false,
}: ThreeLoveHeart3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const liquidMeshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  // Aktifkan local clipping pada renderer Three.js untuk efek pengisian cairan
  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  const [hovered, setHovered] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [fillProgress, setFillProgress] = useState(isFilled ? 1 : 0);
  const progressRef = useRef(isFilled ? 1 : 0);
  const hasTriggeredRef = useRef(isFilled);

  // Uniform untuk shader pengisian cairan merah dari bawah ke atas (Lokal)
  const fillUniforms = useMemo(() => ({
    uFillProgress: { value: isFilled ? 1.0 : 0.0 },
  }), [isFilled]);

  // Geometri Hati 3D dengan bevel halus
  const heartGeometry = useMemo(() => {
    const shape = createHeartShape();
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.24,
      bevelEnabled: true,
      bevelSegments: 10,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center(); // Pusatkan tepat di titik (0, 0, 0)
    return geom;
  }, []);

  // Material cairan merah dengan shader pemotongan lokal berbasis position.y geometri
  const liquidMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#ff0844',
      emissive: '#ff0044',
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uFillProgress = fillUniforms.uFillProgress;

      shader.vertexShader = `
        varying float vLocalY;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vLocalY = position.y;
        `
      );

      shader.fragmentShader = `
        uniform float uFillProgress;
        varying float vLocalY;
        ${shader.fragmentShader}
      `.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        // Batas bawah ujung hati sekitar -0.55, batas atas lekukan sekitar +0.50
        float waterThreshold = -0.56 + uFillProgress * 1.12;
        if (uFillProgress <= 0.001 || vLocalY > waterThreshold) {
          discard;
        }
        `
      );
    };

    return mat;
  }, [fillUniforms]);

  // Handler klik dan pointer pada icon Love
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onHeartClick?.();

    if (progressRef.current >= 1.0 || isFilling) return;
    setIsFilling(true);
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
  };

  // Frame animation: animasi melayang lembut (bobbing), denyut (pulse), dan kenaikan cairan
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;

    // Gerakan melayang (float) lembut & rotasi anggun
    const baseScale = scale * (hovered ? 1.08 : 1.0);
    const pulse = Math.sin(t * (isFilling ? 7.0 : 2.5)) * 0.035;
    groupRef.current.scale.setScalar(baseScale + pulse);
    groupRef.current.position.y = position[1] + Math.sin(t * 2.0) * 0.05;
    groupRef.current.rotation.y = Math.sin(t * 1.2) * 0.12;

    // Animasi pengisian cairan merah dari 0% ke 100%
    if (isFilling && progressRef.current < 1.0) {
      progressRef.current = Math.min(1.0, progressRef.current + delta * 0.55);
      setFillProgress(progressRef.current);
      fillUniforms.uFillProgress.value = progressRef.current;

      if (progressRef.current >= 1.0 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setIsFilling(false);
        setTimeout(() => {
          onFilled?.();
        }, 500);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 1. KULIT LUAR TRANSPARAN MURNI (Crystal Glass Love Shell) */}
      <mesh
        geometry={heartGeometry}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <meshPhysicalMaterial
          color={isFilled ? '#ff1744' : '#ffffff'}
          transparent
          opacity={isFilled ? 0.95 : 0.25}
          roughness={0.08}
          metalness={0.05}
          transmission={isFilled ? 0.05 : 0.94}
          ior={1.5}
          reflectivity={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          emissive={isFilled ? '#ff1744' : '#ffffff'}
          emissiveIntensity={isFilled ? 0.85 : hovered ? 0.35 : 0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. CAIRAN MERAH DI DALAM HATI (Hanya terisi dan muncul saat diklik) */}
      <mesh
        ref={liquidMeshRef}
        geometry={heartGeometry}
        material={liquidMaterial}
        scale={[0.95, 0.95, 0.95]}
        visible={fillProgress > 0 || isFilling || isFilled}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />

      {/* 3. CAHAYA INTI HATI (Point Light) */}
      <pointLight
        color={fillProgress > 0 ? '#ff1744' : '#ffffff'}
        intensity={fillProgress > 0 ? 2.5 : 0.8}
        distance={3}
      />

      {/* 4. BALON TEKS PANDUAN DI ATAS ICON LOVE (Sembunyi saat sudah terisi/dikirim) */}
      {!isFilled && (
        <Html
          position={[0, 0.88, 0]}
          center
          distanceFactor={5.2}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              background: isFilling
                ? 'rgba(225, 29, 72, 0.92)'
                : 'rgba(15, 23, 42, 0.90)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: isFilling
                ? '1.5px solid #ff4d6d'
                : '1.5px solid rgba(254, 202, 87, 0.9)',
              borderRadius: '9999px',
              padding: '0.28rem 0.75rem',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.6), 0 0 14px rgba(255, 77, 109, 0.5)',
              animation: 'pulse 1.5s infinite',
              transform: 'scale(1)',
              transition: 'all 0.25s ease',
            }}
          >
            {isFilling ? (
              <>
                <span>💖</span>
                <span>Mengisi Cinta... {Math.round(fillProgress * 100)}%</span>
                <span>✨</span>
              </>
            ) : (
              <>
                <span>💖</span>
                <span>Klik kalau kamu happy!</span>
                <span>✨</span>
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
