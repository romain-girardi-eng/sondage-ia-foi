/**
 * Public archetype data for the shareable profile pages (/profil/[slug]).
 *
 * Single source of truth derived from the scoring engine
 * (PROFILE_DEFINITIONS). These pages are 100% generic per archetype TYPE:
 * they contain NO personal data, no respondent identifier, no hash. The slug
 * encodes only the archetype type, never the person.
 */

import { PROFILE_DEFINITIONS } from "@/lib/scoring";
import type { PrimaryProfile } from "@/lib/scoring/types";

export interface PublicArchetype {
  /** Canonical scoring id, e.g. "pionnier_spirituel" */
  id: PrimaryProfile;
  /** URL-safe slug, e.g. "pionnier-spirituel" */
  slug: string;
  title: string;
  emoji: string;
  shortDescription: string;
  fullDescription: string;
  coreMotivation: string;
  primaryFear: string;
}

/** Convert a scoring profile id to its public URL slug. */
export function profileIdToSlug(id: PrimaryProfile): string {
  return id.replace(/_/g, "-");
}

/** Convert a public URL slug back to a scoring profile id, if valid. */
export function slugToProfileId(slug: string): PrimaryProfile | null {
  const candidate = slug.replace(/-/g, "_");
  return Object.prototype.hasOwnProperty.call(PROFILE_DEFINITIONS, candidate)
    ? (candidate as PrimaryProfile)
    : null;
}

function toPublicArchetype(id: PrimaryProfile): PublicArchetype {
  const def = PROFILE_DEFINITIONS[id];
  return {
    id,
    slug: profileIdToSlug(id),
    title: def.title,
    emoji: def.emoji,
    shortDescription: def.shortDescription,
    fullDescription: def.fullDescription,
    coreMotivation: def.coreMotivation,
    primaryFear: def.primaryFear,
  };
}

/** Every archetype, in the canonical scoring order. */
export const PUBLIC_ARCHETYPES: PublicArchetype[] = (
  Object.keys(PROFILE_DEFINITIONS) as PrimaryProfile[]
).map(toPublicArchetype);

/** All public slugs (used by generateStaticParams). */
export const ALL_ARCHETYPE_SLUGS: string[] = PUBLIC_ARCHETYPES.map((a) => a.slug);

/** Look up the public archetype for a slug, or null if the slug is unknown. */
export function getArchetypeBySlug(slug: string): PublicArchetype | null {
  const id = slugToProfileId(slug);
  return id ? toPublicArchetype(id) : null;
}

/** Look up the public archetype for a scoring profile id. */
export function getArchetypeById(id: PrimaryProfile): PublicArchetype {
  return toPublicArchetype(id);
}
