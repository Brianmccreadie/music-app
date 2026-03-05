"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function NavBar() {
  const { user, loading, signOut } = useAuth();

  return (
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
          <Link href="/exercises" className="text-muted hover:text-foreground transition-colors">
            Library
          </Link>
          <Link href="/plans" className="text-muted hover:text-foreground transition-colors">
            Plans
          </Link>
          <Link href="/routines" className="text-muted hover:text-foreground transition-colors">
            Custom Routines
          </Link>
          <Link href="/settings" className="text-muted hover:text-foreground transition-colors">
            Settings
          </Link>
          {!loading && (
            user ? (
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors text-sm"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors text-sm"
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
