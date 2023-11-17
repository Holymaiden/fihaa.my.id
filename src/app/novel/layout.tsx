import NovelAuth from "@/common/components/elements/NovelAuth";
import { NovelAuthProvider } from "@/common/context/NovelAuthContext";
import { CookiesProvider } from "next-client-cookies/server";

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
