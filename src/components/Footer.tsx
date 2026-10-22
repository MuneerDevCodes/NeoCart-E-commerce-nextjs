import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link className="font-semibold text-indigo-700" href="/">
          NeoCart
        </Link>
        <p>Shopping made simple.</p>
      </div>
    </footer>
  );
}
