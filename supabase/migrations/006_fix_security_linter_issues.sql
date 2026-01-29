-- ============================================================================
-- SECURITY FIX MIGRATION - Linter Issues
-- ============================================================================
-- Fixes 3 security issues identified by Supabase database linter:
-- 1. RLS disabled on email_submissions table (policies exist but RLS not enabled)
-- 2. admin_stats view uses SECURITY DEFINER (bypasses RLS)
-- 3. security_dashboard view uses SECURITY DEFINER (bypasses RLS)
--
-- Date: January 2025
-- ============================================================================

-- ============================================================================
-- FIX 1: Enable RLS on email_submissions table
-- ============================================================================
-- The table has policies but RLS was not enabled, making the policies useless

ALTER TABLE public.email_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_submissions FORCE ROW LEVEL SECURITY;


-- ============================================================================
-- FIX 2: Recreate admin_stats view with SECURITY INVOKER
-- ============================================================================
-- SECURITY DEFINER views bypass RLS and run with creator's permissions
-- SECURITY INVOKER (default in PG15+, explicit here) respects caller's permissions

DROP VIEW IF EXISTS public.admin_stats;

CREATE VIEW public.admin_stats
WITH (security_invoker = true)
AS
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS responses_count,
  COUNT(DISTINCT anonymous_id) AS unique_participants,
  AVG(EXTRACT(EPOCH FROM (
    (metadata->>'completedAt')::TIMESTAMPTZ -
    (SELECT started_at FROM sessions WHERE id = responses.session_id)
  ))) AS avg_completion_time_seconds
FROM responses
WHERE consent_given = true
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Only service_role should access admin stats
REVOKE ALL ON public.admin_stats FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.admin_stats TO service_role;


-- ============================================================================
-- FIX 3: Recreate security_dashboard view with SECURITY INVOKER
-- ============================================================================

DROP VIEW IF EXISTS public.security_dashboard;

CREATE VIEW public.security_dashboard
WITH (security_invoker = true)
AS
SELECT
  DATE_TRUNC('hour', created_at) AS hour,
  operation,
  COUNT(*) AS event_count,
  COUNT(DISTINCT anonymous_id) AS unique_users,
  COUNT(DISTINCT ip_hash) AS unique_ips,
  SUM(CASE WHEN success THEN 0 ELSE 1 END) AS failure_count
FROM public.security_audit_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), operation
ORDER BY hour DESC, operation;

-- Only service_role should access security dashboard
REVOKE ALL ON public.security_dashboard FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.security_dashboard TO service_role;


-- ============================================================================
-- FIX 4: Fix security_audit_log policy targeting wrong role
-- ============================================================================
-- Original policy targeted 'public' role instead of 'service_role'

DROP POLICY IF EXISTS "Service role only - audit_log" ON public.security_audit_log;

CREATE POLICY "service_role_all_audit_log" ON public.security_audit_log
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);


-- ============================================================================
-- FIX 5: Add validation to submission_tracking INSERT policy
-- ============================================================================
-- Original policy was WITH CHECK (true) - too permissive

DROP POLICY IF EXISTS "anon_insert_submission_tracking" ON public.submission_tracking;

CREATE POLICY "anon_insert_submission_tracking" ON public.submission_tracking
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Must have at least one identifier
    (fingerprint_id IS NOT NULL AND LENGTH(fingerprint_id) > 0)
    OR (anonymous_id IS NOT NULL)
    OR (ip_address IS NOT NULL AND LENGTH(ip_address) > 0)
  );


-- ============================================================================
-- VERIFICATION QUERIES (run after migration to confirm fixes)
-- ============================================================================
-- Check RLS is enabled:
-- SELECT tablename, rowsecurity, forcerowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND tablename = 'email_submissions';

-- Check views are SECURITY INVOKER (security_invoker should be true or null for invoker):
-- SELECT viewname,
--        (SELECT option_value FROM pg_options_to_table(reloptions) WHERE option_name = 'security_invoker') as security_invoker
-- FROM pg_views v
-- JOIN pg_class c ON c.relname = v.viewname
-- WHERE schemaname = 'public' AND viewname IN ('admin_stats', 'security_dashboard');
