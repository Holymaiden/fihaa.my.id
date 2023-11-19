import { NextPage, Metadata } from "next";

import Container from "@/common/components/elements/Container";
import HomePage from "@/modules/home";

export const metadata: Metadata = {
  title: "M. Fiqri Haikhar Anwar - Personal Portfolio",
};

const Home: NextPage = () => {
  return (
    <Container>
      <HomePage />
    </Container>
  );
};

export default Home;
