import 'aos/dist/aos.css';

import ContactWidget from '@/common/components/elements/ContactWidget';
import ProgressBar from '@/common/components/elements/ProgressBar';
import Layout from '@/common/components/layouts';

import AosInit from './aos-init';

export default function TwoDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50"
      >
        Skip to main content
      </a>
      <AosInit />
      <Layout>
        <ProgressBar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <ContactWidget />
      </Layout>
    </>
  );
}
