"use client";

import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import { useDraggable } from "react-use-draggable-scroll";

import BlogCardNewSkeleton from "@/common/components/skeleton/BlogCardSkeleton";
import { BlogItemProps } from "@/common/types/blog";
import BlogCard from "@/modules/blog/components/BlogCard";
import useSWR from "swr";
import { fetcher } from "@/services/fetcher";

const BlogCarousel = () => {
  const { data, isLoading } = useSWR(`/api/blog?page=1&per_page=4`, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
  });

  const blogData: BlogItemProps[] = useMemo(() => {
    return data?.data?.posts || [];
  }, [data]);

  const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { events } = useDraggable(ref);

  const renderBlogCards = () => {
    if (isLoading) {
      return Array.from({ length: 3 }, (_, index) => (
        <BlogCardNewSkeleton key={index} />
      ));
    }

    return blogData.map((item, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className="min-w-[326px] gap-x-5"
      >
        <BlogCard {...item} />
      </motion.div>
    ));
  };

  return (
    <div
      className="flex p-1 gap-4 overflow-x-scroll scrollbar-hide"
      {...events}
      ref={ref}
    >
      {renderBlogCards()}
    </div>
  );
};

export default BlogCarousel;
