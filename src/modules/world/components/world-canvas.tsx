'use client';

import dynamic from 'next/dynamic';

import WorldLoading from './world-loading';

// Client only, and only loaded on /world.
const WorldScene = dynamic(() => import('./world-scene'), {
  ssr: false,
  loading: () => <WorldLoading />,
});

const WorldCanvas = () => {
  return (
    <div className="h-screen w-full">
      <WorldScene />
    </div>
  );
};

export default WorldCanvas;
