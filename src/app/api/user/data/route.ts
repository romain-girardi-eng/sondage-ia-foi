import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { userDataSchema } from '@/lib/validation';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { validateCSRF, csrfErrorResponse } from '@/lib/csrf';
import { createHash } from 'crypto';
import type { Json } from '@/lib/supabase/types';

// Response types for RPC functions
interface UserResponseData {
  id: string;
  created_at: string;
  answers: Json;
  metadata: Json;
}

interface DeleteUserDataResult {
  deleted_responses: number;
  deleted_sessions: number;
  deleted_email_submissions: number;
}

// Hash IP for audit logging (privacy-preserving)
function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_HASH_SALT || 'default-salt')).digest('hex');
}

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

    // Check if Supabase is configured (requires service role for GDPR operations)
    if (!isServiceRoleConfigured) {
      return NextResponse.json(
        { data: [], demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { data: [], demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Use secure RPC function with audit logging
    const ipHash = hashIP(ip);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('get_user_responses', {
      p_anonymous_id: anonymousId,
      p_ip_hash: ipHash,
    }) as { data: UserResponseData[] | null; error: Error | null };

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
    // Validate CSRF token for destructive operations
    const csrfResult = await validateCSRF(request);
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error || 'Invalid CSRF token');
    }

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

    // Check if Supabase is configured (requires service role for GDPR operations)
    if (!isServiceRoleConfigured) {
      return NextResponse.json(
        { success: true, deletedCount: 0, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { success: true, deletedCount: 0, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Use secure RPC function with audit logging
    const ipHash = hashIP(ip);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('delete_user_data', {
      p_anonymous_id: anonymousId,
      p_ip_hash: ipHash,
    }) as { data: DeleteUserDataResult[] | null; error: Error | null };

    if (error) {
      console.error('User data deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete data' },
        { status: 500 }
      );
    }

    const result = data?.[0] || { deleted_responses: 0, deleted_sessions: 0, deleted_email_submissions: 0 };

    return NextResponse.json(
      {
        success: true,
        deletedCount: result.deleted_responses,
        details: {
          responses: result.deleted_responses,
          sessions: result.deleted_sessions,
          emailSubmissions: result.deleted_email_submissions,
        },
      },
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
