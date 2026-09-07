import { describe, it, expect } from "vitest";
import { INSTRUMENT_VERSION } from "@/data/surveySchema";
import {
  parseSavedProgress,
  sanitizeExclusiveSelections,
  RESUME_MAX_AGE_MS,
} from "./surveyProgress";

const NOW = Date.parse("2026-09-07T12:00:00.000Z");

function saved(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    answers: { profil_confession: "protestant" },
    currentIndex: 3,
    timestamp: NOW - 1000,
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    instrumentVersion: INSTRUMENT_VERSION,
    ...overrides,
  });
}

describe("parseSavedProgress — instrument version guard", () => {
  it("resumes progress saved by the current instrument", () => {
    const progress = parseSavedProgress(saved(), { now: NOW });
    expect(progress).not.toBeNull();
    expect(progress?.currentIndex).toBe(3);
    expect(progress?.answers).toEqual({ profil_confession: "protestant" });
  });

  it("discards progress saved by another instrument version", () => {
    const progress = parseSavedProgress(saved({ instrumentVersion: "1.4.0" }), { now: NOW });
    expect(progress).toBeNull();
  });

  it("discards progress with no version stamp (pre-v2 format)", () => {
    const progress = parseSavedProgress(saved({ instrumentVersion: undefined }), { now: NOW });
    expect(progress).toBeNull();
  });

  it("discards progress older than the resume window", () => {
    const progress = parseSavedProgress(
      saved({ timestamp: NOW - RESUME_MAX_AGE_MS - 1 }),
      { now: NOW }
    );
    expect(progress).toBeNull();
  });

  it("discards empty, missing and unreadable payloads", () => {
    expect(parseSavedProgress(null, { now: NOW })).toBeNull();
    expect(parseSavedProgress("{not json", { now: NOW })).toBeNull();
    expect(parseSavedProgress(saved({ answers: {} }), { now: NOW })).toBeNull();
    expect(parseSavedProgress(saved({ answers: "protestant" }), { now: NOW })).toBeNull();
  });

  it("falls back to the first question when the index is unusable", () => {
    const progress = parseSavedProgress(saved({ currentIndex: -4 }), { now: NOW });
    expect(progress?.currentIndex).toBe(0);
  });
});

describe("sanitizeExclusiveSelections", () => {
  it("keeps only the exclusive value when it was combined with others", () => {
    expect(
      sanitizeExclusiveSelections({
        digital_outils_existants: ["bible_app", "aucun", "podcast"],
      })
    ).toEqual({ digital_outils_existants: ["aucun"] });
  });

  it("handles the aucune / aucun_domaines spellings", () => {
    expect(
      sanitizeExclusiveSelections({
        theo_activites_sacrees: ["sacrements", "aucune"],
        futur_domaines_interet: ["etude_bible", "aucun_domaines"],
      })
    ).toEqual({
      theo_activites_sacrees: ["aucune"],
      futur_domaines_interet: ["aucun_domaines"],
    });
  });

  it("leaves valid answers untouched", () => {
    const answers = {
      digital_outils_existants: ["bible_app", "podcast"],
      theo_activites_sacrees: ["aucune"],
      profil_confession: "catholique",
      profil_age: 3,
      matrix: { row_a: 2 },
    };
    expect(sanitizeExclusiveSelections(answers)).toBe(answers);
  });

  it("is applied to resumed progress", () => {
    const progress = parseSavedProgress(
      saved({ answers: { digital_outils_existants: ["bible_app", "aucun"] } }),
      { now: NOW }
    );
    expect(progress?.answers).toEqual({ digital_outils_existants: ["aucun"] });
  });
});
