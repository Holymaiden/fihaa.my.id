import { Metadata, NextPage } from "next";

import BackButton from "@/common/components/elements/BackButton";
import Container from "@/common/components/elements/Container";
import Loading from "@/common/components/elements/Loading";
import PageHeading from "@/common/components/elements/PageHeading";
import { loadMdxNovelFiles } from "@/common/libs/mdx";
import ContentList from "@/modules/novel/components/ContentList";
import { Suspense } from "react";
import { NOVEL_CONTENTS } from "@/common/constant/novel";
import { MdxFileContentProps, ContentProps } from "@/common/types/novel";

interface NovelPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const content: ContentProps | undefined = NOVEL_CONTENTS.find(
    (content) => String(content.slug) === String(params.slug)
  );

  if (!content) {
    return {
      title: "Novel | Fihaa Portfolio",
      description: "Novel | Fihaa Portfolio",
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
  params: { slug: string };
}) => {
  const content: ContentProps | undefined = NOVEL_CONTENTS.find(
    (content) => String(content.slug) === String(params.slug)
  );

  if (!content) {
    return <Loading />;
  }

  const { title, description } = content;

  const subContents = await loadMdxNovelFiles("novels", params.slug);

  const sortedSubContents = subContents.sort(
    (a: MdxFileContentProps, b: MdxFileContentProps) =>
      a.frontMatter.id - b.frontMatter.id
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
            title={title}
          />
        </Suspense>
      </Container>
    </>
  );
};

export default NovelContentPage;
