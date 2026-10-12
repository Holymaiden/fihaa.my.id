'use client';

import dynamic from 'next/dynamic';

import type { WorldContent } from '@/lib/content/types';

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
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <WorldScene
        stations={content.stations}
        counts={{
          projects: content.projects.length,
          skillGroups: content.skillGroups.length,
        }}
        loadingLabel={content.copy.loadingAssets}
      />
      <WorldHud content={content} />
    </div>
  );
};

export default WorldCanvas;
