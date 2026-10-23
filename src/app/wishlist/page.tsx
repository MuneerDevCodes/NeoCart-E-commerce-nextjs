"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useProducts } from "@/hooks/useProducts";
import { getProductImageUrl } from "@/lib/productImage";

import type { Product } from "@/types";

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"
          key={index}
        >
          <div className="aspect-square animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const { wishlist, toggleWishlist, isReady: wishlistReady } = useWishlist();
  const { products, loading, error, retry } = useProducts();
  const { addItem, isReady: cartReady } = useCart();
  const [movingId, setMovingId] = useState<string>();
  const [message, setMessage] = useState("");
  const wishedProducts = useMemo(
    () =>
      wishlist
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is Product => product !== undefined),
    [products, wishlist],
  );
  const missingCount = wishlist.length - wishedProducts.length;

  async function moveToCart(product: Product) {
    setMovingId(product.id);
    setMessage("");
    try {
      await addItem(product.id);
      toggleWishlist(product.id);
      setMessage(`${product.name} moved to your cart.`);
    } catch {
      setMessage(`Could not add ${product.name} to the cart. Please try again.`);
    } finally {
      setMovingId(undefined);
    }
  }

  if (loading || !wishlistReady) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <WishlistSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <section
        className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/40"
        role="alert"
      >
        <h1 className="text-xl font-bold text-rose-900 dark:text-rose-200">
          Wishlist products could not be loaded
        </h1>
        <p className="mt-2 text-sm text-rose-800 dark:text-rose-300">{error}</p>
        <button
          className="mt-4 rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
          onClick={retry}
          type="button"
        >
          Try again
        </button>
      </section>
    );
  }

  if (wishlist.length === 0) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <span aria-hidden="true" className="text-5xl text-rose-500">♡</span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Your wishlist is empty
        </h1>
        <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
          Save products you love and they&apos;ll be ready when you are.
        </p>
        <Link
          className="mt-7 rounded-full bg-[#315b49] px-6 py-3 text-sm font-semibold text-white hover:bg-[#244536] dark:bg-[#a7c4ad] dark:text-[#17251c]"
          href="/products"
        >
          Find something to love
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6d806e] dark:text-[#a7c4ad]">
          Saved for later
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Your wishlist
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {wishlist.length} {wishlist.length === 1 ? "saved product" : "saved products"}
        </p>
      </header>

      {missingCount > 0 && (
        <p
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
          role="status"
        >
          {missingCount} saved {missingCount === 1 ? "product is" : "products are"}{" "}
          no longer available.
          <button
            className="ml-1 font-semibold underline"
            onClick={() => {
              for (const id of wishlist) {
                if (!products.some((product) => product.id === id)) {
                  toggleWishlist(id);
                }
              }
            }}
            type="button"
          >
            Remove unavailable items
          </button>
        </p>
      )}

      {message && (
        <p
          aria-live="polite"
          className="rounded-xl bg-[#e8eee8] px-4 py-3 text-sm text-[#315b49] dark:bg-slate-800 dark:text-[#c8dccb]"
          role="status"
        >
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishedProducts.map((product, index) => (
          <article
            className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#e8e6df] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_-24px_rgba(39,53,43,0.3)] dark:border-slate-800 dark:bg-slate-900"
            key={product.id}
          >
            <div             className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 sm:aspect-square">
              <Link
                aria-label={`View ${product.name}`}
                className="absolute inset-0"
                href={`/products/${product.id}`}
              >
                <Image
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  height={700}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                  src={getProductImageUrl(product)}
                  width={700}
                />
              </Link>
              <button
                aria-label={`Remove ${product.name} from wishlist`}
                className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-white text-xl text-rose-600 shadow hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950"
                onClick={() => toggleWishlist(product.id)}
                type="button"
              >
                <span aria-hidden="true">♥</span>
              </button>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#6d806e] dark:text-[#a7c4ad]">
                {product.category}
              </p>
              <Link
                className="mt-1 font-semibold text-slate-900 hover:text-[#315b49] dark:text-white dark:hover:text-[#c8dccb]"
                href={`/products/${product.id}`}
              >
                {product.name}
              </Link>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                ${product.price.toFixed(2)}
              </p>
              <button
                className="mt-4 min-h-11 rounded-full bg-[#315b49] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#244536] disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-[#a7c4ad] dark:text-[#17251c] dark:disabled:bg-slate-700"
                disabled={!cartReady || product.stock < 1 || movingId === product.id}
                onClick={() => void moveToCart(product)}
                type="button"
              >
                {movingId === product.id
                  ? "Moving…"
                  : product.stock < 1
                    ? "Out of stock"
                    : "Move to cart"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
