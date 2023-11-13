import { NextPage } from "next";

import Container from "@/common/components/elements/Container";
import BlogList from "@/modules/blog";

const BlogPage: NextPage = () => {
  return (
    <>
      <Container className="xl:!-mt-5" data-aos="fade-up">
        <BlogList />
      </Container>
    </>
  );
};

export default BlogPage;
