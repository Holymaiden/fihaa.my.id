import type { Metadata, NextPage } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ROUTE_WORLD, SITE_URL, to2d } from '@/lib/routes';
import { WORLD_MODE_COOKIE } from '@/lib/world-mode/cookie';
import { isWorldMode } from '@/lib/world-mode/types';
import WorldPicker from '@/modules/landing';

export const metadata: Metadata = {
  title: 'M. Fiqri Haikhar Anwar - Software Engineer Portfolio',
  description:
    'Portfolio of M. Fiqri Haikhar Anwar, a Software Engineer from Makassar, Indonesia. Explore it as a classic 2D site or as an interactive 3D world.',
  alternates: {
    canonical: SITE_URL,
  },
};

interface LandingPageProps {
  searchParams: Promise<{ choose?: string }>;
}

const LandingPage: NextPage<LandingPageProps> = async ({ searchParams }) => {
  const { choose } = await searchParams;
  const cookieStore = await cookies();
  const lastMode = cookieStore.get(WORLD_MODE_COOKIE)?.value;

  // Returning visitors go straight back to the world they picked last.
  // `/?choose` always shows the picker.
  if (choose === undefined && isWorldMode(lastMode)) {
    redirect(lastMode === '3d' ? ROUTE_WORLD : to2d());
  }

  return (
    <main id="main-content">
      <WorldPicker />
    </main>
  );
};

export default LandingPage;
