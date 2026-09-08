// ============================================================
// APP — Root component
// ============================================================

import './index.css';
import './App.css';

import { StoryProvider, useStory } from './hooks/useStory';
import { SceneTransition } from './components/scene/SceneTransition';

import { OpeningWorld } from './worlds/Opening/OpeningWorld';
import { BeginningWorld } from './worlds/Beginning/BeginningWorld';
import { ConcertWorld } from './worlds/Concert/ConcertWorld';
import { JourneyWorld } from './worlds/Journey/JourneyWorld';
// import { BollywoodWorld } from './worlds/Bollywood/BollywoodWorld';
// import { MemoriesWorld } from './worlds/Memories/MemoriesWorld';
// import { NeverSaidWorld } from './worlds/NeverSaid/NeverSaidWorld';
// import { BirthdayWorld } from './worlds/Birthday/BirthdayWorld';

import { useState, useEffect, useRef } from 'react';
import type { WorldId } from './types';

const WORLDS_CONFIG: { id: WorldId; name: string; icon: string; path: string }[] = [
  { id: 'opening', name: 'Awal Cerita', icon: '🏠', path: '/opening' },
  { id: 'beginning', name: 'Surabaya (Suro & Boyo)', icon: '🐊', path: '/beginning' },
  { id: 'concert', name: 'Konser & Kenangan', icon: '🎸', path: '/concert' },
  { id: 'journey', name: 'Taipei & Surat Cinta', icon: '🏮', path: '/journey' },
];

/* ── Navigasi / Route Switcher Cepat Untuk Testing & Loncat Antar World ── */
function RouteNavigator() {
  const { state, goToWorld } = useStory();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentConfig = WORLDS_CONFIG.find((w) => w.id === state.currentWorld) || WORLDS_CONFIG[0];

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        right: '0.75rem',
        zIndex: 9999,
        fontFamily: "'Quicksand', 'Outfit', sans-serif",
      }}
    >
      <button
        id="btn-route-navigator"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(254, 202, 87, 0.75)',
          color: '#ffffff',
          borderRadius: '9999px',
          padding: '0.42rem 0.95rem',
          fontSize: '0.76rem',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          boxShadow: '0 6px 20px rgba(0,0,0,0.65), 0 0 14px rgba(254, 202, 87, 0.35)',
          transition: 'all 0.25s ease',
          userSelect: 'none',
        }}
      >
        <span>{currentConfig.icon}</span>
        <span style={{ color: '#ffd166' }}>{currentConfig.name}</span>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 'min(90vw, 290px)',
            background: 'rgba(11, 19, 38, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(254, 202, 87, 0.6)',
            borderRadius: '16px',
            padding: '0.55rem',
            boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(254, 202, 87, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              padding: '0.35rem 0.55rem',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>🧭 Lompat Perjalanan</span>
            <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Direct Path</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {WORLDS_CONFIG.map((w) => {
              const isActive = w.id === state.currentWorld;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    setIsOpen(false);
                    if (!isActive) goToWorld(w.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '10px',
                    border: isActive ? '1.5px solid #38bdf8' : '1px solid transparent',
                    background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: isActive ? '#38bdf8' : '#f1f5f9',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem' }}>{w.icon}</span>
                    <span>{w.name}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color: isActive ? '#38bdf8' : '#64748b',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {w.path}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              padding: '0.4rem 0.55rem 0.2rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.64rem',
              color: '#94a3b8',
              lineHeight: 1.35,
            }}
          >
            💡 <strong style={{ color: '#ffd166' }}>Tips:</strong> Kamu juga bisa langsung ketik di URL browser, misal: <code style={{ color: '#38bdf8' }}>/journey</code> atau <code style={{ color: '#38bdf8' }}>/concert</code>!
          </div>
        </div>
      )}
    </div>
  );
}

/* ── World Renderer ── */
function WorldRenderer() {
  const { state } = useStory();

  switch (state.currentWorld) {
    case 'opening': return <OpeningWorld />;
    case 'beginning': return <BeginningWorld />;
    case 'concert': return <ConcertWorld />;
    case 'journey': return <JourneyWorld />;
    // case 'bollywood':  return <BollywoodWorld />;
    // case 'memories':   return <MemoriesWorld />;
    // case 'never-said': return <NeverSaidWorld />;
    // case 'birthday':   return <BirthdayWorld />;
    default: return <OpeningWorld />;
  }
}

/* ── Inner App (needs story context) ── */
function AppInner() {
  const { state } = useStory();

  return (
    <>
      {/* Route Navigator Cepat untuk Tester & Pengguna */}
      <RouteNavigator />

      {/* Scene transition overlay */}
      <SceneTransition isVisible={state.isTransitioning} />

      {/* World */}
      <WorldRenderer />
    </>
  );
}

/* ── Root App ── */
export default function App() {
  return (
    <StoryProvider>
      <AppInner />
    </StoryProvider>
  );
}
