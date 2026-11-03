import type { Metadata, Viewport } from "next";
import { CnefLanding } from "./landing";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

// The CNEF entry renders on a white background (light theme) by default.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Usage de l'IA par les protestants évangéliques | IA & Foi x CNEF",
  description:
    "Enquête indépendante sur l'usage de l'intelligence artificielle dans la vie d'Église évangélique, réalisée en partenariat avec le CNEF. Réponses pseudonymisées, résultats personnalisés inclus.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${BASE_URL}/cnef`,
    languages: { "fr-FR": `${BASE_URL}/cnef`, "en-US": `${BASE_URL}/eng/cnef` },
  },
  openGraph: {
    title: "Usage de l'IA par les protestants évangéliques | IA & Foi x CNEF",
    description:
      "Participez à l'enquête indépendante sur l'IA dans les Églises évangéliques, en partenariat avec le CNEF. Réponses pseudonymisées.",
    url: `${BASE_URL}/cnef`,
    type: "website",
    images: [
      {
        url: `${BASE_URL}/cnef-og.png`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Usage de l'IA par les protestants évangéliques : enquête IA & Foi en partenariat avec le CNEF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Usage de l'IA par les protestants évangéliques | IA & Foi x CNEF",
    description:
      "Participez à l'enquête indépendante sur l'IA dans les Églises évangéliques, en partenariat avec le CNEF.",
    images: [{ url: `${BASE_URL}/cnef-og.png`, alt: "IA & Foi x CNEF" }],
  },
};

export default function CnefHome() {
  return <CnefLanding />;
}
