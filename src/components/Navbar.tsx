"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { usePrefs } from "@/context/PrefsContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useWishlist } from "@/context/WishlistContext";
import { clearAllDatabaseData } from "@/lib/db";
import { removeLocalStorage, STORAGE_KEYS } from "@/lib/storage";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/orders", label: "Orders" },
  { href: "/cart", label: "Cart" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const { itemCount, isReady: cartReady } = useCart();
  const { wishlist, isReady: wishlistReady } = useWishlist();
  const { theme, setTheme, display, setDisplay, isReady: prefsReady } = usePrefs();
  const { clearRecentlyViewed, isReady: recentReady } = useRecentlyViewed();

  const linkCount = (label: string) => {
    if (label === "Cart") {
      return cartReady ? itemCount : undefined;
    }
    if (label === "Wishlist") {
      return wishlistReady ? wishlist.length : undefined;
    }
    return undefined;
  };

  const settingsButton = (
    <button
      aria-expanded={settingsOpen}
      aria-haspopup="true"
      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      onClick={() => setSettingsOpen((open) => !open)}
      type="button"
    >
      Settings
    </button>
  );

  function clearSavedDetails() {
    if (!removeLocalStorage(STORAGE_KEYS.customer)) {
      setSettingsMessage("Saved shipping details could not be cleared.");
      return;
    }
    setSettingsMessage("Saved shipping details cleared.");
  }

  function clearRecentHistory() {
    if (!recentReady) {
      return;
    }
    clearRecentlyViewed();
    setSettingsMessage("Recently viewed history cleared.");
  }

  async function resetAllLocalData() {
    if (
      !window.confirm(
        "Reset all NeoCart data on this device? This clears your cart, wishlist, preferences, shipping details, recently viewed products, orders, and local product catalog.",
      )
    ) {
      return;
    }

    try {
      await clearAllDatabaseData();
      for (const key of Object.values(STORAGE_KEYS)) {
        if (!removeLocalStorage(key)) {
          throw new Error(`Unable to clear local storage key "${key}".`);
        }
      }
      window.location.reload();
    } catch (error) {
      console.error("Unable to reset local NeoCart data.", error);
      setSettingsMessage(
        error instanceof Error
          ? error.message
          : "Unable to reset local data. Please try again.",
      );
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          className="text-2xl font-bold tracking-tight text-indigo-700"
          href="/"
          onClick={() => setMenuOpen(false)}
        >
          NeoCart
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {links.map(({ href, label }) => (
            <Link
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-400"
              href={href}
              key={href}
            >
              {label}
              {linkCount(label) !== undefined && (
                <span
                  aria-label={`${linkCount(label)} ${label === "Cart" ? "items" : "saved products"}`}
                  className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                >
                  {linkCount(label)}
                </span>
              )}
            </Link>
          ))}
          {settingsButton}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {settingsButton}
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-xl text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden"
        >
          {links.map(({ href, label }) => (
            <Link
              className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              href={href}
              key={href}
              onClick={() => setMenuOpen(false)}
            >
              {label}
              {linkCount(label) !== undefined && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {linkCount(label)}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}

      {settingsOpen && (
        <section
          aria-label="Settings"
          className="border-t border-slate-200 bg-slate-50 px-4 py-5 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                htmlFor="settings-theme"
              >
                Theme
              </label>
              <select
                className="mt-2 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                disabled={!prefsReady}
                id="settings-theme"
                onChange={(event) =>
                  setTheme(event.target.value as "light" | "dark")
                }
                value={theme}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                htmlFor="settings-display"
              >
                Default product view
              </label>
              <select
                className="mt-2 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                disabled={!prefsReady}
                id="settings-display"
                onChange={(event) =>
                  setDisplay(event.target.value as "grid" | "list")
                }
                value={display}
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                className="min-h-10 w-full rounded-lg border border-slate-300 px-3 text-left text-sm font-semibold text-slate-700 hover:bg-white disabled:cursor-wait disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                disabled={!recentReady}
                onClick={clearRecentHistory}
                type="button"
              >
                Clear recently viewed
              </button>
            </div>
            <div className="flex items-end">
              <button
                className="min-h-10 w-full rounded-lg border border-slate-300 px-3 text-left text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={clearSavedDetails}
                type="button"
              >
                Clear saved shipping details
              </button>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <button
                className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
                onClick={() => void resetAllLocalData()}
                type="button"
              >
                Reset all local data
              </button>
              {settingsMessage && (
                <p
                  aria-live="polite"
                  className="mt-2 text-sm text-slate-600 dark:text-slate-400"
                  role="status"
                >
                  {settingsMessage}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </header>
  );
}
