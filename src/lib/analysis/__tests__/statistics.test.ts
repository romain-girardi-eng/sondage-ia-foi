import { describe, it, expect } from 'vitest';
import {
  benjaminiHochberg,
  fisherCI,
  incompleteBeta,
  normalQuantile,
  pValueFromR,
  pearson,
  sampleSd,
} from '../statistics';

describe('pearson', () => {
  it('returns r = 1 for a perfectly increasing relation', () => {
    const result = pearson([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]);
    expect(result).not.toBeNull();
    expect(result?.r).toBeCloseTo(1, 12);
    expect(result?.n).toBe(5);
  });

  it('returns r = -1 for a perfectly decreasing relation', () => {
    expect(pearson([1, 2, 3], [3, 2, 1])?.r).toBeCloseTo(-1, 12);
  });

  it('matches a hand-computed value', () => {
    // x = [1,2,3,4,5], y = [2,1,4,3,5] : Sxy = 8, Sxx = 10, Syy = 10, r = 0.8
    expect(pearson([1, 2, 3, 4, 5], [2, 1, 4, 3, 5])?.r).toBeCloseTo(0.8, 10);
  });

  it('drops pairs where either value is missing', () => {
    const result = pearson([1, 2, null, 4, 5], [2, 4, 9, 8, 10]);
    expect(result?.n).toBe(4);
    expect(result?.r).toBeCloseTo(1, 12);
  });

  it('returns null when a variable is constant or the sample too small', () => {
    expect(pearson([1, 1, 1, 1], [1, 2, 3, 4])).toBeNull();
    expect(pearson([1, 2], [2, 4])).toBeNull();
  });
});

describe('sampleSd', () => {
  it('uses the n - 1 denominator', () => {
    // values [2,4,4,4,5,5,7,9]: population sd = 2, sample sd = 2.13809
    expect(sampleSd([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.13809, 5);
  });

  it('returns null with fewer than two usable values', () => {
    expect(sampleSd([3, null, undefined])).toBeNull();
  });
});

describe('normalQuantile', () => {
  it('recovers the classic 1.96 critical value', () => {
    expect(normalQuantile(0.975)).toBeCloseTo(1.959964, 5);
  });

  it('is symmetric around the median', () => {
    expect(normalQuantile(0.5)).toBeCloseTo(0, 8);
    expect(normalQuantile(0.05)).toBeCloseTo(-normalQuantile(0.95), 6);
  });
});

describe('fisherCI', () => {
  it('reproduces the textbook interval for r = 0.5, n = 50', () => {
    const ci = fisherCI(0.5, 50);
    expect(ci).not.toBeNull();
    expect(ci?.[0]).toBeCloseTo(0.26, 2);
    expect(ci?.[1]).toBeCloseTo(0.68, 2);
  });

  it('narrows as n grows', () => {
    const small = fisherCI(0.3, 30) as [number, number];
    const large = fisherCI(0.3, 300) as [number, number];
    expect(large[1] - large[0]).toBeLessThan(small[1] - small[0]);
  });

  it('returns null when the transformation is undefined', () => {
    expect(fisherCI(1, 50)).toBeNull();
    expect(fisherCI(0.4, 3)).toBeNull();
  });
});

describe('incompleteBeta', () => {
  it('is symmetric: I_x(a,b) = 1 - I_(1-x)(b,a)', () => {
    expect(incompleteBeta(2, 5, 0.3)).toBeCloseTo(1 - incompleteBeta(5, 2, 0.7), 12);
  });

  it('equals x when a = b = 1', () => {
    expect(incompleteBeta(1, 1, 0.42)).toBeCloseTo(0.42, 12);
  });
});

describe('pValueFromR', () => {
  it('gives p close to 0.0002 for r = 0.5, n = 50 (t = 4, df = 48)', () => {
    const p = pValueFromR(0.5, 50);
    expect(p).toBeGreaterThan(0.0001);
    expect(p).toBeLessThan(0.0005);
  });

  it('gives p = 1 for a null correlation', () => {
    expect(pValueFromR(0, 40)).toBeCloseTo(1, 10);
  });

  it('is insensitive to the sign of r', () => {
    expect(pValueFromR(-0.35, 60)).toBeCloseTo(pValueFromR(0.35, 60), 12);
  });

  it('decreases as n grows for a fixed r', () => {
    expect(pValueFromR(0.2, 200)).toBeLessThan(pValueFromR(0.2, 40));
  });
});

describe('benjaminiHochberg', () => {
  it('reproduces a textbook example', () => {
    const adjusted = benjaminiHochberg([0.005, 0.011, 0.02, 0.04, 0.13]);
    expect(adjusted[0]).toBeCloseTo(0.025, 10);
    expect(adjusted[1]).toBeCloseTo(0.0275, 10);
    expect(adjusted[2]).toBeCloseTo(0.033333, 5);
    expect(adjusted[3]).toBeCloseTo(0.05, 10);
    expect(adjusted[4]).toBeCloseTo(0.13, 10);
  });

  it('maps equally spaced p values onto a single adjusted value', () => {
    const adjusted = benjaminiHochberg([0.01, 0.02, 0.03, 0.04, 0.05]);
    for (const p of adjusted) expect(p).toBeCloseTo(0.05, 10);
  });

  it('returns adjusted values in the original order', () => {
    const adjusted = benjaminiHochberg([0.13, 0.005, 0.04, 0.011, 0.02]);
    expect(adjusted[0]).toBeCloseTo(0.13, 10);
    expect(adjusted[1]).toBeCloseTo(0.025, 10);
    expect(adjusted[2]).toBeCloseTo(0.05, 10);
  });

  it('never exceeds 1 and handles the empty family', () => {
    expect(benjaminiHochberg([0.9, 0.95])).toEqual([0.95, 0.95]);
    expect(benjaminiHochberg([])).toEqual([]);
  });
});
