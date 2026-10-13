'use client';

import { useState } from 'react';
import {
  LuChevronLeft,
  LuChevronRight,
  LuFootprints,
  LuMap,
  LuMountainSnow,
  LuOrbit,
  LuWaves,
} from 'react-icons/lu';

import type { WorldContent } from '@/lib/content/types';

import type { ScenicViewpointId } from '../config/viewpoints';
import { frontViewpoint, SCENIC_VIEWPOINTS } from '../config/viewpoints';
import { useStationTurn } from '../hooks/use-station-turn';
import { useWorldStore } from '../store/world-store';
import { islandTurn } from './scene/island-turn';
import { STATION_ICONS } from './ui/station-icons';
import { GLASS, ICON_BUTTON } from './ui/styles';

interface WorldDockProps {
  content: WorldContent;
  // Lets the HUD put focus back here when a place closes.
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  // Explore mode needs the 3D scene.
  sceneShown: boolean;
}

export const DOCK_MENU_ID = 'world-places-menu';

const SCENIC_ICONS = {
  waterfall: LuWaves,
  meadow: LuMountainSnow,
} as const satisfies Record<ScenicViewpointId, unknown>;

// Bottom dock: ← / → walk the places, the middle shows where you are, the
// map button lists every place (the keyboard route to all of them), and
// the last button steps onto the island or back out.
const WorldDock = ({ content, menuButtonRef, sceneShown }: WorldDockProps) => {
  const { stations, copy } = content;
  const activeStation = useWorldStore((state) => state.activeStation);
  const openStation = useWorldStore((state) => state.openStation);
  const mode = useWorldStore((state) => state.mode);
  const viewpoint = useWorldStore((state) => state.viewpoint);
  const goTo = useWorldStore((state) => state.goTo);
  const enterExplore = useWorldStore((state) => state.enterExplore);
  const exitExplore = useWorldStore((state) => state.exitExplore);
  const turn = useStationTurn();
  const [menuOpen, setMenuOpen] = useState(false);
  const exploring = mode === 'explore';
  const current = stations.find((station) => station.id === activeStation);
  const scenic =
    exploring && !current
      ? SCENIC_VIEWPOINTS.find((id) => id === viewpoint)
      : undefined;
  const CurrentIcon = current
    ? STATION_ICONS[current.id]
    : scenic
      ? SCENIC_ICONS[scenic]
      : LuMap;
  const currentName = current
    ? current.id === 'secret'
      ? current.title
      : current.label
    : scenic
      ? copy.scenicPlaces[scenic]
      : copy.placesMenu;

  const toggleMode = () => {
    if (exploring) {
      exitExplore();
    } else {
      enterExplore(activeStation ?? frontViewpoint(islandTurn.angle));
    }
  };

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
          {exploring &&
            SCENIC_VIEWPOINTS.map((id) => {
              const Icon = SCENIC_ICONS[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={id === scenic ? 'true' : undefined}
                    onClick={() => {
                      setMenuOpen(false);
                      goTo(id);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent/15 aria-[current=true]:bg-accent aria-[current=true]:text-light"
                  >
                    <Icon aria-hidden />
                    {copy.scenicPlaces[id]}
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
          className={`${GLASS} flex min-w-36 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-800 hover:text-accent dark:text-neutral-100 md:min-w-44`}
        >
          <CurrentIcon aria-hidden className="text-accent" />
          {currentName}
        </button>
        <button
          type="button"
          aria-label={copy.nextPlace}
          onClick={() => turn(1)}
          className={ICON_BUTTON}
        >
          <LuChevronRight aria-hidden />
        </button>
        {sceneShown && (
          <button
            type="button"
            aria-pressed={exploring}
            aria-label={exploring ? copy.islandViewLabel : copy.exploreLabel}
            title={exploring ? copy.islandViewLabel : copy.exploreLabel}
            onClick={toggleMode}
            className="flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-light shadow-lg shadow-black/20 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {exploring ? <LuOrbit aria-hidden /> : <LuFootprints aria-hidden />}
            <span className="hidden sm:inline">
              {exploring ? copy.islandView : copy.explore}
            </span>
          </button>
        )}
      </div>
      {sceneShown && (!current || exploring) && (
        <p className="max-w-md text-center text-2xs text-neutral-700 drop-shadow dark:text-neutral-300">
          {exploring ? copy.exploreHint : copy.turnHint}
        </p>
      )}
    </div>
  );
};

export default WorldDock;
