"use client";

import React, { createContext, ReactNode, useState } from "react";

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
  const getCookie: () => boolean = () => {
    const cookies = document.cookie.split("; ");
    const novelAuth = cookies.find((cookie) => cookie.startsWith("novelAuth="));
    if (novelAuth) {
      const expires = new Date(novelAuth.split("=")[1]);
      if (expires < new Date()) {
        return false;
      }
      return novelAuth.split("=")[1] === "true";
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
      // expired 1 day
      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      document.cookie = `novelAuth=true; expires=${expires.toUTCString()};`;
      setError(null);
      setOpen(false);
      return;
    }

    document.cookie = "novelAuth=false";
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
