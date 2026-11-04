import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const orMock = vi.fn();

vi.mock('@/lib/supabase', () => ({
  isServiceRoleConfigured: true,
  createServiceRoleClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({ or: orMock }),
      }),
    }),
  })),
}));

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn(() => ({ success: true, maxRequests: 100, remaining: 99, resetIn: 1000 })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

// The scoring module is being rewritten concurrently; the route only depends on
// the `{ value: number | null }` contract, which is what we stub here.
vi.mock('@/lib/scoring', () => ({
  calculateAllDimensions: (answers: Record<string, unknown>) => {
    const seed = typeof answers.seed === 'number' ? answers.seed : 0;
    const score = (offset: number) => ({ value: 1 + ((seed + offset) % 5) });
    return {
      religiosity: score(0),
      aiOpenness: score(1),
      sacredBoundary: score(2),
      ethicalConcern: score(3),
      psychologicalPerception: score(4),
      // Half the sample has no scorable answer for this dimension.
      communityContext: { value: seed % 2 === 0 ? 3 : null },
      futureOrientation: score(5),
    };
  },
}));

import { GET } from './route';

function makeRequest() {
  return new NextRequest('http://localhost/api/results/norms');
}

function syntheticRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    answers: { seed: i },
    // Two thirds of the pool carries a version, the rest predates the stamp.
    metadata: i % 3 === 0 ? null : { instrumentVersion: i % 3 === 1 ? '2.0.0' : '1.4.0' },
  }));
}

describe('GET /api/results/norms', () => {
  beforeEach(() => {
    orMock.mockReset();
  });

  it('returns mode "insufficient" below 30 responses', async () => {
    orMock.mockResolvedValue({ data: syntheticRows(12), error: null });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ n: 12, mode: 'insufficient' });
  });

  it('returns nine monotonic deciles per dimension', async () => {
    orMock.mockResolvedValue({ data: syntheticRows(60), error: null });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.n).toBe(60);
    expect(body.mode).toBeUndefined();
    expect(Object.keys(body.dimensions)).toEqual([
      'religiosity',
      'aiOpenness',
      'sacredBoundary',
      'ethicalConcern',
      'psychologicalPerception',
      'communityContext',
      'futureOrientation',
    ]);

    for (const key of Object.keys(body.dimensions)) {
      const { quantiles } = body.dimensions[key];
      expect(quantiles).toHaveLength(9);
      for (let i = 1; i < quantiles.length; i++) {
        expect(quantiles[i]).toBeGreaterThanOrEqual(quantiles[i - 1]);
      }
      expect(quantiles[0]).toBeGreaterThanOrEqual(1);
      expect(quantiles[8]).toBeLessThanOrEqual(5);
      for (const q of quantiles) expect(Number.isInteger(q * 10 + 1e-9) || Math.abs(q * 10 - Math.round(q * 10)) < 1e-9).toBe(true);
    }
  });

  it('drops null dimension values from the norm', async () => {
    orMock.mockResolvedValue({ data: syntheticRows(60), error: null });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.dimensions.religiosity.n).toBe(60);
    // Only even seeds produce a value for communityContext.
    expect(body.dimensions.communityContext.n).toBe(30);
  });

  it('reports the instrument versions actually pooled, never a single hardcoded one', async () => {
    orMock.mockResolvedValue({ data: syntheticRows(60), error: null });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.instrumentVersion).toBeUndefined();
    expect(body.instrumentVersions).toEqual({ '2.0.0': 20, '1.4.0': 20, unknown: 20 });
    const pooled = Object.values(body.instrumentVersions as Record<string, number>).reduce(
      (sum, count) => sum + count,
      0
    );
    expect(pooled).toBe(body.n);
  });

  it('compares a CNEF respondent only with the CNEF version, and the others without it', async () => {
    const cnef = syntheticRows(40).map((row) => ({ ...row, metadata: { wordingVariant: 'cnef-2026-10' } }));
    orMock.mockResolvedValue({ data: [...syntheticRows(35), ...cnef], error: null });

    const general = await (await GET(makeRequest())).json();
    const entry = await (await GET(new NextRequest('http://localhost/api/results/norms?entry=cnef'))).json();

    expect(general.n).toBe(35);
    expect(entry.n).toBe(40);
  });

  it('publishes no cut-point for a dimension measured on fewer than 30 people', async () => {
    orMock.mockResolvedValue({ data: syntheticRows(40), error: null });
    const body = await (await GET(makeRequest())).json();
    for (const key of Object.keys(body.dimensions)) {
      if (body.dimensions[key].n < 30) expect(body.dimensions[key].quantiles).toEqual([]);
    }
  });

  it('sets the 10-minute cache header', async () => {
    orMock.mockResolvedValue({ data: syntheticRows(60), error: null });

    const response = await GET(makeRequest());
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=600');
  });
});
