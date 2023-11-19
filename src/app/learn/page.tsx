import { NextPage, Metadata } from "next";

import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import { LEARN_CONTENTS } from "@/common/constant/learn";
import LearnModule from "@/modules/learn";

const PAGE_TITLE = "Learn";
const PAGE_DESCRIPTION = `The following is a dedicated learning resource that I have meticulously prepared in the field of information technology. May this material not only provide a profound understanding but also inspire you to delve deeper into this dynamic world. Keep striving and enjoy your learning journey!`;

export const metadata: Metadata = {
  title: `${PAGE_TITLE} - Fihaa Portfolio`,
  description: PAGE_DESCRIPTION,
};

const LearnPage: NextPage = () => {
  const filteredContents =
    LEARN_CONTENTS.filter((content) => content.is_show) || [];

  return (
    <>
      <Container data-aos="fade-up">
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <LearnModule contents={filteredContents} />
      </Container>
    </>
  );
};

export default LearnPage;
