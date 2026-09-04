// ============================================================
// COMPONENT — PhotoAlbum3D (Interactive 3D Polaroid Carousel in Three.js)
// Menampilkan album foto kenangan Tunjungan dalam ruang 3D:
// Kartu foto Polaroid 3D ukuran MEDIUM yang elegan, auto-slide
// bergilir sendiri ke samping, caption seragam penuh kasih sayang,
// dan otomatis menutup saat foto terakhir selesai untuk lanjut dialog pamitan.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface PhotoItem {
  id: string;
  src: string;
  caption: string;
  date?: string;
}

// 9 Foto Kenangan Tunjungan dengan caption seragam penuh cinta & sayang
export const TUNJUNGAN_PHOTOS: PhotoItem[] = [
  {
    id: 'p1',
    src: '/memories/photos/WhatsApp Image 2026-09-04 at 14.15.11 (1).jpeg',
    caption: 'Kenangan hangat di dalam kota pahlawan ❤️🥰',
    date: 'Momen 1',
  },
  {
    id: 'p2',
    src: '/memories/photos/WhatsApp Image 2026-09-04 at 14.15.11 (2).jpeg',
    caption: 'Kenangan hangat di dalam kota pahlawan ❤️🥰',
    date: 'Momen 2',
  },
  {
    id: 'p3',
    src: '/memories/photos/WhatsApp Image 2026-09-04 at 14.15.11.jpeg',
    caption: 'Kenangan hangat di dalam kota pahlawan ❤️🥰',
    date: 'Momen 3',
  },
  {
    id: 'p4',
    src: '/memories/photos/WhatsApp Image 2026-09-04 at 14.15.13 (1).jpeg',
    caption: 'Kenangan hangat di dalam kota pahlawan ❤️🥰',
    date: 'Momen 4',
  },
  {
    id: 'p5',
    src: '/memories/photos/WhatsApp Image 2026-09-04 at 14.15.13 (2).jpeg',
    caption: 'Kenangan hangat di dalam kota pahlawan ❤️🥰',
    date: 'Momen 5',
  },
  {
    id: 'p6',
    src: '/memories/photos/WhatsApp Image 2026-09-04 at 14.15.13.jpeg',
    caption: 'Kenangan hangat di dalam kota pahlawan ❤️🥰',
    date: 'Momen 6',
  },
  {
    id: 'p7',
    src: '/memories/photos/WhatsApp Image 2026-09-04 at 14.15.14 (1).jpeg',
    caption: 'Kenangan hangat di dalam kota pahlawan ❤️🥰',
    date: 'Momen 7',
  },
  {
    id: 'p8',
    src: '/memories/photos/WhatsApp Image 2026-09-04 at 14.15.14 (2).jpeg',
    caption: 'Kenangan hangat di dalam kota pahlawan ❤️🥰',
    date: 'Momen 8',
  },
  {
    id: 'p9',
    src: '/memories/photos/WhatsApp Image 2026-09-04 at 14.15.14.jpeg',
    caption: 'Kenangan hangat di dalam kota pahlawan ❤️🥰',
    date: 'Momen 9',
  },
];

interface PhotoCardProps {
  photo: PhotoItem;
  index: number;
  activeIndex: number;
  total: number;
  onClick: () => void;
}

function PhotoCard({ photo, index, activeIndex, total, onClick }: PhotoCardProps) {
  const cardGroupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load photo texture cleanly
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(encodeURI(photo.src), (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setTexture(tex);
    });
  }, [photo.src]);

  // Hitung offset relatif dari kartu aktif
  let offset = index - activeIndex;
  // Circular wrap agar kartu mengalir mulus
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  const isActive = offset === 0;

  useFrame((state, delta) => {
    if (!cardGroupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Hitung posisi 3D melengkung yang pas (Ukuran MEDIUM proporsional)
    const angle = offset * 0.38;
    const radius = 3.2;

    const targetX = Math.sin(angle) * radius;
    let targetZ = Math.cos(angle) * radius - radius + (isActive ? 0.75 : 0.2);
    let targetY = 0;

    // Floating melayang halus untuk kartu aktif
    if (isActive) {
      targetY += Math.sin(time * 2.2) * 0.04;
      targetZ += Math.cos(time * 1.8) * 0.02;
    } else {
      targetY += Math.sin(time * 1.5 + index) * 0.025;
    }

    // Rotasi target
    const targetRotY = -angle * 0.85;
    const targetRotZ = isActive ? Math.sin(time * 1.5) * 0.015 : -offset * 0.035;
    const targetRotX = isActive ? Math.sin(time * 2.0) * 0.012 : 0.03;

    // Skala target ukuran MEDIUM (tidak menutupi layar berlebihan)
    const targetScale = isActive ? 1.05 : Math.max(0.6, 0.85 - Math.abs(offset) * 0.12);

    // Animasi damp mulus
    cardGroupRef.current.position.x = THREE.MathUtils.damp(cardGroupRef.current.position.x, targetX, 5.0, delta);
    cardGroupRef.current.position.y = THREE.MathUtils.damp(cardGroupRef.current.position.y, targetY, 5.0, delta);
    cardGroupRef.current.position.z = THREE.MathUtils.damp(cardGroupRef.current.position.z, targetZ, 5.0, delta);

    cardGroupRef.current.rotation.x = THREE.MathUtils.damp(cardGroupRef.current.rotation.x, targetRotX, 5.0, delta);
    cardGroupRef.current.rotation.y = THREE.MathUtils.damp(cardGroupRef.current.rotation.y, targetRotY, 5.0, delta);
    cardGroupRef.current.rotation.z = THREE.MathUtils.damp(cardGroupRef.current.rotation.z, targetRotZ, 5.0, delta);

    const s = THREE.MathUtils.damp(cardGroupRef.current.scale.x, targetScale, 5.0, delta);
    cardGroupRef.current.scale.set(s, s, s);
  });

  // Dimensi Polaroid 3D Ukuran MEDIUM
  const cardW = 1.1;
  const cardH = 1.36;
  const cardDepth = 0.025;

  return (
    <group
      ref={cardGroupRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        if (!isActive) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Badan Kartu Polaroid 3D (Slab Putih Gading Halus) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[cardW, cardH, cardDepth]} />
        <meshStandardMaterial
          color={isActive ? '#ffffff' : '#f8fafc'}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* 2. Permukaan Foto 3D di Dalam Frame Polaroid */}
      {texture && (
        <mesh position={[0, 0.09, cardDepth / 2 + 0.002]}>
          <planeGeometry args={[cardW - 0.12, cardW - 0.12]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.35}
            metalness={0.02}
          />
        </mesh>
      )}

      {/* 3. Strip Washi Tape / Perekat Emas di Atas Kartu */}
      <mesh position={[0, cardH / 2 - 0.015, cardDepth / 2 + 0.006]} rotation={[0, 0, index % 2 === 0 ? 0.04 : -0.04]}>
        <boxGeometry args={[0.32, 0.08, 0.01]} />
        <meshStandardMaterial
          color={isActive ? '#feca57' : '#cbd5e1'}
          roughness={0.4}
          transparent={true}
          opacity={0.88}
        />
      </mesh>

      {/* 4. Drop Shadow 3D Halus di Belakang Kartu */}
      <mesh position={[0, -cardH / 2 - 0.10, -0.05]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[cardW * 1.05, 0.3]} />
        <meshBasicMaterial
          color="#000000"
          transparent={true}
          opacity={isActive ? 0.3 : 0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

interface PhotoAlbum3DProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoAlbum3D({ isOpen, onClose }: PhotoAlbum3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = TUNJUNGAN_PHOTOS.length;
  const SLIDE_INTERVAL = 3800; // 3.8 detik per foto

  // Reset indeks ke 0 setiap kali album dibuka
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
  }, [isOpen]);

  // 🔄 Auto-slide bergilir sendiri ke samping + auto-close di foto terakhir
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (activeIndex < total - 1) {
        // Geser ke foto berikutnya
        setActiveIndex((prev) => prev + 1);
      } else {
        // Sudah selesai melihat foto ke-9 (terakhir), otomatis tutup album & picu dialog pamitan
        onClose();
      }
    }, SLIDE_INTERVAL);

    return () => clearTimeout(timer);
  }, [isOpen, activeIndex, total, onClose]);

  // Keyboard navigation (Panah Kiri & Kanan, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
      } else if (e.key === 'ArrowRight') {
        if (activeIndex < total - 1) {
          setActiveIndex((prev) => prev + 1);
        } else {
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, total, onClose]);

  if (!isOpen) return null;

  const currentPhoto = TUNJUNGAN_PHOTOS[activeIndex];

  return (
    <group position={[0, 0.25, 0.7]}>
      {/* Pencahayaan Lembut Khusus Album Foto 3D */}
      <pointLight position={[0, 1.5, 2.5]} intensity={1.8} color="#fffbeb" distance={8} />
      <pointLight position={[0, -1.0, 1.8]} intensity={0.9} color="#ffd166" distance={6} />

      {/* 📸 Deretan 9 Kartu Foto Polaroid 3D dalam Carousel Melengkung */}
      {TUNJUNGAN_PHOTOS.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={index}
          activeIndex={activeIndex}
          total={total}
          onClick={() => setActiveIndex(index)}
        />
      ))}

      {/* 💬 UI Kontrol Navigasi & Caption Foto Mengambang di Atas Scene 3D */}
      <Html position={[0, -0.72, 1.2]} center distanceFactor={4.6}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            width: 'max-content',
            maxWidth: '92vw',
            animation: 'fadeIn 0.3s ease',
            pointerEvents: 'auto',
            userSelect: 'none',
          }}
        >
          {/* Caption Kartu yang Sedang Aktif: Seragam Penuh Cinta & Kasih Sayang */}
          <div
            style={{
              background: 'rgba(9, 14, 26, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(254, 202, 87, 0.8)',
              borderRadius: '9999px',
              padding: '0.35rem 1.25rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(254, 202, 87, 0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#feca57', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>📸</span>
              <span>{currentPhoto.caption}</span>
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                fontWeight: 700,
              }}
            >
              {activeIndex + 1} / {total}
            </span>
          </div>

          {/* Tombol Navigasi ◀ Previous | Dots | Next ▶ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '9999px',
              padding: '0.3rem 0.75rem',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Tombol Previous */}
            <button
              id="btn-album-prev"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                borderRadius: '9999px',
                color: '#ffffff',
                padding: '0.3rem 0.7rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
              title="Foto Sebelumnya (Panah Kiri)"
            >
              <span>◀</span>
              <span>Sebelumnya</span>
            </button>

            {/* Pagination Dots */}
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', padding: '0 0.2rem' }}>
              {TUNJUNGAN_PHOTOS.map((_, i) => (
                <div
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(i);
                  }}
                  style={{
                    width: i === activeIndex ? '16px' : '7px',
                    height: '7px',
                    borderRadius: '9999px',
                    background: i === activeIndex ? '#feca57' : 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: i === activeIndex ? '0 0 8px #feca57' : 'none',
                  }}
                  title={`Lihat Foto ${i + 1}`}
                />
              ))}
            </div>

            {/* Tombol Next */}
            <button
              id="btn-album-next"
              onClick={(e) => {
                e.stopPropagation();
                if (activeIndex < total - 1) {
                  setActiveIndex((prev) => prev + 1);
                } else {
                  onClose();
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                borderRadius: '9999px',
                color: '#ffffff',
                padding: '0.3rem 0.7rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
              title="Foto Berikutnya (Panah Kanan)"
            >
              <span>{activeIndex === total - 1 ? 'Selesai' : 'Berikutnya'}</span>
              <span>▶</span>
            </button>
          </div>

          {/* Tombol Tutup Manual & Info Otomatis (Ijo Jelas & Nyaman Diklik) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
            <button
              id="btn-album-close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 1.35rem',
                borderRadius: '9999px',
                border: '1.5px solid rgba(255, 255, 255, 0.9)',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.6), 0 0 15px rgba(52, 211, 153, 0.5)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>✨</span>
              <span>Tutup Album & Lanjut Pamitan</span>
              <span>🚪</span>
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}
