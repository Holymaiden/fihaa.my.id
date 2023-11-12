import { NextPage } from "next";

import Container from "@/common/components/elements/Container";
import BlogDetail from "@/modules/blog/components/BlogDetail";
import BlogContainer from "@/modules/blog/components/BlogContainer";

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

const BlogDetailPage: NextPage<BlogDetailPageProps> = ({
  params,
}: {
  params: { slug: string };
}) => {
  return (
    <>
      <Container data-aos="fade-up">
        <BlogContainer slug={params.slug}>
          <BlogDetail slug={params.slug} />
        </BlogContainer>
      </Container>
    </>
  );
};

export default BlogDetailPage;
