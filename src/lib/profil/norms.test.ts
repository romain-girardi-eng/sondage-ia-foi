import { describe, it, expect } from 'vitest';
import {
  computeEmpiricalRank,
  getDimensionComparison,
  parseNormsResponse,
  type NormsResponse,
} from './norms';

/** 99 ascending cut-points spanning 1 to 5, so quantiles[i] = 1 + (i + 1) / 25. */
const quantiles = Array.from({ length: 99 }, (_, i) => 1 + (i + 1) / 25);

describe('computeEmpiricalRank', () => {
  it('returns the smallest index whose quantile reaches the score', () => {
    expect(computeEmpiricalRank(quantiles[0], quantiles)).toBe(0);
    expect(computeEmpiricalRank(quantiles[49], quantiles)).toBe(49);
  });

  it('returns 0 for a score below every cut-point', () => {
    expect(computeEmpiricalRank(1, quantiles)).toBe(0);
  });

  it('returns the array length for a score above every cut-point', () => {
    expect(computeEmpiricalRank(5, quantiles)).toBe(99);
  });

  it('returns null without quantiles', () => {
    expect(computeEmpiricalRank(3, [])).toBeNull();
  });
});

describe('parseNormsResponse', () => {
  it('reads the insufficient mode', () => {
    expect(parseNormsResponse({ n: 12, mode: 'insufficient' })).toEqual({
      mode: 'insufficient',
      n: 12,
    });
  });

  it('reads a full payload', () => {
    const parsed = parseNormsResponse({
      n: 120,
      instrumentVersion: '2.0.0',
      dimensions: { religiosity: { n: 118, quantiles } },
    });

    expect(parsed?.mode).toBe('ready');
    expect(parsed && parsed.mode === 'ready' && parsed.dimensions.religiosity?.n).toBe(118);
  });

  it('rejects malformed payloads', () => {
    expect(parseNormsResponse(null)).toBeNull();
    expect(parseNormsResponse({ error: 'boom' })).toBeNull();
    expect(parseNormsResponse({ n: 40 })).toBeNull();
  });

  it('drops a dimension whose quantiles are not numbers', () => {
    const parsed = parseNormsResponse({
      n: 40,
      instrumentVersion: '2.0.0',
      dimensions: { religiosity: { n: 40, quantiles: ['a'] } },
    });

    expect(parsed?.mode).toBe('ready');
    expect(parsed && parsed.mode === 'ready' && parsed.dimensions.religiosity).toBeUndefined();
  });
});

describe('getDimensionComparison', () => {
  const ready: NormsResponse = {
    mode: 'ready',
    n: 120,
    instrumentVersion: '2.0.0',
    dimensions: {
      religiosity: { n: 118, quantiles },
      aiOpenness: { n: 12, quantiles },
    },
  };

  it('returns the rank and the dimension count', () => {
    expect(getDimensionComparison(ready, 'religiosity', quantiles[74])).toEqual({
      rank: 74,
      n: 118,
    });
  });

  it('hides the comparison under 30 participants on that dimension', () => {
    expect(getDimensionComparison(ready, 'aiOpenness', 3)).toBeNull();
  });

  it('hides the comparison for an unmeasured dimension', () => {
    expect(getDimensionComparison(ready, 'religiosity', null)).toBeNull();
    expect(getDimensionComparison(ready, 'sacredBoundary', 3)).toBeNull();
  });

  it('hides the comparison while the norms are insufficient or absent', () => {
    expect(getDimensionComparison({ mode: 'insufficient', n: 8 }, 'religiosity', 3)).toBeNull();
    expect(getDimensionComparison(null, 'religiosity', 3)).toBeNull();
  });
});
