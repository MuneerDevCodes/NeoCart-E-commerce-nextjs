import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 bg-[#202c25] text-white dark:bg-[#0e120f]">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8 lg:py-16">
        <div className="max-w-sm">
          <Link
            className="inline-flex items-center gap-2.5 text-xl font-bold tracking-[-0.04em]"
            href="/"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#d9e4d7] text-sm font-extrabold text-[#25382c]">
              N
            </span>
            NeoCart
          </Link>
          <p className="mt-4 text-sm leading-6 text-white/65">
            A considered collection of everyday essentials, chosen to make
            good design feel at home.
          </p>
        </div>
        <nav aria-label="Shop" className="flex flex-col items-start gap-3">
          <h2 className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#c1d2bf]">
            Shop
          </h2>
          <Link
            className="text-sm text-white/70 transition hover:text-white"
            href="/products"
          >
            Browse products
          </Link>
          <Link
            className="text-sm text-white/70 transition hover:text-white"
            href="/orders"
          >
            Your orders
          </Link>
        </nav>
        <nav aria-label="Information" className="flex flex-col items-start gap-3">
          <h2 className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#c1d2bf]">
            Information
          </h2>
          <Link
            className="text-sm text-white/70 transition hover:text-white"
            href="/about"
          >
            About NeoCart
          </Link>
          <Link
            className="text-sm text-white/70 transition hover:text-white"
            href="/contact"
          >
            Contact
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Thoughtfully picked. Made for everyday.</span>
          <span>© {new Date().getFullYear()} NeoCart</span>
        </div>
      </div>
    </footer>
  );
}
