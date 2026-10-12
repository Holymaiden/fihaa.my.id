import type { Metadata, NextPage } from 'next';
import { cookies } from 'next/headers';

import { SITE_URL } from '@/lib/routes';
import { WORLD_MODE_COOKIE } from '@/lib/world-mode/cookie';
import { isWorldMode } from '@/lib/world-mode/types';
import WorldPicker from '@/modules/landing';

export const metadata: Metadata = {
  title: 'M. Fiqri Haikhar Anwar - Software Engineer Portfolio',
  alternates: {
    canonical: SITE_URL,
  },
};

const LandingPage: NextPage = async () => {
  const cookieStore = await cookies();
  const lastMode = cookieStore.get(WORLD_MODE_COOKIE)?.value;

  return (
    <main id="main-content">
      <WorldPicker lastMode={isWorldMode(lastMode) ? lastMode : null} />
    </main>
  );
};

export default LandingPage;
