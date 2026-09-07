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
  return Array.from({ length: count }, (_, i) => ({ answers: { seed: i } }));
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

  it('returns 99 monotonic quantiles per dimension', async () => {
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
      expect(quantiles).toHaveLength(99);
      for (let i = 1; i < quantiles.length; i++) {
        expect(quantiles[i]).toBeGreaterThanOrEqual(quantiles[i - 1]);
      }
      expect(quantiles[0]).toBeGreaterThanOrEqual(1);
      expect(quantiles[98]).toBeLessThanOrEqual(5);
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

  it('sets the 10-minute cache header', async () => {
    orMock.mockResolvedValue({ data: syntheticRows(60), error: null });

    const response = await GET(makeRequest());
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=600');
  });
});
