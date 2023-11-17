import { NextPage } from "next";
import { Suspense } from "react";

import BackButton from "@/common/components/elements/BackButton";
import Container from "@/common/components/elements/Container";
import ContentDetail from "@/modules/novel/components/ContentDetail";
import Loading from "@/common/components/elements/Loading";

import { getMdxFileCount, loadMdxNovelFile } from "@/common/libs/mdx";
import { NOVEL_CONTENTS } from "@/common/constant/novel";
import { ContentProps } from "@/common/types/novel";

interface NovelContentPageProps {
  params: {
    slug: string;
    content: string;
  };
}

const NovelContentPage: NextPage<NovelContentPageProps> = async ({
  params,
}: NovelContentPageProps) => {
  const { slug, content } = params;

  const novelData = await loadMdxNovelFile("novels/" + slug, content);
  const novelContent: ContentProps | any = NOVEL_CONTENTS.find(
    (content) => String(content.slug) === String(slug)
  );

  const novelLength = await getMdxFileCount("novels", slug);

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
