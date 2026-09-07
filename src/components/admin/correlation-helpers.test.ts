import { describe, expect, it } from 'vitest';
import { interpretMatrix } from '@/lib/analysis';
import type { CorrelationFact } from '@/lib/analysis';
import {
  GRADE_STYLES,
  bestGrade,
  gradeChipClass,
  groupByHypothesis,
  sortByAbsoluteR,
  variableLabel,
} from './correlation-helpers';
import {
  NOT_AVAILABLE,
  SUPPRESSED,
  difference,
  formatNullable,
  formatStdDev,
  unattributedCount,
} from './display-helpers';

function fact(overrides: Partial<CorrelationFact> = {}): CorrelationFact {
  return {
    x: 'religiosity',
    y: 'sacredBoundary',
    r: 0.4,
    n: 200,
    ci95: [0.3, 0.5],
    pRaw: 0.001,
    pAdjusted: 0.002,
    sharedItems: [],
    ...overrides,
  };
}

describe('grade palette', () => {
  it('gives each grade a distinct chip class', () => {
    const classes = (['A', 'B', 'C', 'D'] as const).map(gradeChipClass);
    expect(new Set(classes).size).toBe(4);
  });

  it('colours A green and D red', () => {
    expect(GRADE_STYLES.A.chip).toContain('emerald');
    expect(GRADE_STYLES.D.chip).toContain('red');
  });

  it('never reuses the dashboard accent (blue / purple)', () => {
    for (const grade of ['A', 'B', 'C', 'D'] as const) {
      expect(GRADE_STYLES[grade].chip).not.toContain('blue-');
      expect(GRADE_STYLES[grade].chip).not.toContain('purple');
    }
  });
});

describe('sortByAbsoluteR', () => {
  it('sorts on the magnitude, not the sign, without mutating the input', () => {
    const input = [fact({ r: 0.2 }), fact({ r: -0.7 }), fact({ r: 0.5 })];
    const sorted = sortByAbsoluteR(interpretMatrix(input));
    expect(sorted.map((item) => item.fact.r)).toEqual([-0.7, 0.5, 0.2]);
    expect(input[0].r).toBe(0.2);
  });
});

describe('groupByHypothesis', () => {
  it('keeps the eight hypotheses whatever was computed', () => {
    const rows = groupByHypothesis([]);
    expect(rows).toHaveLength(8);
    expect(rows.map((row) => row.hypothesis.id)).toEqual([
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'H7',
      'H8',
    ]);
    expect(rows.every((row) => row.interpreted === null)).toBe(true);
  });

  it('matches a fact to its hypothesis whatever the order of the variables', () => {
    const interpreted = interpretMatrix([fact({ x: 'sacredBoundary', y: 'religiosity' })]);
    const rows = groupByHypothesis(interpreted);
    const h1 = rows.find((row) => row.hypothesis.id === 'H1');
    expect(h1?.interpreted?.fact.r).toBe(0.4);
    expect(rows.filter((row) => row.interpreted !== null)).toHaveLength(1);
  });

  it('exposes the grade of the best interpretation', () => {
    const [interpreted] = interpretMatrix([fact()]);
    expect(['A', 'B', 'C', 'D']).toContain(bestGrade(interpreted));
  });
});

describe('variableLabel', () => {
  it('falls back to the raw identifier for an unknown variable', () => {
    expect(variableLabel('religiosity')).toBe('Religiosité (CRS-5)');
    expect(variableLabel('profil_age')).toBe('profil_age');
  });
});

describe('formatNullable', () => {
  it('uses the French decimal comma', () => {
    expect(formatNullable(3.456)).toBe('3,46');
    expect(formatNullable(3.456, { digits: 1 })).toBe('3,5');
  });

  it('says « n < 5 » when the segment is too small to publish', () => {
    expect(formatNullable(null, { count: 3 })).toBe(SUPPRESSED);
  });

  it('falls back to a dash when nothing explains the absence', () => {
    expect(formatNullable(null)).toBe(NOT_AVAILABLE);
    expect(formatNullable(null, { count: 120 })).toBe(NOT_AVAILABLE);
    expect(formatNullable(undefined)).toBe(NOT_AVAILABLE);
  });

  it('prefixes a standard deviation only when it exists', () => {
    expect(formatStdDev(0.85)).toBe('±0,85');
    expect(formatStdDev(null, 2)).toBe(SUPPRESSED);
    expect(formatStdDev(null)).toBe(NOT_AVAILABLE);
  });
});

describe('difference', () => {
  it('is null as soon as one side is missing', () => {
    expect(difference(4.2, 3.5)).toBeCloseTo(0.7);
    expect(difference(null, 3.5)).toBeNull();
    expect(difference(4.2, null)).toBeNull();
  });
});

describe('unattributedCount', () => {
  it('counts the respondents no profile was attributed to', () => {
    expect(unattributedCount({ equilibriste: 10, explorateur: 5 }, 20)).toBe(5);
  });

  it('never goes negative', () => {
    expect(unattributedCount({ equilibriste: 30 }, 20)).toBe(0);
  });
});
