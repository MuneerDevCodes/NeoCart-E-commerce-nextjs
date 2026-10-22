"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllProducts, getProduct } from "@/lib/db";
import { seedProductCatalog } from "@/lib/seed";
import type { Product } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setLoading(true);
    setError(undefined);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let active = true;

    void seedProductCatalog()
      .then(getAllProducts)
      .then((loadedProducts) => {
        if (active) {
          setProducts(loadedProducts);
          setError(undefined);
        }
      })
      .catch(() => {
        if (active) {
          setError("Products could not be loaded from local storage.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  return { products, loading, error, retry };
}

export function useProduct(id: string) {
  const [result, setResult] = useState<{
    id: string;
    product: Product | undefined;
    loading: boolean;
    error?: string;
  }>({ id, product: undefined, loading: true });
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setResult({ id, product: undefined, loading: true });
    setReloadToken((token) => token + 1);
  }, [id]);

  useEffect(() => {
    let active = true;

    void seedProductCatalog()
      .then(() => getProduct(id))
      .then((loadedProduct) => {
        if (active) {
          setResult({
            id,
            product: loadedProduct,
            loading: false,
          });
        }
      })
      .catch(() => {
        if (active) {
          setResult({
            id,
            product: undefined,
            loading: false,
            error: "Product details could not be loaded from local storage.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id, reloadToken]);

  return {
    product: result.id === id ? result.product : undefined,
    loading: result.id !== id || result.loading,
    error: result.id === id ? result.error : undefined,
    retry,
  };
}
