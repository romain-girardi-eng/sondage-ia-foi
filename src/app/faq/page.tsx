import { FAQSection } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes sur l'enquête IA & Foi",
  description:
    "Tout savoir sur l'enquête académique IA & Foi : anonymat, durée, données personnelles, score CRS-5, indice de résistance spirituelle et résultats.",
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

const faqSchemaItems = [
  {
    q: "Pourquoi cette étude ?",
    a: "L'intelligence artificielle transforme silencieusement les pratiques religieuses, de la rédaction de sermons à la prière assistée. Cette grande enquête vise à cartographier ces usages et comprendre les enjeux éthiques qu'ils soulèvent pour les communautés chrétiennes.",
  },
  {
    q: "Mes réponses sont-elles anonymes ?",
    a: "Oui. Nous utilisons une empreinte cryptographique (hash) de votre email pour garantir qu'une personne ne réponde qu'une seule fois, mais votre email réel n'est jamais stocké. Vos réponses sont agrégées à des fins statistiques, dans le respect du RGPD.",
  },
  {
    q: "Combien de temps dure le sondage ?",
    a: "Entre 5 et 7 minutes selon votre profil. Le nombre de questions varie : les membres du clergé répondent à des questions supplémentaires sur leur ministère.",
  },
  {
    q: "Qui peut participer ?",
    a: "Toute personne se reconnaissant dans la foi chrétienne, quelle que soit sa dénomination (catholique, protestant, orthodoxe, évangélique) et son niveau d'engagement.",
  },
  {
    q: "Comment mes données seront-elles utilisées ?",
    a: "Les résultats seront publiés sous forme agrégée dans des rapports publics et présentés lors de conférences. Aucune réponse individuelle ne sera jamais divulguée.",
  },
  {
    q: "Qu'est-ce que le score CRS-5 ?",
    a: "Le CRS-5 (Centrality of Religiosity Scale) est une échelle validée par Huber & Huber (2012) qui mesure 5 dimensions de la religiosité : intellect, idéologie, pratique publique, pratique privée et expérience spirituelle.",
  },
  {
    q: "Qu'est-ce que l'indice de résistance spirituelle ?",
    a: "C'est un indicateur original de cette étude qui mesure la différence entre votre usage général de l'IA et votre usage spirituel. Un indice positif suggère une réticence spécifique à utiliser l'IA pour des tâches spirituelles.",
  },
  {
    q: "Puis-je voir les résultats ?",
    a: "Oui ! À la fin du sondage, vous recevez un profil personnalisé avec vos scores et votre typologie. Vous pouvez ensuite consulter les résultats agrégés de l'ensemble des participants.",
  },
];

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
