"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";

type RecentlyViewedContextValue = {
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;
  isReady: boolean;
};

const RecentlyViewedContext = createContext<
  RecentlyViewedContextValue | undefined
>(undefined);
const emptyRecentlyViewed: string[] = [];

export function RecentlyViewedProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { value, setValue, isReady } = useLocalStorage<string[]>(
    STORAGE_KEYS.recent,
    [],
  );
  const recentlyViewed = Array.isArray(value)
    ? value.slice(0, 8)
    : emptyRecentlyViewed;

  const addRecentlyViewed = useCallback(
    (productId: string) => {
      setValue((current) => [
        productId,
        ...(Array.isArray(current) ? current : []).filter(
          (id) => id !== productId,
        ),
      ].slice(0, 8));
    },
    [setValue],
  );

  const contextValue = useMemo(
    () => ({ recentlyViewed, addRecentlyViewed, isReady }),
    [recentlyViewed, addRecentlyViewed, isReady],
  );

  return (
    <RecentlyViewedContext.Provider value={contextValue}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error(
      "useRecentlyViewed must be used within a RecentlyViewedProvider.",
    );
  }
  return context;
}
