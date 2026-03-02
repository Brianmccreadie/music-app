import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocal Reps — Train Your Voice",
  description:
    "Professional vocal training with personalized routines, training tracks, and real piano accompaniment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <nav className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">Vocal Reps</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/exercises"
                className="text-muted hover:text-foreground transition-colors"
              >
                Library
              </Link>
              <Link
                href="/plans"
                className="text-muted hover:text-foreground transition-colors"
              >
                Plans
              </Link>
              <Link
                href="/routines"
                className="text-muted hover:text-foreground transition-colors"
              >
                Custom Routines
              </Link>
              <Link
                href="/settings"
                className="text-muted hover:text-foreground transition-colors"
              >
                Settings
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors text-sm"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>

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
