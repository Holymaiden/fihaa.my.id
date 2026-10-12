'use client';

import { useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuMap } from 'react-icons/lu';

import type { WorldContent } from '@/lib/content/types';

import { useStationTurn } from '../hooks/use-station-turn';
import { useWorldStore } from '../store/world-store';
import { STATION_ICONS } from './ui/station-icons';
import { GLASS, ICON_BUTTON } from './ui/styles';

interface WorldDockProps {
  content: WorldContent;
  // Lets the HUD put focus back here when a place closes.
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const DOCK_MENU_ID = 'world-places-menu';

// Bottom dock: ← / → walk the places, the middle shows where you are, and
// the map button lists every place (the keyboard route to all of them).
const WorldDock = ({ content, menuButtonRef }: WorldDockProps) => {
  const { stations, copy } = content;
  const activeStation = useWorldStore((state) => state.activeStation);
  const openStation = useWorldStore((state) => state.openStation);
  const turn = useStationTurn();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = stations.find((station) => station.id === activeStation);
  const CurrentIcon = current ? STATION_ICONS[current.id] : LuMap;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2 px-4">
      {menuOpen && (
        <ul
          id={DOCK_MENU_ID}
          className={`${GLASS} pointer-events-auto grid w-full max-w-sm grid-cols-2 gap-1 rounded-2xl p-2`}
        >
          {stations.map((station) => {
            const Icon = STATION_ICONS[station.id];
            return (
              <li key={station.id}>
                <button
                  type="button"
                  aria-current={
                    station.id === activeStation ? 'true' : undefined
                  }
                  onClick={() => {
                    setMenuOpen(false);
                    openStation(station.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent/15 aria-[current=true]:bg-accent aria-[current=true]:text-light"
                >
                  <Icon aria-hidden />
                  {station.id === 'secret' ? station.title : station.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          aria-label={copy.previousPlace}
          onClick={() => turn(-1)}
          className={ICON_BUTTON}
        >
          <LuChevronLeft aria-hidden />
        </button>
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls={DOCK_MENU_ID}
          onClick={() => setMenuOpen((open) => !open)}
          className={`${GLASS} flex min-w-44 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-800 hover:text-accent dark:text-neutral-100`}
        >
          <CurrentIcon aria-hidden className="text-accent" />
          {current
            ? current.id === 'secret'
              ? current.title
              : current.label
            : copy.placesMenu}
        </button>
        <button
          type="button"
          aria-label={copy.nextPlace}
          onClick={() => turn(1)}
          className={ICON_BUTTON}
        >
          <LuChevronRight aria-hidden />
        </button>
      </div>
      {!current && (
        <p className="hidden text-2xs text-neutral-700 drop-shadow dark:text-neutral-300 md:block">
          {copy.turnHint}
        </p>
      )}
    </div>
  );
};

export default WorldDock;
