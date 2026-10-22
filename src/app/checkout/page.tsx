"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { placeOrder } from "@/lib/db";
import { STORAGE_KEYS } from "@/lib/storage";
import { useProducts } from "@/hooks/useProducts";
import { getProductImageUrl } from "@/lib/productImage";
import type { CustomerDetails, Product } from "@/types";


const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING = 6.99;
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type CheckoutFields = {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  notes: string;
};

type SavedShippingDetails = Omit<CheckoutFields, "notes">;
type CheckoutField = keyof CheckoutFields;
type CheckoutErrors = Partial<Record<CheckoutField, string>>;

const emptyFields: CheckoutFields = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  postalCode: "",
  notes: "",
};

function makeOrderNumber() {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const suffix = [...bytes]
    .map((byte) => alphabet[byte % alphabet.length])
    .join("");
  return `NC-${datePart}-${suffix}`;
}

function validateFields(fields: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (fields.fullName.trim().length < 2) {
    errors.fullName = "Enter your full name.";
  }

  const phoneDigits = fields.phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = "Enter a valid phone number with 7 to 15 digits.";
  }

  if (fields.addressLine.trim().length < 5) {
    errors.addressLine = "Enter your street address.";
  }
  if (fields.city.trim().length < 2) {
    errors.city = "Enter your city.";
  }
  if (!fields.postalCode.trim()) {
    errors.postalCode = "Enter your postal code.";
  }
  return errors;
}

function isSavedShippingDetails(
  value: SavedShippingDetails | null,
): value is SavedShippingDetails {
  return (
    value !== null &&
    typeof value.fullName === "string" &&
    typeof value.phone === "string" &&
    typeof value.addressLine === "string" &&
    typeof value.city === "string" &&
    typeof value.postalCode === "string"
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="h-[34rem] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    clearCart,
    isReady: cartReady,
  } = useCart();
  const {
    products,
    loading: productsLoading,
    error: productsError,
    retry: retryProducts,
  } = useProducts();
  const {
    value: savedDetails,
    setValue: setSavedDetails,
    removeValue: removeSavedDetails,
    isReady: savedDetailsReady,
  } = useLocalStorage<SavedShippingDetails | null>(STORAGE_KEYS.customer, null);
  const [editedFields, setEditedFields] = useState<CheckoutFields | null>(null);
  const [saveConsent, setSaveConsent] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const usableSavedDetails = isSavedShippingDetails(savedDetails)
    ? savedDetails
    : null;
  const fields: CheckoutFields = editedFields ?? {
    ...emptyFields,
    ...(usableSavedDetails ?? {}),
  };
  const shouldSaveDetails = saveConsent ?? usableSavedDetails !== null;
  const lines = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.productId),
      })),
    [items, products],
  );
  const validLines = lines.filter(
    (line): line is typeof line & { product: Product } =>
      line.product !== undefined,
  );
  const subtotal = validLines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING;
  const total = subtotal + shipping;
  const stockIssue = validLines.some(
    (line) => line.quantity > line.product.stock || line.product.stock < 1,
  );
  const missingProduct = lines.some((line) => !line.product);

  if (!cartReady || productsLoading || !savedDetailsReady) {
    return <CheckoutSkeleton />;
  }

  if (productsError) {
    return (
      <section
        className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/40"
        role="alert"
      >
        <h1 className="text-xl font-bold text-rose-900 dark:text-rose-200">
          Checkout could not load your products
        </h1>
        <p className="mt-2 text-sm text-rose-800 dark:text-rose-300">
          {productsError}
        </p>
        <button
          className="mt-4 rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
          onClick={retryProducts}
          type="button"
        >
          Try again
        </button>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Add products to your cart before checking out.
        </p>
        <Link
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
          href="/products"
        >
          Browse products
        </Link>
      </section>
    );
  }

  function updateField(field: CheckoutField, value: string) {
    setEditedFields({ ...fields, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  }

  function shippingDetails(): SavedShippingDetails {
    return {
      fullName: fields.fullName.trim(),
      phone: fields.phone.trim(),
      addressLine: fields.addressLine.trim(),
      city: fields.city.trim(),
      postalCode: fields.postalCode.trim(),
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateFields(fields);
    setErrors(validationErrors);
    setSubmitError("");
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    if (missingProduct) {
      setSubmitError(
        "One or more products are no longer available. Remove them from your cart before placing the order.",
      );
      return;
    }
    if (stockIssue) {
      setSubmitError(
        "The quantity of one or more items exceeds current stock. Update your cart and try again.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const details = shippingDetails();
      if (shouldSaveDetails) {
        setSavedDetails(details);
      } else {
        removeSavedDetails();
      }

      const customer: CustomerDetails = {
        fullName: details.fullName,
        phone: details.phone,
        address: {
          line1: details.addressLine,
          city: details.city,
          postalCode: details.postalCode,
          country: "",
        },
      };

      let placedOrder;
      let collisionRetries = 0;
      while (true) {
        const orderNumber = makeOrderNumber();
        try {
          placedOrder = await placeOrder({
            id: orderNumber,
            orderNumber,
            createdAt: Date.now(),
            customer,
            paymentMethod: "cash-on-delivery",
            notes: fields.notes.trim() || undefined,
            items: items.map(({ productId, quantity }) => ({
              productId,
              quantity,
            })),
          });
          break;
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "ConstraintError" &&
            collisionRetries < 3
          ) {
            collisionRetries += 1;
            continue;
          }
          throw error;
        }
      }

      clearCart();
      router.push(`/orders/${encodeURIComponent(placedOrder.id)}?placed=1`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order. Please try again.",
      );
      setSubmitting(false);
    }
  }

  function fieldError(field: CheckoutField) {
    return errors[field] ? (
      <p className="mt-1.5 text-sm text-rose-700 dark:text-rose-400" id={`${field}-error`}>
        {errors[field]}
      </p>
    ) : null;
  }

  const inputClass =
    "mt-1.5 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Almost there
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Checkout
        </h1>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <form
          className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7"
          noValidate
          onSubmit={(event) => void handleSubmit(event)}
        >
          <section aria-labelledby="shipping-heading">
            <h2
              className="text-lg font-bold text-slate-900 dark:text-white"
              id="shipping-heading"
            >
              Shipping details
            </h2>
            {savedDetails && (
              <button
                className="mt-2 text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-400"
                onClick={() => {
                  removeSavedDetails();
                  setSaveConsent(false);
                  setEditedFields(emptyFields);
                }}
                type="button"
              >
                Clear saved details
              </button>
            )}

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                  htmlFor="fullName"
                >
                  Full name
                </label>
                <input
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  aria-invalid={Boolean(errors.fullName)}
                  autoComplete="name"
                  className={inputClass}
                  id="fullName"
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Your full name"
                  value={fields.fullName}
                />
                {fieldError("fullName")}
              </div>

              <div>
                <label
                  className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                  htmlFor="phone"
                >
                  Phone number
                </label>
                <input
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  aria-invalid={Boolean(errors.phone)}
                  autoComplete="tel"
                  className={inputClass}
                  id="phone"
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="e.g. 555 123 4567"
                  type="tel"
                  value={fields.phone}
                />
                {fieldError("phone")}
              </div>

              <div className="sm:col-span-2">
                <label
                  className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                  htmlFor="addressLine"
                >
                  Address line
                </label>
                <input
                  aria-describedby={
                    errors.addressLine ? "addressLine-error" : undefined
                  }
                  aria-invalid={Boolean(errors.addressLine)}
                  autoComplete="street-address"
                  className={inputClass}
                  id="addressLine"
                  onChange={(event) =>
                    updateField("addressLine", event.target.value)
                  }
                  placeholder="Street address and unit"
                  value={fields.addressLine}
                />
                {fieldError("addressLine")}
              </div>

              <div>
                <label
                  className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                  htmlFor="city"
                >
                  City
                </label>
                <input
                  aria-describedby={errors.city ? "city-error" : undefined}
                  aria-invalid={Boolean(errors.city)}
                  autoComplete="address-level2"
                  className={inputClass}
                  id="city"
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="City"
                  value={fields.city}
                />
                {fieldError("city")}
              </div>

              <div>
                <label
                  className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                  htmlFor="postalCode"
                >
                  Postal code
                </label>
                <input
                  aria-describedby={
                    errors.postalCode ? "postalCode-error" : undefined
                  }
                  aria-invalid={Boolean(errors.postalCode)}
                  autoComplete="postal-code"
                  className={inputClass}
                  id="postalCode"
                  onChange={(event) =>
                    updateField("postalCode", event.target.value)
                  }
                  placeholder="Postal code"
                  value={fields.postalCode}
                />
                {fieldError("postalCode")}
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
              <input
                checked={shouldSaveDetails}
                className="mt-0.5 size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                onChange={(event) => setSaveConsent(event.target.checked)}
                type="checkbox"
              />
              <span>Save my shipping details on this device for next time</span>
            </label>
          </section>

          <section aria-labelledby="notes-heading">
            <label
              className="text-lg font-bold text-slate-900 dark:text-white"
              htmlFor="notes"
              id="notes-heading"
            >
              Order notes <span className="text-sm font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              id="notes"
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Anything we should know about your delivery?"
              rows={3}
              value={fields.notes}
            />
          </section>

          <fieldset>
            <legend className="text-lg font-bold text-slate-900 dark:text-white">
              Payment method
            </legend>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/50">
              <input
                checked
                className="mt-0.5 size-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                name="paymentMethod"
                readOnly
                type="radio"
                value="cash-on-delivery"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Cash on Delivery
                </span>
                <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">
                  Pay in cash when your order arrives.
                </span>
              </span>
            </label>
            <label className="mt-3 flex cursor-not-allowed items-start gap-3 rounded-xl border border-slate-200 p-4 opacity-60 dark:border-slate-800">
              <input
                className="mt-0.5 size-4"
                disabled
                name="paymentMethod"
                type="radio"
                value="card"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Card <span className="font-normal">(coming soon)</span>
              </span>
            </label>
          </fieldset>

          {(missingProduct || stockIssue) && (
            <p
              className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
              role="alert"
            >
              {missingProduct
                ? "One or more cart products are unavailable. Please remove them from your cart."
                : "One or more cart quantities exceed available stock. Please update your cart."}
              <Link className="ml-1 font-semibold underline" href="/cart">
                Return to cart
              </Link>
            </p>
          )}
          {submitError && (
            <p
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <button
            className="min-h-12 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:bg-slate-400 dark:disabled:bg-slate-700"
            disabled={
              submitting ||
              missingProduct ||
              stockIssue ||
              validLines.length === 0
            }
            type="submit"
          >
            {submitting ? "Placing your order…" : `Place order · $${total.toFixed(2)}`}
          </button>
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Order summary
          </h2>
          <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto">
            {lines.map((line) => (
              <li className="flex gap-3" key={line.productId}>
                {line.product ? (
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Image
                      alt=""
                      className="h-full w-full object-cover"
                      height={120}
                      sizes="56px"
                      src={getProductImageUrl(line.product)}
                      width={120}
                    />
                  </div>
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    !
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {line.product?.name ?? "Unavailable product"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Qty {line.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {line.product
                    ? `$${(line.product.price * line.quantity).toFixed(2)}`
                    : "—"}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
            <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
              <dt>Subtotal</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                ${subtotal.toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
              <dt>Shipping</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <dt>Total</dt>
              <dd>${total.toFixed(2)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Shipping is free on orders of $75 or more. Orders are paid by cash
            on delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}
