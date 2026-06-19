import type { MetadataRoute } from "next";
import { ALL_ARCHETYPE_SLUGS } from "@/lib/profil/archetypes";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ia-foi.fr";

// Routes with both FR and EN variants
const BILINGUAL_ROUTES = [
  { fr: "/", en: "/eng", priority: 1.0, changeFrequency: "weekly" as const },
  { fr: "/methodology", en: "/eng/methodology", priority: 0.8, changeFrequency: "monthly" as const },
  { fr: "/privacy", en: "/eng/privacy", priority: 0.4, changeFrequency: "yearly" as const },
  { fr: "/mes-donnees", en: "/eng/mes-donnees", priority: 0.3, changeFrequency: "yearly" as const },
];

// FR-only routes
const FR_ONLY_ROUTES = [
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/cnef", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/legal", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const bilingualEntries: MetadataRoute.Sitemap = BILINGUAL_ROUTES.flatMap(
    ({ fr, en, priority, changeFrequency }) => [
      {
        url: `${BASE_URL}${fr}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            fr: `${BASE_URL}${fr}`,
            en: `${BASE_URL}${en}`,
          },
        },
      },
      {
        url: `${BASE_URL}${en}`,
        lastModified: now,
        changeFrequency,
        priority: priority * 0.9,
        alternates: {
          languages: {
            fr: `${BASE_URL}${fr}`,
            en: `${BASE_URL}${en}`,
          },
        },
      },
    ]
  );

  const frOnlyEntries: MetadataRoute.Sitemap = FR_ONLY_ROUTES.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  // Public shareable archetype profile pages (one per archetype type, no PII).
  const profilEntries: MetadataRoute.Sitemap = ALL_ARCHETYPE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/profil/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...bilingualEntries, ...frOnlyEntries, ...profilEntries];
}
