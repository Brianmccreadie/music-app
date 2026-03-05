import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { SubscriptionProvider } from "@/lib/subscription";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocal Reps — Train Your Voice",
  description:
    "Professional vocal training with personalized routines, training tracks, and real piano accompaniment. 50+ exercises, custom practice plans, and progress tracking.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vocal Reps",
  },
  openGraph: {
    title: "Vocal Reps — Train Your Voice",
    description:
      "Professional vocal training with real piano accompaniment. 50+ exercises, custom practice plans, and progress tracking.",
    type: "website",
    siteName: "Vocal Reps",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vocal Reps — Train Your Voice",
    description:
      "Professional vocal training with real piano accompaniment. 50+ exercises, custom practice plans, and progress tracking.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1B6B5A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <AuthProvider>
          <SubscriptionProvider>
            <NavBar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <CookieConsent />
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
