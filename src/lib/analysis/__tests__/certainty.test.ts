import { describe, it, expect } from 'vitest';
import {
  BASE_METHOD_ARTIFACT_SHARED,
  GENERIC_INTERPRETIVE_CAP,
  MIN_N,
  caveatsFor,
  certaintyScore,
  interpretiveCertainty,
  statisticalCertainty,
  uncontrolledConfounders,
} from '../certainty';
import { DEFAULT_COLLECTED_COVARIATES } from '../interpretationCatalog';
import type { AnalysisContext, CorrelationFact, Interpretation } from '../types';

const context: AnalysisContext = { collectedCovariates: DEFAULT_COLLECTED_COVARIATES };

function fact(overrides: Partial<CorrelationFact> = {}): CorrelationFact {
  return {
    x: 'religiosity',
    y: 'sacredBoundary',
    r: 0.45,
    n: 120,
    ci95: [0.3, 0.58],
    pRaw: 0.0001,
    pAdjusted: 0.0005,
    sharedItems: [],
    ...overrides,
  };
}

function interpretation(overrides: Partial<Interpretation> = {}): Interpretation {
  return {
    mechanism: 'x_causes_y',
    label: 'Test',
    rationale: 'Test',
    confounders: [],
    testable: null,
    ...overrides,
  };
}

describe('statisticalCertainty', () => {
  it('is zero below the minimum sample size', () => {
    expect(statisticalCertainty(fact({ n: MIN_N - 1 }))).toBe(0);
  });

  it('increases with n, all else equal', () => {
    const small = statisticalCertainty(fact({ n: 25 }));
    const large = statisticalCertainty(fact({ n: 200 }));
    expect(large).toBeGreaterThan(small);
  });

  it('increases with |r|, all else equal', () => {
    const weak = statisticalCertainty(fact({ r: 0.05 }));
    const strong = statisticalCertainty(fact({ r: 0.6 }));
    expect(strong).toBeGreaterThan(weak);
  });

  it('penalises a wide confidence interval', () => {
    const precise = statisticalCertainty(fact({ ci95: [0.4, 0.5] }));
    const vague = statisticalCertainty(fact({ ci95: [-0.1, 0.8] }));
    expect(precise).toBeGreaterThan(vague);
  });

  it('penalises a non significant adjusted p value', () => {
    const significant = statisticalCertainty(fact({ pAdjusted: 0.001 }));
    const not = statisticalCertainty(fact({ pAdjusted: 0.2 }));
    expect(significant).toBeGreaterThan(not);
  });

  it('stays within 0 and 1', () => {
    const value = statisticalCertainty(fact({ r: 0.99, n: 5000, ci95: [0.98, 0.99] }));
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThanOrEqual(1);
  });
});

describe('interpretiveCertainty', () => {
  it('gives a method artifact the highest base when items are shared', () => {
    const value = interpretiveCertainty(
      interpretation({ mechanism: 'method_artifact' }),
      fact({ sharedItems: ['crs_public_practice'] }),
      context,
    );
    expect(value).toBeCloseTo(BASE_METHOD_ARTIFACT_SHARED, 10);
  });

  it('drops the method artifact base when no item is shared', () => {
    const value = interpretiveCertainty(
      interpretation({ mechanism: 'method_artifact' }),
      fact(),
      context,
    );
    expect(value).toBeLessThan(0.5);
  });

  it('scores a measured confounder above a cross-sectional causal claim', () => {
    const causal = interpretiveCertainty(interpretation(), fact(), context);
    const confounded = interpretiveCertainty(
      interpretation({ mechanism: 'confounder', confounders: ['profil_age'] }),
      fact(),
      context,
    );
    expect(confounded).toBeGreaterThan(causal);
  });

  it('applies the penalty when a listed confounder was not collected', () => {
    const withMissing = interpretiveCertainty(
      interpretation({ mechanism: 'confounder', confounders: ['revenu_du_foyer'] }),
      fact(),
      context,
    );
    expect(withMissing).toBeCloseTo(0.5, 10);
  });

  it('respects an explicit cap', () => {
    const capped = interpretiveCertainty(
      interpretation({ mechanism: 'confounder', confounders: ['profil_age'] }),
      fact(),
      context,
      GENERIC_INTERPRETIVE_CAP,
    );
    expect(capped).toBeCloseTo(GENERIC_INTERPRETIVE_CAP, 10);
  });
});

describe('uncontrolledConfounders', () => {
  it('lists only the variables absent from the collected set', () => {
    const missing = uncontrolledConfounders(
      interpretation({ confounders: ['profil_age', 'revenu_du_foyer'] }),
      context,
    );
    expect(missing).toEqual(['revenu_du_foyer']);
  });
});

describe('caveatsFor', () => {
  it('always flags the cross-sectional design for causal mechanisms', () => {
    const caveats = caveatsFor(interpretation(), fact(), context);
    expect(caveats.some((c) => c.startsWith('Design transversal'))).toBe(true);
  });

  it('does not flag causality for a method artifact', () => {
    const caveats = caveatsFor(
      interpretation({ mechanism: 'method_artifact' }),
      fact(),
      context,
    );
    expect(caveats.some((c) => c.startsWith('Design transversal'))).toBe(false);
  });

  it('names the shared items', () => {
    const caveats = caveatsFor(
      interpretation(),
      fact({ sharedItems: ['theo_inspiration'] }),
      context,
    );
    expect(caveats.some((c) => c.includes('theo_inspiration'))).toBe(true);
  });

  it('flags an insufficient sample and a confidence interval containing zero', () => {
    const caveats = caveatsFor(
      interpretation(),
      fact({ n: 12, ci95: [-0.2, 0.4], pAdjusted: 0.4 }),
      context,
    );
    expect(caveats.some((c) => c.includes('Effectif insuffisant'))).toBe(true);
    expect(caveats.some((c) => c.includes('contient zéro'))).toBe(true);
    expect(caveats.some((c) => c.includes('Benjamini-Hochberg'))).toBe(true);
  });

  it('mentions the self-selected sample', () => {
    expect(caveatsFor(interpretation(), fact(), context)).toContain(
      'Échantillon de convenance, auto-sélectionné',
    );
  });
});

describe('certaintyScore', () => {
  it('uses the geometric mean of the two components', () => {
    const score = certaintyScore(interpretation(), fact(), context);
    expect(score.overall).toBeCloseTo(Math.sqrt(score.statistical * score.interpretive), 12);
  });

  it('grades D when the sample is below the minimum', () => {
    const score = certaintyScore(interpretation(), fact({ n: 15 }), context);
    expect(score.statistical).toBe(0);
    expect(score.overall).toBe(0);
    expect(score.grade).toBe('D');
  });

  it('grades a strong artifact explanation above a weak causal one', () => {
    const shared = fact({ sharedItems: ['theo_inspiration'], r: 0.7, n: 300, ci95: [0.64, 0.75] });
    const artifact = certaintyScore(
      interpretation({ mechanism: 'method_artifact' }),
      shared,
      context,
    );
    const causal = certaintyScore(interpretation(), shared, context);
    expect(artifact.overall).toBeGreaterThan(causal.overall);
    expect(artifact.grade).toBe('A');
  });

  it('assigns grades monotonically along the thresholds', () => {
    const strong = certaintyScore(
      interpretation({ mechanism: 'method_artifact' }),
      fact({ sharedItems: ['x'], r: 0.8, n: 400, ci95: [0.76, 0.83] }),
      context,
    );
    const middling = certaintyScore(interpretation(), fact({ r: 0.15, n: 40, ci95: [-0.16, 0.44], pAdjusted: 0.3 }), context);
    expect(strong.grade).toBe('A');
    expect(['C', 'D']).toContain(middling.grade);
  });
});
