import { NextPage } from "next";

import BackButton from "@/common/components/elements/BackButton";
import Container from "@/common/components/elements/Container";
import { loadMdxFile } from "@/common/libs/mdx";
import ContentDetail from "@/modules/learn/components/ContentDetail";
import ContentDetailHeader from "@/modules/learn/components/ContentDetailHeader";
import Loading from "@/common/components/elements/Loading";
import { Suspense } from "react";

const LearnContentDetailPage: NextPage = async ({ params }: any) => {
  const { slug, content } = params;

  const { content: mdx, frontMatter }: any = await loadMdxFile(
    "learns/" + slug,
    content
  );

  return (
    <>
      <Container data-aos="fade-up">
        <BackButton url={`/learn/${slug}`} />
        <Suspense fallback={<Loading />}>
          <ContentDetailHeader {...frontMatter} />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <ContentDetail
            content={mdx}
            frontMatter={frontMatter}
            params={params}
          />
        </Suspense>
      </Container>
    </>
  );
};

export default LearnContentDetailPage;