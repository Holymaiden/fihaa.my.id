"use client";

import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import { useDraggable } from "react-use-draggable-scroll";

import BlogCardSkeleton from "@/common/components/skeleton/BlogCardSkeleton";
import { BlogItemProps } from "@/common/types/blog";
import BlogCard from "@/modules/blog/components/BlogCard";
import { BLOG_ITEMS } from "@/common/constant/blog";

const BlogCarousel = () => {
  const data = BLOG_ITEMS;
  const isLoading = false;

  const blogData: BlogItemProps[] = useMemo(() => {
    return data || [];
  }, [data]);

  const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { events } = useDraggable(ref);

  const renderBlogCards = () => {
    if (isLoading) {
      return Array.from({ length: 3 }, (_, index) => (
        <BlogCardSkeleton key={index} />
      ));
    }

    return blogData.map((item, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
      >
        <BlogCard view="grid" isExcerpt={false} isCarousel={true} {...item} />
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
