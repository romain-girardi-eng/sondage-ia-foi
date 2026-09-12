import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';

interface PurgeResult {
  purged_sessions: number;
  purged_submission_tracking: number;
  purged_audit_log: number;
}

interface AttritionSnapshotResult {
  snapshot_rows: number;
  archived_sessions: number;
}

// Constant-time comparison against CRON_SECRET. Fails closed: if the secret
// is not configured, no request is ever authorized (this is a data-purge
// endpoint, not something that should have a permissive fallback).
function isAuthorized(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const provided = authHeader.slice(7);
  try {
    const providedBuf = Buffer.from(provided);
    const secretBuf = Buffer.from(secret);
    if (providedBuf.length !== secretBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(providedBuf, secretBuf);
  } catch {
    return false;
  }
}

// Daily retention purge (see vercel.json cron schedule). Enforces the
// retention limits promised by the privacy policy: abandoned sessions,
// stale submission_tracking rows, and old security_audit_log entries.
// Never touches responses or email_submissions (research data, retained
// under consent, not this operational-metadata window). All counts and the
// purge event itself are also logged to security_audit_log by
// purge_expired_data() at the database level.
export async function GET(request: NextRequest) {
  if (!isAuthorized(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isServiceRoleConfigured) {
    return NextResponse.json(
      { error: 'Service role not configured' },
      { status: 500 }
    );
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Service role not configured' },
      { status: 500 }
    );
  }

  // Archive the anonymised drop-off table BEFORE anything is deleted
  // (migration 012): once the sessions are purged, the attrition analysis
  // promised by the pre-registration has no input left. A failure here must
  // not skip the purge, which enforces the retention promise.
  const { data: snapshotData, error: snapshotError } = await supabase.rpc('snapshot_attrition');

  if (snapshotError) {
    console.error('Attrition snapshot error:', snapshotError);
  }

  const snapshot: AttritionSnapshotResult = snapshotData?.[0] || {
    snapshot_rows: 0,
    archived_sessions: 0,
  };

  const { data, error } = await supabase.rpc('purge_expired_data');

  if (error) {
    console.error('Retention purge error:', error);
    return NextResponse.json({ error: 'Purge failed' }, { status: 500 });
  }

  const result: PurgeResult = data?.[0] || {
    purged_sessions: 0,
    purged_submission_tracking: 0,
    purged_audit_log: 0,
  };

  return NextResponse.json({
    success: true,
    attritionSnapshot: {
      rows: snapshot.snapshot_rows,
      archivedSessions: snapshot.archived_sessions,
      failed: Boolean(snapshotError),
    },
    purged: {
      sessions: result.purged_sessions,
      submissionTracking: result.purged_submission_tracking,
      auditLog: result.purged_audit_log,
    },
  });
}
