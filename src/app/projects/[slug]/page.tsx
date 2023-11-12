import { NextPage } from "next";

import BackButton from "@/common/components/elements/BackButton";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import { ProjectItemProps } from "@/common/types/projects";
import ProjectDetail from "@/modules/projects/components/ProjectDetail";

import { PROJECTS } from "@/common/constant/project";

interface ProjectsDetailPageProps {
  params: {
    slug: string;
  };
}

const ProjectsDetailPage: NextPage<ProjectsDetailPageProps> = ({
  params,
}: {
  params: { slug: string };
}) => {
  const project: ProjectItemProps | undefined = PROJECTS.find(
    (project) => project.slug === params.slug
  );

  const PAGE_TITLE = project?.title || "Default Title";
  const PAGE_DESCRIPTION = project?.description;

  return (
    <>
      <Container data-aos="fade-up">
        <BackButton url="/projects" />
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <ProjectDetail {...project} />
      </Container>
    </>
  );
};

export default ProjectsDetailPage;
