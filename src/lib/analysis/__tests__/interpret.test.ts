import { describe, it, expect } from 'vitest';
import {
  GENERIC_CONFOUNDER_CANDIDATES,
  PREFERENCE_MARGIN,
  describeFact,
  genericInterpretations,
  interpretCorrelation,
  interpretMatrix,
  withSharedItems,
} from '../interpret';
import { GENERIC_INTERPRETIVE_CAP } from '../certainty';
import { DEFAULT_COLLECTED_COVARIATES } from '../interpretationCatalog';
import type { CorrelationFact } from '../types';

function fact(overrides: Partial<CorrelationFact> = {}): CorrelationFact {
  return {
    x: 'religiosity',
    y: 'sacredBoundary',
    r: 0.42,
    n: 140,
    ci95: [0.28, 0.55],
    pRaw: 0.00002,
    pAdjusted: 0.0004,
    sharedItems: [],
    ...overrides,
  };
}

describe('interpretCorrelation', () => {
  it('uses the pre-specified catalogue when the pair is known', () => {
    const result = interpretCorrelation(fact());
    expect(result.interpretations.length).toBeGreaterThanOrEqual(2);
    expect(result.interpretations.some((i) => i.mechanism === 'confounder')).toBe(true);
  });

  it('always offers at least one competing explanation', () => {
    const result = interpretCorrelation(fact());
    const mechanisms = new Set(result.interpretations.map((i) => i.mechanism));
    expect(mechanisms.size).toBeGreaterThanOrEqual(2);
  });

  it('sorts interpretations by decreasing overall certainty', () => {
    const result = interpretCorrelation(fact());
    const overalls = result.interpretations.map((i) => i.certainty.overall);
    const sorted = [...overalls].sort((a, b) => b - a);
    expect(overalls).toEqual(sorted);
  });

  it('leaves preferred null when the top two are within the margin', () => {
    const result = interpretCorrelation(fact());
    const [first, second] = result.interpretations;
    if (second !== undefined && first.certainty.overall - second.certainty.overall < PREFERENCE_MARGIN) {
      expect(result.preferred).toBeNull();
    } else {
      expect(result.preferred).not.toBeNull();
    }
  });

  it('prefers the method artifact when the two measures share an item', () => {
    const result = interpretCorrelation(
      fact({
        x: 'aiOpenness',
        y: 'futureOrientation',
        sharedItems: ['ctrl_ia_frequence'],
        r: 0.65,
        n: 250,
        ci95: [0.58, 0.71],
      }),
    );
    expect(result.interpretations[0].mechanism).toBe('method_artifact');
    // L'écart avec le recouvrement de construit reste sous la marge, ambiguïté signalée.
    expect(result.preferred).toBeNull();
  });

  it('ranks measurement explanations above causal ones when items are shared', () => {
    const result = interpretCorrelation(
      fact({ sharedItems: ['crs_public_practice'], r: 0.65, n: 250, ci95: [0.58, 0.71] }),
    );
    expect(['method_artifact', 'construct_overlap']).toContain(
      result.interpretations[0].mechanism,
    );
    const causal = result.interpretations.find((i) => i.mechanism === 'x_causes_y');
    expect(result.interpretations[0].certainty.overall).toBeGreaterThan(
      causal?.certainty.overall ?? 1,
    );
  });

  it('falls back to generic mechanisms for an unknown pair, capped at 0.4', () => {
    const result = interpretCorrelation(fact({ x: 'profil_genre', y: 'futur_formation_souhait' }));
    expect(result.interpretations.length).toBeGreaterThan(0);
    for (const interpretation of result.interpretations) {
      expect(interpretation.certainty.interpretive).toBeLessThanOrEqual(GENERIC_INTERPRETIVE_CAP);
    }
  });

  it('derives shared items from the mapping given by the caller', () => {
    const result = interpretCorrelation(fact(), {
      dimensionItems: {
        religiosity: ['crs_intellect', 'crs_public_practice'],
        sacredBoundary: ['crs_public_practice', 'theo_inspiration'],
      },
    });
    expect(result.fact.sharedItems).toEqual(['crs_public_practice']);
  });

  it('produces grade D and no preference when n is below the minimum', () => {
    const result = interpretCorrelation(fact({ n: 12 }));
    for (const interpretation of result.interpretations) {
      expect(interpretation.certainty.grade).toBe('D');
      expect(interpretation.certainty.overall).toBe(0);
    }
    expect(result.preferred).toBeNull();
  });

  it('penalises an interpretation whose confounders were not collected', () => {
    const result = interpretCorrelation(fact(), { collectedCovariates: [] });
    const confounded = result.interpretations.find((i) => i.confounders.length > 0);
    expect(confounded?.certainty.caveats.some((c) => c.includes('non collectées'))).toBe(true);
  });
});

describe('genericInterpretations', () => {
  it('proposes one confounder per collected generic covariate plus selection', () => {
    const generated = genericInterpretations(fact({ x: 'profil_genre', y: 'profil_pays' }), {
      collectedCovariates: DEFAULT_COLLECTED_COVARIATES,
    });
    const confounders = generated.filter((i) => i.mechanism === 'confounder');
    expect(confounders).toHaveLength(GENERIC_CONFOUNDER_CANDIDATES.length);
    expect(generated.some((i) => i.mechanism === 'selection')).toBe(true);
    expect(generated.some((i) => i.mechanism === 'method_artifact')).toBe(false);
  });

  it('adds a method artifact when items are shared', () => {
    const generated = genericInterpretations(fact({ sharedItems: ['theo_inspiration'] }), {
      collectedCovariates: DEFAULT_COLLECTED_COVARIATES,
    });
    expect(generated.some((i) => i.mechanism === 'method_artifact')).toBe(true);
  });

  it('never proposes one of the correlated variables as its own confounder', () => {
    const generated = genericInterpretations(fact({ x: 'profil_age', y: 'futur_formation_souhait' }), {
      collectedCovariates: DEFAULT_COLLECTED_COVARIATES,
    });
    expect(generated.every((i) => !i.confounders.includes('profil_age'))).toBe(true);
  });
});

describe('withSharedItems', () => {
  it('leaves the fact untouched when no mapping is given', () => {
    const input = fact();
    expect(withSharedItems(input)).toBe(input);
  });
});

describe('interpretMatrix', () => {
  it('recomputes the adjusted p values across the family when they are missing', () => {
    const facts = [0.005, 0.011, 0.02, 0.04, 0.13].map((pRaw, index) =>
      fact({ x: `v${index}`, y: `w${index}`, pRaw, pAdjusted: Number.NaN }),
    );
    const results = interpretMatrix(facts);
    expect(results[0].fact.pAdjusted).toBeCloseTo(0.025, 10);
    expect(results[4].fact.pAdjusted).toBeCloseTo(0.13, 10);
  });

  it('keeps the adjusted p values already provided', () => {
    const results = interpretMatrix([fact({ pAdjusted: 0.03 })]);
    expect(results[0].fact.pAdjusted).toBe(0.03);
  });

  it('returns an empty array for an empty family', () => {
    expect(interpretMatrix([])).toEqual([]);
  });
});

describe('describeFact', () => {
  it('formats numbers in French and stays neutral', () => {
    const text = describeFact(
      fact({ r: 0.32, ci95: [0.12, 0.5], n: 87, pAdjusted: 0.01 }),
    );
    expect(text).toContain('0,32');
    expect(text).toContain('0,12');
    expect(text).toContain('0,50');
    expect(text).toContain('87');
    expect(text).toContain('0,01');
    expect(text).not.toMatch(/cause|prouve|explique/i);
  });

  it('uses a narrow no-break space before the percent sign and the semicolon', () => {
    const text = describeFact(fact());
    expect(text).toContain('95 %');
    expect(text).toContain(' ;');
  });

  it('reports a very small p as a threshold', () => {
    expect(describeFact(fact({ pAdjusted: 0.0000001 }))).toContain('< 0,001');
  });
});
