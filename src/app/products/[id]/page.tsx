"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useWishlist } from "@/context/WishlistContext";
import { useProduct, useProducts } from "@/hooks/useProducts";

function ProductDetailSkeleton() {
  return (
    <div className="space-y-10">
      <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-5 py-4">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { product, loading } = useProduct(id);
  const { products, loading: productsLoading } = useProducts();
  const {
    recentlyViewed,
    addRecentlyViewed,
    isReady: recentReady,
  } = useRecentlyViewed();
  const { addItem, isReady: cartReady } = useCart();
  const {
    isWishlisted,
    toggleWishlist,
    isReady: wishlistReady,
  } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(null);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  }>();

  useEffect(() => {
    setQuantity(1);
    setNotice(undefined);
  }, [id]);

  useEffect(() => {
    if (product && recentReady) {
      addRecentlyViewed(product.id);
    }
  }, [product, recentReady, addRecentlyViewed]);

  const relatedProducts = useMemo(
    () =>
      product
        ? products
            .filter(
              (candidate) =>
                candidate.category === product.category &&
                candidate.id !== product.id,
            )
            .slice(0, 4)
        : [],
    [product, products],
  );

  const recentlyViewedProducts = useMemo(
    () =>
      recentReady
        ? recentlyViewed
            .filter((recentId) => recentId !== id)
            .map((recentId) =>
              products.find((candidate) => candidate.id === recentId),
            )
            .filter((candidate) => candidate !== undefined)
            .slice(0, 4)
        : [],
    [id, products, recentReady, recentlyViewed],
  );

  async function handlePurchase(action: "cart" | "buy") {
    if (!product) {
      return;
    }

    setPendingAction(action);
    setNotice(undefined);
    try {
      await addItem(product.id, quantity);
      if (action === "buy") {
        router.push("/checkout");
        return;
      }
      setNotice({
        kind: "success",
        text: `${quantity} ${quantity === 1 ? "item" : "items"} added to cart`,
      });
    } catch (error) {
      console.error("Unable to add product to cart.", error);
      setNotice({
        kind: "error",
        text: "Could not add this item to your cart. Please try again.",
      });
    } finally {
      setPendingAction(null);
    }
  }

  if (loading || productsLoading || !recentReady) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          NeoCart
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
          Product not found
        </h1>
        <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
          This product may have been removed or the link may be incorrect.
        </p>
        <Link
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          href="/products"
        >
          Browse products
        </Link>
      </section>
    );
  }

  const wishlisted = wishlistReady && isWishlisted(product.id);
  const discountPercent =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : undefined;
  const stockLabel =
    product.stock === 0
      ? "Out of stock"
      : product.stock <= 5
        ? `Only ${product.stock} left`
        : "In stock";

  return (
    <div className="space-y-16">
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400">
          <li>
            <Link className="hover:text-indigo-700 dark:hover:text-indigo-400" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="hover:text-indigo-700 dark:hover:text-indigo-400"
              href="/products"
            >
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="hover:text-indigo-700 dark:hover:text-indigo-400"
              href={`/products?category=${encodeURIComponent(product.category)}`}
            >
              {product.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-slate-800 dark:text-slate-200">
            {product.name}
          </li>
        </ol>
      </nav>

      <section className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900">
          <Image
            alt={product.name}
            className="h-full w-full object-cover"
            height={1000}
            priority
            src={product.imageUrl}
            unoptimized
            width={1000}
          />
          {discountPercent !== undefined && (
            <span className="absolute left-5 top-5 rounded-full bg-rose-600 px-3 py-1.5 text-sm font-bold text-white">
              Save {discountPercent}%
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            {product.category}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span aria-label={`${product.rating} out of 5 stars`} className="text-amber-500">
              ★
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {product.rating.toFixed(1)} / 5
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              |
            </span>
            <span
              className={`text-sm font-semibold ${
                product.stock === 0
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {stockLabel}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice !== undefined &&
              product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-slate-500 line-through dark:text-slate-400">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                    {discountPercent}% off
                  </span>
                </>
              )}
          </div>

          <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-300">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Quantity
              <input
                className="mt-2 block h-12 w-24 rounded-xl border border-slate-300 bg-white px-3 text-center text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
                max={product.stock}
                min={1}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isFinite(next)) {
                    setQuantity(
                      Math.min(product.stock, Math.max(1, Math.trunc(next))),
                    );
                  }
                }}
                type="number"
                value={quantity}
                disabled={product.stock === 0}
              />
            </label>
            <button
              aria-label={
                wishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              aria-pressed={wishlisted}
              className="inline-flex size-12 items-center justify-center rounded-xl border border-slate-300 text-2xl text-slate-600 hover:border-rose-300 hover:text-rose-600 disabled:cursor-wait dark:border-slate-700 dark:text-slate-300"
              disabled={!wishlistReady}
              onClick={() => toggleWishlist(product.id)}
              type="button"
            >
              <span aria-hidden="true">{wishlisted ? "♥" : "♡"}</span>
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              className="min-h-12 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
              disabled={!cartReady || product.stock === 0 || pendingAction !== null}
              onClick={() => void handlePurchase("cart")}
              type="button"
            >
              {pendingAction === "cart" ? "Adding…" : "Add to cart"}
            </button>
            <button
              className="min-h-12 rounded-xl border border-indigo-600 px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 dark:text-indigo-300 dark:hover:bg-indigo-950 dark:disabled:border-slate-700 dark:disabled:text-slate-600"
              disabled={!cartReady || product.stock === 0 || pendingAction !== null}
              onClick={() => void handlePurchase("buy")}
              type="button"
            >
              {pendingAction === "buy" ? "Preparing checkout…" : "Buy now"}
            </button>
          </div>

          {notice && (
            <p
              aria-live="polite"
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
                notice.kind === "success"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              }`}
              role={notice.kind === "error" ? "alert" : "status"}
            >
              {notice.text}
            </p>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-products-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                More to explore
              </p>
              <h2
                className="mt-2 text-2xl font-bold text-slate-900 dark:text-white"
                id="related-products-heading"
              >
                Related products
              </h2>
            </div>
            <Link
              className="text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-400"
              href={`/products?category=${encodeURIComponent(product.category)}`}
            >
              View category
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}

      {recentlyViewedProducts.length > 0 && (
        <section aria-labelledby="recently-viewed-heading">
          <h2
            className="mb-6 text-2xl font-bold text-slate-900 dark:text-white"
            id="recently-viewed-heading"
          >
            Recently viewed
          </h2>
          <div className="flex snap-x gap-5 overflow-x-auto pb-4">
            {recentlyViewedProducts.map((recentProduct) => (
              <div
                className="w-[min(85vw,18rem)] shrink-0 snap-start"
                key={recentProduct.id}
              >
                <ProductCard product={recentProduct} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
