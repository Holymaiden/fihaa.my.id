"use client";

import { NextPage } from "next";
import { useState } from "react";

import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import { ProjectItemProps } from "@/common/types/projects";
import Projects from "@/modules/projects";

import { PROJECTS } from "@/common/constant/project";

interface ProjectsPageProps {
  projects: ProjectItemProps[];
}

const PAGE_TITLE = "Projects";
const PAGE_DESCRIPTION =
  "Several projects that I have worked on, both private and open source.";

const ProjectsPage: NextPage<ProjectsPageProps> = () => {
  const [visibleProjects, setVisibleProjects] = useState(6);

  const loadMore = () => setVisibleProjects((prev) => prev + 2);
  const hasMore = visibleProjects < PROJECTS.length;

  return (
    <>
      <Container data-aos="fade-up">
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <Projects
          projects={PROJECTS.slice(0, visibleProjects)}
          loadMore={loadMore}
          hasMore={hasMore}
        />
      </Container>
    </>
  );
};

export default ProjectsPage;
