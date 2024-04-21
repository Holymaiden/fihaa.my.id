'use client';

import BackButton from '@/common/components/elements/BackButton';
const BlogContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <BackButton url="/blog" />
      {children}
    </>
  );
};

export default BlogContainer;
