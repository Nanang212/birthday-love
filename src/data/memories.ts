// ============================================================
// DATA — Memories (placeholder photos & videos)
// ============================================================

import type { Memory } from '../types';

export const memories: Memory[] = [
  {
    id: 'memory-001',
    type: 'photo',
    src: '/memories/photos/photo-001.webp',
    thumbnail: '/memories/photos/photo-001.webp',
    title: 'A beautiful day ☀️',
    caption: '[MEMORY_TEXT_001]',
    dialogues: [
      { id: 'mem-001-1', speaker: 'me', text: 'Masih ingat hari ini?' },
      { id: 'mem-001-2', speaker: 'her', text: 'Iya! Itu hari yang menyenangkan banget.' },
      { id: 'mem-001-3', speaker: 'me', text: 'Aku juga suka banget momen ini. ❤️' },
    ],
  },
  {
    id: 'memory-002',
    type: 'photo',
    src: '/memories/photos/photo-002.webp',
    thumbnail: '/memories/photos/photo-002.webp',
    title: '[SPECIAL_PLACE]',
    caption: '[MEMORY_TEXT_002]',
    dialogues: [
      { id: 'mem-002-1', speaker: 'me', text: 'Tempat ini spesial buatku.' },
      { id: 'mem-002-2', speaker: 'her', text: 'Sama. Aku mau ke sini lagi. 🌸' },
    ],
  },
  {
    id: 'memory-003',
    type: 'photo',
    src: '/memories/photos/photo-003.webp',
    thumbnail: '/memories/photos/photo-003.webp',
    title: 'Together 💕',
    caption: '[MEMORY_TEXT_003]',
    dialogues: [
      { id: 'mem-003-1', speaker: 'me', text: 'Kita sudah melewati banyak hal bersama.' },
      { id: 'mem-003-2', speaker: 'her', text: 'Dan masih banyak lagi yang kita akan lewati. 😊' },
    ],
  },
  {
    id: 'memory-video-001',
    type: 'video',
    src: '/memories/videos/video-001.mp4',
    thumbnail: '/memories/photos/video-001-thumb.webp',
    title: 'A little video 🎬',
    caption: '[MEMORY_TEXT_VIDEO_001]',
    dialogues: [
      { id: 'mem-vid-001-1', speaker: 'me', text: 'Ini favoritku.' },
      { id: 'mem-vid-001-2', speaker: 'her', text: 'Haha itu lucu banget! 😄' },
    ],
  },
];
