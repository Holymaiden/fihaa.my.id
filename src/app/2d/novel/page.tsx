import type { Metadata, NextPage } from 'next';
import { Suspense } from 'react';

import Container from '@/common/components/elements/Container';
import Loading from '@/common/components/elements/Loading';
import NovelList from '@/modules/novel';

export const metadata: Metadata = {
  title: 'Novel | Fihaa Portfolio',
  description: 'My Favorite Novels',
};

const NovelPage: NextPage = () => {
  return (
    <>
      <Container className="xl:!-mt-5" data-aos="fade-up">
        <Suspense fallback={<Loading />}>
          <NovelList />
        </Suspense>
      </Container>
    </>
  );
};

export default NovelPage;
