'use client';

import type { WorldCopy } from '@/lib/content/types';

import { useStationTurn } from '../hooks/use-station-turn';

interface WorldTurnControlsProps {
  copy: WorldCopy;
  // Hidden on phones while the bottom panel is open.
  hidden: boolean;
}

const buttonClass =
  'h-10 w-10 rounded-full border border-neutral-300 bg-light/90 text-lg hover:border-accent dark:border-neutral-700 dark:bg-dark/90';

// ← / → buttons that turn the island to the previous/next station.
const WorldTurnControls = ({ copy, hidden }: WorldTurnControlsProps) => {
  const turn = useStationTurn();

  return (
    <div
      className={`absolute bottom-28 left-1/2 z-10 -translate-x-1/2 items-center gap-3 md:bottom-6 ${
        hidden ? 'hidden md:flex' : 'flex'
      }`}
    >
      <button
        type="button"
        aria-label={copy.previousPlace}
        onClick={() => turn(-1)}
        className={buttonClass}
      >
        ←
      </button>
      <p className="hidden text-2xs text-neutral-700 dark:text-neutral-300 md:block">
        {copy.turnHint}
      </p>
      <button
        type="button"
        aria-label={copy.nextPlace}
        onClick={() => turn(1)}
        className={buttonClass}
      >
        →
      </button>
    </div>
  );
};

export default WorldTurnControls;
