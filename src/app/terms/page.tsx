import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Vocal Reps",
  description: "Terms of Service for the Vocal Reps vocal training application.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-accent hover:text-accent-hover mb-6 inline-block">
        &larr; Home
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted mb-8">Last updated: March 5, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Vocal Reps (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. Description of Service</h2>
          <p>
            Vocal Reps is a vocal training application that provides exercises, practice plans, training tracks,
            and progress tracking tools for singers. The Service is available via web browser and mobile applications.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. Account Registration</h2>
          <p>
            You must create an account to access the Service. You are responsible for maintaining the
            confidentiality of your account credentials and for all activities that occur under your account.
            You must provide accurate and complete information when creating your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. Free Trial</h2>
          <p>
            New users are eligible for a 3-day free trial of Vocal Reps Pro. The trial provides full access
            to all features. After the trial period ends, you will need an active subscription to continue
            accessing Pro features. No credit card is required to start a trial.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">5. Subscriptions & Payments</h2>
          <p>
            Vocal Reps Pro is available as a monthly ($9.99/month) or yearly ($89.99/year) subscription.
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.</li>
            <li>You can cancel your subscription at any time through your account settings (web) or through the App Store (iOS).</li>
            <li>Refunds are handled in accordance with the applicable platform&apos;s refund policy (Stripe for web, Apple for iOS).</li>
            <li>Prices may change with reasonable notice. Existing subscribers will be notified before any price changes take effect.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to reverse-engineer, decompile, or disassemble the Service</li>
            <li>Share your account credentials with others</li>
            <li>Attempt to circumvent subscription or access controls</li>
            <li>Upload or transmit harmful content through the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">7. Intellectual Property</h2>
          <p>
            All content, exercises, audio samples, and materials in Vocal Reps are the property of Vocal Reps
            and are protected by copyright and other intellectual property laws. You may not reproduce,
            distribute, or create derivative works without our written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">8. Account Deletion</h2>
          <p>
            You may delete your account at any time through the Settings page. Upon deletion, your account
            data will be permanently removed. Active subscriptions should be cancelled before deleting your
            account to avoid further charges.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">9. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranties of any kind. Vocal Reps does not guarantee
            specific vocal improvement results. Always consult with a qualified vocal coach or medical
            professional if you experience vocal strain or discomfort.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Vocal Reps shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">11. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes via email
            or through the Service. Continued use after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">12. Contact</h2>
          <p>
            For questions about these Terms, please contact us at{" "}
            <Link href="/contact" className="text-accent hover:underline">our contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
