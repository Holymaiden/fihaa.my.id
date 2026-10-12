import type { Metadata } from 'next';

import { getWorldContent } from '@/lib/content/world-content';
import WorldCanvas from '@/modules/world';
import WorldSwitchLink from '@/modules/world/components/world-switch-link';

export const metadata: Metadata = {
  title: '3D World | Fihaa Portfolio',
  description:
    'Explore the portfolio of M. Fiqri Haikhar Anwar as an interactive 3D world.',
};

const WorldPage = async () => {
  const content = await getWorldContent();

  return (
    <main className="relative font-sora">
      <h1 className="sr-only">{content.copy.heading}</h1>
      {/* Always visible, also when WebGL fails. */}
      <WorldSwitchLink
        to="2d"
        className="absolute left-4 top-4 z-30 rounded-md border border-neutral-300 bg-light/90 px-3 py-1.5 text-sm hover:border-accent dark:border-neutral-700 dark:bg-dark/90"
      >
        {content.copy.switchTo2d}
      </WorldSwitchLink>
      <WorldCanvas content={content} />
    </main>
  );
};

export default WorldPage;
