'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { ROUTE_WORLD, to2d } from '@/lib/routes';
import type { WorldMode } from '@/lib/world-mode/types';
import { rememberWorldMode } from '@/lib/world-mode/world-mode-store';

interface WorldSwitchLinkProps {
  to: WorldMode;
  // 2D only: page under /2d, e.g. '/projects'.
  path?: string;
  className?: string;
  children: ReactNode;
}

const WorldSwitchLink = ({
  to,
  path,
  className,
  children,
}: WorldSwitchLinkProps) => {
  return (
    <Link
      href={to === '3d' ? ROUTE_WORLD : to2d(path)}
      // no prefetch, so the 3D page doesn't pull in the 2D one (and vice versa)
      prefetch={false}
      onClick={() => rememberWorldMode(to)}
      className={className}
      data-umami-event={`Switch World: ${to}`}
    >
      {children}
    </Link>
  );
};

export default WorldSwitchLink;
