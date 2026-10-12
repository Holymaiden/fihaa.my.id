import type { Metadata, NextPage } from 'next';
import Link from 'next/link';

import { to2d } from '@/lib/routes';
import WorldCanvas from '@/modules/world';

export const metadata: Metadata = {
  title: 'Dunia 3D | Fihaa Portfolio',
};

const WorldPage: NextPage = () => {
  return (
    <main className="relative font-sora">
      <h1 className="sr-only">Dunia 3D</h1>
      <WorldCanvas />
      {/* Tanpa prefetch agar /world tidak ikut memuat aset halaman 2D. */}
      <Link
        href={to2d()}
        prefetch={false}
        className="absolute left-4 top-4 rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
      >
        Ke Dunia 2D
      </Link>
    </main>
  );
};

export default WorldPage;
