import 'react-loading-skeleton/dist/skeleton.css';

import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';

type SkeletonLoaderProps = {
  children: ReactNode;
};

const SkeletonLoader = ({ children }: SkeletonLoaderProps) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const baseColor = isLight
    ? 'var(--color-skeleton-base-light)'
    : 'var(--color-skeleton-base-dark)';
  const highlightColor = isLight
    ? 'var(--color-skeleton-highlight-light)'
    : 'var(--color-skeleton-highlight-dark)';

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      {children}
    </SkeletonTheme>
  );
};

export default SkeletonLoader;
