import type { Language } from "./translations";

function normalizeSlug(slug: string): string {
  if (!slug || slug === "/") {
    return "/";
  }
  return slug.startsWith("/") ? slug : `/${slug}`;
}

export function getLocalizedPath(language: Language, slug = "/"): string {
  const prefix = language === "en" ? "/eng" : "";
  const normalized = normalizeSlug(slug);
  if (normalized === "/") {
    return prefix || "/";
  }
  return `${prefix}${normalized}`;
}
