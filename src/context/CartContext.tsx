"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getProduct } from "@/lib/db";
import { STORAGE_KEYS } from "@/lib/storage";
import type { CartItem } from "@/types";

type CartContextValue = {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  itemCount: number;
  isReady: boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const emptyCart: CartItem[] = [];

function clampQuantity(quantity: number, stock: number) {
  const requestedQuantity = Number.isFinite(quantity)
    ? Math.trunc(quantity)
    : 1;
  return Math.min(Math.max(1, requestedQuantity), stock);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { value, setValue, removeValue, isReady } = useLocalStorage<CartItem[]>(
    STORAGE_KEYS.cart,
    [],
  );
  const items = Array.isArray(value) ? value : emptyCart;

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const product = await getProduct(productId);
      if (!product) {
        throw new Error(`Cannot add missing product "${productId}" to the cart.`);
      }
      if (product.stock < 1) {
        return;
      }

      const amount = clampQuantity(quantity, product.stock);
      setValue((current) => {
        const existingItems = Array.isArray(current) ? current : [];
        const existing = existingItems.find((item) => item.productId === productId);
        if (!existing) {
          return [...existingItems, { productId, quantity: amount }];
        }

        return existingItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(item.quantity + amount, product.stock) }
            : item,
        );
      });
    },
    [setValue],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setValue((current) =>
        (Array.isArray(current) ? current : []).filter(
          (item) => item.productId !== productId,
        ),
      );
    },
    [setValue],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const product = await getProduct(productId);
      if (!product) {
        throw new Error(`Cannot update missing product "${productId}" in the cart.`);
      }
      if (product.stock < 1) {
        removeItem(productId);
        return;
      }

      const nextQuantity = clampQuantity(quantity, product.stock);
      setValue((current) =>
        (Array.isArray(current) ? current : []).map((item) =>
          item.productId === productId
            ? { ...item, quantity: nextQuantity }
            : item,
        ),
      );
    },
    [removeItem, setValue],
  );

  const clearCart = useCallback(() => {
    removeValue();
  }, [removeValue]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      isReady,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      isReady,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
