import type { Metadata, NextPage } from 'next';

import BackButton from '@/common/components/elements/BackButton';
import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import { getProjectBySlug } from '@/lib/content/projects';
import { to2d } from '@/lib/routes';
import ProjectDetail from '@/modules/projects/components/ProjectDetail';

interface ProjectsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

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
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  const PAGE_TITLE = project?.frontMatter?.title || 'Default Title';
  const PAGE_DESCRIPTION = project?.frontMatter?.description;

  return (
    <>
      <Container data-aos="fade-up">
        <BackButton url={to2d('/projects')} />
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <ProjectDetail
          {...project?.frontMatter}
          content={project ? project.content : 'Not Found'}
        />
      </Container>
    </>
  );
};

export default ProjectsDetailPage;
