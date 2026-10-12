'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { WorldContent } from '@/lib/content/types';

import { useWebGLSupport } from '../hooks/use-webgl-support';
import WorldErrorBoundary from './world-error-boundary';
import WorldFallback from './world-fallback';
import WorldHud from './world-hud';
import WorldLoading from './world-loading';

interface WorldCanvasProps {
  content: WorldContent;
}

// The scene (and three.js) is client only and only loaded on /world.
const WorldScene = dynamic(() => import('./world-scene'), {
  ssr: false,
  loading: () => <WorldLoading />,
});

const WorldCanvas = ({ content }: WorldCanvasProps) => {
  const webgl = useWebGLSupport();
  const [contextLost, setContextLost] = useState(false);
  const errorFallback = <WorldFallback reason="error" copy={content.copy} />;

  const renderScene = () => {
    if (webgl === null) {
      return <WorldLoading />;
    }
    if (!webgl) {
      return <WorldFallback reason="unsupported" copy={content.copy} />;
    }
    if (contextLost) {
      return errorFallback;
    }
    return (
      <WorldErrorBoundary fallback={errorFallback}>
        <WorldScene
          stations={content.stations}
          counts={{
            projects: content.projects.length,
            skillGroups: content.skillGroups.length,
          }}
          loadingLabel={content.copy.loadingAssets}
          onContextLost={() => setContextLost(true)}
        />
      </WorldErrorBoundary>
    );
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {renderScene()}
      {/* The HTML layer works without the scene, so it always renders. */}
      <WorldHud content={content} />
    </div>
  );
};

export default WorldCanvas;
