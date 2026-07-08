/**
 * Schema Invariant Tests
 *
 * These tests protect the integrity of the academic survey instrument:
 * duplicate or missing question IDs, malformed options/scales, broken
 * conditional-display logic, and i18n gaps would silently corrupt data
 * collection or the respondent experience.
 */

import { describe, it, expect } from 'vitest';
import { SURVEY_QUESTIONS, type Answers, type Question } from './surveySchema';
import { questionTranslations } from '@/lib/i18n/questions';

// ==========================================
// HELPERS
// ==========================================

/**
 * Replicates the visible-questions computation used by SurveyContainer
 * (src/components/survey/SurveyContainer.tsx): a question is visible when
 * it has no condition, or its condition evaluates truthy against answers.
 */
function computeVisibleQuestions(answers: Answers): Question[] {
  return SURVEY_QUESTIONS.filter((q) => !q.condition || q.condition(answers));
}

/** All option values (plus `undefined` for "unanswered") for a choice question. */
function possibleValuesFor(id: string): Array<string | undefined> {
  const question = SURVEY_QUESTIONS.find((q) => q.id === id);
  const values = question?.options?.map((o) => o.value) ?? [];
  return [undefined, ...values];
}

function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((partial) => curr.map((value) => [...partial, value])),
    [[]]
  );
}

// ==========================================
// QUESTION IDS
// ==========================================

describe('Question IDs', () => {
  it('are all non-empty strings', () => {
    SURVEY_QUESTIONS.forEach((q) => {
      expect(typeof q.id).toBe('string');
      expect(q.id.trim().length).toBeGreaterThan(0);
    });
  });

  it('are all unique', () => {
    const ids = SURVEY_QUESTIONS.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("includes 'profil_confession_evangelique' (CNEF deep-link target in SurveyContainer)", () => {
    // SurveyContainer.tsx locates this exact id to lock the CNEF co-branded
    // deep-link flow onto the evangelical sub-question. If this id ever
    // changes or is removed, the CNEF deep-link silently breaks.
    const ids = SURVEY_QUESTIONS.map((q) => q.id);
    expect(ids).toContain('profil_confession_evangelique');
  });
});

// ==========================================
// CHOICE / MULTIPLE QUESTIONS
// ==========================================

describe('Choice and multiple questions', () => {
  const choiceQuestions = SURVEY_QUESTIONS.filter(
    (q) => q.type === 'choice' || q.type === 'multiple'
  );

  it('exist in the schema', () => {
    expect(choiceQuestions.length).toBeGreaterThan(0);
  });

  it('each have a non-empty options array', () => {
    choiceQuestions.forEach((q) => {
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options!.length).toBeGreaterThan(0);
    });
  });

  it('each option has a non-empty value and label', () => {
    choiceQuestions.forEach((q) => {
      q.options!.forEach((opt) => {
        expect(typeof opt.value).toBe('string');
        expect(opt.value.trim().length).toBeGreaterThan(0);
        expect(typeof opt.label).toBe('string');
        expect(opt.label.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('have unique option values within each question', () => {
    choiceQuestions.forEach((q) => {
      const values = q.options!.map((opt) => opt.value);
      const unique = new Set(values);
      expect(unique.size, `duplicate option values in '${q.id}'`).toBe(values.length);
    });
  });
});

// ==========================================
// SCALE QUESTIONS
// ==========================================

describe('Scale questions', () => {
  const scaleQuestions = SURVEY_QUESTIONS.filter((q) => q.type === 'scale');

  it('exist in the schema', () => {
    expect(scaleQuestions.length).toBeGreaterThan(0);
  });

  it('each define both minLabelKey and maxLabelKey', () => {
    scaleQuestions.forEach((q) => {
      expect(typeof q.minLabelKey, `'${q.id}' missing minLabelKey`).toBe('string');
      expect(q.minLabelKey!.length).toBeGreaterThan(0);
      expect(typeof q.maxLabelKey, `'${q.id}' missing maxLabelKey`).toBe('string');
      expect(q.maxLabelKey!.length).toBeGreaterThan(0);
    });
  });

  it('resolve to distinct, non-empty labels in both languages', () => {
    // ScaleQuestion renders a fixed 1-5 scale; min/max labels must be
    // meaningful and distinct in both FR and EN so the two ends are not
    // ambiguous to respondents.
    scaleQuestions.forEach((q) => {
      (['fr', 'en'] as const).forEach((lang) => {
        const scales = questionTranslations[lang].scales as Record<string, string>;
        const minLabel = scales[q.minLabelKey!];
        const maxLabel = scales[q.maxLabelKey!];
        expect(minLabel, `'${q.id}' missing ${lang} scale label for '${q.minLabelKey}'`).toBeTruthy();
        expect(maxLabel, `'${q.id}' missing ${lang} scale label for '${q.maxLabelKey}'`).toBeTruthy();
        expect(minLabel).not.toBe(maxLabel);
      });
    });
  });
});

// ==========================================
// MATRIX QUESTIONS
// ==========================================

describe('Matrix questions', () => {
  const matrixQuestions = SURVEY_QUESTIONS.filter((q) => q.type === 'matrix');

  it('exist in the schema', () => {
    expect(matrixQuestions.length).toBeGreaterThan(0);
  });

  it('each have non-empty, unique rows', () => {
    matrixQuestions.forEach((q) => {
      expect(Array.isArray(q.rows)).toBe(true);
      expect(q.rows!.length).toBeGreaterThan(0);
      const values = q.rows!.map((r) => r.value);
      expect(new Set(values).size).toBe(values.length);
      q.rows!.forEach((r) => {
        expect(r.value.trim().length).toBeGreaterThan(0);
        expect(r.label.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('each have coherent, ordered numeric columns (min < max)', () => {
    matrixQuestions.forEach((q) => {
      expect(Array.isArray(q.columns)).toBe(true);
      const values = q.columns!.map((c) => c.value);
      expect(values.length).toBeGreaterThan(1);

      const unique = new Set(values);
      expect(unique.size, `duplicate column values in '${q.id}'`).toBe(values.length);

      const sorted = [...values].sort((a, b) => a - b);
      expect(sorted[0]).toBeLessThan(sorted[sorted.length - 1]);

      q.columns!.forEach((c) => {
        expect(c.label.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

// ==========================================
// CONDITIONAL LOGIC
// ==========================================

describe('Conditional display logic', () => {
  const conditionedQuestions = SURVEY_QUESTIONS.filter((q) => q.condition);

  it('has at least one conditioned question to exercise', () => {
    expect(conditionedQuestions.length).toBeGreaterThan(0);
  });

  it('each condition evaluates without throwing on empty answers', () => {
    conditionedQuestions.forEach((q) => {
      expect(() => q.condition!({})).not.toThrow();
    });
  });

  it('each condition returns a boolean for every combination of gating answers', () => {
    // These are the fields referenced (directly or via isClergy/isLayperson/
    // clergyUsesAI) by every `condition` closure in the schema. We exercise
    // the full cartesian product of their possible values (including
    // "unanswered") so every branch of every condition is hit.
    const gatingFields = [
      'profil_confession',
      'profil_confession_protestante',
      'profil_statut',
      'min_pred_usage',
      'ctrl_ia_frequence',
    ];

    const valueSets = gatingFields.map(possibleValuesFor);
    const combos = cartesian(valueSets);

    combos.forEach((combo) => {
      const answers: Answers = {};
      gatingFields.forEach((field, i) => {
        const value = combo[i];
        if (value !== undefined) answers[field] = value;
      });

      conditionedQuestions.forEach((q) => {
        let result: boolean | undefined;
        expect(() => {
          result = q.condition!(answers);
        }).not.toThrow();
        expect(typeof result).toBe('boolean');
      });
    });
  });

  it('visible-questions computation never throws and always yields a subsequence of schema order', () => {
    const gatingFields = [
      'profil_confession',
      'profil_confession_protestante',
      'profil_statut',
      'min_pred_usage',
      'ctrl_ia_frequence',
    ];
    const valueSets = gatingFields.map(possibleValuesFor);
    const combos = cartesian(valueSets);

    const idToIndex = new Map(SURVEY_QUESTIONS.map((q, i) => [q.id, i]));

    combos.forEach((combo) => {
      const answers: Answers = {};
      gatingFields.forEach((field, i) => {
        const value = combo[i];
        if (value !== undefined) answers[field] = value;
      });

      let visible: Question[] = [];
      expect(() => {
        visible = computeVisibleQuestions(answers);
      }).not.toThrow();

      expect(visible.length).toBeLessThanOrEqual(SURVEY_QUESTIONS.length);

      // Subsequence check: original-schema indices of visible questions
      // must be strictly increasing (filter preserves relative order).
      const indices = visible.map((q) => idToIndex.get(q.id)!);
      for (let i = 1; i < indices.length; i++) {
        expect(indices[i]).toBeGreaterThan(indices[i - 1]);
      }

      // Every visible id must be unique (no duplicate rendering).
      expect(new Set(visible.map((q) => q.id)).size).toBe(visible.length);
    });
  });

  it('shows the evangelical sub-question only when protestant + evangelique are selected', () => {
    const empty = computeVisibleQuestions({});
    expect(empty.some((q) => q.id === 'profil_confession_evangelique')).toBe(false);

    const protestantOnly = computeVisibleQuestions({ profil_confession: 'protestant' });
    expect(protestantOnly.some((q) => q.id === 'profil_confession_evangelique')).toBe(false);

    const fullPath = computeVisibleQuestions({
      profil_confession: 'protestant',
      profil_confession_protestante: 'evangelique',
    });
    expect(fullPath.some((q) => q.id === 'profil_confession_evangelique')).toBe(true);
  });

  it('gates clergy-only ministry questions on profil_statut', () => {
    const laic = computeVisibleQuestions({ profil_statut: 'laic_pratiquant' });
    expect(laic.some((q) => q.id === 'min_pred_usage')).toBe(false);

    const clerge = computeVisibleQuestions({ profil_statut: 'clerge' });
    expect(clerge.some((q) => q.id === 'min_pred_usage')).toBe(true);
  });

  it('gates layperson-only spirituality questions on profil_statut', () => {
    const clerge = computeVisibleQuestions({ profil_statut: 'clerge' });
    expect(clerge.some((q) => q.id === 'laic_conseil_spirituel')).toBe(false);

    const laic = computeVisibleQuestions({ profil_statut: 'laic_pratiquant' });
    expect(laic.some((q) => q.id === 'laic_conseil_spirituel')).toBe(true);
  });
});

// ==========================================
// I18N COMPLETENESS
// ==========================================

describe('i18n question text completeness', () => {
  const schemaIds = SURVEY_QUESTIONS.map((q) => q.id);
  const frIds = Object.keys(questionTranslations.fr.questions);
  const enIds = Object.keys(questionTranslations.en.questions);

  // Regression guard: missing keys used to make EN respondents silently
  // see the hardcoded French schema text (tQuestion falls back to the id,
  // QuestionCard then falls back to question.text).
  it('every schema question id has a French translation', () => {
    const missing = schemaIds.filter((id) => !frIds.includes(id));
    expect(missing, `question ids missing FR text: ${missing.join(', ')}`).toEqual([]);
  });

  it('every schema question id has an English translation', () => {
    const missing = schemaIds.filter((id) => !enIds.includes(id));
    expect(missing, `question ids missing EN text: ${missing.join(', ')}`).toEqual([]);
  });

  it('every FR translation key corresponds to a real schema question id', () => {
    const orphans = frIds.filter((id) => !schemaIds.includes(id));
    expect(orphans, `FR translations with no matching schema question: ${orphans.join(', ')}`).toEqual([]);
  });

  it('every EN translation key corresponds to a real schema question id', () => {
    const orphans = enIds.filter((id) => !schemaIds.includes(id));
    expect(orphans, `EN translations with no matching schema question: ${orphans.join(', ')}`).toEqual([]);
  });
});
