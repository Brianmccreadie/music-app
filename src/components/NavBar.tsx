"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/lib/subscription";

const NAV_LINKS = [
  { href: "/exercises", label: "Library" },
  { href: "/plans", label: "Plans" },
  { href: "/routines", label: "Routines" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const { user, loading, signOut } = useAuth();
  const { isActive, tier } = useSubscription();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">Vocal Reps</span>
          {isActive && (
            <span className="px-1.5 py-0.5 bg-accent text-white text-[10px] font-bold rounded-md uppercase tracking-wide">
              Pro
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href
                  ? "text-accent font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -mr-2 text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-accent-light text-accent"
                    : "text-foreground hover:bg-background"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              {user && !isActive && (
                <Link
                  href="/subscribe"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-accent bg-accent-light hover:bg-accent/10 transition-colors mb-1"
                >
                  Upgrade to Pro
                </Link>
              )}
              {!loading && (
                user ? (
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-accent hover:bg-accent-light transition-colors"
                  >
                    Sign In
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
