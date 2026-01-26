import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { z } from 'zod';

const emailHashSchema = z.object({
  emailHash: z.string().length(64), // SHA-256 produces 64 hex characters
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';

    // Rate limiting
    const rateLimitResult = rateLimit(ip, 'general');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validationResult = emailHashSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid email hash format' },
        { status: 400 }
      );
    }

    const { emailHash } = validationResult.data;

    // Check if Supabase is configured
    if (!isServiceRoleConfigured) {
      // Demo mode - always allow
      console.log('Demo mode: Email hash verification', { emailHash: emailHash.substring(0, 16) + '...' });
      return NextResponse.json(
        { valid: true, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { valid: true, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Check if this email hash already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: checkError } = await (supabase as any)
      .from('email_hashes')
      .select('id')
      .eq('email_hash', emailHash)
      .maybeSingle();

    if (checkError) {
      console.error('Email hash check error:', checkError);
      // Don't block on error - allow submission
      return NextResponse.json(
        { valid: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    if (existing) {
      // Email already used
      return NextResponse.json(
        {
          error: 'This email has already been used to complete the survey.',
          code: 'EMAIL_ALREADY_USED'
        },
        { status: 409, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Email hash is valid and not used - return success
    // The actual storage happens when survey is submitted
    return NextResponse.json(
      { valid: true },
      { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
