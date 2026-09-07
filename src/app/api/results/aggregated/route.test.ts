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

function mockRpc(participantCount: number) {
  rpcMock.mockImplementation((fn: string) => {
    if (fn === 'get_participant_count') {
      return Promise.resolve({ data: participantCount, error: null });
    }
    // get_aggregated_results: a legitimate choice question, an expanded
    // multi-select (one cell per option plus the k-anonymity bucket), and the
    // free-text comment question carrying a raw verbatim.
    return Promise.resolve({
      data: [
        {
          question_id: 'profil_confession',
          distribution: { protestant: 30, catholique: 12 },
          total_responses: 42,
        },
        {
          question_id: 'ctrl_ia_contextes',
          distribution: { professionnel: 28, spirituel: 9, _autres: 5 },
          total_responses: 42,
        },
        {
          question_id: 'commentaires_libres',
          distribution: { [SECRET_VERBATIM]: 1 },
          total_responses: 1,
        },
      ],
      error: null,
    });
  });
}

describe('GET /api/results/aggregated', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    mockRpc(42);
  });

  it('does not expose free-text verbatims', async () => {
    const response = await GET(makeRequest());
    const body = await response.json();
    const raw = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(raw).not.toContain(SECRET_VERBATIM);
    expect(raw).not.toContain('commentaires_libres');
  });

  it('returns mode "ok" with the legitimate aggregate questions', async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.mode).toBe('ok');
    expect(body.participantCount).toBe(42);
    const ids = body.results.map((r: { questionId: string }) => r.questionId);
    expect(ids).toContain('profil_confession');
    expect(ids).toContain('ctrl_ia_contextes');
  });

  it('passes the expanded multi-select cells through untouched', async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    const contexts = body.results.find(
      (r: { questionId: string }) => r.questionId === 'ctrl_ia_contextes'
    );
    expect(contexts.distribution).toEqual({ professionnel: 28, spirituel: 9, _autres: 5 });
  });

  it('returns mode "insufficient" below 30 participants and no results', async () => {
    rpcMock.mockReset();
    mockRpc(12);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      mode: 'insufficient',
      participantCount: 12,
      lastUpdated: expect.any(String),
    });
    // The heavy aggregate query must not even run below the publication floor.
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('get_participant_count');
  });

  it('never fabricates data when the aggregate query fails', async () => {
    rpcMock.mockReset();
    rpcMock.mockImplementation((fn: string) => {
      if (fn === 'get_participant_count') {
        return Promise.resolve({ data: 120, error: null });
      }
      return Promise.resolve({ data: null, error: { message: 'boom' } });
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.mode).toBe('insufficient');
    expect(body.participantCount).toBe(120);
    expect(body.results).toBeUndefined();
  });
});
