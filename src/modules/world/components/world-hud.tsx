'use client';

import { useEffect, useRef } from 'react';

import type { WorldContent, WorldStationId } from '@/lib/content/types';

import {
  useEffectsEnabled,
  useEffectsPreferenceStorage,
} from '../hooks/use-effects-enabled';
import { useStationTurn } from '../hooks/use-station-turn';
import { useWorldStore } from '../store/world-store';
import StationBody, { stationHasContent } from './panels/station-body';
import WorldCredits from './world-credits';
import WorldSwitchLink from './world-switch-link';
import WorldTurnControls from './world-turn-controls';

interface WorldHudProps {
  content: WorldContent;
}

// HTML layer over the canvas: station list, station panel and keyboard
// handling. Works even before (or without) the 3D scene.
const WorldHud = ({ content }: WorldHudProps) => {
  const { stations, copy } = content;
  const activeStation = useWorldStore((state) => state.activeStation);
  const openStation = useWorldStore((state) => state.openStation);
  const closeStation = useWorldStore((state) => state.closeStation);
  const setHoveredStation = useWorldStore((state) => state.setHoveredStation);
  const setEffectsPreference = useWorldStore(
    (state) => state.setEffectsPreference,
  );
  const effectsEnabled = useEffectsEnabled();
  useEffectsPreferenceStorage();

  const turn = useStationTurn();

  const headingRef = useRef<HTMLHeadingElement>(null);
  const buttonRefs = useRef(new Map<WorldStationId, HTMLButtonElement>());
  const lastStation = useRef<WorldStationId | null>(null);

  // Move focus into the panel when it opens, and back to the station's
  // button when it closes.
  useEffect(() => {
    if (activeStation) {
      headingRef.current?.focus();
    } else if (lastStation.current) {
      buttonRefs.current.get(lastStation.current)?.focus();
    }
    lastStation.current = activeStation;
  }, [activeStation]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) {
        // Esc inside the credits dialog only closes the dialog.
        return;
      }
      if (event.key === 'Escape') {
        closeStation();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        turn(event.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closeStation, turn]);

  const station = stations.find((item) => item.id === activeStation);

  return (
    <>
      <nav
        aria-label={copy.stationListLabel}
        className={`absolute inset-x-4 bottom-4 z-10 md:inset-x-auto md:bottom-auto md:left-4 md:top-16 ${
          station ? 'hidden md:block' : ''
        }`}
      >
        <ul className="flex flex-wrap gap-2 md:flex-col">
          {stations.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                ref={(node) => {
                  if (node) {
                    buttonRefs.current.set(item.id, node);
                  } else {
                    buttonRefs.current.delete(item.id);
                  }
                }}
                aria-current={item.id === activeStation ? 'true' : undefined}
                onClick={() => openStation(item.id)}
                onPointerEnter={() => setHoveredStation(item.id)}
                onPointerLeave={() => setHoveredStation(null)}
                onFocus={() => setHoveredStation(item.id)}
                onBlur={() => setHoveredStation(null)}
                className="rounded-md border border-neutral-300 bg-light/90 px-3 py-1.5 text-sm hover:border-accent aria-[current=true]:border-accent aria-[current=true]:text-accent dark:border-neutral-700 dark:bg-dark/90"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {station && (
        <section
          aria-labelledby="world-panel-title"
          className="absolute inset-x-0 bottom-0 z-20 max-h-[65vh] overflow-y-auto rounded-t-lg border-t border-neutral-300 bg-light/95 p-4 dark:border-neutral-700 dark:bg-dark/95 md:inset-y-4 md:left-auto md:right-4 md:max-h-none md:w-96 md:rounded-lg md:border"
        >
          <button
            type="button"
            onClick={closeStation}
            className="text-sm text-neutral-600 underline underline-offset-2 hover:text-accent dark:text-neutral-400"
          >
            ← {copy.back}
          </button>
          <h2
            id="world-panel-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-subheading font-semibold outline-none"
          >
            {station.title}
          </h2>
          <p className="mt-1 text-meta text-neutral-600 dark:text-neutral-400">
            {station.summary}
          </p>
          <div className="mt-4">
            {stationHasContent(station.id, content) ? (
              <StationBody id={station.id} content={content} />
            ) : (
              <p className="text-meta italic">{station.emptyMessage}</p>
            )}
          </div>
          <p className="mt-6 flex flex-wrap justify-between gap-2 text-2xs text-neutral-500">
            <WorldSwitchLink
              to="2d"
              path={station.path2d}
              className="underline underline-offset-2 hover:text-accent"
            >
              {copy.openIn2d}
            </WorldSwitchLink>
            <span className="hidden md:inline">{copy.escapeHint}</span>
          </p>
        </section>
      )}

      <button
        type="button"
        aria-pressed={effectsEnabled}
        onClick={() => setEffectsPreference(!effectsEnabled)}
        className="absolute right-24 top-4 z-10 rounded-md border border-neutral-300 bg-light/90 px-3 py-1.5 text-2xs hover:border-accent dark:border-neutral-700 dark:bg-dark/90 md:bottom-4 md:left-24 md:right-auto md:top-auto"
      >
        {effectsEnabled ? copy.effectsOn : copy.effectsOff}
      </button>
      <WorldTurnControls copy={copy} hidden={Boolean(station)} />
      <WorldCredits credits={content.credits} copy={copy} />
    </>
  );
};

export default WorldHud;
