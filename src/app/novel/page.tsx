import { NextPage } from "next";

import Container from "@/common/components/elements/Container";
import NovelList from "@/modules/novel";
import { Suspense } from "react";
import Loading from "@/common/components/elements/Loading";

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
