// ============================================================
// DATA — Capybara Dialogues & Easter Eggs
// ============================================================

import type { DialogueLine } from '../types';

export const capyName = 'Capy';

// Easter egg clicks (3 klik berurutan)
export const capyEasterEggDialogues: DialogueLine[][] = [
  // Klik 1
  [{ id: 'capy-ee-1', speaker: 'capy', text: 'Hmm? 👀' }],
  // Klik 2
  [{ id: 'capy-ee-2', speaker: 'capy', text: 'Kenapa?' }],
  // Klik 3
  [{ id: 'capy-ee-3', speaker: 'capy', text: "Aku capek. Kamu aja yang jalan. 💤" }],
];

// Dialog Capy per world
export const capyWorldDialogues: Record<string, DialogueLine[]> = {
  opening: [
    { id: 'capy-open-1', speaker: 'capy', text: '✨ ✨ ✨' },
    { id: 'capy-open-2', speaker: 'capy', text: 'Psst...' },
    { id: 'capy-open-3', speaker: 'capy', text: 'Ikuti aku.' },
  ],
  beginning: [
    { id: 'capy-begin-1', speaker: 'capy', text: 'Oh, akhirnya kamu datang. 😄' },
    { id: 'capy-begin-2', speaker: 'capy', text: 'Aku punya sesuatu untuk kamu lihat.' },
  ],
  journey: [
    { id: 'capy-journey-1', speaker: 'capy', text: '🎒 Siap petualangan? Ayo kita jalan-jalan!' },
  ],
  bollywood: [
    { id: 'capy-bollywood-1', speaker: 'capy', text: '✨ Namasté!' },
    { id: 'capy-bollywood-2', speaker: 'capy', text: 'Kalau hidup ini film Bollywood... 🕺' },
  ],
  memories: [
    { id: 'capy-memories-1', speaker: 'capy', text: '📷 Senyum dulu!' },
    { id: 'capy-memories-2', speaker: 'capy', text: '*click* 📸' },
  ],
  'never-said': [
    // Capy diam di sini - silent companion
  ],
  birthday: [
    { id: 'capy-birthday-1', speaker: 'capy', text: '🎂 Aku bawa sesuatu...' },
    { id: 'capy-birthday-2', speaker: 'capy', text: 'Selamat ulang tahun! ❤️' },
  ],

  // Scene lucu (World Memories)
  funScene: [
    { id: 'capy-fun-1', speaker: 'capy', text: '...' },
    { id: 'capy-fun-2', speaker: 'capy', text: 'Kamu mau lihat sesuatu?' },
    { id: 'capy-fun-3', speaker: 'capy', text: '... Dia cantik ya. 🥰❤️' },
    { id: 'capy-fun-4', speaker: 'me', text: 'Iya.' },
    { id: 'capy-fun-5', speaker: 'capy', text: 'Beruntung banget kamu.' },
    { id: 'capy-fun-6', speaker: 'me', text: '...iya. 😄' },
  ],
};

// Capy outfit per world (untuk 3D accessories)
export type CapyOutfit = 'normal' | 'backpack' | 'camera' | 'bollywood' | 'cake';

export const capyOutfitPerWorld: Record<string, CapyOutfit> = {
  opening: 'normal',
  beginning: 'normal',
  journey: 'backpack',
  bollywood: 'bollywood',
  memories: 'camera',
  'never-said': 'normal',
  birthday: 'cake',
};
