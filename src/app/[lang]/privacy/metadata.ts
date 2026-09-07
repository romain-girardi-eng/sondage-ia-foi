import type { Metadata } from "next";

export type SupportedLang = "fr" | "en";

const PRIVACY_METADATA = {
  fr: {
    title: "Politique de Confidentialité - Sondage IA & Foi",
    description: "Notre politique de confidentialité et de protection des données personnelles.",
  },
  en: {
    title: "Privacy Policy - IA & Faith Survey",
    description: "Our privacy policy and approach to protecting personal data.",
  },
} satisfies Record<SupportedLang, Metadata>;

export function resolveLang(value?: string): SupportedLang {
  return value === "en" ? "en" : "fr";
}

export function getPrivacyMetadata(lang: SupportedLang): Metadata {
  return PRIVACY_METADATA[lang];
}
