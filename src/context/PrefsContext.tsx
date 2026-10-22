"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Prefs } from "@/types";

type PrefsContextValue = {
  theme: Prefs["theme"];
  display: Prefs["display"];
  setTheme: (theme: Prefs["theme"]) => void;
  toggleTheme: () => void;
  setDisplay: (display: Prefs["display"]) => void;
  isReady: boolean;
};

const defaultPrefs: Prefs = { theme: "light", display: "grid" };
const PrefsContext = createContext<PrefsContextValue | undefined>(undefined);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const { value, setValue, isReady } = useLocalStorage<Prefs>(
    STORAGE_KEYS.prefs,
    defaultPrefs,
  );
  const prefs = {
    theme: value?.theme === "dark" ? "dark" : "light",
    display: value?.display === "list" ? "list" : "grid",
  } satisfies Prefs;

  useLayoutEffect(() => {
    if (isReady) {
      document.documentElement.classList.toggle("dark", prefs.theme === "dark");
    }
  }, [isReady, prefs.theme]);

  const setTheme = useCallback(
    (theme: Prefs["theme"]) => {
      setValue((current) => ({
        ...defaultPrefs,
        ...current,
        theme,
      }));
    },
    [setValue],
  );

  const toggleTheme = useCallback(() => {
    setTheme(prefs.theme === "dark" ? "light" : "dark");
  }, [prefs.theme, setTheme]);

  const setDisplay = useCallback(
    (display: Prefs["display"]) => {
      setValue((current) => ({
        ...defaultPrefs,
        ...current,
        display,
      }));
    },
    [setValue],
  );

  const contextValue = useMemo(
    () => ({
      theme: prefs.theme,
      display: prefs.display,
      setTheme,
      toggleTheme,
      setDisplay,
      isReady,
    }),
    [prefs.theme, prefs.display, setTheme, toggleTheme, setDisplay, isReady],
  );

  return (
    <PrefsContext.Provider value={contextValue}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const context = useContext(PrefsContext);
  if (!context) {
    throw new Error("usePrefs must be used within a PrefsProvider.");
  }
  return context;
}
