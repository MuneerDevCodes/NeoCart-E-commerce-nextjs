"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cancelOrder, getOrder } from "@/lib/db";
import { getProductImageUrl } from "@/lib/productImage";

import type { Order, OrderStatus } from "@/types";

const statusStyles: Record<OrderStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  confirmed:
    "bg-[#e8eee8] text-[#315b49] dark:bg-slate-800 dark:text-[#c8dccb]",
  delivered:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export default function OrderDetail() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = decodeURIComponent(params.id);
  const placed = searchParams.get("placed") === "1";
  const [order, setOrder] = useState<Order>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void getOrder(id)
      .then((loadedOrder) => {
        if (!active) {
          return;
        }
        if (!loadedOrder) {
          setError("This order could not be found.");
          setOrder(undefined);
          return;
        }
        setOrder(loadedOrder);
      })
      .catch(() => {
        if (active) {
          setError("Order details could not be loaded. Please try again.");
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
  }, [id]);

  async function handleCancel() {
    setCancelling(true);
    setCancelError("");
    try {
      const cancelledOrder = await cancelOrder(id);
      setOrder(cancelledOrder);
    } catch (cancelFailure) {
      setCancelError(
        cancelFailure instanceof Error
          ? cancelFailure.message
          : "This order could not be cancelled. Please try again.",
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Order not found
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          {error || "This order could not be found."}
        </p>
        <Link
          className="mt-6 rounded-full bg-[#315b49] px-6 py-3 text-sm font-semibold text-white hover:bg-[#244536] dark:bg-[#a7c4ad] dark:text-[#17251c]"
          href="/orders"
        >
          View your orders
        </Link>
      </section>
    );
  }

  const status = order.status ?? "pending";
  const itemCount = order.items.reduce(
    (count, item) => count + item.quantity,
    0,
  );

  return (
    <div className="space-y-8">
      {placed && (
        <section
          className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/50 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div>
            <p className="font-bold text-emerald-900 dark:text-emerald-200">
              Your order has been placed!
            </p>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
              Order number: <span className="font-bold">{order.orderNumber ?? order.id}</span>
            </p>
          </div>
          <Link
            className="inline-flex shrink-0 justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            href="/products"
          >
            Continue shopping
          </Link>
        </section>
      )}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            className="text-sm font-semibold text-[#315b49] hover:underline dark:text-[#a7c4ad]"
            href="/orders"
          >
            ← Your orders
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#6d806e] dark:text-[#a7c4ad]">
            Order details
          </p>
          <h1 className="mt-2 break-all text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {order.orderNumber ?? order.id}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-sm font-bold capitalize ${statusStyles[status]}`}
        >
          {status}
        </span>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="rounded-[1.35rem] border border-[#e8e6df] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Items ({itemCount})
            </h2>
            <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
              {order.items.map((item, index) => (
                <li
                  className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0"
                  key={`${item.productId}-${index}`}
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Image
                      alt=""
                      className="h-full w-full object-cover"
                      height={160}
                      sizes="64px"
                      src={getProductImageUrl({
                        id: item.productId,
                        imageUrl: item.image,
                      })}
                      width={160}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      ${item.price.toFixed(2)} each · Quantity {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.35rem] border border-[#e8e6df] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Shipping details
            </h2>
            <address className="mt-4 not-italic text-sm leading-6 text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                {order.customer.fullName}
              </span>
              <br />
              {order.customer.phone && (
                <>
                  {order.customer.phone}
                  <br />
                </>
              )}
              {order.customer.address.line1}
              {order.customer.address.line2 && (
                <>
                  <br />
                  {order.customer.address.line2}
                </>
              )}
              <br />
              {[
                order.customer.address.city,
                order.customer.address.region,
                order.customer.address.postalCode,
              ]
                .filter(Boolean)
                .join(", ")}
              {order.customer.address.country && (
                <>
                  <br />
                  {order.customer.address.country}
                </>
              )}
            </address>
          </section>

          {order.notes && (
            <section className="rounded-[1.35rem] border border-[#e8e6df] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Order notes
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                {order.notes}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-5 rounded-[1.35rem] border border-[#e8e6df] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Payment & total
          </h2>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Payment method
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {order.paymentMethod === "cash-on-delivery"
                ? "Cash on Delivery"
                : order.paymentMethod}
            </p>
          </div>
          <dl className="space-y-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
            <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
              <dt>Subtotal</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                ${order.subtotal.toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
              <dt>Shipping</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {(order.shipping ?? 0) === 0
                  ? "Free"
                  : `$${order.shipping.toFixed(2)}`}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <dt>Total</dt>
              <dd>${order.total.toFixed(2)}</dd>
            </div>
          </dl>

          {status === "pending" && (
            <div>
              <button
                className="w-full rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950"
                disabled={cancelling}
                onClick={() => void handleCancel()}
                type="button"
              >
                {cancelling ? "Cancelling…" : "Cancel order"}
              </button>
              {cancelError && (
                <p
                  className="mt-2 text-sm text-rose-700 dark:text-rose-400"
                  role="alert"
                >
                  {cancelError}
                </p>
              )}
            </div>
          )}
          {status === "cancelled" && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              This order was cancelled and its available items were returned to
              stock.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
