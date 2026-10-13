import type { WorldCopy } from '@/lib/content/types';

import WorldSwitchLink from './world-switch-link';

interface WorldFallbackProps {
  reason: 'unsupported' | 'error';
  copy: WorldCopy;
}

// Shown instead of the canvas when WebGL is missing or the scene crashed.
const WorldFallback = ({ reason, copy }: WorldFallbackProps) => {
  return (
    <div
      role="alert"
      className="flex h-full w-full items-center justify-center p-6"
    >
      <div className="max-w-md space-y-3 text-center">
        <p className="font-medium">
          {reason === 'unsupported'
            ? copy.fallbackUnsupported
            : copy.fallbackError}
        </p>
        <p className="text-meta text-neutral-600 dark:text-neutral-400">
          {copy.fallbackHint}
        </p>
        <WorldSwitchLink
          to="2d"
          className="inline-block rounded-md border border-accent px-4 py-2 text-sm text-accent hover:bg-accent hover:text-light"
        >
          {copy.fallbackCta}
        </WorldSwitchLink>
      </div>
    </div>
  );
};

export default WorldFallback;
