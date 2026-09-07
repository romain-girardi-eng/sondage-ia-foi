import { SurveyContainer } from "@/components/survey";

const SUPPORTED_LOCALES = ["fr", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function isValidLocale(lang: string): lang is Locale {
  return SUPPORTED_LOCALES.includes(lang as Locale);
}

interface Props {
  params: Promise<{ lang: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export default async function LocalizedHome({ params }: Props) {
  const { lang: rawLang } = await params;
  const lang: Locale = isValidLocale(rawLang) ? rawLang : "fr";

  const skipToContent = {
    fr: "Aller au contenu principal",
    en: "Skip to main content",
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-lg focus:font-medium"
      >
        {skipToContent[lang]}
      </a>

      <main
        id="main-content"
        className="min-h-[100dvh] w-screen max-w-full relative overflow-x-hidden bg-background text-foreground"
      >

        <div className="relative z-10 w-full">
          <SurveyContainer initialLanguage={lang} />
        </div>
      </main>
    </>
  );
}
