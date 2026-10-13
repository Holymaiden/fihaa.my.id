'use client';

import BackButton from '@/common/components/elements/BackButton';
import { to2d } from '@/lib/routes';
const BlogContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <BackButton url={to2d('/blog')} />
      {children}
    </>
  );
};

export default BlogContainer;
