import { seedProductCatalogIfNeeded } from "@/lib/db";
import productCatalog from "@/lib/productCatalog.json";
import type { Product } from "@/types";

const CATALOG_VERSION = 1;
const catalogCreatedAt = Date.now();

export const seedProducts: Product[] = productCatalog.map((product) => ({
  ...product,
  id: product.sku,
  rating: 0,
  stock: 10,
  featured: false,
  imageUrl: product.image_url,
  createdAt: catalogCreatedAt,
}));

export function seedProductCatalog(): Promise<void> {
  return seedProductCatalogIfNeeded(seedProducts, CATALOG_VERSION);
}
