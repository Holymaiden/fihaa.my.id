import type { Metadata, NextPage } from 'next';

import Container from '@/common/components/elements/Container';
import Loading from '@/common/components/elements/Loading';
import { loadMdxFile } from '@/common/libs/mdx';
import { type BlogDetailProps } from '@/common/types/blog';
import BlogContainer from '@/modules/blog/components/BlogContainer';
import BlogDetail from '@/modules/blog/components/BlogDetail';

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await loadMdxFile<BlogDetailProps>('blogs/', slug);

  if (!content) {
    return {
      title: 'Blog | Fihaa Portfolio',
      description: 'Blog | Fihaa Portfolio',
    };
  }

  return {
    title: `${content.frontMatter.title} | Fihaa Portfolio`,
    description: content.frontMatter.title,
  };
}

const BlogDetailPage: NextPage<BlogDetailPageProps> = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const content = await loadMdxFile<BlogDetailProps>('blogs/', slug);

  if (!content) {
    return <Loading />;
  }

  return (
    <>
      <Container data-aos="fade-up">
        <BlogContainer>
          <BlogDetail content={content} />
        </BlogContainer>
      </Container>
    </>
  );
};

export default BlogDetailPage;
