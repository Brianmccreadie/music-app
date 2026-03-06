"use client";

import Link from "next/link";

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Soprano, Community Choir",
    text: "Vocal Reps completely changed my warm-up routine. The piano accompaniment makes practicing feel professional.",
  },
  {
    name: "James L.",
    role: "Tenor, Music Student",
    text: "The custom routines saved me so much time. I went from scattered practice to focused improvement.",
  },
  {
    name: "Maria K.",
    role: "Alto, Singer-Songwriter",
    text: "Having 70+ exercises organized by routines is exactly what I needed to build consistency.",
  },
];

const PRICING_FEATURES = [
  "70+ vocal exercises with piano accompaniment",
  "15 core training programs",
  "70+ exercise library",
  "Unlimited custom routines",
  "Progress tracking & streaks",
  "Voice profile & range detection",
  "Priority support",
];

export default function MarketingHome() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-hero-bg text-hero-fg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 py-24 lg:py-36 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm text-white/80 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Now available on iOS & Web
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
              Train your voice.
              <br />
              <span className="text-accent">One rep at a time.</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Professional vocal training with piano accompaniment,
              personalized routines, and progress tracking. Built for
              singers who take their craft seriously.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors text-lg"
              >
                Start Free Trial
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors text-lg"
              >
                View Pricing
              </a>
            </div>
            <p className="mt-4 text-white/40 text-sm">
              3-day free trial. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Social proof bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent">70+</div>
              <div className="text-sm text-muted mt-1">Vocal Exercises</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">15</div>
              <div className="text-sm text-muted mt-1">Core Training</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">Custom</div>
              <div className="text-sm text-muted mt-1">Practice Routines</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">4.9</div>
              <div className="text-sm text-muted mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">
            How it works
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Your complete vocal training system
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              step: "01",
              title: "Set Your Profile",
              desc: "Tell us your voice type, range, and goals. We customize everything to match your unique voice.",
              icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
            },
            {
              step: "02",
              title: "Pick a Routine",
              desc: "Browse 70+ exercises, follow a core training program, or build a custom routine tailored to your voice.",
              icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
            },
            {
              step: "03",
              title: "Train & Improve",
              desc: "Practice with piano accompaniment. Track your progress and build consistent habits.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow relative"
            >
              <span className="absolute top-6 right-6 text-5xl font-bold text-accent/10">
                {item.step}
              </span>
              <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features section */}
      <div className="bg-hero-bg text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">
              Features
            </p>
            <h2 className="text-3xl lg:text-5xl font-bold">
              Everything you need to train
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Piano Accompaniment",
                desc: "Practice with sampled grand piano, not MIDI beeps. Adjust tempo and range to match your voice.",
              },
              {
                title: "Custom Routines",
                desc: "Tell us your goals and get personalized practice routines tailored to your voice and skill level.",
              },
              {
                title: "Core Training",
                desc: "15 curated training programs covering warm-ups, agility, range, breath control, and more.",
              },
              {
                title: "70+ Exercise Library",
                desc: "Browse a growing library of vocal exercises covering warm-ups, technique, agility, range, and more.",
              },
              {
                title: "Progress Tracking",
                desc: "Track practice minutes, maintain streaks, and see your improvement over time.",
              },
              {
                title: "Your Daily Practice Partner",
                desc: "Designed for singers who just need reps. Open the app, hit play, and build your voice one session at a time.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-accent/40 transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">
            Testimonials
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Loved by singers
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl border border-border p-6"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-foreground mb-4 leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {t.name}
                </p>
                <p className="text-muted text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="bg-background py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">
              Pricing
            </p>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Simple, transparent pricing
            </h2>
            <p className="text-muted mt-3 text-lg">
              Start with a 3-day free trial. Cancel anytime.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border-2 border-accent p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full">
                3-DAY FREE TRIAL
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Vocal Reps Pro</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-foreground">
                  $9.99
                </span>
                <span className="text-muted ml-1">/month</span>
              </div>
              <p className="text-sm text-muted mb-6">or $89.99/year (save 25%)</p>
              <ul className="space-y-3 mb-8">
                {PRICING_FEATURES.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <svg
                      className="w-4 h-4 text-accent flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full py-3.5 bg-accent text-white rounded-full font-semibold text-center hover:bg-accent-hover transition-colors"
              >
                Start 3-Day Free Trial
              </Link>
              <p className="text-xs text-muted text-center mt-3">
                Then $9.99/month. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-hero-bg text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            Ready to transform your voice?
          </h2>
          <p className="text-white/60 max-w-lg mx-auto mb-8 text-lg">
            Join singers who are building better vocal habits with Vocal Reps.
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors text-lg"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
