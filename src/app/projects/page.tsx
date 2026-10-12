import type { Metadata, NextPage } from 'next';
import { Suspense } from 'react';

import Container from '@/common/components/elements/Container';
import Loading from '@/common/components/elements/Loading';
import PageHeading from '@/common/components/elements/PageHeading';
import { getProjects } from '@/lib/content/projects';
import Projects from '@/modules/projects';

const PAGE_TITLE = 'Projects';
const PAGE_DESCRIPTION =
  'Several projects that I have worked on, both private and open source.';

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Fihaa Portfolio`,
  description: PAGE_DESCRIPTION,
};

const ProjectsPage: NextPage = async () => {
  const sortedContents = await getProjects();

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
