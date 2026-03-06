"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Footer() {
  const { user } = useAuth();

  return (
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
              Professional vocal training with piano accompaniment.
            </p>
          </div>
          {user && (
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Train</h4>
              <div className="space-y-2 text-sm">
                <Link href="/exercises" className="block hover:text-white transition-colors">Exercise Library</Link>
                <Link href="/plans" className="block hover:text-white transition-colors">Routine Library</Link>
                <Link href="/routines" className="block hover:text-white transition-colors">My Routines</Link>
              </div>
            </div>
          )}
          {user && (
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Explore</h4>
              <div className="space-y-2 text-sm">
                <Link href="/exercises?track=warm-up-essentials" className="block hover:text-white transition-colors">Warm-Ups</Link>
                <Link href="/exercises?track=build-vocal-agility" className="block hover:text-white transition-colors">Vocal Agility</Link>
                <Link href="/exercises?track=expand-your-range" className="block hover:text-white transition-colors">Range Extension</Link>
              </div>
            </div>
          )}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <div className="space-y-2 text-sm">
              <Link href="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/contact" className="block hover:text-white transition-colors">Contact & Support</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <span>&copy; {new Date().getFullYear()} Vocal Reps. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
