import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const maybeSingleMock = vi.fn();
const upsertMock = vi.fn();
const validateCSRFMock = vi.fn();

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  isServiceRoleConfigured: true,
  createServerSupabaseClient: vi.fn(),
  createServiceRoleClient: vi.fn(() => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: maybeSingleMock }) }),
      upsert: upsertMock,
    }),
  })),
}));

vi.mock('@/lib/csrf', () => ({
  validateCSRF: (...args: unknown[]) => validateCSRFMock(...args),
  csrfErrorResponse: (error: string) =>
    new Response(JSON.stringify({ error }), { status: 403 }),
}));

vi.mock('@/lib/rateLimit', () => ({
  rateLimitPartial: vi.fn(() => ({ success: true, maxRequests: 120, remaining: 119, resetIn: 1000 })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

import { POST } from './route';

const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';
const ANONYMOUS_ID = '6f9619ff-8b86-4d11-b42d-00c04fc964ff';

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/survey/partial', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validBody = {
  sessionId: SESSION_ID,
  anonymousId: ANONYMOUS_ID,
  answers: { profil_confession: 'protestant' },
  lastQuestionIndex: 1,
  language: 'fr',
  instrumentVersion: '2.0.0',
  entryVariant: 'general',
};

describe('POST /api/survey/partial', () => {
  beforeEach(() => {
    maybeSingleMock.mockReset();
    upsertMock.mockReset();
    validateCSRFMock.mockReset();
    validateCSRFMock.mockResolvedValue({ valid: true });
    upsertMock.mockResolvedValue({ error: null });
  });

  it('rejects a request without a valid CSRF token', async () => {
    validateCSRFMock.mockResolvedValue({ valid: false, error: 'Missing CSRF token' });

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(403);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('stores the session with its anonymous id and attrition strata', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(
      {
        id: SESSION_ID,
        anonymous_id: ANONYMOUS_ID,
        language: 'fr',
        partial_answers: { profil_confession: 'protestant' },
        last_question_index: 1,
        instrument_version: '2.0.0',
        entry_variant: 'general',
      },
      { onConflict: 'id' }
    );
  });

  it('never overwrites a session that is already complete', async () => {
    maybeSingleMock.mockResolvedValue({ data: { is_complete: true }, error: null });

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, ignored: 'session_complete' });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('rejects a save without anonymous id', async () => {
    const withoutAnonymousId: Record<string, unknown> = { ...validBody };
    delete withoutAnonymousId.anonymousId;

    const response = await POST(makeRequest(withoutAnonymousId));

    expect(response.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
