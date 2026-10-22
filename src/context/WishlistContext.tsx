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

type WishlistContextValue = {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  isReady: boolean;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);
const emptyWishlist: string[] = [];

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { value, setValue, isReady } = useLocalStorage<string[]>(
    STORAGE_KEYS.wishlist,
    [],
  );
  const wishlist = Array.isArray(value) ? value : emptyWishlist;

  const toggleWishlist = useCallback(
    (productId: string) => {
      setValue((current) => {
        const currentWishlist = Array.isArray(current) ? current : [];
        return currentWishlist.includes(productId)
          ? currentWishlist.filter((id) => id !== productId)
          : [...currentWishlist, productId];
      });
    },
    [setValue],
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );
  const contextValue = useMemo(
    () => ({ wishlist, toggleWishlist, isWishlisted, isReady }),
    [wishlist, toggleWishlist, isWishlisted, isReady],
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider.");
  }
  return context;
}
