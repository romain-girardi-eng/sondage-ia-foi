import type { Metadata } from "next";
export { default } from "../[lang]/methodology/page";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

export const metadata: Metadata = {
  title: "Méthodologie — Comment fonctionne l'enquête IA & Foi",
  description:
    "Découvrez la méthodologie scientifique de l'enquête IA & Foi : 7 dimensions, 8 profils, échelle CRS-5, indice de résistance spirituelle et hypothèses de recherche.",
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
      "7 dimensions psychométriques, 8 profils typologiques, échelles validées (CRS-5, Marlowe-Crowne). Transparence totale sur la méthode.",
    url: `${BASE_URL}/methodology`,
    type: "website",
  },
};
