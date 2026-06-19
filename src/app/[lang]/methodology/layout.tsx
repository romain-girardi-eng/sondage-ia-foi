import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

const SUPPORTED_LOCALES = ["fr", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function isValidLocale(lang: string): lang is Locale {
  return SUPPORTED_LOCALES.includes(lang as Locale);
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Locale = isValidLocale(rawLang) ? rawLang : "fr";

  const data = {
    fr: {
      title: "Méthodologie — Comment fonctionne l'enquête IA & Foi",
      description:
        "Découvrez la méthodologie scientifique de l'enquête IA & Foi : 7 dimensions, 8 profils, échelle CRS-5, indice de résistance spirituelle et hypothèses de recherche.",
      path: `${BASE_URL}/methodology`,
    },
    en: {
      title: "Methodology — How the AI & Faith Survey Works",
      description:
        "Discover the scientific methodology behind the AI & Faith survey: 7 psychometric dimensions, 8 typological profiles, CRS-5 scale, spiritual resistance index and research hypotheses.",
      path: `${BASE_URL}/eng/methodology`,
    },
  };

  return {
    title: data[lang].title,
    description: data[lang].description,
    alternates: {
      canonical: data[lang].path,
      languages: {
        "fr-FR": `${BASE_URL}/methodology`,
        "en-US": `${BASE_URL}/eng/methodology`,
      },
    },
    openGraph: {
      title: data[lang].title,
      description: data[lang].description,
      url: data[lang].path,
      type: "website",
    },
  };
}

export default function MethodologyLocaleLayout({ children }: Props) {
  return <>{children}</>;
}
