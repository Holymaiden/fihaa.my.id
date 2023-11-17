import NovelAuth from "@/common/components/elements/NovelAuth";
import { NovelAuthProvider } from "@/common/context/NovelAuthContext";

export default function NovelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NovelAuthProvider>
      <NovelAuth />
      {children}
    </NovelAuthProvider>
  );
}
