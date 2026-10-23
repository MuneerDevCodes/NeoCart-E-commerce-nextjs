"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { usePrefs } from "@/context/PrefsContext";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types";

type SortOrder = "newest" | "price-asc" | "price-desc" | "rating" | "name";

const sortOptions: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Rating" },
  { value: "name", label: "Name: A to Z" },
];

function ProductSkeleton({ list }: { list: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${
        list ? "flex" : ""
      }`}
    >
      <div
        className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${
          list ? "w-28 shrink-0 sm:w-44" : "aspect-square"
        }`}
      />
      <div className="flex-1 space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function ProductsListing() {
  const { products, loading, error, retry } = useProducts();
  const { display, setDisplay } = usePrefs();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [searchDraft, setSearchDraft] = useState(
    searchParams.get("search") ?? "",
  );
  const [isPending, startTransition] = useTransition();
  const paramsRef = useRef(searchParams.toString());

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStockOnly = searchParams.get("inStock") === "1";
  const requestedSort = searchParams.get("sort");
  const sort: SortOrder = sortOptions.some(
    (option) => option.value === requestedSort,
  )
    ? (requestedSort as SortOrder)
    : "newest";
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products],
  );

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(paramsRef.current);
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const query = params.toString();
      paramsRef.current = query;
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router],
  );

  useEffect(() => {
    paramsRef.current = searchParams.toString();
  }, [searchParams]);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      if (trimmed !== search) {
        updateParams({ search: trimmed });
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchDraft, search, updateParams]);

  const clearFilters = useCallback(() => {
    setSearchDraft("");
    paramsRef.current = "";
    startTransition(() => router.push(pathname, { scroll: false }));
  }, [pathname, router]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLocaleLowerCase().includes(query) ||
        product.description.toLocaleLowerCase().includes(query);
      const matchesCategory = !category || product.category === category;
      const matchesMin =
        minPrice === "" ||
        (Number.isFinite(Number(minPrice)) && product.price >= Number(minPrice));
      const matchesMax =
        maxPrice === "" ||
        (Number.isFinite(Number(maxPrice)) && product.price <= Number(maxPrice));
      const matchesStock = !inStockOnly || product.stock > 0;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMin &&
        matchesMax &&
        matchesStock
      );
    });

    return filtered.sort((first, second) => {
      switch (sort) {
        case "price-asc":
          return first.price - second.price;
        case "price-desc":
          return second.price - first.price;
        case "rating":
          return second.rating - first.rating;
        case "name":
          return first.name.localeCompare(second.name);
        case "newest":
        default:
          return second.createdAt - first.createdAt;
      }
    });
  }, [products, search, category, minPrice, maxPrice, inStockOnly, sort]);

  const hasFilters =
    Boolean(search || category || minPrice || maxPrice || inStockOnly);
  const filters = (idPrefix: string) => (
    <div className="space-y-6">
      <div>
        <label
          className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
          htmlFor={`${idPrefix}-category-filter`}
        >
          Category
        </label>
        <select
          className="w-full rounded-xl border border-[#deded5] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#78917a] focus:ring-2 focus:ring-[#315b49]/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          id={`${idPrefix}-category-filter`}
          onChange={(event) => updateParams({ category: event.target.value })}
          value={category}
        >
          <option value="">All categories</option>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Price range
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-600 dark:text-slate-400">
            Minimum
            <input
              className="mt-1 w-full rounded-xl border border-[#deded5] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#78917a] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              min="0"
              onChange={(event) => updateParams({ minPrice: event.target.value })}
              placeholder="$0"
              type="number"
              value={minPrice}
            />
          </label>
          <label className="text-xs text-slate-600 dark:text-slate-400">
            Maximum
            <input
              className="mt-1 w-full rounded-xl border border-[#deded5] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#78917a] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              min="0"
              onChange={(event) => updateParams({ maxPrice: event.target.value })}
              placeholder="Any"
              type="number"
              value={maxPrice}
            />
          </label>
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
        <input
          checked={inStockOnly}
          className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          onChange={(event) =>
            updateParams({ inStock: event.target.checked ? "1" : "" })
          }
          type="checkbox"
        />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <p         className="text-xs font-bold uppercase tracking-[0.2em] text-[#6d806e] dark:text-[#a7c4ad]">
          The NeoCart collection
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Shop all products
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Browse everyday favorites and narrow the collection to find just what
          you need.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="rounded-[1.35rem] border border-[#e8e6df] bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
          <details className="group lg:hidden">
            <summary className="cursor-pointer list-none text-sm font-bold text-slate-900 marker:hidden dark:text-white">
              <span className="flex items-center justify-between">
                Filters
                <span aria-hidden="true" className="text-slate-500 group-open:rotate-180">
                  ▼
                </span>
              </span>
            </summary>
            <div className="mt-5">{filters("mobile")}</div>
          </details>
          <div className="hidden lg:block">
            <h2 className="mb-5 text-base font-bold text-slate-900 dark:text-white">
              Filters
            </h2>
            {filters("desktop")}
          </div>
        </aside>

        <section aria-label="Product results" className="min-w-0">
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="product-search">
                Search products
              </label>
              <input
                autoComplete="off"
                className="min-h-12 min-w-0 flex-1 rounded-full border border-[#deded5] bg-white px-5 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#78917a] focus:ring-2 focus:ring-[#315b49]/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400"
                id="product-search"
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search by name or description"
                type="search"
                value={searchDraft}
              />
              <label className="sr-only" htmlFor="product-sort">
                Sort products
              </label>
              <select
                className="min-h-12 rounded-full border border-[#deded5] bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#78917a] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                id="product-sort"
                onChange={(event) =>
                  updateParams({ sort: event.target.value === "newest" ? "" : event.target.value })
                }
                value={sort}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p aria-live="polite" className="text-sm text-slate-600 dark:text-slate-400">
                {loading
                  ? "Loading products…"
                  : `${filteredProducts.length} ${
                      filteredProducts.length === 1 ? "product" : "products"
                    }`}
                {isPending && <span className="sr-only"> Updating results</span>}
              </p>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <button
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={clearFilters}
                    type="button"
                  >
                    Clear filters
                  </button>
                )}
                <div
                  aria-label="Product display mode"
                  className="inline-flex rounded-full border border-[#deded5] bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
                  role="group"
                >
                  <button
                    aria-label="Grid view"
                    aria-pressed={display === "grid"}
                    className={`rounded-md px-2.5 py-1.5 text-sm ${
                      display === "grid"
                        ? "bg-[#e8eee8] text-[#315b49] dark:bg-slate-800 dark:text-[#c8dccb]"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                    onClick={() => setDisplay("grid")}
                    type="button"
                  >
                    ▦
                  </button>
                  <button
                    aria-label="List view"
                    aria-pressed={display === "list"}
                    className={`rounded-md px-2.5 py-1.5 text-sm ${
                      display === "list"
                        ? "bg-[#e8eee8] text-[#315b49] dark:bg-slate-800 dark:text-[#c8dccb]"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                    onClick={() => setDisplay("list")}
                    type="button"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div
              className={
                display === "grid"
                  ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  : "space-y-4"
              }
            >
              {Array.from({ length: 6 }, (_, index) => (
                <ProductSkeleton key={index} list={display === "list"} />
              ))}
            </div>
          ) : error ? (
            <div
              className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center dark:border-rose-900 dark:bg-rose-950/40"
              role="alert"
            >
              <h2 className="text-lg font-bold text-rose-900 dark:text-rose-200">
                Could not load products
              </h2>
              <p className="mt-2 text-sm text-rose-800 dark:text-rose-300">
                {error}
              </p>
              <button
                className="mt-5 rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
                onClick={retry}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              className={
                display === "grid"
                  ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  : "space-y-4"
              }
            >
              {filteredProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  layout={display}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
              <p aria-hidden="true" className="text-4xl">⌕</p>
              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                No products found
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Try changing your search or filters to see more products.
              </p>
              {hasFilters && (
                <button
                  className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  onClick={clearFilters}
                  type="button"
                >
                  Clear filters
                </button>
              )}
              <Link
                className="mt-5 block text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-400"
                href="/products"
              >
                Browse all products
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
