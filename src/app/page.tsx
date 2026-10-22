"use client";

import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useProducts } from "@/hooks/useProducts";
import { getProductImageUrl } from "@/lib/productImage";

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-square animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  id,
  title,
}: {
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
        {eyebrow}
      </p>
      <h2
        className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
        id={id}
      >
        {title}
      </h2>
    </div>
  );
}

export default function HomePage() {
  const { products, loading, error, retry } = useProducts();
  const { recentlyViewed, isReady: recentReady } = useRecentlyViewed();
  const categories = [...new Set(products.map((product) => product.category))];
  const featuredProducts = products.filter((product) => product.featured);
  const recentlyViewedProducts = recentReady
    ? recentlyViewed
        .map((id) => products.find((product) => product.id === id))
        .filter((product) => product !== undefined)
    : [];

  return (
    <div className="flex flex-col gap-16 pb-8 sm:gap-20">
      <section className="relative isolate overflow-hidden rounded-3xl bg-indigo-950 px-6 py-16 text-white sm:px-12 sm:py-20 lg:px-16">
        <div className="absolute -right-20 -top-24 -z-10 size-80 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 -z-10 size-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">
            Everyday finds, thoughtfully picked
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find something
            <span className="block text-indigo-300">you&apos;ll love.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100 sm:text-lg">
            Shop useful, well-made favorites for your home, your routine, and
            everywhere in between.
          </p>
          <Link
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-950 transition hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href="/products"
          >
            Shop now <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[38%] items-end justify-center sm:flex"
        >
          <div className="mb-[-15%] mr-[-10%] aspect-square w-[90%] rotate-6 rounded-[3rem] border border-white/15 bg-white/5 p-5">
            {products[0]?.imageUrl && (
              <Image
                alt=""
                className="h-full w-full rounded-[2.25rem] object-cover opacity-90"
                height={800}
                priority
                sizes="(min-width: 1024px) 34vw, 0px"
                src={getProductImageUrl(products[0])}
                width={800}
              />
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="categories-heading">
        <SectionHeading
          eyebrow="Explore the collection"
          id="categories-heading"
          title="Shop by category"
        />
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
                key={index}
              />
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/40"
            role="alert"
          >
            <p className="text-sm text-rose-800 dark:text-rose-300">{error}</p>
            <button
              className="mt-3 font-semibold text-rose-900 underline dark:text-rose-200"
              onClick={retry}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => {
              const categoryProduct = products.find(
                (product) => product.category === category,
              );
              if (!categoryProduct) {
                return null;
              }

              return (
                <Link
                  className="group relative isolate aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800"
                  href={`/products?category=${encodeURIComponent(category)}`}
                  key={category}
                >
                  <Image
                    alt=""
                    className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    height={600}
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    src={getProductImageUrl(categoryProduct)}
                    width={800}
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-base font-bold text-white sm:text-lg">
                    {category}
                    <span aria-hidden="true" className="ml-2 opacity-0 transition group-hover:opacity-100">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="featured-heading">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Handpicked for you"
            id="featured-heading"
            title="Featured favorites"
          />
          <Link
            className="mb-6 shrink-0 text-sm font-semibold text-indigo-700 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            href="/products"
          >
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))
              : error ? (
                <div
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 sm:col-span-2 lg:col-span-3 xl:col-span-4"
                  role="alert"
                >
                  Featured products could not be loaded.{" "}
                  <button
                    className="font-semibold underline"
                    onClick={retry}
                    type="button"
                  >
                    Try again
                  </button>
                </div>
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No featured products are available right now.
                </p>
              )}
        </div>
      </section>

      {recentlyViewedProducts.length > 0 && (
        <section aria-labelledby="recent-heading">
          <SectionHeading
            eyebrow="Pick up where you left off"
            id="recent-heading"
            title="Recently viewed"
          />
          <div className="flex snap-x gap-5 overflow-x-auto pb-4">
            {recentlyViewedProducts.map((product) => (
              <div className="w-[min(85vw,18rem)] shrink-0 snap-start" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section
        aria-label="Shopping benefits"
        className="grid grid-cols-1 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50 px-5 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {[
          { title: "Free shipping", detail: "On orders over $50", icon: "📦" },
          { title: "Cash on delivery", detail: "Pay when it arrives", icon: "💳" },
          { title: "Easy returns", detail: "30 days to decide", icon: "↩" },
        ].map(({ title, detail, icon }) => (
          <div className="flex items-center gap-4 py-5 sm:px-5 sm:py-6" key={title}>
            <span aria-hidden="true" className="text-2xl">{icon}</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {detail}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
