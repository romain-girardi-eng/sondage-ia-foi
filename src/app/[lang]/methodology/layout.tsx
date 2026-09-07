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
        "La méthodologie de l'enquête IA & Foi\u00a0: instrument v2.0.0 à 58 questions, 7 dimensions, 8 profils heuristiques, CRS-5 adapté, écart d'usage et hypothèses H1 à H8.",
      path: `${BASE_URL}/methodology`,
    },
    en: {
      title: "Methodology — How the AI & Faith Survey Works",
      description:
        "The methodology behind the AI & Faith survey: a 58-question instrument (v2.0.0), 7 dimensions, 8 heuristic profiles, an adapted CRS-5, a usage-gap indicator and hypotheses H1 to H8.",
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
