"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useWindowSize } from "usehooks-ts";

import EmptyState from "@/common/components/elements/EmptyState";
import Loading from "@/common/components/elements/Loading";
import { useBlogViewStore } from "@/common/stores/useBlogViewStore";
import { BlogItemProps } from "@/common/types/blog";

import BlogCard from "./BlogCard";
import BlogListHeader from "./BlogListHeader";
import Pagination from "./Pagination";

type BlogList = {
  showHeader?: boolean;
  showPagination?: boolean;
  perPage?: number;
};

const BlogList = ({
  perPage = 6,
  showHeader = true,
  showPagination = true,
}: BlogList) => {
  const { width } = useWindowSize();
  const isMobile = width < 468;

  const { viewOption, setViewOption } = useBlogViewStore();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(perPage);

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
    if (data && Array.isArray(data)) {
      return data;
    }
    return [];
  }, [data]);

  const handleNextPage = () => {
    setPage(page + 1);
    scrollToTop();
  };

  const handlePrevPage = () => {
    setPage(page - 1);
    scrollToTop();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <Loading />;

  if (!isLoading && blogData.length === 0) {
    return <EmptyState message="No Data" />;
  }

  return (
    <>
      {showHeader && !isMobile && (
        <BlogListHeader viewOption={viewOption} setViewOption={setViewOption} />
      )}

      <div
        className={clsx(
          "gap-5 sm:gap-4",
          viewOption === "list" || isMobile
            ? "flex flex-col"
            : "grid grid-cols-2 sm:!gap-5"
        )}
      >
        {blogData?.map((item: BlogItemProps, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <BlogCard view={viewOption} {...item} />
          </motion.div>
        ))}
      </div>

      {showPagination && (
        <Pagination
          page={page}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          blogData={blogData}
          pageSize={pageSize}
        />
      )}
    </>
  );
};

export default BlogList;
