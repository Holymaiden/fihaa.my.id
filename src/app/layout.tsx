import '@/common/styles/globals.css';
import 'aos/dist/aos.css';

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import Layout from '@/common/components/layouts';
import GoogleAdsense from '@/common/libs/googl-adsense';
import { firaCode, jakartaSans, soraSans } from '@/common/styles/fonts';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Porfolio - Fihaa',
  description: 'Porfolio - M. Fiqri Haikhar Anwar',
};

const ProgressBar = dynamic(
  () => import('@/common/components/elements/ProgressBar'),
  { ssr: false },
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakartaSans.variable} ${soraSans.variable} ${firaCode.variable}`}
      >
        <Providers>
          <Layout>
            <ProgressBar />
            {children}
          </Layout>
        </Providers>
      </body>
      <GoogleAdsense pId="4893424345889965" />
    </html>
  );
}
