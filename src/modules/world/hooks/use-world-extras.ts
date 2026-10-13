'use client';

import { useEffect, useRef } from 'react';

import type { WorldCopy } from '@/lib/content/types';

import { AmbientEngine } from '../audio/ambient-engine';
import { CRYSTALS } from '../config/crystals';
import { VISUAL } from '../config/visual';
import { useWorldStore } from '../store/world-store';
import { useEffectsEnabled } from './use-effects-enabled';

const CRYSTAL_KEY = 'world-crystals';
const TOAST_SECONDS = 4;

const isNight = () => document.documentElement.classList.contains('dark');

// Music and nature sounds follow the sound toggle, the weather and the
// theme (day/night).
export const useAmbientSound = () => {
  const soundOn = useWorldStore((state) => state.soundOn);
  const weather = useWorldStore((state) => state.weather);
  const crystals = useWorldStore((state) => state.crystals.length);
  const engine = useRef<AmbientEngine | null>(null);
  const lastCrystals = useRef(crystals);

  useEffect(() => {
    if (soundOn) {
      engine.current ??= new AmbientEngine();
      engine.current.start();
    } else {
      engine.current?.stop();
    }
  }, [soundOn]);

  useEffect(() => {
    const update = () =>
      engine.current?.setMood({
        night: isNight(),
        rain: weather === 'rain' ? 1 : 0,
        mist: weather === 'mist' ? 1 : 0,
      });
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [weather, soundOn]);

  useEffect(() => {
    if (crystals > lastCrystals.current) {
      engine.current?.chime();
    }
    lastCrystals.current = crystals;
  }, [crystals]);

  useEffect(() => () => engine.current?.dispose(), []);
};

// Starts the 360° tour after a while without any input on the island view.
export const useIdleTour = (enabled: boolean) => {
  const effects = useEffectsEnabled();
  const startTour = useWorldStore((state) => state.startTour);

  useEffect(() => {
    if (!enabled || !effects) {
      return;
    }
    let timer = 0;
    const restart = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const state = useWorldStore.getState();
        if (
          state.mode === 'island' &&
          !state.activeStation &&
          !document.querySelector('dialog[open]')
        ) {
          startTour();
        }
      }, VISUAL.tour.idleStart * 1000);
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel'] as const;
    events.forEach((name) => window.addEventListener(name, restart));
    restart();
    return () => {
      window.clearTimeout(timer);
      events.forEach((name) => window.removeEventListener(name, restart));
    };
  }, [enabled, effects, startTour]);
};

// Remembers found crystals and cheers each find (and the last one).
export const useCrystalProgress = (copy: WorldCopy) => {
  const crystals = useWorldStore((state) => state.crystals);
  const restoreCrystals = useWorldStore((state) => state.restoreCrystals);
  const showToast = useWorldStore((state) => state.showToast);
  const restored = useRef(false);
  const previous = useRef(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(CRYSTAL_KEY) ?? '[]',
      ) as unknown;
      if (Array.isArray(saved)) {
        const ids = saved.filter((id): id is string =>
          CRYSTALS.some((spot) => spot.id === id),
        );
        previous.current = ids.length;
        restoreCrystals(ids);
      }
    } catch {
      // Storage unavailable: progress just isn't remembered.
    }
    restored.current = true;
  }, [restoreCrystals]);

  useEffect(() => {
    if (!restored.current) {
      return;
    }
    try {
      window.localStorage.setItem(CRYSTAL_KEY, JSON.stringify(crystals));
    } catch {
      // ignore
    }
    if (crystals.length > previous.current) {
      const total = CRYSTALS.length;
      showToast(
        crystals.length === total
          ? copy.crystalsComplete
          : copy.crystalFound
              .replace('{found}', String(crystals.length))
              .replace('{total}', String(total)),
      );
    }
    previous.current = crystals.length;
  }, [crystals, showToast, copy]);
};

// Hides the toast after a few seconds.
export const useToastTimeout = () => {
  const toast = useWorldStore((state) => state.toast);
  const showToast = useWorldStore((state) => state.showToast);
  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(
      () => showToast(null),
      TOAST_SECONDS * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [toast, showToast]);
};
