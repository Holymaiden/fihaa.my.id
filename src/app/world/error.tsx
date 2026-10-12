'use client';

import { getWorldCopy } from '@/lib/content/world';
import WorldFallback from '@/modules/world/components/world-fallback';

// Route-level safety net for errors outside the scene's own boundary.
const WorldError = () => (
  <main className="h-dvh font-sora">
    <WorldFallback reason="error" copy={getWorldCopy()} />
  </main>
);

export default WorldError;
