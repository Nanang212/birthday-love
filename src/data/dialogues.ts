// ============================================================
// DATA — Dialogues per World
// ============================================================

import type { DialogueLine } from '../types';

export const openingDialogues: DialogueLine[] = [
  {
    id: 'open-01',
    speaker: 'me',
    text: 'Hey...',
    autoAdvance: true,
    delay: 2000,
  },
  {
    id: 'open-02',
    speaker: 'me',
    text: 'Aku punya sesuatu untuk kamu.',
    autoAdvance: true,
    delay: 2500,
  },
  {
    id: 'open-03',
    speaker: 'me',
    text: 'Sebuah perjalanan kecil... yang aku buat khusus untukmu. 🌟',
    autoAdvance: false,
  },
];

export const beginningDialogues: DialogueLine[] = [
  {
    id: 'begin-01',
    speaker: 'me',
    text: 'Masih ingat tempat ini?',
  },
  {
    id: 'begin-02',
    speaker: 'her',
    text: 'Tentu saja aku ingat. ❤️',
  },
  {
    id: 'begin-03',
    speaker: 'me',
    text: 'Aku waktu itu nggak pernah menyangka...',
  },
  {
    id: 'begin-04',
    speaker: 'her',
    text: 'Menyangka apa?',
  },
  {
    id: 'begin-05',
    speaker: 'me',
    text: '...kalau hari itu bakal membawa aku bertemu seseorang yang sangat berarti.',
  },
  {
    id: 'begin-06',
    speaker: 'her',
    text: '😊',
    autoAdvance: true,
    delay: 2000,
  },
];

export const journeyDialogues: DialogueLine[] = [
  {
    id: 'journey-01',
    speaker: 'me',
    text: 'Kita sudah pergi ke banyak tempat bersama...',
  },
  {
    id: 'journey-02',
    speaker: 'her',
    text: 'Iya... dan setiap tempat punya kenangan tersendiri.',
  },
  {
    id: 'journey-03',
    speaker: 'me',
    text: 'Dunia mana yang mau kita kunjungi lagi?',
  },
];

export const bollywoodDialogues: DialogueLine[] = [
  {
    id: 'bollywood-01',
    speaker: 'me',
    text: 'Kalau hidup kita adalah sebuah film...',
  },
  {
    id: 'bollywood-02',
    speaker: 'her',
    text: 'Mungkin film Bollywood? 😂',
  },
  {
    id: 'bollywood-03',
    speaker: 'me',
    text: 'Mungkin ini salah satu scene favoritku.',
  },
  {
    id: 'bollywood-04',
    speaker: 'her',
    text: 'Kenapa?',
  },
  {
    id: 'bollywood-05',
    speaker: 'me',
    text: 'Karena pemeran utamanya adalah kamu. ✨',
  },
];

export const memoriesDialogues: DialogueLine[] = [
  {
    id: 'memories-01',
    speaker: 'me',
    text: 'Kenangan adalah salah satu hal yang aku hargai paling besar.',
  },
  {
    id: 'memories-02',
    speaker: 'her',
    text: 'Aku juga. 🌙',
  },
  {
    id: 'memories-03',
    speaker: 'me',
    text: 'Setiap foto ini menyimpan sebuah momen yang nyata.',
  },
  {
    id: 'memories-04',
    speaker: 'me',
    text: 'Momen bersamamu.',
  },
];

export const neverSaidDialogues: DialogueLine[] = [
  {
    id: 'never-01',
    speaker: 'me',
    text: 'Ada hal-hal yang seringkali susah aku ucapkan...',
  },
  {
    id: 'never-02',
    speaker: 'me',
    text: 'Bukan karena aku tidak merasakannya.',
  },
  {
    id: 'never-03',
    speaker: 'me',
    text: 'Tapi karena beberapa perasaan terlalu besar untuk kata-kata biasa.',
  },
  {
    id: 'never-04',
    speaker: 'me',
    text: 'Jadi malam ini... izinkan aku mencoba.',
  },
  {
    id: 'never-05',
    speaker: 'me',
    text: 'Terima kasih sudah ada.',
  },
  {
    id: 'never-06',
    speaker: 'me',
    text: 'Terima kasih sudah memilihku setiap harinya.',
  },
  {
    id: 'never-07',
    speaker: 'me',
    text: 'Kamu bukan sekadar bagian dari hidupku.',
  },
  {
    id: 'never-08',
    speaker: 'me',
    text: 'Kamu adalah salah satu alasan aku ingin menjadi lebih baik. ❤️',
  },
];

export const birthdayDialogues: DialogueLine[] = [
  {
    id: 'bday-01',
    speaker: 'me',
    text: 'Dan di ujung perjalanan ini...',
    autoAdvance: true,
    delay: 2500,
  },
  {
    id: 'bday-02',
    speaker: 'me',
    text: 'Ada satu hal yang ingin aku katakan.',
    autoAdvance: true,
    delay: 3000,
  },
  {
    id: 'bday-03',
    speaker: 'me',
    text: 'Selamat ulang tahun, [HER_NAME]. 🎂',
    autoAdvance: false,
  },
  {
    id: 'bday-04',
    speaker: 'me',
    text: 'Aku harap harimu seindah kamu.',
    autoAdvance: false,
  },
];
