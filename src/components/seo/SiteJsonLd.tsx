import { JsonLd } from "./JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  "@id": `${BASE_URL}/#organization`,
  name: "IA & Foi — Enquête sur l'Intelligence Artificielle et la Vie Spirituelle",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/logo.png`,
  },
  description:
    "Étude académique sur l'utilisation de l'intelligence artificielle dans les pratiques religieuses chrétiennes. Réalisée en partenariat avec le CNEF.",
  knowsAbout: [
    "Intelligence Artificielle",
    "Pratiques religieuses chrétiennes",
    "Spiritualité numérique",
    "Sociologie des religions",
    "Éthique de l'IA",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@ia-foi.fr",
    contactType: "customer support",
    availableLanguage: ["French", "English"],
  },
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "IA & Foi",
  description:
    "Grande enquête académique 2026 sur l'intelligence artificielle et la vie spirituelle chrétienne.",
  publisher: { "@id": `${BASE_URL}/#organization` },
  inLanguage: ["fr-FR", "en-US"],
};

export function SiteJsonLd() {
  return <JsonLd data={[organizationSchema, websiteSchema]} />;
}
