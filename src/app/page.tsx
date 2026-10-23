"use client";

import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useProducts } from "@/hooks/useProducts";
import { getProductImageUrl } from "@/lib/productImage";

const HOMEPAGE_PRODUCT_LIMIT = 8;

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
  const homepageProducts = [
    ...featuredProducts,
    ...products.filter((product) => !product.featured),
  ].slice(0, HOMEPAGE_PRODUCT_LIMIT);
  const recentlyViewedProducts = recentReady
    ? recentlyViewed
        .map((id) => products.find((product) => product.id === id))
        .filter((product) => product !== undefined)
    : [];

  return (
    <div className="flex flex-col gap-20 pb-10 sm:gap-24">
      <section className="relative isolate min-h-[30rem] overflow-hidden rounded-[2rem] bg-[#e8e9df] text-[#202b24] dark:bg-[#27332b] dark:text-white sm:min-h-[34rem]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_55%,rgba(255,255,255,0.7),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_80%_55%,rgba(178,200,174,0.14),transparent_50%)]" />
        <div className="relative z-10 flex min-h-[30rem] max-w-3xl flex-col items-start justify-center px-7 py-14 sm:min-h-[34rem] sm:px-12 lg:px-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#315b49]/15 bg-white/55 px-3.5 py-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#496552] dark:border-white/15 dark:bg-white/5 dark:text-[#c1d2bf]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#66846a]" />
            Everyday finds, thoughtfully picked
          </p>
          <h1 className="mt-7 max-w-xl text-[3.25rem] font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
            Make room for
            <span className="mt-1 block font-serif font-medium italic text-[#66816a] dark:text-[#bfd0ba]">
              the good stuff.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#59635a] dark:text-slate-300 sm:text-lg">
            Shop useful, well-made favorites for your home, your routine, and
            everywhere in between.
          </p>
          <Link
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-[#315b49] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#315b49]/15 transition hover:-translate-y-0.5 hover:bg-[#244536] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b49] dark:bg-[#c1d2bf] dark:text-[#1b2b20] dark:hover:bg-white"
            href="/products"
          >
            Explore the collection <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] items-center justify-center sm:flex"
        >
          <div className="relative aspect-[0.82] h-[84%] max-h-[30rem] translate-x-4 rotate-2 overflow-hidden rounded-[1.5rem] border-[7px] border-white/80 bg-white/50 shadow-[0_30px_90px_-35px_rgba(32,48,37,0.4)] dark:border-white/10">
            {products[0]?.imageUrl && (
              <Image
                alt=""
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
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
                  className="group relative isolate aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-slate-200 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800"
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
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/80 via-slate-950/5 to-transparent transition group-hover:from-slate-950/90" />
                  <span className="absolute bottom-4 left-4 text-base font-semibold tracking-tight text-white sm:bottom-5 sm:left-5 sm:text-lg">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: HOMEPAGE_PRODUCT_LIMIT }, (_, index) => (
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
              ) : homepageProducts.length > 0 ? (
                homepageProducts.map((product) => (
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
        className="grid grid-cols-1 divide-y divide-[#e5e3dc] rounded-[1.5rem] border border-[#e8e6df] bg-white/65 px-5 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
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
