import type { Metadata, NextPage } from 'next';

import WorldCanvas from '@/modules/world';
import WorldSwitchLink from '@/modules/world/components/world-switch-link';

export const metadata: Metadata = {
  title: '3D World | Fihaa Portfolio',
  description:
    'Explore the portfolio of M. Fiqri Haikhar Anwar as an interactive 3D world.',
};

const WorldPage: NextPage = () => {
  return (
    <main className="relative font-sora">
      <h1 className="sr-only">3D World</h1>
      <WorldCanvas />
      <WorldSwitchLink
        to="2d"
        className="absolute left-4 top-4 rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
      >
        Switch to 2D
      </WorldSwitchLink>
    </main>
  );
};

export default WorldPage;
