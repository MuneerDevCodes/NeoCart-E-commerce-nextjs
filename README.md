# NeoCart

A browser-only storefront built with Next.js, React, TypeScript, and Tailwind CSS. Product catalog and orders are stored locally in the browser; no account or backend is required.

## Setup

1. Install Node.js and npm.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000).

Verify changes with `npm run lint` and `npm run build`.

## Features

- Seeded product catalog with search, category/price/stock filters, sorting, and grid/list display.
- Product details, wishlist, recently viewed products, and persistent cart.
- Checkout with optional saved shipping details and simulated Cash on Delivery orders.
- Order history, order details, and cancellation with stock restoration.
- Light/dark theme and responsive layouts.

## Browser storage

| Data | Storage | Details |
| --- | --- | --- |
| Cart | `localStorage` | Product IDs and quantities |
| Wishlist | `localStorage` | Product IDs |
| Preferences | `localStorage` | Theme and product display mode |
| Recently viewed | `localStorage` | Up to eight product IDs |
| Shipping details | `localStorage` | Saved only when checkout consent is selected |
| Products | IndexedDB (`neocart-db`, `products`) | Seeded catalog and current stock |
| Orders | IndexedDB (`neocart-db`, `orders`) | Order and item snapshots |
| Files | IndexedDB (`neocart-db`, `files`) | Local file records |
