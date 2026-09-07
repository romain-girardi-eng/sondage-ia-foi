/**
 * Schema Invariant Tests
 *
 * These tests protect the integrity of the academic survey instrument:
 * duplicate or missing question IDs, malformed options/scales, broken
 * conditional-display logic, and i18n gaps would silently corrupt data
 * collection or the respondent experience.
 */

import { describe, it, expect } from 'vitest';
import {
  SURVEY_QUESTIONS,
  INSTRUMENT_VERSION,
  CONSENT_VERSION,
  getVisibleQuestions,
  isScreenedOut,
  isExclusiveOptionValue,
  type Answers,
  type Question,
} from './surveySchema';
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
  return getVisibleQuestions(answers);
}

function optionValues(id: string): string[] {
  const question = SURVEY_QUESTIONS.find((q) => q.id === id);
  expect(question, `question '${id}' is missing from the schema`).toBeDefined();
  return question!.options!.map((o) => o.value);
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

// ==========================================
// INSTRUMENT v2.0.0
// ==========================================

describe('Instrument v2.0.0', () => {
  it('stamps the expected instrument and consent versions', () => {
    expect(INSTRUMENT_VERSION).toBe('2.0.0');
    expect(CONSENT_VERSION).toBe('2.0');
  });

  it('has 58 questions', () => {
    expect(SURVEY_QUESTIONS.length).toBe(58);
  });

  it('adds profil_formation_theologique right after profil_education', () => {
    const ids = SURVEY_QUESTIONS.map((q) => q.id);
    expect(ids.indexOf('profil_formation_theologique')).toBe(ids.indexOf('profil_education') + 1);
    expect(optionValues('profil_formation_theologique')).toEqual([
      'aucune',
      'cours_ponctuels',
      'diplome_theologie',
      'formation_pastorale',
    ]);
  });

  it('adds the non-ordained leader status right after ordained clergy', () => {
    const values = optionValues('profil_statut');
    expect(values.indexOf('responsable_non_ordonne')).toBe(values.indexOf('clerge') + 1);
  });

  it('separates "autre" from "je préfère ne pas répondre" for gender', () => {
    expect(optionValues('profil_genre')).toEqual([
      'homme',
      'femme',
      'autre',
      'prefere_ne_pas_repondre',
    ]);
  });

  it('uses the byzantin / oriental Orthodox split', () => {
    expect(optionValues('profil_confession_orthodoxe')).toEqual(['byzantin', 'oriental']);
  });

  it('drops the "(Fin du sondage)" hint now that the screen-out is real', () => {
    const option = SURVEY_QUESTIONS
      .find((q) => q.id === 'profil_confession')!
      .options!.find((o) => o.value === 'sans_religion')!;
    expect(option.label).not.toMatch(/fin du sondage/i);
  });

  it('aligns the CRS-5 practice items on Huber & Huber (2012)', () => {
    expect(optionValues('crs_private_practice')).toEqual([
      'pluri_quotidien',
      'quotidien',
      'hebdomadaire',
      'mensuel',
      'rarement',
      'jamais',
    ]);
    expect(optionValues('crs_public_practice')).toEqual([
      'hebdomadaire_plus',
      'mensuel',
      'quelques_fois_an',
      'rarement',
      'jamais',
    ]);
  });

  it('keeps the liturgical examples in the public practice item', () => {
    const question = SURVEY_QUESTIONS.find((q) => q.id === 'crs_public_practice')!;
    expect(question.text).toContain('messe, culte, liturgie');
  });

  it('asks the CRS experience item about divine intervention', () => {
    const question = SURVEY_QUESTIONS.find((q) => q.id === 'crs_experience')!;
    expect(question.text).toContain('intervient dans votre vie');
  });

  it('balances the pastoral email item', () => {
    expect(optionValues('min_care_email')).toEqual(['non', 'oui_relu', 'oui_tel_quel']);
  });

  it('drops the parenthetical from the "jamais" preaching option', () => {
    const option = SURVEY_QUESTIONS
      .find((q) => q.id === 'min_pred_usage')!
      .options!.find((o) => o.value === 'jamais')!;
    expect(option.label).toBe('Jamais');
  });

  it('drops the shouted JAMAIS from the sacred activities item', () => {
    const question = SURVEY_QUESTIONS.find((q) => q.id === 'theo_activites_sacrees')!;
    expect(question.text).not.toContain('JAMAIS');
    expect(question.text).toContain('jamais');
  });

  it('keeps theo_inspiration neutral (no persuasive option)', () => {
    const labels = SURVEY_QUESTIONS
      .find((q) => q.id === 'theo_inspiration')!
      .options!.map((o) => o.label)
      .join(' ');
    expect(labels).not.toMatch(/Dieu peut agir/i);
  });

  it('splits "varied opinions" from "I don\'t know" for peer perception', () => {
    const values = optionValues('communaute_perception_pairs');
    expect(values).toContain('opinions_variees');
    expect(values).toContain('ne_sait_pas');
  });

  it('offers "sans réponse" last on every attitudinal theology, psychology and community item', () => {
    const attitudinal = SURVEY_QUESTIONS.filter(
      (q) =>
        q.type === 'choice' &&
        (q.id.startsWith('theo_') || q.id.startsWith('psych_') || q.id.startsWith('communaute_'))
    );
    expect(attitudinal.length).toBeGreaterThan(0);
    attitudinal.forEach((q) => {
      const values = q.options!.map((o) => o.value);
      expect(values, `'${q.id}' has no sans_reponse option`).toContain('sans_reponse');
      expect(values[values.length - 1], `'${q.id}' sans_reponse is not last`).toBe('sans_reponse');
    });
  });

  it('uses contiguous, non-overlapping ranges for profil_milieu', () => {
    const labels = SURVEY_QUESTIONS
      .find((q) => q.id === 'profil_milieu')!
      .options!.map((o) => o.label);
    expect(labels).toEqual([
      'Rural (moins de 2 000 habitants)',
      'Petite ville (2 000 à 20 000 habitants)',
      'Ville moyenne (20 000 à 100 000 habitants)',
      'Grande ville (100 000 à 500 000 habitants)',
      'Métropole (plus de 500 000 habitants)',
    ]);
  });

  it('replaces "depuis toujours" by "depuis l\'enfance"', () => {
    const option = SURVEY_QUESTIONS
      .find((q) => q.id === 'profil_anciennete_foi')!
      .options!.find((o) => o.value === 'naissance')!;
    expect(option.label).toContain("Depuis l'enfance");
  });
});

// ==========================================
// SCREEN-OUT
// ==========================================

describe('Screen-out (sans_religion)', () => {
  it('detects the screened-out respondent', () => {
    expect(isScreenedOut({ profil_confession: 'sans_religion' })).toBe(true);
    expect(isScreenedOut({ profil_confession: 'catholique' })).toBe(false);
    expect(isScreenedOut({})).toBe(false);
  });

  it('ends the questionnaire on the confession question', () => {
    const visible = getVisibleQuestions({ profil_confession: 'sans_religion' });
    expect(visible.map((q) => q.id)).toEqual(['profil_confession']);
  });

  it('keeps the full questionnaire for every other confession', () => {
    const visible = getVisibleQuestions({ profil_confession: 'catholique' });
    expect(visible.length).toBeGreaterThan(1);
  });
});

// ==========================================
// EXCLUSIVE "AUCUN" OPTIONS
// ==========================================

describe('Exclusive "aucun" options', () => {
  it('recognises only the aucun* prefix', () => {
    expect(isExclusiveOptionValue('aucun')).toBe(true);
    expect(isExclusiveOptionValue('aucune')).toBe(true);
    expect(isExclusiveOptionValue('aucun_domaines')).toBe(true);
    expect(isExclusiveOptionValue('bible_app')).toBe(false);
  });

  it('places an exclusive option last on the multiple-choice questions that have one', () => {
    const multiples = SURVEY_QUESTIONS.filter((q) => q.type === 'multiple');
    const withExclusive = multiples.filter((q) =>
      q.options!.some((o) => isExclusiveOptionValue(o.value))
    );
    expect(withExclusive.map((q) => q.id)).toEqual([
      'digital_outils_existants',
      'theo_activites_sacrees',
      'futur_domaines_interet',
    ]);
    withExclusive.forEach((q) => {
      const values = q.options!.map((o) => o.value);
      expect(values.filter(isExclusiveOptionValue).length, `'${q.id}'`).toBe(1);
      expect(isExclusiveOptionValue(values[values.length - 1]), `'${q.id}'`).toBe(true);
    });
  });
});

// ==========================================
// RESPONDENT PATHS
// ==========================================

describe('Respondent paths', () => {
  const baseLaity: Answers = {
    profil_confession: 'catholique',
    profil_statut: 'laic_pratiquant',
    ctrl_ia_frequence: 'regulier',
  };

  it('shows 48 questions to a lay respondent who uses AI', () => {
    expect(computeVisibleQuestions(baseLaity).length).toBe(48);
  });

  it('shows 49 questions to clergy who never use AI', () => {
    const visible = computeVisibleQuestions({
      ...baseLaity,
      profil_statut: 'clerge',
      min_pred_usage: 'jamais',
    });
    expect(visible.length).toBe(49);
    expect(visible.some((q) => q.id === 'min_admin_burden')).toBe(false);
  });

  it('shows 52 questions to clergy who use AI', () => {
    const visible = computeVisibleQuestions({
      ...baseLaity,
      profil_statut: 'clerge',
      min_pred_usage: 'regulier',
    });
    expect(visible.length).toBe(52);
    expect(visible.some((q) => q.id === 'min_admin_burden')).toBe(true);
    expect(visible.some((q) => q.id === 'min_pred_nature')).toBe(true);
  });

  it('routes a non-ordained leader through the ministry block', () => {
    const visible = computeVisibleQuestions({
      ...baseLaity,
      profil_statut: 'responsable_non_ordonne',
      min_pred_usage: 'regulier',
    });
    expect(visible.some((q) => q.id === 'min_pred_usage')).toBe(true);
    expect(visible.some((q) => q.id === 'laic_conseil_spirituel')).toBe(false);
  });

  it('gates min_admin_burden on actually using AI', () => {
    const noUsage = computeVisibleQuestions({ profil_statut: 'clerge' });
    expect(noUsage.some((q) => q.id === 'min_admin_burden')).toBe(false);
  });
});

// ==========================================
// I18N OPTION COMPLETENESS & FRENCH TYPOGRAPHY
// ==========================================

describe('i18n option completeness', () => {
  it('every schema option value has a French and an English label', () => {
    SURVEY_QUESTIONS.filter((q) => q.options).forEach((q) => {
      q.options!.forEach((opt) => {
        (['fr', 'en'] as const).forEach((lang) => {
          const label = questionTranslations[lang].optionLabels[q.id]?.[opt.value];
          expect(label, `missing ${lang} label for '${q.id}.${opt.value}'`).toBeTruthy();
        });
      });
    });
  });

  it('has no orphan option label (declared but not in the schema)', () => {
    const schemaValues = new Map(
      SURVEY_QUESTIONS.filter((q) => q.options).map((q) => [
        q.id,
        new Set(q.options!.map((o) => o.value)),
      ])
    );
    (['fr', 'en'] as const).forEach((lang) => {
      Object.entries(questionTranslations[lang].optionLabels).forEach(([id, labels]) => {
        const values = schemaValues.get(id);
        expect(values, `${lang} option labels for unknown question '${id}'`).toBeDefined();
        Object.keys(labels).forEach((value) => {
          expect(values!.has(value), `${lang} orphan option '${id}.${value}'`).toBe(true);
        });
      });
    });
  });

  it('uses the schema label as the canonical French text', () => {
    SURVEY_QUESTIONS.filter((q) => q.options).forEach((q) => {
      q.options!.forEach((opt) => {
        expect(opt.label).toBe(questionTranslations.fr.optionLabels[q.id][opt.value]);
      });
      expect(q.text).toBe(
        (questionTranslations.fr.questions as Record<string, string>)[q.id]
      );
    });
  });
});

describe('French typography', () => {
  // House rule: a narrow no-break space (U+202F) before ? ! ; % and a
  // no-break space (U+00A0) before : so punctuation never orphans on a
  // new line.
  const badBreak = /[ ]([?!;%:])/;

  it('never leaves a breakable space before French punctuation', () => {
    const strings: Array<[string, string]> = [];
    Object.entries(questionTranslations.fr.questions).forEach(([id, text]) =>
      strings.push([`questions.${id}`, text])
    );
    Object.entries(questionTranslations.fr.optionLabels).forEach(([id, labels]) =>
      Object.entries(labels).forEach(([value, label]) =>
        strings.push([`optionLabels.${id}.${value}`, label])
      )
    );

    const offenders = strings.filter(([, text]) => badBreak.test(text)).map(([key]) => key);
    expect(offenders, `plain space before punctuation in: ${offenders.join(', ')}`).toEqual([]);
  });
});
