"use client";

import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import { useDraggable } from "react-use-draggable-scroll";

import BlogCardSkeleton from "@/common/components/skeleton/BlogCardSkeleton";
import { BlogItemProps } from "@/common/types/blog";
import BlogCard from "@/modules/blog/components/BlogCard";

const BlogCarousel = () => {
  const data = [
    {
      type_of: "post",
      id: 1,
      title: "Title 1",
      description: "Description 1",
      published: true,
      published_at: "2022-01-01",
      slug: "title-1",
      path: "title-1",
      url: "https://example.com",
      comments_count: 10,
      public_reactions_count: 10,
      page_views_count: 10,
      published_timestamp: "2022-01-01",
      body_markdown: "Body 1",
      positive_reactions_count: 10,
      cover_image: "/images/placeholder.png",
      tag_list: ["tag 1", "tag 2"],
      canonical_url: "https://example.com",
      reading_time_minutes: 10,
      user: {
        name: "John Doe",
        username: "johndoe",
        twitter_username: "johndoe",
        github_username: "johndoe",
        user_id: 1,
        website_url: "https://example.com",
        profile_image: "/images/placeholder.png",
        profile_image_90: "/images/placeholder.png",
      },
      db_views_count: 100,
      total_views_count: 100,
    },
  ];
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
