import type { Metadata } from 'next';

import { getWorldContent } from '@/lib/content/world-content';
import { ROUTE_WORLD } from '@/lib/routes';
import WorldCanvas from '@/modules/world';
import WorldSwitchLink from '@/modules/world/components/world-switch-link';

const TITLE = '3D World | Fihaa Portfolio';
const DESCRIPTION =
  'Explore the portfolio of M. Fiqri Haikhar Anwar as an interactive 3D world: a quest board of projects, a skill tree, a travel journal and a tavern mailbox.';
const OG_IMAGE = {
  url: '/images/og-world.jpg',
  width: 1200,
  height: 630,
  alt: 'Floating islands of the 3D portfolio world',
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ROUTE_WORLD },
  openGraph: {
    type: 'website',
    url: ROUTE_WORLD,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Fihaa Portfolio',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
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
