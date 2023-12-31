import { NextPage, Metadata } from "next";

import BackButton from "@/common/components/elements/BackButton";
import Container from "@/common/components/elements/Container";
import {
  getMdxFileCount,
  loadMdxFile,
  loadMdxNextPrevFile,
} from "@/common/libs/mdx";
import ContentDetail from "@/modules/learn/components/ContentDetail";
import ContentDetailHeader from "@/modules/learn/components/ContentDetailHeader";
import Loading from "@/common/components/elements/Loading";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; content: string };
}): Promise<Metadata> {
  const { content: mdx, frontMatter }: any = await loadMdxFile(
    "learns/" + params.slug,
    params.content
  );

  if (!frontMatter) {
    return {
      title: "Blog | Fihaa Portfolio",
      description: "Blog | Fihaa Portfolio",
    };
  }

  return {
    title: `${frontMatter.title} | Fihaa Portfolio`,
    description: frontMatter.title,
  };
}

const LearnContentDetailPage: NextPage = async ({ params }: any) => {
  const { slug, content } = params;

  const contentLearn: any = await loadMdxNextPrevFile(
    "learns/" + slug,
    content
  );

  const learnLength = await getMdxFileCount("learns", slug);

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
            params={params}
            learnLength={learnLength}
          />
        </Suspense>
      </Container>
    </>
  );
};

export default LearnContentDetailPage;
