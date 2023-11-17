import React, { useMemo } from "react";

import BlogFeaturedHeroSkeleton from "@/common/components/skeleton/BlogFeaturedHeroSkeleton";

import BlogFeaturedHero from "./BlogFeaturedHero";
import { MdxFileProps } from "@/common/libs/mdx";

const BlogFeaturedSection = ({ content }: MdxFileProps[] | any) => {
  const featuredData: MdxFileProps[] = useMemo(() => {
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
