import { NextPage } from "next";

import Container from "@/common/components/elements/Container";
import BlogDetail from "@/modules/blog/components/BlogDetail";
import BlogContainer from "@/modules/blog/components/BlogContainer";
import { loadMdxFile } from "@/common/libs/mdx";
import Loading from "@/common/components/elements/Loading";

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

const BlogDetailPage: NextPage<BlogDetailPageProps> = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const content = await loadMdxFile("blogs/", params.slug);

  if (!content) {
    return <Loading />;
  }

  return (
    <>
      <Container data-aos="fade-up">
        <BlogContainer slug={params.slug}>
          <BlogDetail slug={params.slug} content={content} />
        </BlogContainer>
      </Container>
    </>
  );
};

export default BlogDetailPage;
