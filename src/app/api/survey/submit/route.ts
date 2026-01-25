import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { surveySubmissionSchema } from '@/lib/validation';
import { rateLimitSubmit, getRateLimitHeaders, detectHoneypot, flagAsBot } from '@/lib/rateLimit';
import { validateCSRF, csrfErrorResponse } from '@/lib/csrf';
import { cookies } from 'next/headers';

const SUBMITTED_COOKIE_NAME = 'survey_submitted';
const SUBMITTED_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Error codes for client-side handling
const ERROR_CODES = {
  ALREADY_SUBMITTED_COOKIE: 'ALREADY_SUBMITTED_COOKIE',
  ALREADY_SUBMITTED_FINGERPRINT: 'ALREADY_SUBMITTED_FINGERPRINT',
  ALREADY_SUBMITTED_ANONYMOUS_ID: 'ALREADY_SUBMITTED_ANONYMOUS_ID',
  IP_LIMIT_EXCEEDED: 'IP_LIMIT_EXCEEDED',
  RATE_LIMITED: 'RATE_LIMITED',
  BOT_DETECTED: 'BOT_DETECTED',
} as const;

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting and tracking
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const userAgent = request.headers.get('user-agent') || '';

    // CSRF Check
    const csrfResult = await validateCSRF(request);
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error || 'Invalid CSRF token');
    }

    // Check for submission cookie FIRST (fastest check)
    const cookieStore = await cookies();
    const submittedCookie = cookieStore.get(SUBMITTED_COOKIE_NAME);
    if (submittedCookie) {
      return NextResponse.json(
        {
          error: 'You have already completed this survey.',
          code: ERROR_CODES.ALREADY_SUBMITTED_COOKIE,
          helpText: 'If you believe this is an error (e.g., shared computer), please contact us.'
        },
        { status: 403 }
      );
    }

    // Rate limiting - strict for submit endpoint
    const rateLimitResult = rateLimitSubmit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          code: ERROR_CODES.RATE_LIMITED,
        },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Parse and validate body
    const body = await request.json();

    // Honeypot detection - block bots
    const honeypotResult = detectHoneypot(body);
    if (honeypotResult.isBot) {
      // Flag IP for future requests and return fake success (don't let bots know they're detected)
      flagAsBot(ip, honeypotResult.reason || 'honeypot');
      console.warn(`Bot detected from IP ${ip}: ${honeypotResult.reason}`);
      return NextResponse.json(
        { success: true, responseId: 'fake-' + Date.now(), demo: true },
        { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const validationResult = surveySubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, answers, metadata, consentGiven, consentVersion, anonymousId, fingerprint } = validationResult.data;

    // Consent is required
    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Consent is required to submit the survey' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isServiceRoleConfigured) {
      // In demo mode, just acknowledge the submission and set cookie
      console.log('Demo mode: Survey submission received', { sessionId, answersCount: Object.keys(answers).length });

      const response = NextResponse.json(
        { success: true, responseId: 'demo-' + Date.now(), anonymousId, demo: true },
        { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
      );

      // Set submission cookie even in demo mode
      response.cookies.set(SUBMITTED_COOKIE_NAME, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SUBMITTED_COOKIE_MAX_AGE,
        path: '/',
      });

      return response;
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      const response = NextResponse.json(
        { success: true, responseId: 'demo-' + Date.now(), anonymousId, demo: true },
        { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
      );
      response.cookies.set(SUBMITTED_COOKIE_NAME, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SUBMITTED_COOKIE_MAX_AGE,
        path: '/',
      });
      return response;
    }

    // Check for duplicate submissions using the database function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: checkResult, error: checkError } = await (supabase as any)
      .rpc('check_submission_allowed', {
        p_fingerprint_id: fingerprint || null,
        p_ip_address: ip,
        p_anonymous_id: anonymousId,
      });

    if (checkError) {
      console.error('Duplicate check error:', checkError);
      // Continue anyway - don't block submission due to check failure
    } else if (checkResult && checkResult.length > 0 && !checkResult[0].allowed) {
      const reason = checkResult[0].reason;
      const previousSubmissionAt = checkResult[0].previous_submission_at;

      // Record the blocked attempt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).rpc('record_submission_attempt', {
        p_fingerprint_id: fingerprint || null,
        p_ip_address: ip,
        p_anonymous_id: anonymousId,
        p_session_id: sessionId,
        p_is_successful: false,
        p_blocked_reason: reason,
        p_user_agent: userAgent,
      });

      let errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES] = ERROR_CODES.ALREADY_SUBMITTED_FINGERPRINT;
      let errorMessage = 'You have already completed this survey.';

      if (reason === 'anonymous_id_exists') {
        errorCode = ERROR_CODES.ALREADY_SUBMITTED_ANONYMOUS_ID;
      } else if (reason === 'ip_limit_exceeded') {
        errorCode = ERROR_CODES.IP_LIMIT_EXCEEDED;
        errorMessage = 'Too many submissions from this network. Please contact us if you need assistance.';
      }

      return NextResponse.json(
        {
          error: errorMessage,
          code: errorCode,
          previousSubmissionAt,
          helpText: 'If you believe this is an error (e.g., shared computer), please contact us at contact@ia-foi.fr'
        },
        { status: 403 }
      );
    }

    // First, ensure session exists (upsert)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: sessionError } = await (supabase as any)
      .from('sessions')
      .upsert({
        id: sessionId,
        language: metadata?.language || 'fr',
        completed_at: new Date().toISOString(),
        is_complete: true,
        partial_answers: answers,
      }, { onConflict: 'id' });

    if (sessionError) {
      console.error('Session upsert error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to save session' },
        { status: 500 }
      );
    }

    // Insert response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('responses')
      .insert({
        session_id: sessionId,
        answers: answers,
        metadata: metadata || {},
        consent_given: consentGiven,
        consent_timestamp: new Date().toISOString(),
        consent_version: consentVersion || '1.0',
        anonymous_id: anonymousId,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Response insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      );
    }

    // Record successful submission in tracking table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('record_submission_attempt', {
      p_fingerprint_id: fingerprint || null,
      p_ip_address: ip,
      p_anonymous_id: anonymousId,
      p_session_id: sessionId,
      p_is_successful: true,
      p_blocked_reason: null,
      p_user_agent: userAgent,
    });

    // Create response with cookie
    const response = NextResponse.json(
      { success: true, responseId: data.id, anonymousId },
      { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
    );

    // Set submission cookie to prevent re-submission
    response.cookies.set(SUBMITTED_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SUBMITTED_COOKIE_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Survey submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
