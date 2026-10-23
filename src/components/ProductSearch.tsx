"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useProducts } from "@/hooks/useProducts";
import { getProductImageUrl } from "@/lib/productImage";
import {
  getProductSearchRank,
  normalizeProductSearchText,
} from "@/lib/productSearch";

export default function ProductSearch() {
  const router = useRouter();
  const { products, loading, error, retry } = useProducts();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = "navbar-product-search-results";
  const normalizedQuery = normalizeProductSearchText(query);

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return products
      .map((product) => ({
        product,
        rank: getProductSearchRank(product, normalizedQuery),
      }))
      .filter(({ rank }) => Number.isFinite(rank))
      .sort(
        (first, second) =>
          first.rank - second.rank ||
          first.product.name.localeCompare(second.product.name),
      )
      .map(({ product }) => product);
  }, [normalizedQuery, products]);

  function goToAllResults(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = query.trim();
    if (!search) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/products?search=${encodeURIComponent(search)}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) =>
        index <= 0 ? results.length - 1 : index - 1,
      );
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      router.push(`/products/${encodeURIComponent(results[activeIndex].id)}`);
    }
  }

  const showResults = isOpen && normalizedQuery.length > 0;

  return (
    <div
      className="relative z-30 mx-auto w-full max-w-3xl"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      }}
      ref={containerRef}
    >
      <form className="flex" onSubmit={goToAllResults} role="search">
        <label className="sr-only" htmlFor="navbar-product-search">
          Search products by name, category, or description
        </label>
        <div className="relative flex min-w-0 flex-1 items-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 text-slate-500 dark:text-slate-400"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.5 4.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            aria-activedescendant={
              showResults && activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            aria-autocomplete="list"
            aria-controls={showResults && !loading && !error ? listboxId : undefined}
            aria-expanded={showResults}
            autoComplete="off"
            className="min-h-12 w-full rounded-l-full border border-r-0 border-slate-300 bg-white py-3 pl-12 pr-10 text-base text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#78917a] focus:ring-2 focus:ring-inset focus:ring-[#315b49]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
            id="navbar-product-search"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(-1);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="What are you looking for? Try headphones or home..."
            ref={inputRef}
            role="combobox"
            type="search"
            value={query}
          />
          {query && (
            <button
              aria-label="Clear search"
              className="absolute right-2 inline-flex size-9 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-[#315b49] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={() => {
                setQuery("");
                setActiveIndex(-1);
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
        <button
          className="min-h-12 shrink-0 rounded-r-full bg-[#315b49] px-5 text-sm font-semibold text-white transition hover:bg-[#244536] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b49] dark:bg-[#a7c4ad] dark:text-[#17251c] dark:hover:bg-[#c0d5c4]"
          type="submit"
        >
          Search
        </button>
      </form>

      {showResults && (
        <div
          className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/15 dark:border-slate-700 dark:bg-slate-900"
        >
          <p
            aria-live="polite"
            className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300"
          >
            {loading
              ? "Loading products..."
              : error
                ? "Product search is unavailable."
                : results.length > 0
                  ? `${results.length} ${results.length === 1 ? "product" : "products"} found. Choose one or press Search to see all results.`
                  : "No matches yet. Try a product name, category, or a shorter word."}
          </p>
          {error ? (
            <button
              className="w-full px-4 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
              onClick={retry}
              type="button"
            >
              Try loading products again
            </button>
          ) : (
            <ul
              className="max-h-[min(65vh,28rem)] overflow-y-auto overscroll-contain py-1"
              id={listboxId}
              role="listbox"
            >
              {results.map((product, index) => (
                <li key={product.id}>
                  <Link
                    aria-selected={activeIndex === index}
                    className={`flex items-center gap-3 px-4 py-3 transition ${
                      activeIndex === index
                        ? "bg-[#edf1eb] dark:bg-slate-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                    }`}
                    href={`/products/${encodeURIComponent(product.id)}`}
                    id={`${listboxId}-option-${index}`}
                    onClick={() => {
                      setIsOpen(false);
                      setActiveIndex(-1);
                    }}
                    role="option"
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="48px"
                        src={getProductImageUrl(product)}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                        {product.category}
                        {product.stock < 1 ? " · Out of stock" : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      ${product.price.toFixed(2)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
