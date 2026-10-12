import type { Metadata, NextPage } from 'next';

import Container from '@/common/components/elements/Container';
import { ROUTE_2D, SITE_URL } from '@/lib/routes';
import HomePage from '@/modules/home';

const HOME_2D_URL = `${SITE_URL}${ROUTE_2D}`;

export const metadata: Metadata = {
  title: 'M. Fiqri Haikhar Anwar - Software Engineer Portfolio',
  description:
    'Portfolio website of M. Fiqri Haikhar Anwar, a passionate Software Engineer from Makassar, Indonesia. Showcasing projects, blog posts, and learning resources in React, Next.js, TypeScript, Golang, Laravel, React Native, Elysia.js, and modern web technologies.',
  keywords: [
    'M. Fiqri Haikhar Anwar',
    'Fihaa',
    'Software Engineer',
    'React Developer',
    'Next.js Developer',
    'TypeScript',
    'Golang',
    'Laravel',
    'React Native',
    'Elysia.js',
    'Web Developer',
    'Mobile Developer',
    'Backend Developer',
    'Software Engineer',
    'Portfolio',
    'Makassar',
    'Indonesia',
    'JavaScript',
    'Node.js',
    'Frontend',
    'Backend',
  ],
  openGraph: {
    title: 'M. Fiqri Haikhar Anwar - Software Engineer',
    description:
      'Passionate Software Engineer specializing in React, Next.js, Golang, Laravel, React Native, Elysia.js, and modern web technologies. Based in Makassar, Indonesia.',
    type: 'website',
    url: HOME_2D_URL,
    images: [
      {
        url: '/images/fihaa.png',
        width: 1200,
        height: 630,
        alt: 'M. Fiqri Haikhar Anwar - Software Engineer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'M. Fiqri Haikhar Anwar - Software Engineer',
    description:
      'Passionate Software Engineer specializing in React, Next.js, Golang, Laravel, React Native, Elysia.js, and modern web technologies.',
    images: ['/images/fihaa.png'],
  },
  alternates: {
    canonical: HOME_2D_URL,
  },
};

const Home: NextPage = () => {
  return (
    <Container>
      <HomePage />
    </Container>
  );
};

export default Home;
