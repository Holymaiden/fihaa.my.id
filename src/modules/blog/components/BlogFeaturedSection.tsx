import React, { useMemo } from 'react';

import BlogFeaturedHeroSkeleton from '@/common/components/skeleton/BlogFeaturedHeroSkeleton';
import type { MdxFileProps } from '@/common/libs/mdx';
import { type BlogDetailProps } from '@/common/types/blog';

import BlogFeaturedHero from './BlogFeaturedHero';

type BlogFeaturedHeroProps = {
  content: MdxFileProps<BlogDetailProps>[];
};

const BlogFeaturedSection = ({ content }: BlogFeaturedHeroProps) => {
  const featuredData: MdxFileProps<BlogDetailProps>[] = useMemo(() => {
    if (content && Array.isArray(content)) {
      return content;
    }
    return [];
  }, [content]);

  return (
    <>
      {!content || content.length !== 0 ? (
        <BlogFeaturedHero data={featuredData} />
      ) : (
        <BlogFeaturedHeroSkeleton />
      )}
    </>
  );
};

export default BlogFeaturedSection;
