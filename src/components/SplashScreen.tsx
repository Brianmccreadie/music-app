"use client";

import { useState, useEffect } from "react";

export default function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1800);
    const done = setTimeout(onFinished, 2400);
    return () => {
      clearTimeout(timer);
      clearTimeout(done);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-hero-bg flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo */}
      <div className="animate-[scaleIn_0.6s_ease-out_both]">
        <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
      </div>

      {/* App name */}
      <h1 className="mt-6 text-3xl font-bold text-white tracking-tight animate-[fadeUp_0.6s_ease-out_0.3s_both]">
        Vocal Reps
      </h1>
      <p className="mt-2 text-white/50 text-sm animate-[fadeUp_0.6s_ease-out_0.5s_both]">
        Train your voice
      </p>

      {/* Loading dots */}
      <div className="mt-10 flex gap-1.5 animate-[fadeUp_0.6s_ease-out_0.7s_both]">
        <div className="w-2 h-2 bg-accent rounded-full animate-[bounce_1s_infinite_0ms]" />
        <div className="w-2 h-2 bg-accent rounded-full animate-[bounce_1s_infinite_150ms]" />
        <div className="w-2 h-2 bg-accent rounded-full animate-[bounce_1s_infinite_300ms]" />
      </div>
    </div>
  );
}
