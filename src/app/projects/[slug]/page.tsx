import type { Metadata, NextPage } from 'next';

import BackButton from '@/common/components/elements/BackButton';
import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import { loadMdxFile } from '@/common/libs/mdx';
import { type ProjectItemProps } from '@/common/types/projects';
import ProjectDetail from '@/modules/projects/components/ProjectDetail';

interface ProjectsDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await loadMdxFile<ProjectItemProps>('projects', params.slug);

  if (!project) {
    return {
      title: 'Project | Fihaa Portfolio',
      description: 'Project | Fihaa Portfolio',
    };
  }

  return {
    title: `${project?.frontMatter?.title} | Fihaa Portfolio`,
    description: project?.frontMatter?.description,
  };
}

const ProjectsDetailPage: NextPage<ProjectsDetailPageProps> = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const project = await loadMdxFile<ProjectItemProps>('projects', params.slug);

  const PAGE_TITLE = project?.frontMatter?.title || 'Default Title';
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
