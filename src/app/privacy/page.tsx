import type { Metadata } from "next";
import { PrivacyContent } from "../[lang]/privacy/page";
import { getPrivacyMetadata } from "../[lang]/privacy/metadata";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

const base = getPrivacyMetadata("fr");

export const metadata: Metadata = {
  ...base,
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de l'enquête IA & Foi : données collectées, base légale RGPD, durée de conservation et droits des participants.",
  robots: { index: true, follow: false },
  alternates: {
    canonical: `${BASE_URL}/privacy`,
    languages: {
      "fr-FR": `${BASE_URL}/privacy`,
      "en-US": `${BASE_URL}/eng/privacy`,
    },
  },
};

export default function PrivacyPageFr() {
  return <PrivacyContent lang="fr" />;
}
