import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-3">404</h1>
      <p className="text-xl text-muted mb-8">
        This page doesn&apos;t exist. Maybe the note was a little off-key.
      </p>
      <Link
        href="/"
        className="inline-block px-8 py-3.5 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
