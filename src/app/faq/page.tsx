import { FAQSection } from "@/components/ui";
import { FAQ_CONTENT } from "@/components/ui/faq-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes sur l'enquête IA & Foi",
  description:
    "Tout savoir sur l'enquête académique IA & Foi : anonymat, durée, données personnelles, score CRS-5, écart d'usage et résultats.",
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
  openGraph: {
    title: "FAQ — Enquête IA & Vie Spirituelle",
    description:
      "Vos questions sur l'enquête académique IA & Foi : anonymat, durée, résultats et protection des données.",
    url: `${BASE_URL}/faq`,
    type: "website",
  },
};

const faqSchemaItems = FAQ_CONTENT.fr;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqSchemaItems.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: a,
    },
  })),
};

const faqBreadcrumbs = [
  { name: "Accueil", url: `${BASE_URL}/` },
  { name: "FAQ", url: `${BASE_URL}/faq` },
];

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <BreadcrumbJsonLd items={faqBreadcrumbs} />
      <FAQSection />
    </>
  );
}
