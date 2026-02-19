import type { Metadata } from "next";

const SUPPORTED_LOCALES = ["fr", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function isValidLocale(lang: string): lang is Locale {
  return SUPPORTED_LOCALES.includes(lang as Locale);
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Locale = isValidLocale(rawLang) ? rawLang : "fr";

  const metadata = {
    fr: {
      title: "IA & Vie Spirituelle | Grande Enquête 2026",
      description:
        "Participez à cette grande enquête sur l'utilisation de l'intelligence artificielle dans les pratiques religieuses chrétiennes.",
      locale: "fr_FR",
    },
    en: {
      title: "AI & Spiritual Life | Great Survey 2026",
      description:
        "Participate in this major survey on the use of artificial intelligence in Christian religious practices.",
      locale: "en_US",
    },
  };
  const localizedPath = lang === "en" ? "/eng" : "/";

  return {
    title: metadata[lang].title,
    description: metadata[lang].description,
    alternates: {
      canonical: localizedPath,
      languages: {
        fr: "/",
        en: "/eng",
      },
    },
    openGraph: {
      type: "website",
      locale: metadata[lang].locale,
      title: metadata[lang].title,
      description: metadata[lang].description,
      siteName: "IA & Foi",
      url: localizedPath,
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
      title: metadata[lang].title,
      description: metadata[lang].description,
      images: ["/og-image.png"],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang: rawLang } = await params;
  const lang: Locale = isValidLocale(rawLang) ? rawLang : "fr";

  return (
    <div data-lang={lang}>
      {children}
    </div>
  );
}
