"use client";

import { NextPage } from "next";
import { SWRConfig } from "swr";

import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import Dashboard from "@/modules/dashboard";
import { Suspense } from "react";
import Loading from "@/common/components/elements/Loading";

const PAGE_TITLE = "Dashboard";
const PAGE_DESCRIPTION =
  "This is my personal dashboard, built with Next.js API routes deployed as serverless functions.";

const DashboardPage: NextPage = () => {
  return (
    <SWRConfig>
      <Container data-aos="fade-up">
        <Suspense fallback={<Loading />}>
          <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
          <Dashboard />
        </Suspense>
      </Container>
    </SWRConfig>
  );
};

export default DashboardPage;
