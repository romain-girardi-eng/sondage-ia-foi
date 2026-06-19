import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { LanguageProvider, ThemeProvider } from "@/lib";
import { ToastProvider } from "@/components/ui";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { WebVitalsReporter } from "@/components/analytics/WebVitalsReporter";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import type { Language } from "@/lib/i18n/translations";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b1120",
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "IA & Vie Spirituelle | Grande Enquête 2026",
    template: "%s | IA & Foi",
  },
  description:
    "Participez à la grande enquête 2026 sur l'utilisation de l'intelligence artificielle dans les pratiques religieuses chrétiennes. Anonyme, confidentiel, résultats personnalisés.",
  keywords: [
    "intelligence artificielle",
    "religion",
    "christianisme",
    "église",
    "sondage",
    "grande enquête",
    "spiritualité",
    "IA",
    "foi",
    "pratiques religieuses",
    "CNEF",
    "évangéliques",
  ],
  authors: [{ name: "Équipe de Recherche IA & Foi" }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
      "en-US": "/eng",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
    title: "IA & Vie Spirituelle | Grande Enquête 2026",
    description:
      "Participez à la grande enquête 2026 sur l'utilisation de l'IA dans les pratiques religieuses chrétiennes.",
    siteName: "IA & Foi",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        type: "image/png",
        alt: "IA & Foi — Enquête sur l'intelligence artificielle et la vie spirituelle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IA & Vie Spirituelle | Grande Enquête 2026",
    description:
      "Grande enquête 2026 sur l'IA dans les pratiques religieuses chrétiennes. Résultats personnalisés.",
    images: [{ url: "/og-image.png", width: 1200, height: 1200, alt: "IA & Foi" }],
  },
};

const SUPPORTED_LANGUAGES: Language[] = ["fr", "en"];

function isSupportedLanguage(lang: string | undefined): lang is Language {
  return Boolean(lang && SUPPORTED_LANGUAGES.includes(lang as Language));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang?: string }>;
}

export default async function RootLayout({ children, params }: Readonly<RootLayoutProps>) {
  const [resolvedParams, cookieStore, headersList] = await Promise.all([
    params,
    cookies(),
    headers(),
  ]);
  const routeLang = resolvedParams?.lang;
  const cookieLang = cookieStore.get("NEXT_LOCALE")?.value;
  const resolvedLang: Language = isSupportedLanguage(routeLang)
    ? routeLang
    : isSupportedLanguage(cookieLang)
      ? (cookieLang as Language)
      : "fr";
  const initialSource: "route" | "default" = isSupportedLanguage(routeLang) ? "route" : "default";
  const nonce = headersList.get("x-nonce") || undefined;

  return (
    <html
      lang={resolvedLang}
      className="scroll-smooth dark"
      suppressHydrationWarning
      style={{ margin: 0, padding: 0, width: "100%", overflowX: "hidden" }}
    >
      <body
        className="antialiased selection:bg-blue-500/30"
        style={{ margin: 0, padding: 0, width: '100%', minHeight: '100vh', overflowX: 'hidden' }}
      >
        <ThemeProvider>
          <LanguageProvider initialLanguage={resolvedLang} initialSource={initialSource}>
            <ToastProvider>{children}</ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
        <SiteJsonLd />
        <AnalyticsProvider nonce={nonce} />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
