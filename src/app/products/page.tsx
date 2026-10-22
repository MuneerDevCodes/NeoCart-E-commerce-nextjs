import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsListing from "@/components/ProductsListing";

export const metadata: Metadata = {
  title: "Shop all products | NeoCart",
};

function ProductsPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="hidden animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 lg:block" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsListing />
    </Suspense>
  );
}
