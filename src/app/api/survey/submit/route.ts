import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { surveySubmissionSchema } from '@/lib/validation';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = rateLimit(`submit:${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validationResult = surveySubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, answers, metadata, consentGiven, consentVersion, anonymousId } = validationResult.data;

    // Consent is required
    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Consent is required to submit the survey' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isServiceRoleConfigured) {
      // In demo mode, just acknowledge the submission
      console.log('Demo mode: Survey submission received', { sessionId, answersCount: Object.keys(answers).length });
      return NextResponse.json(
        { success: true, responseId: 'demo-' + Date.now(), anonymousId, demo: true },
        { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { success: true, responseId: 'demo-' + Date.now(), anonymousId, demo: true },
        { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // First, ensure session exists (upsert)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('sessions')
      .upsert({
        id: sessionId,
        anonymous_id: anonymousId,
        completed_at: new Date().toISOString(),
        is_complete: true,
        partial_answers: answers,
      }, { onConflict: 'id' });

    // Insert response (without session_id foreign key dependency)
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

    return NextResponse.json(
      { success: true, responseId: data.id, anonymousId },
      { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Survey submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
