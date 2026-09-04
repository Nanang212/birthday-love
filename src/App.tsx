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
import { BollywoodWorld } from './worlds/Bollywood/BollywoodWorld';
import { MemoriesWorld } from './worlds/Memories/MemoriesWorld';
import { NeverSaidWorld } from './worlds/NeverSaid/NeverSaidWorld';
import { BirthdayWorld } from './worlds/Birthday/BirthdayWorld';

/* ── World Renderer ── */
function WorldRenderer() {
  const { state } = useStory();

  switch (state.currentWorld) {
    case 'opening':    return <OpeningWorld />;
    case 'beginning':  return <BeginningWorld />;
    case 'concert':    return <ConcertWorld />;
    case 'journey':    return <JourneyWorld />;
    case 'bollywood':  return <BollywoodWorld />;
    case 'memories':   return <MemoriesWorld />;
    case 'never-said': return <NeverSaidWorld />;
    case 'birthday':   return <BirthdayWorld />;
    default:           return <OpeningWorld />;
  }
}

/* ── Inner App (needs story context) ── */
function AppInner() {
  const { state } = useStory();

  return (
    <>
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
