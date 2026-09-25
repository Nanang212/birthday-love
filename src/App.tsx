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
      className="fixed top-[calc(0.75rem+env(safe-area-inset-top,0px))] right-3 z-[9999] font-[var(--font-body)]"
    >
      {/* Trigger button */}
      <button
        id="btn-route-navigator"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[rgba(15,23,42,0.92)] backdrop-blur-md border border-[rgba(254,202,87,0.75)] text-white rounded-full px-4 py-1.5 text-xs font-extrabold cursor-pointer flex items-center gap-2 shadow-[0_6px_20px_rgba(0,0,0,0.65),0_0_14px_rgba(254,202,87,0.35)] transition-all duration-200 select-none hover:scale-105 active:scale-95"
      >
        <span>{currentConfig.icon}</span>
        <span className="text-[#ffd166]">{currentConfig.name}</span>
        <span className="text-[0.65rem] text-slate-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[min(90vw,290px)] bg-[rgba(11,19,38,0.96)] backdrop-blur-xl border border-[rgba(254,202,87,0.6)] rounded-2xl p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(254,202,87,0.25)] flex flex-col gap-1 animate-[fadeIn_0.2s_ease]">
          {/* Header */}
          <div className="px-2 py-1.5 text-[0.68rem] font-extrabold text-slate-400 uppercase tracking-widest border-b border-white/10 flex justify-between items-center">
            <span>🧭 Lompat Perjalanan</span>
            <span className="text-[0.62rem] text-slate-500">Direct Path</span>
          </div>

          {/* World list */}
          <div className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto">
            {WORLDS_CONFIG.map((w) => {
              const isActive = w.id === state.currentWorld;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    setIsOpen(false);
                    if (!isActive) goToWorld(w.id);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer text-left transition-all duration-150
                    ${isActive
                      ? 'border border-sky-400 bg-sky-400/15 text-sky-400 font-extrabold'
                      : 'border border-transparent text-slate-100 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{w.icon}</span>
                    <span>{w.name}</span>
                  </div>
                  <span className={`text-[0.65rem] bg-black/30 px-1.5 py-0.5 rounded font-mono ${isActive ? 'text-sky-400' : 'text-slate-500'}`}>
                    {w.path}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer tip */}
          <div className="px-2 py-1 border-t border-white/10 text-[0.64rem] text-slate-400 leading-snug">
            💡 <strong className="text-[#ffd166]">Tips:</strong> Kamu juga bisa langsung ketik di URL browser, misal: <code className="text-sky-400">/journey</code> atau <code className="text-sky-400">/concert</code>!
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
