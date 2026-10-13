'use client';

import { useSyncExternalStore } from 'react';

const DEFAULT_MAX_WIDTH = 1024;

const subscribe = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

// false on the server and during hydration, like before.
const useIsMobile = (maxWidth = DEFAULT_MAX_WIDTH) =>
  useSyncExternalStore(
    subscribe,
    () => window.innerWidth < maxWidth,
    () => false,
  );

export default useIsMobile;
