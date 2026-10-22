import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">
        Welcome to NeoCart
      </p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Find something you&apos;ll love.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
        Explore a thoughtful collection of everyday favorites, all in one place.
      </p>
      <Link
        className="mt-8 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        href="/products"
      >
        Browse products
      </Link>
    </section>
  );
}
