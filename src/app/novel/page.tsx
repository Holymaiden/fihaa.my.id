import { NextPage, Metadata } from "next";

import Container from "@/common/components/elements/Container";
import NovelList from "@/modules/novel";
import { Suspense } from "react";
import Loading from "@/common/components/elements/Loading";

export const metadata: Metadata = {
  title: "Novel | Fihaa Portfolio",
  description: "My Favorite Novels",
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
