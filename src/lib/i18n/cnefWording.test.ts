import { describe, expect, it } from "vitest";
import { SURVEY_QUESTIONS, getVisibleQuestions, type Answers } from "@/data/surveySchema";
import { CLERGY_STATUSES, LAY_STATUSES, isClergy, isLayperson } from "@/lib/utils/answers";
import { calculateAllDimensions } from "@/lib/scoring/dimensions";
import { calculateProfileSpectrum } from "@/lib/scoring/profiles";
import { calculateSocialDesirability } from "@/lib/scoring/bias";
import { clergyAnswers, moderateAnswers } from "@/lib/scoring/__tests__/fixtures";
import {
  CNEF_HIDDEN_QUESTIONS,
  CNEF_WORDING_VERSION,
  applyCnefAnswer,
  cnefDetailKey,
  cnefDetailedQuestions,
  cnefExtraMatrixRows,
  cnefHiddenOptions,
  cnefOptionLabels,
  cnefQuestionText,
} from "./cnefWording";

const byId = new Map(SURVEY_QUESTIONS.map((q) => [q.id, q]));
const values = (id: string) => byId.get(id)?.options?.map((o) => o.value) ?? [];

function withoutHidden(answers: Answers): Answers {
  return Object.fromEntries(Object.entries(answers).filter(([k]) => !CNEF_HIDDEN_QUESTIONS.includes(k)));
}

describe("CNEF version of the questionnaire", () => {
  it("only refers to questions and option values of the instrument", () => {
    for (const id of [
      ...Object.keys(cnefQuestionText),
      ...Object.keys(cnefOptionLabels),
      ...Object.keys(cnefHiddenOptions),
      ...Object.keys(cnefExtraMatrixRows),
      ...Object.keys(cnefDetailedQuestions),
      ...CNEF_HIDDEN_QUESTIONS,
    ]) {
      expect(byId.has(id), id).toBe(true);
    }
    for (const [id, labels] of Object.entries(cnefOptionLabels)) {
      for (const value of Object.keys(labels)) expect(values(id), `${id}.${value}`).toContain(value);
    }
    for (const [id, hidden] of Object.entries(cnefHiddenOptions)) {
      for (const value of hidden) expect(values(id), `${id}.${value}`).toContain(value);
    }
  });

  it("does not ask the hidden questions on /cnef, and still asks them elsewhere", () => {
    const answers: Answers = { profil_confession: "protestant", profil_confession_protestante: "evangelique" };
    const cnef = getVisibleQuestions(answers, "cnef").map((q) => q.id);
    const general = getVisibleQuestions(answers).map((q) => q.id);
    for (const id of CNEF_HIDDEN_QUESTIONS) {
      expect(cnef).not.toContain(id);
      expect(general).toContain(id);
    }
  });

  it("derives a canonical status that keeps the clergy / lay routing", () => {
    const status = cnefDetailedQuestions.profil_statut;
    for (const option of status.options) {
      const canonical = status.derive([option.value]);
      expect(canonical).not.toBeNull();
      expect([...CLERGY_STATUSES, ...LAY_STATUSES]).toContain(canonical);
    }
    const pastorAndMember = applyCnefAnswer({}, "profil_statut", ["membre_association", "pasteur_benevole"]);
    expect(pastorAndMember.profil_statut).toBe("clerge");
    expect(pastorAndMember[cnefDetailKey("profil_statut")]).toEqual(["membre_association", "pasteur_benevole"]);
    expect(isClergy(pastorAndMember)).toBe(true);
    expect(isLayperson(applyCnefAnswer({}, "profil_statut", ["frequente_occasionnel"]))).toBe(true);
    expect(applyCnefAnswer({ profil_statut: "clerge" }, "profil_statut", [])).not.toHaveProperty("profil_statut");
  });

  it("keeps the five-level frequency scale of H8", () => {
    const frequency = cnefDetailedQuestions.ctrl_ia_frequence;
    for (const option of frequency.options) {
      expect(values("ctrl_ia_frequence")).toContain(frequency.derive(option.value));
    }
    expect(applyCnefAnswer({}, "ctrl_ia_frequence", "plusieurs_par_jour")).toMatchObject({
      ctrl_ia_frequence: "quotidien",
      [cnefDetailKey("ctrl_ia_frequence")]: "plusieurs_par_jour",
    });
  });

  it("scores a CNEF response without the hidden questions", () => {
    for (const fixture of [moderateAnswers, clergyAnswers]) {
      const answers = withoutHidden({
        ...fixture,
        min_pred_nature: { ...(typeof fixture.min_pred_nature === "object" ? fixture.min_pred_nature : {}), relecture: 3 },
      });
      expect(() => calculateAllDimensions(answers)).not.toThrow();
      expect(() => calculateProfileSpectrum(answers)).not.toThrow();
      expect(() => calculateSocialDesirability(answers)).not.toThrow();
    }
  });

  it("does not score the added matrix row", () => {
    const base = withoutHidden(clergyAnswers);
    const withRow = { ...base, min_pred_nature: { ...(base.min_pred_nature as Record<string, number>), relecture: 3 } };
    expect(calculateAllDimensions(withRow)).toEqual(calculateAllDimensions(base));
  });

  it("has a version short enough for the metadata schema", () => {
    expect(CNEF_WORDING_VERSION.length).toBeLessThanOrEqual(20);
  });
});
