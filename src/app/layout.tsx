import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VocalApp — Vocal Exercise Player",
  description:
    "Practice vocal exercises with dynamic piano accompaniment that transposes across your range.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-indigo-600">
              VocalApp
            </Link>
            <div className="flex gap-4 text-sm">
              <Link
                href="/exercises"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Exercises
              </Link>
              <Link
                href="/plans"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Plans
              </Link>
              <Link
                href="/generate"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                AI Generate
              </Link>
              <Link
                href="/settings"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
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
