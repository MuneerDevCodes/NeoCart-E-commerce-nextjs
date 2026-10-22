"use client";

import type { Order, Product } from "@/types";

const DATABASE_NAME = "neocart-db";
const DATABASE_VERSION = 1;

type StoreName = "products" | "orders" | "files";

type StoredFile = {
  id: string;
  blob: Blob;
};

let databasePromise: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment."));
  }

  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("products")) {
        const products = database.createObjectStore("products", {
          keyPath: "id",
        });
        products.createIndex("category", "category", { unique: false });
        products.createIndex("price", "price", { unique: false });
        products.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!database.objectStoreNames.contains("orders")) {
        const orders = database.createObjectStore("orders", { keyPath: "id" });
        orders.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!database.objectStoreNames.contains("files")) {
        database.createObjectStore("files", { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };

    request.onerror = () => {
      databasePromise = undefined;
      reject(
        request.error ?? new Error(`Unable to open the ${DATABASE_NAME} database.`),
      );
    };

    request.onblocked = () => {
      databasePromise = undefined;
      reject(new Error(`Opening the ${DATABASE_NAME} database was blocked.`));
    };
  });

  return databasePromise;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, mode);
  const completed = new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction was aborted."));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
  });

  try {
    const [result] = await Promise.all([
      operation(transaction.objectStore(storeName)),
      completed,
    ]);
    return result;
  } catch (error) {
    try {
      transaction.abort();
    } catch {
      // The transaction may already be complete or aborted.
    }
    await completed.catch(() => undefined);
    throw error;
  }
}

export function getAllProducts(): Promise<Product[]> {
  return withStore("products", "readonly", (store) =>
    requestResult<Product[]>(store.getAll()),
  );
}

export function getProduct(id: string): Promise<Product | undefined> {
  return withStore("products", "readonly", (store) =>
    requestResult<Product | undefined>(store.get(id)),
  );
}

export function putProduct(product: Product): Promise<IDBValidKey> {
  return withStore("products", "readwrite", (store) =>
    requestResult<IDBValidKey>(store.put(product)),
  );
}

export function bulkPutProducts(products: Product[]): Promise<void> {
  return withStore("products", "readwrite", async (store) => {
    await Promise.all(
      products.map((product) => requestResult(store.put(product))),
    );
  });
}

export function deleteProduct(id: string): Promise<void> {
  return withStore("products", "readwrite", async (store) => {
    await requestResult(store.delete(id));
  });
}

export function addOrder(order: Order): Promise<IDBValidKey> {
  return withStore("orders", "readwrite", (store) =>
    requestResult<IDBValidKey>(store.add(order)),
  );
}

export function getAllOrders(): Promise<Order[]> {
  return withStore("orders", "readonly", (store) =>
    requestResult<Order[]>(store.getAll()),
  );
}

export function getOrder(id: string): Promise<Order | undefined> {
  return withStore("orders", "readonly", (store) =>
    requestResult<Order | undefined>(store.get(id)),
  );
}

export function saveFile(id: string, blob: Blob): Promise<IDBValidKey> {
  return withStore("files", "readwrite", (store) =>
    requestResult<IDBValidKey>(store.put({ id, blob } satisfies StoredFile)),
  );
}

export function getFile(id: string): Promise<Blob | undefined> {
  return withStore("files", "readonly", async (store) => {
    const file = await requestResult<StoredFile | undefined>(store.get(id));
    return file?.blob;
  });
}

export function deleteFile(id: string): Promise<void> {
  return withStore("files", "readwrite", async (store) => {
    await requestResult(store.delete(id));
  });
}
