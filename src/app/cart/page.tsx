"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types";

const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING = 6.99;

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            className="flex h-36 animate-pulse gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            key={index}
          >
            <div className="size-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-3 py-2">
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-28 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

type CartLine = {
  productId: string;
  quantity: number;
  product: Product | undefined;
};

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    isReady: cartReady,
  } = useCart();
  const { products, loading: productsLoading } = useProducts();

  const lines = useMemo<CartLine[]>(
    () =>
      items.map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.productId),
      })),
    [items, products],
  );
  const validLines = lines.filter(
    (line): line is CartLine & { product: Product } =>
      line.product !== undefined,
  );
  const subtotal = validLines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING;
  const total = subtotal + shipping;
  const loading = !cartReady || productsLoading;

  async function changeQuantity(productId: string, quantity: number) {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      console.error("Unable to update cart quantity.", error);
    }
  }

  if (loading) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <span aria-hidden="true" className="text-5xl">🛍</span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
          Find something you love and it will be waiting here.
        </p>
        <Link
          className="mt-7 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          href="/products"
        >
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Your selections
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Your cart
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {items.reduce((count, item) => count + item.quantity, 0)}{" "}
            {items.reduce((count, item) => count + item.quantity, 0) === 1
              ? "item"
              : "items"}
          </p>
        </div>
        <button
          className="text-sm font-semibold text-rose-700 hover:underline dark:text-rose-400"
          onClick={clearCart}
          type="button"
        >
          Clear cart
        </button>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Cart items" className="space-y-4">
          {lines.map((line) =>
            line.product ? (
              <article
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center"
                key={line.productId}
              >
                <Link
                  aria-label={`View ${line.product.name}`}
                  className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:size-28"
                  href={`/products/${line.product.id}`}
                >
                  <Image
                    alt={line.product.name}
                    className="h-full w-full object-cover"
                    height={300}
                    src={line.product.imageUrl}
                    unoptimized
                    width={300}
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {line.product.category}
                    </p>
                    <Link
                      className="mt-1 block truncate font-semibold text-slate-900 hover:text-indigo-700 dark:text-white dark:hover:text-indigo-300"
                      href={`/products/${line.product.id}`}
                    >
                      {line.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      ${line.product.price.toFixed(2)} each
                    </p>
                    {line.quantity > line.product.stock && (
                      <p className="mt-1 text-xs font-medium text-rose-700 dark:text-rose-400">
                        Only {line.product.stock} currently in stock.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div
                      aria-label={`Quantity for ${line.product.name}`}
                      className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700"
                    >
                      <button
                        aria-label={`Decrease ${line.product.name} quantity`}
                        className="inline-flex size-10 items-center justify-center text-lg text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
                        disabled={line.quantity <= 1}
                        onClick={() =>
                          void changeQuantity(line.productId, line.quantity - 1)
                        }
                        type="button"
                      >
                        −
                      </button>
                      <span className="min-w-9 text-center text-sm font-semibold text-slate-900 dark:text-white">
                        {line.quantity}
                      </span>
                      <button
                        aria-label={`Increase ${line.product.name} quantity`}
                        className="inline-flex size-10 items-center justify-center text-lg text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
                        disabled={
                          line.quantity >= line.product.stock ||
                          line.product.stock < 1
                        }
                        onClick={() =>
                          void changeQuantity(line.productId, line.quantity + 1)
                        }
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <p className="min-w-20 text-right font-bold text-slate-900 dark:text-white">
                      ${(line.product.price * line.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  aria-label={`Remove ${line.product.name} from cart`}
                  className="self-start text-xs font-semibold text-rose-700 hover:underline dark:text-rose-400 sm:self-center"
                  onClick={() => removeItem(line.productId)}
                  type="button"
                >
                  Remove
                </button>
              </article>
            ) : (
              <article
                className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/40 sm:flex-row sm:items-center sm:justify-between"
                key={line.productId}
              >
                <div>
                  <p className="font-semibold text-rose-900 dark:text-rose-200">
                    Product no longer available
                  </p>
                  <p className="mt-1 text-sm text-rose-800 dark:text-rose-300">
                    This item (ID: {line.productId}) is no longer in the catalog
                    and cannot be checked out.
                  </p>
                </div>
                <button
                  className="shrink-0 self-start rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-950 sm:self-center"
                  onClick={() => removeItem(line.productId)}
                  type="button"
                >
                  Remove item
                </button>
              </article>
            ),
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Order summary
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
              <dt>Subtotal</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                ${subtotal.toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
              <dt>Shipping</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </dd>
            </div>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="flex justify-between gap-4 text-base font-bold text-slate-900 dark:text-white">
                <dt>Total</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </div>
          </dl>

          {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
            <p className="mt-4 rounded-lg bg-indigo-50 px-3 py-2 text-xs leading-5 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
              Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for
              free shipping.
            </p>
          )}
          {subtotal >= FREE_SHIPPING_THRESHOLD && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              Your order qualifies for free shipping.
            </p>
          )}

          <Link
            aria-disabled={validLines.length === 0}
            className={`mt-5 flex min-h-12 items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition ${
              validLines.length > 0
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "pointer-events-none bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            }`}
            href={validLines.length > 0 ? "/checkout" : "#"}
            tabIndex={validLines.length > 0 ? undefined : -1}
          >
            Proceed to checkout
          </Link>
          {validLines.length === 0 && (
            <p className="mt-3 text-center text-xs text-rose-700 dark:text-rose-400">
              Remove unavailable products to continue.
            </p>
          )}
          <Link
            className="mt-4 block text-center text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-400"
            href="/products"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
