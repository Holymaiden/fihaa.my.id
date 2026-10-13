'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// false on the server and during hydration, true afterwards.
const useHasMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export default useHasMounted;
