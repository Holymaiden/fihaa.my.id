import React, { useMemo } from "react";

import BlogFeaturedHeroSkeleton from "@/common/components/skeleton/BlogFeaturedHeroSkeleton";
import { BlogItemProps } from "@/common/types/blog";

import BlogFeaturedHero from "./BlogFeaturedHero";
import { BLOG_ITEMS } from "@/common/constant/blog";

const BlogFeaturedSection = () => {
  const data = BLOG_ITEMS.slice(0, 3);

  const featuredData: BlogItemProps[] = useMemo(() => {
    if (data && Array.isArray(data)) {
      return data;
    }
    return [];
  }, [data]);

  return (
    <>
      {!data || data.length !== 0 ? (
        <BlogFeaturedHero data={featuredData} />
      ) : (
        <BlogFeaturedHeroSkeleton />
      )}
    </>
  );
};

export default BlogFeaturedSection;
