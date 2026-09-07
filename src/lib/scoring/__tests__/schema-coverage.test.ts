/**
 * Coverage guard: every option value of every question consumed by a dimension
 * must either be scored or be a documented missing value.
 *
 * The schema is imported read-only. Questions NOT consumed by any dimension are
 * ignored on purpose: the instrument evolves in parallel and unknown options
 * there are not a scoring bug.
 */

import { describe, it, expect } from 'vitest';
import { SURVEY_QUESTIONS } from '@/data/surveySchema';
import { DIMENSION_KEYS, DIMENSION_ITEMS, scoreItem } from '../dimensions';
import {
  ITEM_SCORE_MAPS,
  SCALE_ITEM_SPECS,
  COUNT_ITEM_SPECS,
  MATRIX_TASK_WEIGHTS,
  UNSCORED_OPTIONS,
  MISSING_VALUES,
  isMissing,
} from '../score-maps';
import { MC_ITEM_IDS } from '../bias';

const SCORED_ITEM_IDS = new Set(DIMENSION_KEYS.flatMap((key) => DIMENSION_ITEMS[key]));

const scoredQuestions = SURVEY_QUESTIONS.filter((question) => SCORED_ITEM_IDS.has(question.id));

describe('schema coverage', () => {
  it('finds every scored item in the schema, or documents it as instrument v2', () => {
    const schemaIds = new Set(SURVEY_QUESTIONS.map((question) => question.id));
    const missingFromSchema = [...SCORED_ITEM_IDS].filter((id) => !schemaIds.has(id));
    // Items may be renamed/added by the questionnaire in flight; the scorer must
    // never silently reference an item the instrument has dropped for good.
    expect(missingFromSchema).toEqual([]);
  });

  it('scores or documents every option of every consumed choice question', () => {
    const unknown: string[] = [];

    for (const question of scoredQuestions) {
      if (question.type !== 'choice' || !question.options) continue;
      const map = ITEM_SCORE_MAPS[question.id] ?? {};
      const unscored = UNSCORED_OPTIONS[question.id] ?? [];

      for (const option of question.options) {
        if (MISSING_VALUES.includes(option.value)) continue;
        if (unscored.includes(option.value)) continue;
        if (typeof map[option.value] === 'number') continue;
        unknown.push(`${question.id}=${option.value}`);
      }
    }

    expect(unknown).toEqual([]);
  });

  it('keeps every scored option inside the 1-5 metric', () => {
    for (const [itemId, map] of Object.entries(ITEM_SCORE_MAPS)) {
      for (const [value, score] of Object.entries(map)) {
        expect(score, `${itemId}=${value}`).toBeGreaterThanOrEqual(1);
        expect(score, `${itemId}=${value}`).toBeLessThanOrEqual(5);
      }
    }
  });

  it('registers a scorer for every consumed non-choice question', () => {
    for (const question of scoredQuestions) {
      if (question.type === 'choice') continue;
      const registered =
        question.id in SCALE_ITEM_SPECS ||
        question.id in COUNT_ITEM_SPECS ||
        question.id in MATRIX_TASK_WEIGHTS;
      expect(registered, `${question.id} has no scorer`).toBe(true);
    }
  });

  it('knows the exclusive "none" option of every consumed multi-select', () => {
    for (const question of scoredQuestions) {
      if (question.type !== 'multiple' || !question.options) continue;
      const spec = COUNT_ITEM_SPECS[question.id];
      expect(spec, `${question.id} is not a count item`).toBeDefined();
      const exclusiveOptions = question.options
        .map((option) => option.value)
        .filter((value) => value.startsWith('aucun'));
      for (const value of exclusiveOptions) {
        expect(scoreItem(question.id, { [question.id]: [value] }), `${question.id}=${value}`).toBe(
          spec.floor,
        );
      }
    }
  });

  it('returns null for every documented missing code on every consumed item', () => {
    for (const itemId of SCORED_ITEM_IDS) {
      for (const missing of MISSING_VALUES) {
        expect(scoreItem(itemId, { [itemId]: missing }), `${itemId}=${missing}`).toBeNull();
        expect(isMissing(missing)).toBe(true);
      }
    }
  });

  it('never scores a Marlowe-Crowne item into a dimension', () => {
    for (const itemId of MC_ITEM_IDS) {
      expect(SCORED_ITEM_IDS.has(itemId)).toBe(false);
    }
  });
});
