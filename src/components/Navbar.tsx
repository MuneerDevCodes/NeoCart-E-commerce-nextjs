"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { usePrefs } from "@/context/PrefsContext";
import { useWishlist } from "@/context/WishlistContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/orders", label: "Orders" },
  { href: "/cart", label: "Cart" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, isReady: cartReady } = useCart();
  const { wishlist, isReady: wishlistReady } = useWishlist();
  const { theme, toggleTheme, isReady: prefsReady } = usePrefs();

  const linkCount = (label: string) => {
    if (label === "Cart") {
      return cartReady ? itemCount : undefined;
    }
    if (label === "Wishlist") {
      return wishlistReady ? wishlist.length : undefined;
    }
    return undefined;
  };

  const themeButton = (
    <button
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-wait dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      disabled={!prefsReady}
      onClick={toggleTheme}
      type="button"
    >
      {prefsReady ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme"}
    </button>
  );

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
          {themeButton}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {themeButton}
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
    </header>
  );
}
