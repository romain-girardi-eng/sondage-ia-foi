import type { Metadata, Viewport } from "next";
import { CnefLanding } from "../../cnef/landing";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

interface Props {
  params: Promise<{ lang: string }>;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

const languages = { "fr-FR": `${BASE_URL}/cnef`, "en-US": `${BASE_URL}/eng/cnef` };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") {
    return { alternates: { canonical: `${BASE_URL}/cnef`, languages } };
  }
  const title = "AI use among evangelical Protestants | AI & Faith x CNEF";
  const description =
    "Independent survey on the use of artificial intelligence in evangelical church life, in partnership with the CNEF. Pseudonymised answers.";
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `${BASE_URL}/eng/cnef`, languages },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/eng/cnef`,
      type: "website",
      locale: "en_US",
      images: [{ url: `${BASE_URL}/cnef-og.png`, width: 1200, height: 630, type: "image/png", alt: "AI & Faith x CNEF" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: `${BASE_URL}/cnef-og.png`, alt: "AI & Faith x CNEF" }],
    },
  };
}

export default async function LocalizedCnefHome({ params }: Props) {
  const { lang } = await params;
  return <CnefLanding lang={lang === "en" ? "en" : "fr"} />;
}
