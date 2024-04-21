import type { Metadata, NextPage } from 'next';
import { Suspense } from 'react';

import BackButton from '@/common/components/elements/BackButton';
import Container from '@/common/components/elements/Container';
import Loading from '@/common/components/elements/Loading';
import { NOVEL_CONTENTS } from '@/common/constant/novel';
import {
  getMdxFileCount,
  loadMdxNovelFile,
  type MdxFileProps,
} from '@/common/libs/mdx';
import type { ContentProps } from '@/common/types/novel';
import ContentDetail from '@/modules/novel/components/ContentDetail';

interface NovelContentPageProps {
  params: {
    slug: string;
    content: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; content: string };
}): Promise<Metadata> {
  const novelData = (await loadMdxNovelFile<ContentProps>(
    'novels/' + params.slug,
    params.content,
  )) as MdxFileProps<ContentProps>;
  const novelContent = NOVEL_CONTENTS.find(
    (content) => String(content.slug) === String(params.slug),
  );

  if (!novelData) {
    return {
      title: 'Novel | Fihaa Portfolio',
      description: 'Novel | Fihaa Portfolio',
    };
  }

  return {
    title: `${novelData.frontMatter?.title} | ${novelContent?.title}`,
    description: novelContent?.description,
  };
}

const NovelContentPage: NextPage<NovelContentPageProps> = async ({
  params,
}: NovelContentPageProps) => {
  const { slug, content } = params;

  const novelData = await loadMdxNovelFile<ContentProps>(
    'novels/' + slug,
    content,
  );
  const novelContent = NOVEL_CONTENTS.find(
    (content) => String(content.slug) === String(slug),
  ) as ContentProps;

  const novelLength = getMdxFileCount('novels', slug);

  return (
    <>
      <Container data-aos="fade-up">
        <BackButton url="/novel" />
        <Suspense fallback={<Loading />}>
          <ContentDetail
            {...novelData}
            {...novelContent}
            novelLength={novelLength}
          />
        </Suspense>
      </Container>
    </>
  );
};

export default NovelContentPage;
