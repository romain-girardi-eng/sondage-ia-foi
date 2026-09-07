import type { Metadata } from "next";
export { default } from "../[lang]/methodology/page";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

export const metadata: Metadata = {
  title: "Méthodologie — Comment fonctionne l'enquête IA & Foi",
  description:
    "La méthodologie de l'enquête IA & Foi\u00a0: instrument v2.0.0 à 58 questions, 7 dimensions, 8 profils heuristiques, CRS-5 adapté, écart d'usage et hypothèses H1 à H8.",
  alternates: {
    canonical: `${BASE_URL}/methodology`,
    languages: {
      "fr-FR": `${BASE_URL}/methodology`,
      "en-US": `${BASE_URL}/eng/methodology`,
    },
  },
  openGraph: {
    title: "Méthodologie scientifique — Enquête IA & Foi 2026",
    description:
      "7 dimensions, 8 profils heuristiques, CRS-5 adapté et sélection ad hoc d'items Marlowe-Crowne. Transparence complète sur ce qui est mesuré et sur ce qui ne l'est pas.",
    url: `${BASE_URL}/methodology`,
    type: "website",
  },
};
