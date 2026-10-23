"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getProductImageUrl } from "@/lib/productImage";
import type { Product } from "@/types";

export default function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "list";
}) {
  const router = useRouter();
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
    } catch {
      setMessage("Could not add this item");
    } finally {
      setAdding(false);
    }
  }

  function handleBuyNow() {
    router.push(
      `/checkout?buyNow=${encodeURIComponent(product.id)}&quantity=1`,
    );
  }

  return (
    <article
      className={`group flex h-full overflow-hidden rounded-[1.35rem] border border-[#e8e6df] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d8ddd4] hover:shadow-[0_18px_42px_-24px_rgba(39,53,43,0.3)] dark:border-slate-800 dark:bg-slate-900 ${
        layout === "list" ? "flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${
          layout === "list"
            ? "w-28 shrink-0 sm:w-44"
            : "aspect-[4/3] sm:aspect-square"
        }`}
      >
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
            sizes={
              layout === "list"
                ? "(min-width: 640px) 176px, 112px"
                : "(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            }
            src={getProductImageUrl(product)}
            width={800}
          />
        </Link>
        {product.compareAtPrice !== undefined &&
          product.compareAtPrice > product.price && (
            <span             className="absolute left-3 top-3 rounded-full bg-[#a34f3e] px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white">
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
          className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full border border-white/60 bg-white/90 text-xl text-slate-600 shadow-md shadow-slate-950/10 backdrop-blur transition hover:scale-105 hover:text-rose-600 disabled:cursor-wait dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-300"
          disabled={!wishlistReady}
          onClick={() => toggleWishlist(product.id)}
          type="button"
        >
          <span aria-hidden="true">{wishlisted ? "♥" : "♡"}</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#6d806e] dark:text-[#a7c4ad]">
          {product.category}
        </p>
        <Link
          className="mt-1 line-clamp-2 min-h-12 text-[0.98rem] font-semibold leading-6 tracking-[-0.015em] text-slate-900 hover:text-[#315b49] dark:text-white dark:hover:text-[#c8dccb]"
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
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
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
          className="mt-4 w-full rounded-full bg-[#315b49] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#244536] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b49] disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-[#a7c4ad] dark:text-[#17251c] dark:hover:bg-[#c0d5c4] dark:disabled:bg-slate-700"
          disabled={!cartReady || product.stock < 1 || adding}
          onClick={handleAddToCart}
          type="button"
        >
          {adding ? "Adding…" : product.stock < 1 ? "Out of stock" : "Add to cart"}
        </button>
        <button
          className="mt-2 w-full rounded-full border border-[#a9b9a9] px-4 py-3 text-sm font-semibold text-[#315b49] transition hover:bg-[#edf1eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b49] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 dark:border-slate-600 dark:text-[#c8dccb] dark:hover:bg-slate-800 dark:disabled:border-slate-700 dark:disabled:text-slate-600"
          disabled={product.stock < 1}
          onClick={handleBuyNow}
          type="button"
        >
          {product.stock < 1 ? "Out of stock" : "Buy it now"}
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
