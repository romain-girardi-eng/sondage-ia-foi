import type { Metadata } from "next";
export { default } from "../[lang]/mes-donnees/page";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

export const metadata: Metadata = {
  title: "Mes Données — Gestion RGPD",
  description:
    "Accédez à vos données personnelles, exportez-les ou supprimez-les conformément au RGPD. Utilisez votre identifiant anonyme pour retrouver vos réponses.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${BASE_URL}/mes-donnees`,
    languages: {
      "fr-FR": `${BASE_URL}/mes-donnees`,
      "en-US": `${BASE_URL}/eng/mes-donnees`,
    },
  },
};
