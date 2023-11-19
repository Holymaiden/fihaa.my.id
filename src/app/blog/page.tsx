import { NextPage, Metadata } from "next";

import Container from "@/common/components/elements/Container";
import BlogList from "@/modules/blog";
import { loadMdxFiles } from "@/common/libs/mdx";
import { Suspense } from "react";
import Loading from "@/common/components/elements/Loading";

export const metadata: Metadata = {
  title: "Blog - Fihaa Portfolio",
  description: "Blog - Fihaa Portfolio",
};

const BlogPage: NextPage = async () => {
  const content = await loadMdxFiles("blogs", "");

  const sortedContents = content.sort(
    (a: any, b: any) => b.frontMatter.id - a.frontMatter.id
  );

  return (
    <>
      <Container className="xl:!-mt-5" data-aos="fade-up">
        <Suspense fallback={<Loading />}>
          <BlogList content={sortedContents} />
        </Suspense>
      </Container>
    </>
  );
};

export default BlogPage;
