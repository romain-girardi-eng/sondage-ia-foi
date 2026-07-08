import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { userDataSchema } from '@/lib/validation';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { validateCSRF, csrfErrorResponse } from '@/lib/csrf';
import { getHashedClientIp } from '@/lib/security/clientIp';
import type { Json } from '@/lib/supabase/types';

interface DeleteUserDataResult {
  deleted_responses: number;
  deleted_sessions: number;
  deleted_email_submissions: number;
  deleted_submission_tracking: number;
  deleted_email_hashes: number;
  anonymized_audit_log: number;
}

// POST: Export user's own data (GDPR right to access).
// This is a POST with the anonymous ID in the JSON body rather than a GET
// with it in the query string, so the identifier never ends up in server or
// proxy access logs.
export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token: this is a mutating-verb (POST) request, and
    // consistent with the DELETE handler below.
    const csrfResult = await validateCSRF(request);
    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error || 'Invalid CSRF token');
    }

    const ipHash = await getHashedClientIp(request);
    const rateLimitResult = rateLimit(`user-data:${ipHash}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const validationResult = userDataSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Invalid user data export request:', validationResult.error.issues);
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { anonymousId } = validationResult.data;

    // Check if Supabase is configured (requires service role for GDPR operations)
    if (!isServiceRoleConfigured) {
      return NextResponse.json(
        { data: null, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { data: null, demo: true },
        { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Use secure RPC function with audit logging. Returns the full set of
    // personal data held (responses, sessions, email_submissions metadata,
    // submission_tracking, email_hashes existence, security_audit_log) — not
    // just responses.
    const { data, error } = await supabase.rpc('export_user_data', {
      p_anonymous_id: anonymousId,
      p_ip_hash: ipHash,
    });

    if (error) {
      console.error('User data export error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve data' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: (data ?? null) as Json | null },
      { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('User data export error:', error);
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

    const ipHash = await getHashedClientIp(request);
    const rateLimitResult = rateLimit(`user-delete:${ipHash}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const validationResult = userDataSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Invalid user data deletion request:', validationResult.error.issues);
      return NextResponse.json(
        { error: 'Invalid request data' },
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

    // Use secure RPC function with audit logging. Also covers
    // submission_tracking and email_hashes, and anonymizes (rather than
    // deletes) the user's security_audit_log entries.
    const { data, error } = await supabase.rpc('delete_user_data', {
      p_anonymous_id: anonymousId,
      p_ip_hash: ipHash,
    });

    if (error) {
      console.error('User data deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete data' },
        { status: 500 }
      );
    }

    const result: DeleteUserDataResult = data?.[0] || {
      deleted_responses: 0,
      deleted_sessions: 0,
      deleted_email_submissions: 0,
      deleted_submission_tracking: 0,
      deleted_email_hashes: 0,
      anonymized_audit_log: 0,
    };

    return NextResponse.json(
      {
        success: true,
        deletedCount: result.deleted_responses,
        details: {
          responses: result.deleted_responses,
          sessions: result.deleted_sessions,
          emailSubmissions: result.deleted_email_submissions,
          submissionTracking: result.deleted_submission_tracking,
          emailHashes: result.deleted_email_hashes,
          anonymizedAuditLog: result.anonymized_audit_log,
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
