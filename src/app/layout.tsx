import type { Metadata } from "next";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import GlobalProviders from "@/components/GlobalProviders";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeoCart",
  description: "Discover your next favorite thing at NeoCart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <GlobalProviders>
          <Navbar />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </GlobalProviders>
      </body>
    </html>
  );
}