import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VocalApp — Vocal Training Studio",
  description:
    "Professional vocal training with personalized routines, training tracks, and real piano accompaniment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground">
        <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-accent tracking-tight">
              VocalApp
            </Link>
            <div className="flex gap-5 text-sm">
              <Link
                href="/"
                className="text-muted hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/exercises"
                className="text-muted hover:text-foreground transition-colors"
              >
                Library
              </Link>
              <Link
                href="/routines"
                className="text-muted hover:text-foreground transition-colors"
              >
                My Routines
              </Link>
              <Link
                href="/settings"
                className="text-muted hover:text-foreground transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
