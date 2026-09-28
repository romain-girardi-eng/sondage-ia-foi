import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  isServiceRoleConfigured,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { partialSaveSchema } from '@/lib/validation';
import { rateLimitPartial, getRateLimitHeaders } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/security/clientIp';
import { validateCSRF, csrfErrorResponse } from '@/lib/csrf';

const sessionIdSchema = z.string().uuid();

export async function POST(request: NextRequest) {
  try {
    const csrfResult = await validateCSRF(request);
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error || 'Invalid CSRF token');
    }

    // Rate limiting (more lenient for partial saves). Raw IP only keys the
    // ephemeral in-memory limiter here; nothing is persisted.
    const ip = getClientIp(request);
    const rateLimitResult = rateLimitPartial(ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const validationResult = partialSaveSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Invalid partial save request:', validationResult.error.issues);
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { sessionId, anonymousId, answers, lastQuestionIndex, language, instrumentVersion, entryVariant } =
      validationResult.data;

    // Service role, as in /api/survey/submit: anon has no SELECT on
    // `sessions` (migration 005), so it can neither check for a completed
    // session nor take the UPDATE path of the upsert on an existing one.
    if (!isServiceRoleConfigured) {
      // In demo mode, just acknowledge
      return NextResponse.json(
        { success: true, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { success: true, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // A save that lands after the final submit (debounce, keepalive flush on
    // page hide) must not overwrite the completed session's answers.
    const { data: existing, error: lookupError } = await supabase
      .from('sessions')
      .select('is_complete')
      .eq('id', sessionId)
      .maybeSingle();

    if (lookupError) {
      console.error('Partial save lookup error:', lookupError);
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      );
    }

    if (existing?.is_complete) {
      return NextResponse.json(
        { success: true, ignored: 'session_complete' },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Upsert session with partial answers. user_agent is intentionally not
    // persisted here (see privacy policy: no browser fingerprint data beyond
    // what duplicate-detection strictly requires).
    const { error } = await supabase
      .from('sessions')
      .upsert({
        id: sessionId,
        anonymous_id: anonymousId,
        language,
        partial_answers: answers,
        last_question_index: lastQuestionIndex,
        instrument_version: instrumentVersion ?? null,
        entry_variant: entryVariant ?? null,
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Partial save error:', error);
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Partial save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Retrieve partial session for resuming
export async function GET(request: NextRequest) {
  try {
    const sessionIdParam = request.nextUrl.searchParams.get('sessionId');
    const sessionIdResult = sessionIdSchema.safeParse(sessionIdParam);

    if (!sessionIdResult.success) {
      return NextResponse.json(
        { error: 'A valid session ID is required' },
        { status: 400 }
      );
    }

    const sessionId = sessionIdResult.data;

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { session: null, demo: true },
        { status: 200 }
      );
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { session: null, demo: true },
        { status: 200 }
      );
    }

    // Sessions are no longer readable by the anon client directly (see
    // migration 005, which revoked anon SELECT on `sessions`). This
    // SECURITY DEFINER RPC replicates the same read, scoped to a single
    // incomplete session, using the session id itself as a bearer token.
    const { data, error } = await supabase.rpc('get_session_partial', {
      p_session_id: sessionId,
    });

    const session = data?.[0];
    if (error || !session) {
      return NextResponse.json(
        { session: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { session },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
