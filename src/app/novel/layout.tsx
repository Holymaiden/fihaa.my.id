import { CookiesProvider } from 'next-client-cookies/server';

import NovelAuth from '@/common/components/elements/NovelAuth';
import { NovelAuthProvider } from '@/common/context/NovelAuthContext';

export default function NovelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CookiesProvider>
      <NovelAuthProvider>
        <NovelAuth />
        {children}
      </NovelAuthProvider>
    </CookiesProvider>
  );
}
