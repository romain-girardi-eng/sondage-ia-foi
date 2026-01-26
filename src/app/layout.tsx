import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider, ThemeProvider } from "@/lib";
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
  title: "IA & Vie Spirituelle | Grande Enquête 2026",
  description:
    "Participez à cette grande enquête sur l'utilisation de l'intelligence artificielle dans les pratiques religieuses chrétiennes. Anonyme et confidentiel.",
  keywords: [
    "intelligence artificielle",
    "religion",
    "christianisme",
    "église",
    "sondage",
    "grande enquête",
    "spiritualité",
    "IA",
  ],
  authors: [{ name: "Équipe de Recherche" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "IA & Vie Spirituelle | Grande Enquête 2026",
    description:
      "Participez à cette grande enquête sur l'utilisation de l'IA dans les pratiques religieuses chrétiennes.",
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
    title: "IA & Vie Spirituelle | Grande Enquête 2026",
    description:
      "Participez à cette grande enquête sur l'utilisation de l'IA dans les pratiques religieuses.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth dark" suppressHydrationWarning style={{ margin: 0, padding: 0, width: '100%', overflowX: 'hidden' }}>
      <head>
        {/* Icons auto-detected from icon.png and apple-icon.png */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ia-foi-theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                  // Default: dark mode (no system preference check)
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30`}
        style={{ margin: 0, padding: 0, width: '100%', minHeight: '100vh', overflowX: 'hidden' }}
      >
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>{children}</ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
        <AnalyticsProvider />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
