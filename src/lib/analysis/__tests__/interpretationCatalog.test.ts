import { describe, it, expect } from 'vitest';
import { SURVEY_QUESTIONS } from '@/data/surveySchema';
import {
  DEFAULT_COLLECTED_COVARIATES,
  HYPOTHESES,
  INTERPRETATION_CATALOG,
  PLANNED_V2_VARIABLES,
  catalogPairKeys,
  findCatalogEntry,
  pairKey,
} from '../interpretationCatalog';
import { DIMENSION_KEYS, type Mechanism } from '../types';

const MECHANISMS = new Set<Mechanism>([
  'x_causes_y',
  'y_causes_x',
  'confounder',
  'selection',
  'method_artifact',
  'construct_overlap',
]);

const SCHEMA_IDS = new Set(SURVEY_QUESTIONS.map((question) => question.id));
const KNOWN_VARIABLES = new Set([
  ...SCHEMA_IDS,
  ...PLANNED_V2_VARIABLES,
  ...DIMENSION_KEYS,
  'sacredBoundaryCore',
  'aiOpennessCore',
]);

describe('catalog integrity', () => {
  it('has no duplicate pair', () => {
    const keys = catalogPairKeys();
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('covers the 21 unordered pairs of the 7 dimensions', () => {
    const keys = new Set(catalogPairKeys());
    const expected: string[] = [];
    for (let i = 0; i < DIMENSION_KEYS.length; i += 1) {
      for (let j = i + 1; j < DIMENSION_KEYS.length; j += 1) {
        expected.push(pairKey(DIMENSION_KEYS[i], DIMENSION_KEYS[j]));
      }
    }
    expect(expected).toHaveLength(21);
    for (const key of expected) expect(keys.has(key)).toBe(true);
  });

  it('offers between 2 and 4 competing interpretations per pair', () => {
    for (const entry of INTERPRETATION_CATALOG) {
      expect(entry.interpretations.length).toBeGreaterThanOrEqual(2);
      expect(entry.interpretations.length).toBeLessThanOrEqual(4);
    }
  });

  it('proposes distinct mechanisms within a pair', () => {
    for (const entry of INTERPRETATION_CATALOG) {
      const labels = entry.interpretations.map((i) => i.label);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });

  it('uses only valid mechanisms', () => {
    for (const entry of INTERPRETATION_CATALOG) {
      for (const interpretation of entry.interpretations) {
        expect(MECHANISMS.has(interpretation.mechanism)).toBe(true);
      }
    }
  });

  it('gives every interpretation a non empty label and rationale', () => {
    for (const entry of INTERPRETATION_CATALOG) {
      for (const interpretation of entry.interpretations) {
        expect(interpretation.label.trim().length).toBeGreaterThan(10);
        expect(interpretation.rationale.trim().length).toBeGreaterThan(40);
      }
    }
  });

  it('only cites confounders that the survey actually collects', () => {
    const collected = new Set(DEFAULT_COLLECTED_COVARIATES);
    for (const entry of INTERPRETATION_CATALOG) {
      for (const interpretation of entry.interpretations) {
        for (const confounder of interpretation.confounders) {
          expect(KNOWN_VARIABLES.has(confounder)).toBe(true);
          expect(collected.has(confounder)).toBe(true);
        }
      }
    }
  });

  it('only lists collected covariates that exist as variables', () => {
    for (const covariate of DEFAULT_COLLECTED_COVARIATES) {
      expect(KNOWN_VARIABLES.has(covariate)).toBe(true);
    }
  });

  it('references variables that exist for every catalogued pair', () => {
    for (const entry of INTERPRETATION_CATALOG) {
      expect(KNOWN_VARIABLES.has(entry.pair[0])).toBe(true);
      expect(KNOWN_VARIABLES.has(entry.pair[1])).toBe(true);
    }
  });

  it('never asserts a proof and never uses an em dash', () => {
    for (const entry of INTERPRETATION_CATALOG) {
      for (const interpretation of entry.interpretations) {
        const text = `${interpretation.label} ${interpretation.rationale} ${interpretation.testable ?? ''}`;
        expect(text.toLowerCase()).not.toContain('prouve');
        expect(text).not.toContain('—');
      }
    }
  });

  it('respects French spacing before double punctuation', () => {
    const badSpacing = /[ ][?!;%:]/;
    for (const entry of INTERPRETATION_CATALOG) {
      for (const interpretation of entry.interpretations) {
        const text = `${interpretation.label} ${interpretation.rationale} ${interpretation.testable ?? ''}`;
        expect(badSpacing.test(text)).toBe(false);
      }
    }
  });
});

describe('hypotheses H1 to H8', () => {
  it('declares exactly eight hypotheses', () => {
    expect(Object.keys(HYPOTHESES)).toHaveLength(8);
  });

  it('attaches every hypothesis to a catalogued pair', () => {
    for (const hypothesis of Object.values(HYPOTHESES)) {
      const entry = findCatalogEntry(hypothesis.variables[0], hypothesis.variables[1]);
      expect(entry).toBeDefined();
      expect(entry?.hypothesis).toBe(hypothesis.id);
    }
  });

  it('states each hypothesis without claiming a result', () => {
    for (const hypothesis of Object.values(HYPOTHESES)) {
      expect(hypothesis.statement.length).toBeGreaterThan(30);
      expect(hypothesis.statement.toLowerCase()).not.toContain('prouve');
    }
  });
});

describe('pairKey', () => {
  it('is order independent', () => {
    expect(pairKey('a', 'b')).toBe(pairKey('b', 'a'));
  });

  it('finds an entry whatever the order given', () => {
    const direct = findCatalogEntry('religiosity', 'sacredBoundary');
    const reversed = findCatalogEntry('sacredBoundary', 'religiosity');
    expect(direct).toBeDefined();
    expect(reversed).toBe(direct);
  });
});
