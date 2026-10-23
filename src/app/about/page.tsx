import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | NeoCart",
  description: "Learn about NeoCart and our approach to everyday shopping.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10">
      <header className="border-b border-[#e7e5dd] pb-8 dark:border-slate-800">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6d806e] dark:text-[#a7c4ad]">
          About us
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-slate-900 dark:text-white sm:text-6xl">
          Everyday shopping, made simple.
        </h1>
      </header>

      <div className="max-w-2xl space-y-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
        <p>
          NeoCart is a browser-based storefront for discovering useful,
          thoughtfully selected products for your home and daily routine.
        </p>
        <p>
          Browse the catalog, save favorites, and keep track of your cart and
          orders. Your shopping activity stays in this browser, so you can use
          the store without creating an account.
        </p>
      </div>

      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#315b49] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#244536] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b49] dark:bg-[#a7c4ad] dark:text-slate-950 dark:hover:bg-[#c0d5c4]"
        href="/products"
      >
        Browse products
      </Link>
    </div>
  );
}
