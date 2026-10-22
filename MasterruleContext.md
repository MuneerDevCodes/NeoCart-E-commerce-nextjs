I have a Next.js project (App Router) named NeoCart. I'm building a small e-commerce site that works entirely in the browser, with no backend.

STRICT RULES for the whole project:
1. Styling: Tailwind CSS only. NO custom CSS: no CSS modules, no styled-jsx, no inline `style` props, no @apply, no custom class names, no extra .css files. globals.css must contain only the Tailwind import/directives. All styling is done with Tailwind utility classes written directly in the JSX of each page/component ("in-page design").
2. Storage architecture (use each tool for what it does best):
   - localStorage: cart, wishlist (product IDs), customer details (only with consent), UI preferences (theme/display), recently viewed IDs
   - IndexedDB: products (catalog), orders (history + details), product images/files (Blobs, when needed)
3. Everything that touches localStorage/IndexedDB must be in Client Components ("use client") and must avoid hydration mismatches (render a skeleton/placeholder until the client has loaded).
4. Responsive: mobile-first, working layouts for mobile, tablet and desktop.
5. TypeScript, clean folder structure, small reusable components, no unused code.
6. After each step, tell me which files you created or changed and how to test it.

Do not start coding yet. Confirm you understand the rules and wait for Step 1.