import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { AuthProvider } from "@/lib/auth-context";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocal Reps — Train Your Voice",
  description:
    "Professional vocal training with personalized routines, training tracks, and real piano accompaniment.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vocal Reps",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1B6B5A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <AuthProvider>
          <NavBar />
          <main className="min-h-screen">{children}</main>
        </AuthProvider>

        {/* Footer */}
        <footer className="bg-hero-bg text-white/70 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <span className="text-white font-bold">Vocal Reps</span>
                </div>
                <p className="text-sm text-white/50">
                  Professional vocal training with real piano accompaniment.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm">Train</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/exercises" className="block hover:text-white transition-colors">Exercise Library</Link>
                  <Link href="/plans" className="block hover:text-white transition-colors">Practice Plans</Link>
                  <Link href="/routines" className="block hover:text-white transition-colors">Custom Routines</Link>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm">Explore</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/exercises?track=warm-up-essentials" className="block hover:text-white transition-colors">Warm-Ups</Link>
                  <Link href="/exercises?track=build-vocal-agility" className="block hover:text-white transition-colors">Vocal Agility</Link>
                  <Link href="/exercises?track=expand-your-range" className="block hover:text-white transition-colors">Range Extension</Link>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm">Get Started</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/onboarding" className="block hover:text-white transition-colors">Onboarding</Link>
                  <Link href="/generate" className="block hover:text-white transition-colors">Plan Builder</Link>
                  <Link href="/settings" className="block hover:text-white transition-colors">Settings</Link>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 text-sm text-white/40">
              Vocal Reps. Train your voice, one rep at a time.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
