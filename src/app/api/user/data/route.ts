import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { userDataSchema } from '@/lib/validation';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

// GET: Export user's own data (GDPR right to access)
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = rateLimit(`user-data:${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const anonymousId = request.nextUrl.searchParams.get('anonymousId');

    if (!anonymousId) {
      return NextResponse.json(
        { error: 'Anonymous ID is required' },
        { status: 400 }
      );
    }

    const validationResult = userDataSchema.safeParse({ anonymousId });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid anonymous ID format' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { data: [], demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { data: [], demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('responses')
      .select('id, created_at, answers, metadata')
      .eq('anonymous_id', anonymousId);

    if (error) {
      console.error('User data retrieval error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve data' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: data || [] },
      { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('User data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user's data (GDPR right to erasure)
export async function DELETE(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = rateLimit(`user-delete:${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const validationResult = userDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid anonymous ID format' },
        { status: 400 }
      );
    }

    const { anonymousId } = validationResult.data;

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: true, deletedCount: 0, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { success: true, deletedCount: 0, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Get the session IDs first to delete sessions too
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: responses } = await (supabase as any)
      .from('responses')
      .select('session_id')
      .eq('anonymous_id', anonymousId);

    const sessionIds = (responses as Array<{ session_id: string }> | null)?.map(r => r.session_id) || [];

    // Delete responses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: responseError, count } = await (supabase as any)
      .from('responses')
      .delete()
      .eq('anonymous_id', anonymousId);

    if (responseError) {
      console.error('Response deletion error:', responseError);
      return NextResponse.json(
        { error: 'Failed to delete data' },
        { status: 500 }
      );
    }

    // Delete associated sessions
    if (sessionIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('sessions')
        .delete()
        .in('id', sessionIds);
    }

    return NextResponse.json(
      { success: true, deletedCount: count || 0 },
      { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('User data deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
