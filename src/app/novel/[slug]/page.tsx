import type { Metadata, NextPage } from 'next';
import { Suspense } from 'react';

import BackButton from '@/common/components/elements/BackButton';
import Container from '@/common/components/elements/Container';
import Loading from '@/common/components/elements/Loading';
import PageHeading from '@/common/components/elements/PageHeading';
import { NOVEL_CONTENTS } from '@/common/constant/novel';
import { loadMdxNovelFiles } from '@/common/libs/mdx';
import type { ContentProps } from '@/common/types/novel';
import ContentList from '@/modules/novel/components/ContentList';

type NovelPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content: ContentProps | undefined = NOVEL_CONTENTS.find(
    (content) => String(content.slug) === String(slug),
  );

  if (!content) {
    return {
      title: 'Novel | Fihaa Portfolio',
      description: 'Novel | Fihaa Portfolio',
    };
  }

  return {
    title: `${content.title} | Fihaa Portfolio`,
    description: content.description,
  };
}

const NovelContentPage: NextPage<NovelPageProps> = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const content: ContentProps | undefined = NOVEL_CONTENTS.find(
    (content) => String(content.slug) === String(slug),
  );

  if (!content) {
    return <Loading />;
  }

  const { title, description } = content;

  const subContents = await loadMdxNovelFiles<ContentProps>('novels', slug);

  const sortedSubContents = subContents.sort(
    (a, b) => a.frontMatter.id - b.frontMatter.id,
  );

  return (
    <>
      <Container data-aos="fade-up">
        <Suspense fallback={<Loading />}>
          <BackButton url="/learn" />
          <PageHeading title={title} description={description} />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <ContentList
            sortedSubContents={sortedSubContents}
            content={content}
          />
        </Suspense>
      </Container>
    </>
  );
};

export default NovelContentPage;
