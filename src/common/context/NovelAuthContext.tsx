"use client";

import React, { createContext, ReactNode, useState } from "react";
import { useCookies } from "next-client-cookies";

interface NovelAuthContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setCookie: (key: string) => void;
  error: string | null;
  getCookie: () => boolean;
}

export const NovelAuthContext = createContext<NovelAuthContextType>({
  isOpen: true,
  setIsOpen: () => {},
  setCookie: () => {},
  error: null,
  getCookie: () => false,
});

interface NovelAuthProviderProps {
  children: ReactNode;
}

export const NovelAuthProvider = ({ children }: NovelAuthProviderProps) => {
  const cookies = useCookies();

  const getCookie = () => {
    const cookieNovel = cookies.get("novelAuth");
    if (cookieNovel) {
      return cookieNovel === "true";
    }
    return false;
  };

  const [isOpen, setOpen] = useState(!getCookie());
  const [error, setError] = useState<string | null>(null);

  const setIsOpen = (open: boolean) => {
    setOpen(open);
  };

  const setCookie = (key: string) => {
    if (key === "Fihaa") {
      cookies.set("novelAuth", "true", { expires: 1 * 24 });
      setError(null);
      setOpen(false);
      return;
    }

    cookies.set("novelAuth", "false", { expires: 1 * 24 });
    setError("Invalid Key");
  };

  return (
    <NovelAuthContext.Provider
      value={{ isOpen, setIsOpen, setCookie, error, getCookie }}
    >
      {children}
    </NovelAuthContext.Provider>
  );
};
