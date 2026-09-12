import type { Metadata } from "next";
import "./globals.css";
import "./honeypot.css";
import { AuthProvider } from "@/lib/auth";
import LoginModalWrapper from "@/components/LoginModalWrapper";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ErrorMonitor from "@/components/ErrorMonitor";
import EnvironmentBadge from "@/components/EnvironmentBadge";

export const metadata: Metadata = {
  title: {
    default: "GuardianHub — The Command Centre for Modern Security Operations",
    template: "%s — GuardianHub",
  },
  description: "GuardianHub is the AI-powered security operations platform for UK security firms. Rota generation, incident reporting, patrol tracking, compliance management, and client portals — all in one connected command centre.",
  keywords: ["security operations", "guard management", "rota scheduling", "patrol tracking", "incident reporting", "security compliance", "ACS compliance", "lone worker protection", "security firm software", "UK security"],
  authors: [{ name: "GuardianHub" }],
  creator: "GuardianHub",
  publisher: "GuardianHub",
  metadataBase: new URL("https://guardianhub.com"),
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://guardianhub.com",
    siteName: "GuardianHub",
    title: "GuardianHub — The Command Centre for Modern Security Operations",
    description: "AI-powered security operations platform for UK security firms. Rota generation, incident reporting, patrol tracking, and compliance — all in one connected command centre.",
    images: [{ url: "https://readdy.ai/api/search-image?query=Dark-themed%20security%20operations%20dashboard%20with%20modern%20glassmorphism%20UI%20showing%20guard%20tracking%20map%20incident%20feed%20and%20KPI%20cards%20professional%20enterprise%20SaaS%20branding%20image%20navy%20background%20electric%20blue%20accents%20GuardianHub%20logo%20placeholder%20clean%20modern%20design&width=1200&height=630&seq=og-image&orientation=landscape", width: 1200, height: 630, alt: "GuardianHub Security Operations Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GuardianHub — The Command Centre for Modern Security Operations",
    description: "AI-powered security operations platform for UK security firms. Rotas, incidents, patrols, compliance — all connected.",
    images: ["https://readdy.ai/api/search-image?query=Dark-themed%20security%20operations%20dashboard%20with%20modern%20glassmorphism%20UI%20showing%20guard%20tracking%20map%20incident%20feed%20and%20KPI%20cards%20professional%20enterprise%20SaaS%20branding%20image%20navy%20background%20electric%20blue%20accents%20GuardianHub%20logo%20placeholder%20clean%20modern%20design&width=1200&height=630&seq=og-image&orientation=landscape"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#0a0e1a] text-white">
        <AuthProvider>
          {children}
          <LoginModalWrapper />
          <CookieConsentBanner />
          <ErrorMonitor />
          <EnvironmentBadge />
        </AuthProvider>
      </body>
    </html>
  );
}