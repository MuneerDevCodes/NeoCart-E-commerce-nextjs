"use client";

import { useEffect, useState } from "react";
import { seedProductCatalog } from "@/lib/seed";

export default function ProductCatalogInitializer() {
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    void seedProductCatalog().catch(() => {
      setError(true);
    });
  }, [attempt]);

  if (!error) {
    return null;
  }

  return (
    <div
      className="mx-auto mt-3 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      role="alert"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">
        <p>The local product catalog could not be initialized.</p>
        <button
          className="font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
          onClick={() => {
            setError(false);
            setAttempt((current) => current + 1);
          }}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
