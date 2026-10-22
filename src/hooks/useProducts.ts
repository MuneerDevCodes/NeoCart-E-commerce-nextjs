"use client";

import { useEffect, useState } from "react";
import { getAllProducts, getProduct } from "@/lib/db";
import { seedProductsIfEmpty } from "@/lib/seed";
import type { Product } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void seedProductsIfEmpty()
      .then(getAllProducts)
      .then((loadedProducts) => {
        if (active) {
          setProducts(loadedProducts);
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load products from IndexedDB.", error);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
}

export function useProduct(id: string) {
  const [result, setResult] = useState<{
    id: string;
    product: Product | undefined;
    loading: boolean;
  }>({ id, product: undefined, loading: true });

  useEffect(() => {
    let active = true;

    void seedProductsIfEmpty()
      .then(() => getProduct(id))
      .then((loadedProduct) => {
        if (active) {
          setResult({ id, product: loadedProduct, loading: false });
        }
      })
      .catch((error: unknown) => {
        console.error(`Unable to load product "${id}" from IndexedDB.`, error);
        if (active) {
          setResult({ id, product: undefined, loading: false });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  return {
    product: result.id === id ? result.product : undefined,
    loading: result.id !== id || result.loading,
  };
}
