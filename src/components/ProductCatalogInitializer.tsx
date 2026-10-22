"use client";

import { useEffect } from "react";
import { seedProductsIfEmpty } from "@/lib/seed";

export default function ProductCatalogInitializer() {
  useEffect(() => {
    void seedProductsIfEmpty().catch((error: unknown) => {
      console.error("Unable to initialize the product catalog.", error);
    });
  }, []);

  return null;
}
