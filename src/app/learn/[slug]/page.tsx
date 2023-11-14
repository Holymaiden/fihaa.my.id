import { NextPage } from "next";

import BackButton from "@/common/components/elements/BackButton";
import Container from "@/common/components/elements/Container";
import Loading from "@/common/components/elements/Loading";
import PageHeading from "@/common/components/elements/PageHeading";
import { LEARN_CONTENTS } from "@/common/constant/learn";
import { loadMdxFiles } from "@/common/libs/mdx";
import { ContentProps, MdxFileContentProps } from "@/common/types/learn";
import ContentList from "@/modules/learn/components/ContentList";
import { Suspense } from "react";

interface ContentPageProps {
  params: {
    slug: string;
  };
}

const LearnContentPage: NextPage<ContentPageProps> = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const content: ContentProps | undefined = LEARN_CONTENTS.find(
    (content) => content.slug === params.slug
  );

  if (!content) {
    return null;
  }

  const { title, description } = content;

  const subContents = await loadMdxFiles("learns", params.slug);

  const sortedSubContents = subContents.sort(
    (a: MdxFileContentProps, b: MdxFileContentProps) =>
      a.frontMatter.id - b.frontMatter.id
  );

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Container data-aos="fade-up">
          <BackButton url="/learn" />
          <PageHeading title={title} description={description} />
          <ContentList
            sortedSubContents={sortedSubContents}
            content={content}
            title={title}
          />
        </Container>
      </Suspense>
    </>
  );
};

export default LearnContentPage;
