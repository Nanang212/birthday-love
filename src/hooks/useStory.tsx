// ============================================================
// HOOK — useStory (Global Story State)
// ============================================================

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { StoryState, StoryAction, WorldId, Memory } from '../types';

const initialState: StoryState = {
  currentWorld: 'opening',
  currentDialogueIndex: 0,
  currentMemory: null,
  visitedWorlds: [],
  lastExitedWorld: null,
  isPlayingVideo: false,
  audioEnabled: false,
  isTransitioning: false,
  capyClickCount: 0,
  isCapyDialogueOpen: false,
  isLoading: true,
};

function storyReducer(state: StoryState, action: StoryAction): StoryState {
  switch (action.type) {
    case 'SET_WORLD':
      return {
        ...state,
        currentWorld: action.world,
        lastExitedWorld: state.currentWorld,
        currentDialogueIndex: 0,
        currentMemory: null,
        visitedWorlds: state.visitedWorlds.includes(action.world)
          ? state.visitedWorlds
          : [...state.visitedWorlds, action.world],
        capyClickCount: 0,
        isCapyDialogueOpen: false,
      };

    case 'NEXT_DIALOGUE':
      return {
        ...state,
        currentDialogueIndex: state.currentDialogueIndex + 1,
      };

    case 'SET_DIALOGUE_INDEX':
      return {
        ...state,
        currentDialogueIndex: action.index,
      };

    case 'OPEN_MEMORY':
      return {
        ...state,
        currentMemory: action.memory,
      };

    case 'CLOSE_MEMORY':
      return {
        ...state,
        currentMemory: null,
        isPlayingVideo: false,
      };

    case 'TOGGLE_AUDIO':
      return {
        ...state,
        audioEnabled: !state.audioEnabled,
      };

    case 'SET_TRANSITIONING':
      return {
        ...state,
        isTransitioning: action.value,
      };

    case 'CLICK_CAPY': {
      const newCount = (state.capyClickCount + 1) % 4; // reset after 3
      return {
        ...state,
        capyClickCount: newCount,
        isCapyDialogueOpen: newCount > 0,
      };
    }

    case 'CLOSE_CAPY_DIALOGUE':
      return {
        ...state,
        isCapyDialogueOpen: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.value,
      };

    default:
      return state;
  }
}

interface StoryContextType {
  state: StoryState;
  dispatch: React.Dispatch<StoryAction>;
  goToWorld: (world: WorldId) => void;
  nextDialogue: () => void;
  openMemory: (memory: Memory) => void;
  closeMemory: () => void;
  clickCapy: () => void;
}

const StoryContext = createContext<StoryContextType | null>(null);

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storyReducer, initialState);

  const goToWorld = (world: WorldId) => {
    dispatch({ type: 'SET_TRANSITIONING', value: true });
    setTimeout(() => {
      dispatch({ type: 'SET_WORLD', world });
      setTimeout(() => {
        dispatch({ type: 'SET_TRANSITIONING', value: false });
      }, 800);
    }, 800);
  };

  const nextDialogue = () => dispatch({ type: 'NEXT_DIALOGUE' });
  const openMemory = (memory: Memory) => dispatch({ type: 'OPEN_MEMORY', memory });
  const closeMemory = () => dispatch({ type: 'CLOSE_MEMORY' });
  const clickCapy = () => dispatch({ type: 'CLICK_CAPY' });

  return (
    <StoryContext.Provider
      value={{ state, dispatch, goToWorld, nextDialogue, openMemory, closeMemory, clickCapy }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export function useStory(): StoryContextType {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error('useStory must be used inside StoryProvider');
  return ctx;
}
