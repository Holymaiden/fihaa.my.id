'use client';

import dynamic from 'next/dynamic';

import WorldLoading from './world-loading';

// three/R3F hanya dimuat di klien dan hanya di route /world.
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
