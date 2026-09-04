// ============================================================
// TYPES — Project Ultah
// ============================================================

export type Speaker = 'me' | 'her' | 'capy';

export interface DialogueLine {
  id: string;
  speaker: Speaker;
  text: string;
  autoAdvance?: boolean;
  delay?: number; // ms before auto-advance
}

export interface Memory {
  id: string;
  type: 'photo' | 'video';
  src: string;
  thumbnail?: string;
  title?: string;
  caption?: string;
  dialogues?: DialogueLine[];
}

export type WorldId =
  | 'opening'
  | 'beginning'
  | 'concert'
  | 'journey'
  | 'bollywood'
  | 'memories'
  | 'never-said'
  | 'birthday';

export interface WorldConfig {
  id: WorldId;
  title: string;
  dialogues: DialogueLine[];
  memories: Memory[];
  nextWorld?: WorldId;
}

export interface StoryState {
  currentWorld: WorldId;
  currentDialogueIndex: number;
  currentMemory: Memory | null;
  visitedWorlds: WorldId[];
  lastExitedWorld?: WorldId | null;
  isPlayingVideo: boolean;
  audioEnabled: boolean;
  isTransitioning: boolean;
  capyClickCount: number;
  isCapyDialogueOpen: boolean;
  isLoading: boolean;
}

export type StoryAction =
  | { type: 'SET_WORLD'; world: WorldId }
  | { type: 'NEXT_DIALOGUE' }
  | { type: 'SET_DIALOGUE_INDEX'; index: number }
  | { type: 'OPEN_MEMORY'; memory: Memory }
  | { type: 'CLOSE_MEMORY' }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'SET_TRANSITIONING'; value: boolean }
  | { type: 'CLICK_CAPY' }
  | { type: 'CLOSE_CAPY_DIALOGUE' }
  | { type: 'SET_LOADING'; value: boolean };
