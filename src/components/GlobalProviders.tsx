"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { PrefsProvider } from "@/context/PrefsContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ProductCatalogInitializer from "@/components/ProductCatalogInitializer";

export default function GlobalProviders({ children }: { children: ReactNode }) {
  return (
    <PrefsProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <ProductCatalogInitializer />
            {children}
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </PrefsProvider>
  );
}
