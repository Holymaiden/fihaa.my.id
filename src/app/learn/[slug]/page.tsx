import type { Metadata, NextPage } from 'next';
import { Suspense } from 'react';

import BackButton from '@/common/components/elements/BackButton';
import Container from '@/common/components/elements/Container';
import Loading from '@/common/components/elements/Loading';
import PageHeading from '@/common/components/elements/PageHeading';
import { LEARN_CONTENTS } from '@/common/constant/learn';
import { loadMdxFiles } from '@/common/libs/mdx';
import type { ContentProps, SubContentMetaProps } from '@/common/types/learn';
import ContentList from '@/modules/learn/components/ContentList';

interface ContentPageProps {
  params: {
    slug: string;
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const content: ContentProps | undefined = LEARN_CONTENTS.find(
    (content) => content.slug === params.slug,
  );

  if (!content) {
    return {
      title: 'Learn | Fihaa Portfolio',
      description: 'Learn | Fihaa Portfolio',
    };
  }

  return {
    title: `${content.title} | Fihaa Portfolio`,
    description: content.description,
  };
}

const LearnContentPage: NextPage<ContentPageProps> = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const content: ContentProps | undefined = LEARN_CONTENTS.find(
    (content) => content.slug === params.slug,
  );

  if (!content) {
    return null;
  }

  const { title, description } = content;

  const subContents = await loadMdxFiles<SubContentMetaProps>(
    'learns',
    params.slug,
  );

  const sortedSubContents = subContents.sort(
    (a, b) => a.frontMatter.id - b.frontMatter.id,
  );

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Container data-aos="fade-up">
          <BackButton url="/learn" />
          <PageHeading title={title} description={description} />
          <ContentList
            sortedSubContents={sortedSubContents}
            slug={params.slug}
            title={title}
          />
        </Container>
      </Suspense>
    </>
  );
};

export default LearnContentPage;
