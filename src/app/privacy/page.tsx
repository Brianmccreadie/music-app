import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Vocal Reps",
  description: "Privacy Policy for the Vocal Reps vocal training application.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-accent hover:text-accent-hover mb-6 inline-block">
        &larr; Home
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted mb-8">Last updated: March 5, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Account information:</strong> Email address and password when you create an account.</li>
            <li><strong>Profile data:</strong> Voice type, vocal range, experience level, and training goals you provide during onboarding.</li>
            <li><strong>Usage data:</strong> Practice session history, exercise completions, favorites, routines, and streaks.</li>
            <li><strong>Subscription data:</strong> Subscription status, billing cycle, and payment identifiers (we do not store full payment card details).</li>
            <li><strong>Device data:</strong> Browser type, operating system, and device type for analytics and service improvement.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and personalize the vocal training experience</li>
            <li>To generate custom practice plans based on your profile</li>
            <li>To track your practice progress and maintain streaks</li>
            <li>To process subscriptions and payments</li>
            <li>To send important service updates and notifications</li>
            <li>To improve the Service through aggregated, anonymized analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. Data Storage & Security</h2>
          <p>
            Your data is stored securely using Supabase (hosted on AWS). We use industry-standard
            encryption for data in transit (TLS/SSL) and at rest. Passwords are hashed and never stored
            in plain text.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Supabase:</strong> Database and authentication</li>
            <li><strong>Stripe:</strong> Payment processing for web subscriptions</li>
            <li><strong>Apple App Store:</strong> In-app purchases and subscription management on iOS</li>
          </ul>
          <p className="mt-2">
            Each third-party service has its own privacy policy governing the data they process on our behalf.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">5. Cookies & Local Storage</h2>
          <p>
            We use browser local storage to cache your preferences, subscription status, and practice data
            for offline access and performance. We may use analytics cookies to understand how the Service
            is used. You can manage cookie preferences through the consent banner or your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">6. Data Sharing</h2>
          <p>
            We do not sell your personal data. We only share data with third-party services as described
            above, and as required by law or to protect our legal rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct your personal information through Settings</li>
            <li><strong>Deletion:</strong> Delete your account and all associated data through Settings</li>
            <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
            <li><strong>Withdrawal of consent:</strong> Opt out of analytics cookies at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">8. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. When you delete your account,
            all personal data is permanently removed within 30 days. Anonymized, aggregated data may
            be retained for analytics purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">9. Children&apos;s Privacy</h2>
          <p>
            Vocal Reps is not intended for children under 13. We do not knowingly collect personal
            information from children under 13. If you believe a child has provided us with personal
            data, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            via email or through the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">11. Contact Us</h2>
          <p>
            For privacy-related questions or to exercise your data rights, contact us at{" "}
            <Link href="/contact" className="text-accent hover:underline">our contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
