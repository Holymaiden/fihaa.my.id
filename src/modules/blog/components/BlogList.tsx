"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import useSWR from "swr";

import BlogCardSkeleton from "@/common/components/skeleton/BlogCardSkeleton";
import BlogFeaturedHeroSkeleton from "@/common/components/skeleton/BlogFeaturedHeroSkeleton";
import { BlogItemProps } from "@/common/types/blog";
import { fetcher } from "@/services/fetcher";

import BlogCard from "./BlogCard";
import BlogFeaturedHero from "./BlogFeaturedHero";
import { BLOG_ITEMS } from "@/common/constant/blog";

const BlogList = () => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);

  const data = BLOG_ITEMS.slice(0, page * pageSize);
  const isLoading = false;

  const blogData: BlogItemProps[] = useMemo(() => {
    if (data && Array.isArray(data)) {
      return data;
    }
    return [];
  }, [data]);

  return (
    <div className="space-y-10 sm:pb-10">
      {!isLoading ? (
        <BlogFeaturedHero data={blogData} />
      ) : (
        <BlogFeaturedHeroSkeleton />
      )}

      <div className="space-y-5">
        <h2 className="text-xl font-sora font-medium px-1">Latest Article</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {!isLoading ? (
            <>
              {blogData?.map((item: BlogItemProps, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <BlogCard {...item} />
                </motion.div>
              ))}
            </>
          ) : (
            <>
              {new Array(3).fill(0).map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogList;
