"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, construct a mailto link. Replace with a form endpoint when ready.
    const mailtoBody = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
    window.location.href = `mailto:support@vocalreps.com?subject=${encodeURIComponent(
      `[${subject}] ${name}`
    )}&body=${encodeURIComponent(mailtoBody)}`;
    setSubmitted(true);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-accent hover:text-accent-hover mb-6 inline-block">
        &larr; Home
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-2">Contact & Support</h1>
      <p className="text-muted mb-8">
        Have a question, found a bug, or need help with your subscription? We&apos;re here to help.
      </p>

      {submitted ? (
        <div className="bg-accent-light rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Message sent!</h2>
          <p className="text-muted text-sm">
            Your email client should have opened with the message. If not, you can email us directly at{" "}
            <a href="mailto:support@vocalreps.com" className="text-accent hover:underline">
              support@vocalreps.com
            </a>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted block mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Your name"
            />
          </div>
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
          <div>
            <label className="text-sm font-medium text-muted block mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="general">General Question</option>
              <option value="bug">Bug Report</option>
              <option value="subscription">Subscription & Billing</option>
              <option value="feature">Feature Request</option>
              <option value="account">Account & Data</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted block mb-1">Message</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
          >
            Send Message
          </button>
        </form>
      )}

      <div className="mt-8 p-6 bg-white rounded-2xl border border-border">
        <h3 className="font-bold text-foreground mb-3">Other ways to reach us</h3>
        <div className="space-y-2 text-sm text-muted">
          <p>
            Email:{" "}
            <a href="mailto:support@vocalreps.com" className="text-accent hover:underline">
              support@vocalreps.com
            </a>
          </p>
          <p>We typically respond within 24 hours on business days.</p>
        </div>
      </div>
    </div>
  );
}
