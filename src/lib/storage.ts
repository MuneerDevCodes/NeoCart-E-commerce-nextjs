"use client";

export const STORAGE_KEYS = {
  cart: "neocart:cart",
  wishlist: "neocart:wishlist",
  customer: "neocart:customer",
  prefs: "neocart:prefs",
  recent: "neocart:recent",
  contactDraft: "neocart:contact-draft",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

type StorageCacheEntry = {
  serialized: string;
  value: unknown;
  valid: boolean;
};

const storageCache = new Map<StorageKey, StorageCacheEntry>();
const subscribers = new Map<StorageKey, Set<() => void>>();

function notifySubscribers(key: StorageKey) {
  subscribers.get(key)?.forEach((subscriber) => subscriber());
}

export function getLocalStorage<T>(key: StorageKey, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const serialized = window.localStorage.getItem(key);
    if (serialized === null) {
      return fallback;
    }

    const cached = storageCache.get(key);
    if (cached?.serialized === serialized) {
      return cached.valid ? (cached.value as T) : fallback;
    }

    try {
      const value: unknown = JSON.parse(serialized);
      storageCache.set(key, { serialized, value, valid: true });
      return value as T;
    } catch {
      storageCache.set(key, { serialized, value: undefined, valid: false });
      return fallback;
    }
  } catch {
    return fallback;
  }
}

export function setLocalStorage<T>(key: StorageKey, value: T): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    storageCache.set(key, { serialized, value, valid: true });
    notifySubscribers(key);
    return true;
  } catch {
    return false;
  }
}

export function removeLocalStorage(key: StorageKey): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    storageCache.delete(key);
    notifySubscribers(key);
    return true;
  } catch {
    return false;
  }
}

export function subscribeToLocalStorage(
  key: StorageKey,
  subscriber: () => void,
): () => void {
  const keySubscribers = subscribers.get(key) ?? new Set<() => void>();
  keySubscribers.add(subscriber);
  subscribers.set(key, keySubscribers);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      if (event.key === null) {
        storageCache.clear();
      } else {
        storageCache.delete(key);
      }
      subscriber();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    keySubscribers.delete(subscriber);
    if (keySubscribers.size === 0) {
      subscribers.delete(key);
    }
  };
}
