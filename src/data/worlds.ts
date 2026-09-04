// ============================================================
// DATA — World Configurations
// ============================================================

import type { WorldConfig } from '../types';
import {
  openingDialogues,
  beginningDialogues,
  journeyDialogues,
  bollywoodDialogues,
  memoriesDialogues,
  neverSaidDialogues,
  birthdayDialogues,
} from './dialogues';
import { memories } from './memories';

export const worlds: WorldConfig[] = [
  {
    id: 'opening',
    title: 'The Beginning of a Journey',
    dialogues: openingDialogues,
    memories: [],
    nextWorld: 'beginning',
  },
  {
    id: 'beginning',
    title: 'Our Beginning',
    dialogues: beginningDialogues,
    memories: [memories[0]],
    nextWorld: 'journey',
  },
  {
    id: 'journey',
    title: 'Our Journey',
    dialogues: journeyDialogues,
    memories: [memories[1]],
    nextWorld: 'bollywood',
  },
  {
    id: 'bollywood',
    title: 'Bollywood World',
    dialogues: bollywoodDialogues,
    memories: [],
    nextWorld: 'memories',
  },
  {
    id: 'memories',
    title: 'Our Memories',
    dialogues: memoriesDialogues,
    memories: memories,
    nextWorld: 'never-said',
  },
  {
    id: 'never-said',
    title: 'Things I Never Said',
    dialogues: neverSaidDialogues,
    memories: [],
    nextWorld: 'birthday',
  },
  {
    id: 'birthday',
    title: 'Birthday Finale',
    dialogues: birthdayDialogues,
    memories: [],
    nextWorld: undefined,
  },
];

export const getWorldById = (id: string): WorldConfig | undefined =>
  worlds.find((w) => w.id === id);
