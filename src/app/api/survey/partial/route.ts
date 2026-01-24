import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { partialSaveSchema } from '@/lib/validation';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (more lenient for partial saves)
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = rateLimit(`partial:${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const validationResult = partialSaveSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, answers, lastQuestionIndex, language } = validationResult.data;

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      // In demo mode, just acknowledge
      return NextResponse.json(
        { success: true, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { success: true, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Upsert session with partial answers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('sessions')
      .upsert({
        id: sessionId,
        language,
        partial_answers: answers,
        last_question_index: lastQuestionIndex,
        user_agent: request.headers.get('user-agent'),
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
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

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

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('is_complete', false)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { session: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { session: data },
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
