import { NextPage } from "next";

import Container from "@/common/components/elements/Container";
import HomePage from "@/modules/home";

const Home: NextPage = () => {
  return (
    <Container>
      <HomePage />
    </Container>
  );
};

export default Home;
