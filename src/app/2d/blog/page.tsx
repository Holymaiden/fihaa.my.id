import type { Metadata, NextPage } from 'next';
import { Suspense } from 'react';

import Container from '@/common/components/elements/Container';
import Loading from '@/common/components/elements/Loading';
import { loadMdxFiles } from '@/common/libs/mdx';
import { type BlogDetailProps } from '@/common/types/blog';
import BlogList from '@/modules/blog';

export const metadata: Metadata = {
  title: 'Blog - Fihaa Portfolio',
  description: 'Blog - Fihaa Portfolio',
};

const BlogPage: NextPage = async () => {
  const content = await loadMdxFiles<BlogDetailProps>('blogs', '');

  const sortedContents = content.sort(
    (a, b) => b.frontMatter.id - a.frontMatter.id,
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
