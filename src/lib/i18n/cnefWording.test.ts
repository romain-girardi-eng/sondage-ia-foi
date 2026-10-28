import { describe, expect, it } from "vitest";
import { SURVEY_QUESTIONS } from "@/data/surveySchema";
import { CLERGY_STATUSES, LAY_STATUSES } from "@/lib/utils/answers";
import {
  CNEF_WORDING_VERSION,
  cnefHiddenOptions,
  cnefOptionLabels,
  cnefQuestionText,
} from "./cnefWording";

const byId = new Map(SURVEY_QUESTIONS.map((q) => [q.id, q]));

// Items that carry a preregistered variable, the CRS-5 wording, the routing,
// the social desirability flag or a scored construct whose meaning a reworded
// label would change. The CNEF wording must leave them untouched.
// profil_genre: options kept as separated in v2.0.0 (« Autre » apart from
// « Je préfère ne pas répondre »); only its question text is reworded.
const PROTECTED_OPTIONS = ["profil_genre"];

const PROTECTED = [
  "profil_formation_theologique",
  "profil_anciennete_foi",
  "theo_orientation",
  "theo_inspiration",
  "ctrl_ia_frequence",
  "min_pred_nature",
  "psych_anxiete_remplacement",
  "crs_intellect",
  "crs_ideology",
  "crs_public_practice",
  "crs_private_practice",
  "crs_experience",
  "ctrl_mc_1",
  "ctrl_mc_2",
  "ctrl_mc_3",
  "ctrl_mc_4",
  "ctrl_mc_5",
];

describe("CNEF wording", () => {
  it("only rewords questions that exist in the schema", () => {
    for (const id of Object.keys(cnefQuestionText)) {
      expect(byId.has(id), id).toBe(true);
    }
  });

  it("only relabels existing option values, never adds one", () => {
    for (const [id, labels] of Object.entries(cnefOptionLabels)) {
      const values = byId.get(id)?.options?.map((o) => o.value) ?? [];
      for (const value of Object.keys(labels)) {
        expect(values, `${id}.${value}`).toContain(value);
      }
    }
  });

  it("only hides existing option values and keeps at least two", () => {
    for (const [id, hidden] of Object.entries(cnefHiddenOptions)) {
      const values = byId.get(id)?.options?.map((o) => o.value) ?? [];
      for (const value of hidden) expect(values, `${id}.${value}`).toContain(value);
      expect(values.length - hidden.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps both sides of the clergy / lay routing on the status question", () => {
    const shown = (byId.get("profil_statut")?.options ?? [])
      .map((o) => o.value)
      .filter((v) => !(cnefHiddenOptions.profil_statut ?? []).includes(v));
    expect(shown.some((v) => CLERGY_STATUSES.includes(v))).toBe(true);
    expect(shown.some((v) => LAY_STATUSES.includes(v))).toBe(true);
    for (const v of shown) expect(v in (cnefOptionLabels.profil_statut ?? {}), v).toBe(true);
  });

  it("leaves protected items untouched", () => {
    const touched = new Set([
      ...Object.keys(cnefQuestionText),
      ...Object.keys(cnefOptionLabels),
      ...Object.keys(cnefHiddenOptions),
    ]);
    for (const id of PROTECTED) expect(touched.has(id), id).toBe(false);
    for (const id of PROTECTED_OPTIONS) expect(id in cnefOptionLabels, id).toBe(false);
  });

  it("has a version short enough for the metadata schema", () => {
    expect(CNEF_WORDING_VERSION.length).toBeLessThanOrEqual(20);
  });
});
