'use client';

import { useSyncExternalStore } from 'react';

import { NARROW_MAX_WIDTH } from '../config/camera';

const QUERY = `(max-width: ${NARROW_MAX_WIDTH - 1}px)`;

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

// Phones and narrow windows (below Tailwind's md); false on the server.
export const useNarrowScreen = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
