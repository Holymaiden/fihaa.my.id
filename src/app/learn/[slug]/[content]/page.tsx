import type { Metadata } from 'next';
import { Suspense } from 'react';

import BackButton from '@/common/components/elements/BackButton';
import Container from '@/common/components/elements/Container';
import Loading from '@/common/components/elements/Loading';
import {
  getMdxFileCount,
  loadMdxFile,
  loadMdxNextPrevFile,
} from '@/common/libs/mdx';
import { type SubContentMetaProps } from '@/common/types/learn';
import { type ContentProps } from '@/common/types/novel';
import ContentDetail from '@/modules/learn/components/ContentDetail';
import ContentDetailHeader from '@/modules/learn/components/ContentDetailHeader';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; content: string }>;
}): Promise<Metadata> {
  const { slug, content } = await params;
  const { frontMatter } = await loadMdxFile<ContentProps>(
    'learns/' + slug,
    content,
  );

  if (!frontMatter) {
    return {
      title: 'Blog | Fihaa Portfolio',
      description: 'Blog | Fihaa Portfolio',
    };
  }

  return {
    title: `${frontMatter.title} | Fihaa Portfolio`,
    description: frontMatter.title,
  };
}

type LearnContentDetailPageProps = {
  params: Promise<{
    slug: string;
    content: string;
  }>;
};

const LearnContentDetailPage = async ({
  params,
}: LearnContentDetailPageProps) => {
  const { slug, content } = await params;

  const contentLearn = await loadMdxNextPrevFile<SubContentMetaProps>(
    'learns/' + slug,
    content,
  );

  const learnLength = getMdxFileCount('learns', slug);

  return (
    <>
      <Container data-aos="fade-up">
        <BackButton url={`/learn/${slug}`} />
        <Suspense fallback={<Loading />}>
          <ContentDetailHeader {...contentLearn.frontMatter} />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <ContentDetail
            {...contentLearn}
            params={{ slug }}
            learnLength={learnLength}
          />
        </Suspense>
      </Container>
    </>
  );
};

export default LearnContentDetailPage;
