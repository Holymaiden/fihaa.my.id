"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ReactNode } from "react";

import useHasMounted from "@/common/hooks/useHasMounted";

import HeaderSidebar from "./header/HeaderSidebar";
import HeaderTop from "./header/HeaderTop";
import TopBar from "../elements/TopBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { resolvedTheme } = useTheme();
  const hasMounted = useHasMounted();

  const isDarkTheme =
    hasMounted && (resolvedTheme === "dark" || resolvedTheme === "system");

  const pathname = usePathname();
  const pageName = pathname.split("/")[1];

  const isFullPageHeader =
    pageName === "novel" ||
    pageName === "blog" ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/novel/") ||
    pathname.startsWith("/learn/");

  return (
    <>
      <TopBar />
      <div
        className={clsx(
          "max-w-6xl mx-auto lg:px-8",
          isDarkTheme ? "dark:text-darkText" : ""
        )}
      >
        {isFullPageHeader ? (
          <div className="flex flex-col xl:pb-8">
            <HeaderTop />
            <main className="transition-all duration-300">{children}</main>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:gap-5 lg:py-4 xl:pb-8">
            <HeaderSidebar />
            <main className="lg:w-4/5 max-w-[854px] transition-all duration-300">
              {children}
            </main>
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;
