"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a password reset link.");
        setMode("login");
      }
    } else if (mode === "signup") {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setMessage("Check your email to confirm your account, then sign in.");
        setMode("login");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        router.push("/");
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
        </h1>
        <p className="text-muted text-sm mt-1">
          {mode === "login"
            ? "Sign in to access your training"
            : mode === "signup"
              ? "Start your 7-day free trial"
              : "Enter your email to receive a reset link"}
        </p>
      </div>

      {message && (
        <div className="bg-accent-light text-accent text-sm p-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted block mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="you@example.com"
          />
        </div>
        {mode !== "reset" && (
          <div>
            <label className="text-sm font-medium text-muted block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="At least 6 characters"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {loading
            ? "..."
            : mode === "login"
              ? "Sign In"
              : mode === "signup"
                ? "Create Account"
                : "Send Reset Link"}
        </button>
      </form>

      <div className="text-center text-sm text-muted mt-6 space-y-2">
        {mode === "login" && (
          <>
            <p>
              Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className="text-accent font-medium hover:underline">
                Sign up
              </button>
            </p>
            <p>
              <button onClick={() => { setMode("reset"); setError(""); setMessage(""); }} className="text-accent font-medium hover:underline">
                Forgot password?
              </button>
            </p>
          </>
        )}
        {mode === "signup" && (
          <p>
            Already have an account?{" "}
            <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="text-accent font-medium hover:underline">
              Sign in
            </button>
          </p>
        )}
        {mode === "reset" && (
          <p>
            Remember your password?{" "}
            <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="text-accent font-medium hover:underline">
              Sign in
            </button>
          </p>
        )}
      </div>

      {mode === "signup" && (
        <p className="text-[10px] text-muted text-center mt-4">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-accent">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="text-accent">Privacy Policy</Link>.
        </p>
      )}
    </div>
  );
}
