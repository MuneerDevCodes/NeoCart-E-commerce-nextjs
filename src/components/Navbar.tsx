"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/orders", label: "Orders" },
  { href: "/cart", label: "Cart" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white">
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
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-700"
              href={href}
              key={href}
            >
              {label}
              {label === "Cart" && (
                <span
                  aria-label="0 items"
                  className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700"
                >
                  0
                </span>
              )}
            </Link>
          ))}
        </nav>

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-xl text-slate-700 hover:bg-slate-50 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-slate-200 px-4 py-3 md:hidden"
        >
          {links.map(({ href, label }) => (
            <Link
              className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              href={href}
              key={href}
              onClick={() => setMenuOpen(false)}
            >
              {label}
              {label === "Cart" && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  0
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
