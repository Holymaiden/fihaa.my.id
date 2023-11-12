import { NextPage } from "next";

import Container from "@/common/components/elements/Container";
import BlogListNew from "@/modules/blog/components/BlogList";

const BlogPage: NextPage = () => {
  return (
    <>
      <Container className="xl:!-mt-5" data-aos="fade-up">
        <BlogListNew />
      </Container>
    </>
  );
};

export default BlogPage;
