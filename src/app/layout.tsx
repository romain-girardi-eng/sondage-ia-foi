import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib";
import { ToastProvider } from "@/components/ui";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { WebVitalsReporter } from "@/components/analytics/WebVitalsReporter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b1120",
};

export const metadata: Metadata = {
  title: "IA & Vie Spirituelle | Enquête Scientifique 2026",
  description:
    "Participez à cette étude académique sur l'utilisation de l'intelligence artificielle dans les pratiques religieuses chrétiennes. Anonyme et confidentiel.",
  keywords: [
    "intelligence artificielle",
    "religion",
    "christianisme",
    "église",
    "sondage",
    "étude scientifique",
    "spiritualité",
    "IA",
  ],
  authors: [{ name: "Équipe de Recherche" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "IA & Vie Spirituelle | Enquête Scientifique 2026",
    description:
      "Participez à cette étude académique sur l'utilisation de l'IA dans les pratiques religieuses chrétiennes.",
    siteName: "IA & Foi",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "IA & Foi - Enquête sur l'intelligence artificielle et la vie spirituelle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IA & Vie Spirituelle | Enquête Scientifique 2026",
    description:
      "Participez à cette étude académique sur l'utilisation de l'IA dans les pratiques religieuses.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        {/* Icons auto-detected from icon.png and apple-icon.png */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30`}
      >
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
        <AnalyticsProvider />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
