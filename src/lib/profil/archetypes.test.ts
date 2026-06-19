import { describe, it, expect } from "vitest";
import { PROFILE_DEFINITIONS } from "@/lib/scoring";
import type { PrimaryProfile } from "@/lib/scoring/types";
import {
  ALL_ARCHETYPE_SLUGS,
  PUBLIC_ARCHETYPES,
  getArchetypeBySlug,
  getArchetypeById,
  profileIdToSlug,
  slugToProfileId,
} from "./archetypes";

const ALL_IDS = Object.keys(PROFILE_DEFINITIONS) as PrimaryProfile[];

describe("archetype slugs", () => {
  it("exposes exactly the 8 canonical archetypes", () => {
    expect(ALL_IDS).toHaveLength(8);
    expect(PUBLIC_ARCHETYPES).toHaveLength(8);
    expect(ALL_ARCHETYPE_SLUGS).toHaveLength(8);
  });

  it("produces hyphenated slugs without underscores", () => {
    for (const slug of ALL_ARCHETYPE_SLUGS) {
      expect(slug).not.toContain("_");
      expect(slug).toMatch(/^[a-z-]+$/);
    }
  });

  it("round-trips every id through its slug", () => {
    for (const id of ALL_IDS) {
      const slug = profileIdToSlug(id);
      expect(slugToProfileId(slug)).toBe(id);
    }
  });

  it("maps the known example slug to the right id", () => {
    expect(slugToProfileId("pionnier-spirituel")).toBe("pionnier_spirituel");
    expect(profileIdToSlug("pionnier_spirituel")).toBe("pionnier-spirituel");
  });
});

describe("getArchetypeBySlug", () => {
  it("returns generic, RGPD-safe content sourced from the scoring engine", () => {
    const archetype = getArchetypeBySlug("pionnier-spirituel");
    expect(archetype).not.toBeNull();
    const def = PROFILE_DEFINITIONS.pionnier_spirituel;
    expect(archetype?.title).toBe(def.title);
    expect(archetype?.fullDescription).toBe(def.fullDescription);
    expect(archetype?.coreMotivation).toBe(def.coreMotivation);
    expect(archetype?.primaryFear).toBe(def.primaryFear);
  });

  it("returns null for unknown or malformed slugs", () => {
    expect(getArchetypeBySlug("not-a-real-profile")).toBeNull();
    expect(getArchetypeBySlug("")).toBeNull();
    expect(slugToProfileId("__proto__")).toBeNull();
  });

  it("resolves every public slug", () => {
    for (const slug of ALL_ARCHETYPE_SLUGS) {
      expect(getArchetypeBySlug(slug)).not.toBeNull();
    }
  });
});

describe("getArchetypeById", () => {
  it("matches the slug-based lookup", () => {
    for (const id of ALL_IDS) {
      const byId = getArchetypeById(id);
      const bySlug = getArchetypeBySlug(profileIdToSlug(id));
      expect(byId).toEqual(bySlug);
    }
  });
});
