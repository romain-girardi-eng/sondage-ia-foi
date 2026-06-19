/**
 * Pure helpers for building the viral share payload of a profile.
 *
 * RGPD: the only respondent-derived value that ever leaves the browser is the
 * archetype slug (the TYPE), which is identical for everyone sharing the same
 * profile. No hash, no email, no identifier.
 */

import type { Language } from "@/lib/i18n/translations";

const FALLBACK_BASE_URL = "https://ia-foi.fr";

/** Base origin for shared links. */
export function getShareBaseURL(): string {
  return process.env.NEXT_PUBLIC_APP_URL || FALLBACK_BASE_URL;
}

/** Absolute, RGPD-safe URL of a public profile page for a given slug. */
export function getProfileShareURL(slug: string): string {
  return `${getShareBaseURL()}/profil/${slug}`;
}

/**
 * Pre-filled share text. No em dash, accents included.
 * `title` is the archetype title, e.g. "Pionnier Spirituel".
 */
export function getProfileShareText(
  title: string,
  url: string,
  language: Language = "fr",
): string {
  if (language === "en") {
    return `I took the CNEF survey on AI and faith, and I am a ${title}. And you, what is your profile? 👉 ${url}`;
  }
  return `J'ai fait l'enquête IA et foi du CNEF, je suis un·e ${title}. Et toi, quel est ton profil ? 👉 ${url}`;
}

export interface ProfileShareLinks {
  whatsapp: string;
  x: string;
  facebook: string;
}

/** Build the fallback share links for each channel (used when navigator.share is absent). */
export function buildProfileShareLinks(text: string, url: string): ProfileShareLinks {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  return {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    x: `https://twitter.com/intent/tweet?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
}
