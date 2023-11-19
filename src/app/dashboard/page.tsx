import { NextPage, Metadata } from "next";

import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import Dashboard from "@/modules/dashboard";
import { Suspense } from "react";
import Loading from "@/common/components/elements/Loading";

const PAGE_TITLE = "Dashboard";
const PAGE_DESCRIPTION =
  "This is my personal dashboard, built with Next.js API routes deployed as serverless functions.";

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Fihaa Portfolio`,
  description: PAGE_DESCRIPTION,
};

const DashboardPage: NextPage = () => {
  return (
    <Container data-aos="fade-up">
      <Suspense fallback={<Loading />}>
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <Dashboard />
      </Suspense>
    </Container>
  );
};

export default DashboardPage;
