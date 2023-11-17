import { NextPage } from "next";

import Container from "@/common/components/elements/Container";
import BlogList from "@/modules/blog";
import { loadMdxFiles } from "@/common/libs/mdx";
import { Suspense } from "react";
import Loading from "@/common/components/elements/Loading";

const BlogPage: NextPage = async () => {
  const content = await loadMdxFiles("blogs", "");
  return (
    <>
      <Container className="xl:!-mt-5" data-aos="fade-up">
        <Suspense fallback={<Loading />}>
          <BlogList content={content} />
        </Suspense>
      </Container>
    </>
  );
};

export default BlogPage;
