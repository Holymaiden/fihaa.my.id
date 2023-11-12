"use client";

import BackButton from "@/common/components/elements/BackButton";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const BlogContainer = ({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) => {
  const searchParams = useSearchParams();
  const id: number = parseInt(searchParams.get("id") || "0");
  const incrementViews = () => {
    try {
      axios.post(`/api/views?id=${id}&slug=${slug}`);
    } catch (error) {
      //       console.error("Failed to update views count:", error);
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      incrementViews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <BackButton url="/blog" />
      {children}
    </>
  );
};

export default BlogContainer;
