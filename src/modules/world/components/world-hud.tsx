'use client';

import { useEffect, useRef } from 'react';

import type { WorldContent } from '@/lib/content/types';

import { useEffectsPreferenceStorage } from '../hooks/use-effects-enabled';
import { useNarrowScreen } from '../hooks/use-narrow-screen';
import { useStationTurn } from '../hooks/use-station-turn';
import {
  useAmbientSound,
  useCrystalProgress,
  useIdleTour,
  useToastTimeout,
} from '../hooks/use-world-extras';
import { useWorldStore } from '../store/world-store';
import StationCard, { CARD_TITLE_ID } from './station-card';
import { GLASS } from './ui/styles';
import WorldControls from './world-controls';
import WorldDetails, { DETAILS_TITLE_ID } from './world-details';
import WorldDock from './world-dock';
import WorldEntrance from './world-entrance';
import WorldVeil from './world-veil';

interface WorldHudProps {
  content: WorldContent;
  // False when WebGL is missing or the scene failed: the card then shows
  // here instead of floating in the world.
  sceneShown: boolean;
}

// Focus an element that may mount a frame or two later (the floating card
// renders through drei's Html).
const focusWhenReady = (id: string) => {
  let tries = 0;
  const attempt = () => {
    const element = document.getElementById(id);
    if (element) {
      element.focus({ preventScroll: true });
    } else if (tries++ < 20) {
      requestAnimationFrame(attempt);
    }
  };
  requestAnimationFrame(attempt);
};

// HTML layer over the canvas: dock, card, details panel, settings and
// keyboard handling. Works even before (or without) the 3D scene.
const WorldHud = ({ content, sceneShown }: WorldHudProps) => {
  const { stations, copy } = content;
  const activeStation = useWorldStore((state) => state.activeStation);
  const detailsOpen = useWorldStore((state) => state.detailsOpen);
  const closeStation = useWorldStore((state) => state.closeStation);
  const closeDetails = useWorldStore((state) => state.closeDetails);
  const exitExplore = useWorldStore((state) => state.exitExplore);
  useEffectsPreferenceStorage();
  const isNarrow = useNarrowScreen();
  const turn = useStationTurn();
  const toast = useWorldStore((state) => state.toast);
  const entered = useWorldStore((state) => state.entered);
  useAmbientSound();
  useIdleTour(sceneShown && entered);
  useCrystalProgress(copy);
  useToastTimeout();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const hadStation = useRef(false);

  // Focus follows what opens: card → details → back to card → dock.
  useEffect(() => {
    if (activeStation) {
      focusWhenReady(detailsOpen ? DETAILS_TITLE_ID : CARD_TITLE_ID);
    } else if (hadStation.current) {
      menuButtonRef.current?.focus();
    }
    hadStation.current = activeStation !== null;
  }, [activeStation, detailsOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) {
        // Esc inside the credits dialog only closes the dialog.
        return;
      }
      if (useWorldStore.getState().mode === 'tour') {
        // Any key ends the tour.
        useWorldStore.getState().stopTour();
        return;
      }
      if (event.key === 'Escape') {
        const state = useWorldStore.getState();
        if (state.detailsOpen) {
          closeDetails();
        } else if (state.activeStation) {
          closeStation();
        } else if (state.mode === 'explore') {
          // Nothing open while exploring: step back out to the island.
          exitExplore();
        }
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        turn(event.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closeStation, closeDetails, exitExplore, turn]);

  const station = stations.find((item) => item.id === activeStation);
  const showSheetCard = station && !detailsOpen && (isNarrow || !sceneShown);

  return (
    <>
      <WorldVeil />
      {sceneShown && <WorldEntrance content={content} />}
      <WorldControls content={content} sceneShown={sceneShown} />
      {toast && (
        <p
          role="status"
          className={`${GLASS} pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium text-neutral-800 dark:text-neutral-100`}
        >
          {toast}
        </p>
      )}

      {showSheetCard && (
        <div className="absolute inset-x-4 bottom-20 z-20 mx-auto max-h-[55vh] max-w-md overflow-y-auto">
          <StationCard station={station} content={content} variant="sheet" />
        </div>
      )}

      {station && detailsOpen && (
        <WorldDetails station={station} content={content} />
      )}

      {/* The entrance screen comes first; the dock after. */}
      {(entered || !sceneShown) && (
        <WorldDock
          content={content}
          menuButtonRef={menuButtonRef}
          sceneShown={sceneShown}
        />
      )}
    </>
  );
};

export default WorldHud;
