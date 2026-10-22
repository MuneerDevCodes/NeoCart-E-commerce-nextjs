"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllOrders } from "@/lib/db";
import type { Order, OrderStatus } from "@/types";

const statusStyles: Record<OrderStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  confirmed:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  delivered:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

function displayStatus(status: OrderStatus | undefined): OrderStatus {
  return status ?? "pending";
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
          key={index}
        />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getAllOrders()
      .then((loadedOrders) => {
        if (active) {
          setOrders(loadedOrders);
        }
      })
      .catch(() => {
        if (active) {
          setError("Order history could not be loaded. Please refresh to try again.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Your NeoCart purchases
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Your orders
        </h1>
      </header>

      {loading ? (
        <OrdersSkeleton />
      ) : error ? (
        <p
          className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200"
          role="alert"
        >
          {error}
        </p>
      ) : orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
          <p aria-hidden="true" className="text-4xl">▤</p>
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            No orders yet
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Your completed checkouts will appear here.
          </p>
          <Link
            className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            href="/products"
          >
            Start shopping
          </Link>
        </section>
      ) : (
        <section aria-label="Order history" className="space-y-4">
          {orders.map((order) => {
            const status = displayStatus(order.status);
            const itemCount = order.items.reduce(
              (count, item) => count + item.quantity,
              0,
            );

            return (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                key={order.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Order
                    </p>
                    <h2 className="mt-1 font-bold text-slate-900 dark:text-white">
                      {order.orderNumber ?? order.id}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[status]}`}
                  >
                    {status}
                  </span>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                      Items
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                      Total
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      ${order.total.toFixed(2)}
                    </dd>
                  </div>
                  <div className="col-span-2 flex items-end sm:col-span-1 sm:justify-end">
                    <Link
                      className="text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-400"
                      href={`/orders/${encodeURIComponent(order.id)}`}
                    >
                      View order <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </dl>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
