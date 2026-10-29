import type { Metadata, Viewport } from "next";
import { SurveyContainer } from "@/components/survey";

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

// CNEF co-branded landing. Enters the SAME survey engine as the general
// survey, but pre-seeds profil_confession=protestant so evangelical
// respondents skip straight to the evangelical sub-question. Responses land
// in the same storage as the general survey to keep the data comparable.
export default function CnefHome() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-lg focus:font-medium"
      >
        Aller au contenu principal
      </a>

      <main
        id="main-content"
        className="min-h-[100dvh] w-full relative bg-background text-foreground"
      >

        <div className="relative z-10">
          <SurveyContainer
            variant="cnef"
            initialAnswers={{ profil_confession: "protestant", profil_confession_protestante: "evangelique" }}
          />
        </div>
      </main>
    </>
  );
}
