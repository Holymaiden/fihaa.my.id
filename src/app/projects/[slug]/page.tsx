import { NextPage } from "next";

import BackButton from "@/common/components/elements/BackButton";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import { ProjectItemProps } from "@/common/types/projects";
import ProjectDetail from "@/modules/projects/components/ProjectDetail";

import { PROJECTS } from "@/common/constant/project";
import { MdxFileProps, loadMdxFile } from "@/common/libs/mdx";

interface ProjectsDetailPageProps {
  params: {
    slug: string;
  };
}

const ProjectsDetailPage: NextPage<ProjectsDetailPageProps> = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const project: MdxFileProps | any = await loadMdxFile(
    "projects",
    params.slug
  );

  const PAGE_TITLE = project?.frontMatter?.title || "Default Title";
  const PAGE_DESCRIPTION = project?.frontMatter?.description;

  return (
    <>
      <Container data-aos="fade-up">
        <BackButton url="/projects" />
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <ProjectDetail {...project?.frontMatter} content={project?.content} />
      </Container>
    </>
  );
};

export default ProjectsDetailPage;
