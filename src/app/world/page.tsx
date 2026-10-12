import type { Metadata, NextPage } from 'next';
import Link from 'next/link';

import { to2d } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Dunia 3D | Fihaa Portfolio',
};

// Placeholder until the 3D scene lands.
const WorldPage: NextPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 font-sora">
      <h1 className="text-2xl font-bold">Dunia 3D sedang dibangun</h1>
      <Link href={to2d()} className="underline">
        Ke Dunia 2D
      </Link>
    </main>
  );
};

export default WorldPage;
