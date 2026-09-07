import { describe, it, expect } from 'vitest';
import {
  fisherCi95,
  benjaminiHochberg,
  pValueForCorrelation,
  sampleStdDev,
  pearson,
  computeCorrelations,
  buildCorrelationMatrix,
  buildSegmentStats,
  calculateDimensionStats,
  MIN_CORRELATION_N,
  type DimensionRecord,
  type SegmentDataItem,
} from './stats-helpers';

describe('fisherCi95', () => {
  it('matches the textbook interval for r = 0.5, n = 50', () => {
    const [lo, hi] = fisherCi95(0.5, 50);
    expect(lo).toBeCloseTo(0.26, 2);
    expect(hi).toBeCloseTo(0.68, 2);
  });

  it('brackets r and widens as n shrinks', () => {
    const [lo50, hi50] = fisherCi95(0.5, 50);
    const [lo20, hi20] = fisherCi95(0.5, 20);
    expect(lo50).toBeLessThan(0.5);
    expect(hi50).toBeGreaterThan(0.5);
    expect(hi20 - lo20).toBeGreaterThan(hi50 - lo50);
  });
});

describe('benjaminiHochberg', () => {
  it('adjusts the classic 0.01 to 0.05 family to a flat 0.05', () => {
    // Compared to the tolerance of a float: the shared implementation computes
    // p·m/k in that order, so the smallest p lands on 0.049999999999999996.
    const adjusted = benjaminiHochberg([0.01, 0.02, 0.03, 0.04, 0.05]);
    expect(adjusted).toHaveLength(5);
    for (const p of adjusted) {
      expect(p).toBeCloseTo(0.05, 12);
    }
  });

  it('preserves input order and enforces monotonicity', () => {
    const adjusted = benjaminiHochberg([0.5, 0.001]);
    expect(adjusted[0]).toBeCloseTo(0.5, 10);
    expect(adjusted[1]).toBeCloseTo(0.002, 10);
  });

  it('never exceeds 1', () => {
    expect(benjaminiHochberg([0.9, 0.95])).toEqual([0.95, 0.95]);
  });

  it('returns an empty family untouched', () => {
    expect(benjaminiHochberg([])).toEqual([]);
  });
});

describe('pValueForCorrelation', () => {
  it('returns 1 for a null correlation', () => {
    expect(pValueForCorrelation(0, 50)).toBeCloseTo(1, 6);
  });

  it('matches t(48) = 4 for r = 0.5, n = 50', () => {
    const p = pValueForCorrelation(0.5, 50);
    expect(p).toBeGreaterThan(0.0001);
    expect(p).toBeLessThan(0.001);
  });
});

describe('sampleStdDev', () => {
  it('uses the n − 1 denominator', () => {
    // Population SD of [2, 4, 4, 4, 5, 5, 7, 9] is 2; the sample SD is larger.
    expect(sampleStdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });

  it('is null below two observations', () => {
    expect(sampleStdDev([3])).toBeNull();
  });
});

describe('pearson', () => {
  it('returns 1 for a perfect linear relation', () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 10);
  });

  it('returns null when a series has no variance', () => {
    expect(pearson([1, 1, 1], [1, 2, 3])).toBeNull();
  });
});

function records(n: number, noise = 0): DimensionRecord[] {
  return Array.from({ length: n }, (_, i) => ({
    religiosity: 1 + (i % 5),
    aiOpenness: 5 - (i % 5) + (i % 2) * noise,
    sacredBoundary: i % 2 === 0 ? 3 : null,
  }));
}

describe('computeCorrelations', () => {
  const keys = ['religiosity', 'aiOpenness', 'sacredBoundary'];

  it('withholds every correlation below n = 20', () => {
    expect(computeCorrelations(records(MIN_CORRELATION_N - 1), keys)).toEqual([]);
  });

  it('reports r, n, CI and both p-values above the threshold', () => {
    const facts = computeCorrelations(records(40), keys);
    const pair = facts.find((f) => f.x === 'religiosity' && f.y === 'aiOpenness');

    expect(pair).toBeDefined();
    expect(pair!.n).toBe(40);
    expect(pair!.r).toBeCloseTo(-1, 2);
    expect(pair!.ci95[0]).toBeLessThanOrEqual(pair!.r);
    expect(pair!.ci95[1]).toBeGreaterThanOrEqual(pair!.r);
    expect(pair!.pAdjusted).toBeGreaterThanOrEqual(pair!.pRaw);
    expect(pair!.sharedItems).toEqual([]);
  });

  it('drops pairs whose pairwise-complete n is too small', () => {
    // sacredBoundary is present on half the records only: 19 pairs out of 38.
    const facts = computeCorrelations(records(38), keys);
    expect(facts.some((f) => f.x === 'sacredBoundary' || f.y === 'sacredBoundary')).toBe(false);
  });

  it('reports the intersection of items shared by two dimensions', () => {
    const facts = computeCorrelations(records(40), ['religiosity', 'aiOpenness'], {
      religiosity: ['crs_intellect', 'ctrl_ia_frequence'],
      aiOpenness: ['ctrl_ia_frequence', 'digital_attitude_generale'],
    });
    expect(facts[0].sharedItems).toEqual(['ctrl_ia_frequence']);
  });
});

describe('buildCorrelationMatrix', () => {
  const keys = ['religiosity', 'aiOpenness'];

  it('is null when a pair could not be computed', () => {
    expect(buildCorrelationMatrix([], keys)).toBeNull();
  });

  it('is symmetric with a unit diagonal when complete', () => {
    const facts = computeCorrelations(records(40), keys);
    const matrix = buildCorrelationMatrix(facts, keys);
    expect(matrix).not.toBeNull();
    expect(matrix!.religiosity.religiosity).toBe(1);
    expect(matrix!.religiosity.aiOpenness).toBe(matrix!.aiOpenness.religiosity);
  });
});

function segment(n: number): SegmentDataItem {
  return {
    religiosity: Array.from({ length: n }, (_, i): number | null => 1 + (i % 5)),
    aiAdoption: Array.from({ length: n }, () => 3),
    profiles: { equilibriste: n },
    usageGap: { uses_both: n },
    dimensions: { religiosity: Array.from({ length: n }, (_, i) => 1 + (i % 5)) },
  };
}

describe('buildSegmentStats', () => {
  it('publishes nothing but its size below n = 5', () => {
    const stats = buildSegmentStats(segment(4));
    expect(stats.count).toBe(4);
    expect(stats.avgReligiosity).toBeNull();
    expect(stats.avgAiAdoption).toBeNull();
    expect(stats.sdReligiosity).toBeNull();
    expect(stats.dimensionAverages.religiosity).toBeNull();
    expect(stats.dimensionSds.religiosity).toBeNull();
    // A distribution over four people is a list of four people.
    expect(stats.profileDistribution).toEqual({});
    expect(stats.usageGapDistribution).toEqual({});
  });

  it('suppresses a dimension measured on fewer than 5 people inside a large segment', () => {
    const data = segment(20);
    // Only three respondents out of twenty have a value on this dimension.
    data.dimensions.sacredBoundary = Array.from({ length: 20 }, (_, i) => (i < 3 ? 4 : null));
    const stats = buildSegmentStats(data);

    expect(stats.count).toBe(20);
    expect(stats.dimensionAverages.religiosity).toBe(3);
    expect(stats.dimensionAverages.sacredBoundary).toBeNull();
    expect(stats.dimensionSds.sacredBoundary).toBeNull();
  });

  it('suppresses the headline means when too few people carry a score', () => {
    const data = segment(20);
    data.religiosity = Array.from({ length: 20 }, (_, i) => (i < 2 ? 5 : null));
    const stats = buildSegmentStats(data);

    expect(stats.count).toBe(20);
    expect(stats.avgReligiosity).toBeNull();
    expect(stats.sdReligiosity).toBeNull();
    // The other measure is untouched.
    expect(stats.avgAiAdoption).toBe(3);
  });

  it('publishes means and sample SDs from n = 5', () => {
    const stats = buildSegmentStats(segment(10));
    expect(stats.count).toBe(10);
    expect(stats.avgReligiosity).toBe(3);
    expect(stats.sdReligiosity).toBeGreaterThan(0);
    expect(stats.usageGapDistribution).toEqual({ uses_both: 10 });
    expect(stats.dimensionAverages.religiosity).toBe(3);
  });
});

describe('calculateDimensionStats', () => {
  it('returns n only below the disclosure floor', () => {
    const stats = calculateDimensionStats({ religiosity: [3, 4, null, 5] });
    expect(stats.religiosity).toEqual({
      n: 3,
      mean: null,
      stdDev: null,
      median: null,
      distribution: [],
    });
  });

  it('ignores nulls when the sample is large enough', () => {
    const stats = calculateDimensionStats({ religiosity: [1, 2, 3, 4, 5, null] });
    expect(stats.religiosity.n).toBe(5);
    expect(stats.religiosity.mean).toBe(3);
    expect(stats.religiosity.stdDev).toBeCloseTo(1.58, 2);
  });
});
