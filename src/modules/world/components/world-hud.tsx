'use client';

import { useEffect, useRef } from 'react';
import { LuSparkles } from 'react-icons/lu';

import type { WorldContent } from '@/lib/content/types';

import {
  useEffectsEnabled,
  useEffectsPreferenceStorage,
} from '../hooks/use-effects-enabled';
import { useNarrowScreen } from '../hooks/use-narrow-screen';
import { useStationTurn } from '../hooks/use-station-turn';
import { useWorldStore } from '../store/world-store';
import StationCard, { CARD_TITLE_ID } from './station-card';
import { ICON_BUTTON } from './ui/styles';
import WorldCredits from './world-credits';
import WorldDetails, { DETAILS_TITLE_ID } from './world-details';
import WorldDock from './world-dock';

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
  const setEffectsPreference = useWorldStore(
    (state) => state.setEffectsPreference,
  );
  const effectsEnabled = useEffectsEnabled();
  useEffectsPreferenceStorage();
  const isNarrow = useNarrowScreen();
  const turn = useStationTurn();
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
      if (event.key === 'Escape') {
        if (useWorldStore.getState().detailsOpen) {
          closeDetails();
        } else {
          closeStation();
        }
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        turn(event.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closeStation, closeDetails, turn]);

  const station = stations.find((item) => item.id === activeStation);
  const showSheetCard = station && !detailsOpen && (isNarrow || !sceneShown);

  return (
    <>
      <div className="absolute right-4 top-4 z-30 flex gap-2">
        {sceneShown && (
          <button
            type="button"
            aria-pressed={effectsEnabled}
            aria-label={effectsEnabled ? copy.effectsOn : copy.effectsOff}
            title={effectsEnabled ? copy.effectsOn : copy.effectsOff}
            onClick={() => setEffectsPreference(!effectsEnabled)}
            className={`${ICON_BUTTON} ${effectsEnabled ? '' : 'opacity-60'}`}
          >
            <LuSparkles aria-hidden />
          </button>
        )}
        <WorldCredits credits={content.credits} copy={copy} />
      </div>

      {showSheetCard && (
        <div className="absolute inset-x-4 bottom-20 z-20 mx-auto max-h-[55vh] max-w-md overflow-y-auto">
          <StationCard station={station} content={content} variant="sheet" />
        </div>
      )}

      {station && detailsOpen && (
        <WorldDetails station={station} content={content} />
      )}

      <WorldDock content={content} menuButtonRef={menuButtonRef} />
    </>
  );
};

export default WorldHud;
