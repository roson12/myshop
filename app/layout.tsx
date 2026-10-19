import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Xorem Shop",
  description: "A small pastel-coloured demo shop.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <CartProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-lavender-deep/40 bg-white/60">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>Xorem Shop — a demo storefront. No real payments are taken.</p>
              <a className="underline hover:text-ink" href="/admin">
                Admin
              </a>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
