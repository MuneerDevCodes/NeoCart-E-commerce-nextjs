"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, isReady: cartReady } = useCart();
  const {
    isWishlisted,
    toggleWishlist,
    isReady: wishlistReady,
  } = useWishlist();
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const wishlisted = wishlistReady && isWishlisted(product.id);

  async function handleAddToCart() {
    setAdding(true);
    setMessage("");
    try {
      await addItem(product.id);
      setMessage("Added to cart");
    } catch (error) {
      console.error("Unable to add product to cart.", error);
      setMessage("Could not add this item");
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link
          aria-label={`View ${product.name}`}
          className="absolute inset-0"
          href={`/products/${product.id}`}
          tabIndex={-1}
        >
          <Image
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            height={800}
            loading="lazy"
            src={product.imageUrl}
            unoptimized
            width={800}
          />
        </Link>
        {product.compareAtPrice !== undefined &&
          product.compareAtPrice > product.price && (
            <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white">
              Sale
            </span>
          )}
        <button
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-white/95 text-xl text-slate-600 shadow-sm transition hover:scale-105 hover:text-rose-600 disabled:cursor-wait dark:bg-slate-950/90 dark:text-slate-300"
          disabled={!wishlistReady}
          onClick={() => toggleWishlist(product.id)}
          type="button"
        >
          <span aria-hidden="true">{wishlisted ? "♥" : "♡"}</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          {product.category}
        </p>
        <Link
          className="mt-1 line-clamp-2 min-h-12 text-base font-semibold text-slate-900 hover:text-indigo-700 dark:text-white dark:hover:text-indigo-300"
          href={`/products/${product.id}`}
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-1.5 text-sm">
          <span aria-label={`${product.rating} out of 5 stars`} className="text-amber-500">
            ★
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-500 dark:text-slate-400">
            {product.stock > 0 ? "In stock" : "Out of stock"}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.compareAtPrice !== undefined &&
            product.compareAtPrice > product.price && (
              <span className="text-sm text-slate-500 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
        </div>
        <button
          className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
          disabled={!cartReady || product.stock < 1 || adding}
          onClick={handleAddToCart}
          type="button"
        >
          {adding ? "Adding…" : product.stock < 1 ? "Out of stock" : "Add to cart"}
        </button>
        {message && (
          <p
            aria-live="polite"
            className={`mt-2 text-center text-xs ${
              message === "Added to cart"
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-rose-700 dark:text-rose-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </article>
  );
}
