import { NextPage, Metadata } from "next";

import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import Projects from "@/modules/projects";

import { loadMdxFiles } from "@/common/libs/mdx";
import { Suspense } from "react";
import Loading from "@/common/components/elements/Loading";

const PAGE_TITLE = "Projects";
const PAGE_DESCRIPTION =
  "Several projects that I have worked on, both private and open source.";

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Fihaa Portfolio`,
  description: PAGE_DESCRIPTION,
};

const ProjectsPage: NextPage = async () => {
  const content = await loadMdxFiles("projects", "");

  const sortedContents = content.sort(
    (a: any, b: any) => b.frontMatter.id - a.frontMatter.id
  );

  return (
    <>
      <Container data-aos="fade-up">
        <Suspense fallback={<Loading />}>
          <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
          <Projects content={sortedContents} />
        </Suspense>
      </Container>
    </>
  );
};

export default ProjectsPage;
