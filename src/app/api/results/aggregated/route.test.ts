import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Verbatim free-text answer that must never leak through the public endpoint.
const SECRET_VERBATIM = 'Mon pasteur Jean Dupont utilise ChatGPT, contact 0600000000';

const rpcMock = vi.fn();

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  createServerSupabaseClient: vi.fn(async () => ({ rpc: rpcMock })),
}));

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn(() => ({ success: true, limit: 100, remaining: 99, reset: Date.now() + 1000 })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

import { GET } from './route';

function makeRequest() {
  return new NextRequest('http://localhost/api/results/aggregated');
}

describe('GET /api/results/aggregated', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    rpcMock.mockImplementation((fn: string) => {
      if (fn === 'get_participant_count') {
        return Promise.resolve({ data: 42, error: null });
      }
      // get_aggregated_results: includes a legitimate choice question plus the
      // free-text comment question carrying a raw verbatim.
      return Promise.resolve({
        data: [
          {
            question_id: 'profil_confession',
            distribution: { '"protestant"': 30, '"catholique"': 12 },
            total_responses: 42,
          },
          {
            question_id: 'commentaires_libres',
            distribution: { [`"${SECRET_VERBATIM}"`]: 1 },
            total_responses: 1,
          },
        ],
        error: null,
      });
    });
  });

  it('does not expose free-text verbatims', async () => {
    const response = await GET(makeRequest());
    const body = await response.json();
    const raw = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(raw).not.toContain(SECRET_VERBATIM);
    expect(raw).not.toContain('commentaires_libres');
  });

  it('still returns legitimate aggregate questions', async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    const ids = body.results.map((r: { questionId: string }) => r.questionId);
    expect(ids).toContain('profil_confession');
    expect(body.participantCount).toBe(42);
  });
});
