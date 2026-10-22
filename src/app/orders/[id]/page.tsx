import { Suspense } from "react";
import OrderDetail from "@/components/OrderDetail";

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetail />
    </Suspense>
  );
}
