"use client";

import BackButton from "@/common/components/elements/BackButton";
const BlogContainer = ({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) => {
  return (
    <>
      <BackButton url="/blog" />
      {children}
    </>
  );
};

export default BlogContainer;
