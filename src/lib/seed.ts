import type { Product } from "@/types";
import { bulkPutProducts, getAllProducts } from "@/lib/db";
import { getProductImageUrl } from "@/lib/productImage";

const catalogCreatedAt = new Date("2026-01-15T12:00:00.000Z").getTime();

export const seedProducts: Product[] = [
  {
    id: "electronics-wireless-headphones",
    name: "Studio Wireless Headphones",
    description:
      "Comfortable over-ear headphones with rich sound, active noise cancellation, and up to 30 hours of battery life.",
    price: 129.99,
    compareAtPrice: 159.99,
    category: "Electronics",
    rating: 4.8,
    stock: 24,
    featured: true,
    imageUrl: "https://picsum.photos/seed/neocart-headphones/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "electronics-smartwatch",
    name: "Everyday Smartwatch",
    description:
      "Track workouts, sleep, and notifications with a bright display and a lightweight, water-resistant design.",
    price: 89.5,
    category: "Electronics",
    rating: 4.5,
    stock: 18,
    featured: true,
    imageUrl: "https://picsum.photos/seed/neocart-smartwatch/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "electronics-bluetooth-speaker",
    name: "Portable Bluetooth Speaker",
    description:
      "A compact speaker with clear, room-filling audio, simple controls, and a rechargeable all-day battery.",
    price: 54.99,
    compareAtPrice: 69.99,
    category: "Electronics",
    rating: 4.6,
    stock: 32,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-speaker/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "electronics-desk-lamp",
    name: "USB-C Desk Lamp",
    description:
      "An adjustable LED desk lamp with three color temperatures, dimming controls, and a convenient USB-C port.",
    price: 39,
    category: "Electronics",
    rating: 4.3,
    stock: 41,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-desklamp/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "fashion-canvas-backpack",
    name: "City Canvas Backpack",
    description:
      "A sturdy everyday backpack with a padded laptop sleeve, roomy main compartment, and easy-access front pocket.",
    price: 64,
    compareAtPrice: 79,
    category: "Fashion",
    rating: 4.7,
    stock: 15,
    featured: true,
    imageUrl: "https://picsum.photos/seed/neocart-backpack/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "fashion-knit-sweater",
    name: "Soft Knit Crewneck",
    description:
      "A versatile crewneck sweater made from a soft cotton blend, designed for comfortable layering throughout the year.",
    price: 58,
    category: "Fashion",
    rating: 4.4,
    stock: 22,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-sweater/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "fashion-leather-wallet",
    name: "Slim Leather Wallet",
    description:
      "A compact wallet with six card slots, a full-length bill pocket, and a slim profile that fits comfortably in a pocket.",
    price: 42.5,
    category: "Fashion",
    rating: 4.6,
    stock: 28,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-wallet/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "fashion-running-sneakers",
    name: "Lightweight Running Sneakers",
    description:
      "Breathable mesh sneakers with cushioned support for daily walks, gym sessions, and easy weekend runs.",
    price: 94.99,
    compareAtPrice: 110,
    category: "Fashion",
    rating: 4.5,
    stock: 12,
    featured: true,
    imageUrl: "https://picsum.photos/seed/neocart-sneakers/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "home-ceramic-mug-set",
    name: "Stoneware Mug Set",
    description:
      "A set of four glazed stoneware mugs with comfortable handles, made for morning coffee and relaxed evenings.",
    price: 32,
    category: "Home",
    rating: 4.8,
    stock: 36,
    featured: true,
    imageUrl: "https://picsum.photos/seed/neocart-mugs/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "home-cotton-throw",
    name: "Textured Cotton Throw",
    description:
      "A soft woven cotton throw that adds an extra layer of warmth and texture to a sofa, chair, or bed.",
    price: 49.99,
    compareAtPrice: 59.99,
    category: "Home",
    rating: 4.7,
    stock: 19,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-throw/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "home-planter-set",
    name: "Minimal Ceramic Planters",
    description:
      "Two clean-lined ceramic planters with drainage trays, sized for herbs, succulents, and small houseplants.",
    price: 35,
    category: "Home",
    rating: 4.4,
    stock: 26,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-planters/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "home-cutting-board",
    name: "Acacia Wood Cutting Board",
    description:
      "A durable acacia cutting board with a generous prep surface and an easy-grip edge for everyday cooking.",
    price: 28.5,
    category: "Home",
    rating: 4.6,
    stock: 30,
    featured: true,
    imageUrl: "https://picsum.photos/seed/neocart-cuttingboard/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "sports-yoga-mat",
    name: "Grip Yoga Mat",
    description:
      "A supportive, non-slip exercise mat with a textured surface for yoga, stretching, and at-home workouts.",
    price: 38,
    compareAtPrice: 45,
    category: "Sports",
    rating: 4.7,
    stock: 27,
    featured: true,
    imageUrl: "https://picsum.photos/seed/neocart-yogamat/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "sports-insulated-bottle",
    name: "Insulated Steel Bottle",
    description:
      "A double-wall stainless steel bottle that keeps drinks cold for hours and fits easily into a day bag.",
    price: 26,
    category: "Sports",
    rating: 4.5,
    stock: 44,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-bottle/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "sports-resistance-bands",
    name: "Resistance Band Set",
    description:
      "A set of five resistance bands with varied tension levels and a storage pouch for versatile strength training.",
    price: 21.99,
    category: "Sports",
    rating: 4.3,
    stock: 38,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-bands/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "sports-fitness-towel",
    name: "Quick-Dry Fitness Towel",
    description:
      "A lightweight microfiber towel that dries quickly and packs neatly for the gym, travel, or outdoor activities.",
    price: 16.5,
    category: "Sports",
    rating: 4.2,
    stock: 50,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-towel/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "beauty-face-cleanser",
    name: "Gentle Daily Face Cleanser",
    description:
      "A fragrance-free gel cleanser that gently removes daily buildup without leaving skin feeling dry or tight.",
    price: 18,
    category: "Beauty",
    rating: 4.6,
    stock: 34,
    featured: true,
    imageUrl: "https://picsum.photos/seed/neocart-cleanser/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "beauty-moisturizer",
    name: "Hydrating Daily Moisturizer",
    description:
      "A lightweight daily moisturizer with a smooth finish, suitable for morning and evening skincare routines.",
    price: 24.99,
    compareAtPrice: 29.99,
    category: "Beauty",
    rating: 4.7,
    stock: 21,
    featured: true,
    imageUrl: "https://picsum.photos/seed/neocart-moisturizer/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "beauty-hand-cream",
    name: "Nourishing Hand Cream",
    description:
      "A fast-absorbing hand cream in a travel-friendly tube to keep hands feeling soft through frequent washing.",
    price: 12,
    category: "Beauty",
    rating: 4.4,
    stock: 47,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-handcream/800/800",
    createdAt: catalogCreatedAt,
  },
  {
    id: "beauty-bath-salts",
    name: "Botanical Bath Salts",
    description:
      "A mineral-rich bath soak with a gentle botanical scent for a calming addition to an at-home evening routine.",
    price: 19.5,
    category: "Beauty",
    rating: 4.5,
    stock: 25,
    featured: false,
    imageUrl: "https://picsum.photos/seed/neocart-bathsalts/800/800",
    createdAt: catalogCreatedAt,
  },
];

let seeding: Promise<void> | undefined;

export function seedProductsIfEmpty(): Promise<void> {
  if (!seeding) {
    seeding = getAllProducts()
      .then((products) => {
        if (products.length === 0) {
          return bulkPutProducts(seedProducts);
        }

        const productsNeedingImages = products.filter(
          (product) =>
            typeof product.imageUrl !== "string" || !product.imageUrl.trim(),
        );
        if (productsNeedingImages.length > 0) {
          return bulkPutProducts(
            productsNeedingImages.map((product) => ({
              ...product,
              imageUrl: getProductImageUrl(product),
            })),
          );
        }
      })
      .catch((error: unknown) => {
        seeding = undefined;
        throw error;
      });
  }

  return seeding;
}
