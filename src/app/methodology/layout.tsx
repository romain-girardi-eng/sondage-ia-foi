import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": `${BASE_URL}/methodology#dataset`,
  name: "Enquête IA & Foi 2026 — Données agrégées sur l'IA dans les pratiques religieuses chrétiennes",
  description:
    "Jeu de données agrégées issu de la grande enquête 2026 sur l'utilisation de l'intelligence artificielle dans les pratiques religieuses chrétiennes. Mesures psychométriques sur 7 dimensions : usage général, usage spirituel, rapport éthique, réflexivité, intégration communautaire, autonomie spirituelle et régulation.",
  url: `${BASE_URL}/methodology`,
  creator: {
    "@type": "ResearchOrganization",
    "@id": `${BASE_URL}/#organization`,
    name: "IA & Foi — Équipe de recherche",
  },
  license: "https://creativecommons.org/licenses/by-nc/4.0/",
  inLanguage: ["fr-FR", "en-US"],
  keywords: [
    "intelligence artificielle",
    "religion chrétienne",
    "psychologie de la religion",
    "CRS-5",
    "Centrality of Religiosity Scale",
    "spiritualité numérique",
    "éthique de l'IA",
    "sondage académique",
  ],
  measurementTechnique: "Questionnaire en ligne, auto-déclaratif",
  variableMeasured: [
    "Usage général de l'IA",
    "Usage spirituel de l'IA",
    "Rapport éthique à l'IA",
    "Réflexivité",
    "Intégration communautaire",
    "Autonomie spirituelle",
    "Régulation",
  ],
  distribution: {
    "@type": "DataDownload",
    contentUrl: `${BASE_URL}/api/results/aggregated`,
    encodingFormat: "application/json",
  },
};

const breadcrumbs = [
  { name: "Accueil", url: `${BASE_URL}/` },
  { name: "Méthodologie", url: `${BASE_URL}/methodology` },
];

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={datasetSchema} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      {children}
    </>
  );
}
