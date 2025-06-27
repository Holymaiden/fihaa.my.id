import '@/common/styles/globals.css';
import 'aos/dist/aos.css';

import type { Metadata } from 'next';

import ContactWidget from '@/common/components/elements/ContactWidget';
import ProgressBar from '@/common/components/elements/ProgressBar';
import Layout from '@/common/components/layouts';
import AnalyticsProvider from '@/common/components/providers/AnalyticsProvider';
import GoogleAdsense from '@/common/libs/google-adsense';
import { firaCode, jakartaSans, soraSans } from '@/common/styles/fonts';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'M. Fiqri Haikhar Anwar - Software Engineer Portfolio',
  description:
    'Experienced Software Engineer specializing in React, Next.js, Node.js, Golang, Laravel, React Native, Elysia.js, and modern web technologies. Based in Makassar, Indonesia.',
  keywords: [
    'Software Engineer',
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'Golang',
    'Laravel',
    'React Native',
    'Elysia.js',
    'Web Developer',
    'Mobile Developer',
    'Backend Developer',
    'Makassar',
    'Indonesia',
  ],
  authors: [{ name: 'M. Fiqri Haikhar Anwar', url: 'https://fihaa.my.id' }],
  creator: 'M. Fiqri Haikhar Anwar',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fihaa.my.id',
    title: 'M. Fiqri Haikhar Anwar - Software Engineer Portfolio',
    description:
      'Experienced Software Engineer specializing in React, Next.js, Node.js, Golang, Laravel, React Native, Elysia.js, and modern web technologies.',
    siteName: 'Fihaa Portfolio',
    images: [
      {
        url: '/images/fihaa.png',
        width: 1200,
        height: 630,
        alt: 'M. Fiqri Haikhar Anwar - Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'M. Fiqri Haikhar Anwar - Software Engineer Portfolio',
    description:
      'Experienced Software Engineer specializing in React, Next.js, Node.js, Golang, Laravel, React Native, Elysia.js, and modern web technologies.',
    creator: '@fihaa_dev',
    images: ['/images/fihaa.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// const ProgressBar = dynamic(
//   () => import('@/common/components/elements/ProgressBar'),
//   { ssr: false },
// );

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${jakartaSans.variable} ${soraSans.variable} ${firaCode.variable}`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50"
        >
          Skip to main content
        </a>
        <Providers>
          <AnalyticsProvider />
          <Layout>
            <ProgressBar />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <ContactWidget />
          </Layout>
        </Providers>
        <GoogleAdsense pId="4893424345889965" />
      </body>
    </html>
  );
}
