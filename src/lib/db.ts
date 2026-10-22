"use client";

import type { Order, PlaceOrderInput, Product } from "@/types";

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

export function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const requestedItems = new Map<string, number>();
  for (const item of input.items) {
    requestedItems.set(
      item.productId,
      (requestedItems.get(item.productId) ?? 0) + item.quantity,
    );
  }

  return openDatabase().then(
    (database) =>
      new Promise<Order>((resolve, reject) => {
        const transaction = database.transaction(
          ["products", "orders"],
          "readwrite",
        );
        const productsStore = transaction.objectStore("products");
        const ordersStore = transaction.objectStore("orders");
        const products = new Map<string, Product>();
        let pendingReads = requestedItems.size;
        let order: Order | undefined;
        let failure: Error | undefined;

        transaction.oncomplete = () => {
          if (order) {
            resolve(order);
          } else {
            reject(new Error("The order transaction completed without an order."));
          }
        };
        transaction.onabort = () => {
          reject(
            failure ??
              transaction.error ??
              new Error("The order transaction was aborted."),
          );
        };
        transaction.onerror = () => {
          failure ??=
            transaction.error ?? new Error("The order transaction failed.");
        };

        const abort = (error: Error) => {
          failure = error;
          try {
            transaction.abort();
          } catch {
            reject(error);
          }
        };

        if (requestedItems.size === 0) {
          abort(new Error("Cannot place an order with no items."));
          return;
        }

        const buildOrder = () => {
          if (--pendingReads > 0) {
            return;
          }

          const orderItems = [...requestedItems].map(
            ([productId, quantity]) => {
            const product = products.get(productId);
            if (!product) {
              throw new Error(
                `Product "${productId}" is no longer available.`,
              );
            }
            if (
              !Number.isInteger(quantity) ||
              quantity < 1 ||
              quantity > product.stock
            ) {
              throw new Error(
                `${product.name} does not have enough stock for this order.`,
              );
            }

            return {
              product,
              snapshot: {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.imageUrl,
                quantity,
              },
            };
            },
          );
          const subtotal = orderItems.reduce(
            (sum, item) => sum + item.product.price * item.snapshot.quantity,
            0,
          );
          const shipping = subtotal >= 75 ? 0 : 6.99;

          order = {
            ...input,
            items: orderItems.map((item) => item.snapshot),
            subtotal,
            shipping,
            total: subtotal + shipping,
          };

          for (const item of orderItems) {
            productsStore.put({
              ...item.product,
              stock: item.product.stock - item.snapshot.quantity,
            });
          }
          ordersStore.add(order);
        };

        for (const [productId] of requestedItems) {
          const request = productsStore.get(productId);
          request.onsuccess = () => {
            const product = request.result as Product | undefined;
            if (product) {
              products.set(productId, product);
            }
            try {
              buildOrder();
            } catch (error) {
              abort(
                error instanceof Error
                  ? error
                  : new Error("Unable to validate order inventory."),
              );
            }
          };
          request.onerror = () => {
            abort(
              request.error ??
                new Error(`Unable to read product "${productId}".`),
            );
          };
        }
      }),
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
