"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "vocal-reps-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-border shadow-lg p-5">
        <p className="text-sm text-foreground mb-3">
          We use cookies to improve your experience and analyze usage.
          See our{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 py-2.5 bg-accent text-white rounded-full font-semibold text-sm hover:bg-accent-hover transition-colors"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 py-2.5 border border-border text-muted rounded-full font-semibold text-sm hover:text-foreground transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
