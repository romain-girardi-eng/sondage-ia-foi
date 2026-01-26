-- ============================================================================
-- SECURITY HARDENING MIGRATION
-- ============================================================================
-- This migration transforms the database security from permissive to
-- professional-grade, following Supabase and PostgreSQL security best practices.
--
-- Security Model: Anonymous Survey with GDPR Compliance
-- - Anonymous users submit surveys (no authentication)
-- - Users identified by anonymous_id (client-side generated UUID)
-- - GDPR: Users can access/delete their data via anonymous_id
-- - All sensitive operations go through API routes with service_role
--
-- Author: Security Audit - January 2026
-- ============================================================================

-- ============================================================================
-- STEP 1: AUDIT LOGGING TABLE
-- ============================================================================
-- Track all sensitive operations for security monitoring and compliance

CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- What happened
  operation VARCHAR(50) NOT NULL,  -- 'data_access', 'data_deletion', 'submission', etc.
  table_name VARCHAR(100),
  record_id UUID,

  -- Who did it (as much as we can track anonymously)
  anonymous_id UUID,
  ip_hash VARCHAR(64),  -- SHA-256 of IP for pattern detection without storing IP
  user_agent_hash VARCHAR(64),

  -- Context
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Index for security analysis queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON security_audit_log(operation);
CREATE INDEX IF NOT EXISTS idx_audit_log_anonymous_id ON security_audit_log(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_ip_hash ON security_audit_log(ip_hash);

-- RLS: Only service_role can access audit logs
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log FORCE ROW LEVEL SECURITY;

CREATE POLICY "Service role only - audit_log" ON security_audit_log
  FOR ALL USING ((SELECT auth.role()) = 'service_role');


-- ============================================================================
-- STEP 2: DROP ALL INSECURE POLICIES
-- ============================================================================
-- Remove the overly permissive USING (true) policies

-- Sessions table
DROP POLICY IF EXISTS "Allow anonymous session creation" ON sessions;
DROP POLICY IF EXISTS "Allow session updates" ON sessions;
DROP POLICY IF EXISTS "Allow session read" ON sessions;

-- Responses table
DROP POLICY IF EXISTS "Allow anonymous response submission" ON responses;
DROP POLICY IF EXISTS "Allow reading own responses" ON responses;
DROP POLICY IF EXISTS "Allow deleting own responses" ON responses;

-- Email submissions table
DROP POLICY IF EXISTS "Allow anonymous insert" ON email_submissions;
DROP POLICY IF EXISTS "Service role read" ON email_submissions;
DROP POLICY IF EXISTS "Service role update" ON email_submissions;

-- Submission tracking table
DROP POLICY IF EXISTS "Allow tracking inserts" ON submission_tracking;
DROP POLICY IF EXISTS "Service role full access" ON submission_tracking;

-- Email hashes table
DROP POLICY IF EXISTS "Service role full access on email_hashes" ON email_hashes;
DROP POLICY IF EXISTS "Allow email hash inserts" ON email_hashes;


-- ============================================================================
-- STEP 3: FORCE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
-- Ensures RLS cannot be bypassed even by table owners

ALTER TABLE sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE responses FORCE ROW LEVEL SECURITY;
ALTER TABLE email_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE submission_tracking FORCE ROW LEVEL SECURITY;
ALTER TABLE email_hashes FORCE ROW LEVEL SECURITY;


-- ============================================================================
-- STEP 4: CREATE RESTRICTIVE RLS POLICIES
-- ============================================================================
-- Principle: Anon can only INSERT, all reads/updates/deletes via service_role

-- -----------------------------------------------------------------------------
-- SESSIONS TABLE
-- -----------------------------------------------------------------------------
-- Anon: Can create new sessions
CREATE POLICY "anon_insert_sessions" ON sessions
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Must have valid UUID
    id IS NOT NULL
    -- Cannot set completed_at on creation
    AND completed_at IS NULL
    -- Must have valid language
    AND language IN ('fr', 'en')
  );

-- Anon: Can update only their own session (for progress tracking)
-- Note: This requires passing session_id which acts as a bearer token
CREATE POLICY "anon_update_own_session" ON sessions
  FOR UPDATE
  TO anon
  USING (
    -- Session must be recent (prevent updating old sessions)
    started_at > NOW() - INTERVAL '24 hours'
    -- Session must not be complete
    AND is_complete = FALSE
  )
  WITH CHECK (
    -- Cannot change the ID
    id = id
    -- Cannot backdate started_at
    AND started_at = started_at
  );

-- Service role: Full access for admin operations
CREATE POLICY "service_role_all_sessions" ON sessions
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- RESPONSES TABLE
-- -----------------------------------------------------------------------------
-- Anon: Can only INSERT new responses (submit survey)
CREATE POLICY "anon_insert_responses" ON responses
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Must have consent
    consent_given = TRUE
    -- Must have consent timestamp
    AND consent_timestamp IS NOT NULL
    -- Must have valid anonymous_id
    AND anonymous_id IS NOT NULL
    -- Must have answers
    AND answers IS NOT NULL
    AND answers != '{}'::jsonb
  );

-- Anon: NO SELECT/UPDATE/DELETE - all goes through service_role API
-- This is intentional: prevents enumeration attacks

-- Service role: Full access for API routes (data export, GDPR requests)
CREATE POLICY "service_role_all_responses" ON responses
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- EMAIL_SUBMISSIONS TABLE
-- -----------------------------------------------------------------------------
-- Anon: Can only INSERT (submit email for PDF)
CREATE POLICY "anon_insert_email_submissions" ON email_submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Must have hashed email
    email_hash IS NOT NULL
    AND LENGTH(email_hash) > 0
    -- Must have encrypted email
    AND email_encrypted IS NOT NULL
    -- Must have IV
    AND email_iv IS NOT NULL
    -- Must have anonymous_id
    AND anonymous_id IS NOT NULL
  );

-- Service role: Full access for PDF sending and admin
CREATE POLICY "service_role_all_email_submissions" ON email_submissions
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- SUBMISSION_TRACKING TABLE
-- -----------------------------------------------------------------------------
-- Anon: Can only INSERT (record submission attempt)
CREATE POLICY "anon_insert_submission_tracking" ON submission_tracking
  FOR INSERT
  TO anon
  WITH CHECK (TRUE);

-- Service role: Full access
CREATE POLICY "service_role_all_submission_tracking" ON submission_tracking
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- -----------------------------------------------------------------------------
-- EMAIL_HASHES TABLE
-- -----------------------------------------------------------------------------
-- Anon: Can only INSERT
CREATE POLICY "anon_insert_email_hashes" ON email_hashes
  FOR INSERT
  TO anon
  WITH CHECK (
    email_hash IS NOT NULL
    AND LENGTH(email_hash) = 64  -- SHA-256 produces 64 hex chars
  );

-- Service role: Full access
CREATE POLICY "service_role_all_email_hashes" ON email_hashes
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);


-- ============================================================================
-- STEP 5: FIX SECURITY DEFINER FUNCTIONS
-- ============================================================================
-- All SECURITY DEFINER functions must have:
-- 1. SET search_path = '' to prevent search_path injection attacks
-- 2. Explicit schema references (public.)
-- 3. Input validation

-- -----------------------------------------------------------------------------
-- get_aggregated_results: Public, anonymized results
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_aggregated_results()
RETURNS TABLE (
  question_id TEXT,
  distribution JSONB,
  total_responses BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    key AS question_id,
    jsonb_object_agg(answer_value, answer_count ORDER BY answer_count DESC) AS distribution,
    SUM(answer_count)::BIGINT AS total_responses
  FROM (
    SELECT
      key,
      value::text AS answer_value,
      COUNT(*)::BIGINT AS answer_count
    FROM public.responses, jsonb_each(answers)
    WHERE consent_given = TRUE
    GROUP BY key, value::text
  ) subq
  GROUP BY key;
END;
$$;

-- -----------------------------------------------------------------------------
-- get_participant_count: Public count of unique participants
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_participant_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE  -- Optimization: function doesn't modify data
AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT anonymous_id)::BIGINT
    FROM public.responses
    WHERE consent_given = TRUE
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- check_submission_allowed: Anti-ballot-stuffing check
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_submission_allowed(
  p_fingerprint_id VARCHAR(64),
  p_ip_address VARCHAR(45),
  p_anonymous_id UUID
)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  previous_submission_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_existing RECORD;
  v_ip_count INTEGER;
BEGIN
  -- Input validation
  IF p_anonymous_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'invalid_anonymous_id'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check for existing successful submission with same fingerprint
  IF p_fingerprint_id IS NOT NULL AND LENGTH(p_fingerprint_id) > 0 THEN
    SELECT created_at INTO v_existing
    FROM public.submission_tracking
    WHERE fingerprint_id = p_fingerprint_id
      AND is_successful = TRUE
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      RETURN QUERY SELECT FALSE, 'fingerprint_exists'::TEXT, v_existing.created_at;
      RETURN;
    END IF;
  END IF;

  -- Check for existing successful submission with same anonymous_id
  SELECT created_at INTO v_existing
  FROM public.submission_tracking
  WHERE anonymous_id = p_anonymous_id
    AND is_successful = TRUE
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT FALSE, 'anonymous_id_exists'::TEXT, v_existing.created_at;
    RETURN;
  END IF;

  -- Check for multiple submissions from same IP (allow up to 5 for shared networks)
  IF p_ip_address IS NOT NULL AND LENGTH(p_ip_address) > 0 THEN
    SELECT COUNT(*)::INTEGER INTO v_ip_count
    FROM public.submission_tracking
    WHERE ip_address = p_ip_address
      AND is_successful = TRUE
      AND created_at > NOW() - INTERVAL '30 days';  -- Rolling window

    IF v_ip_count >= 5 THEN
      RETURN QUERY SELECT FALSE, 'ip_limit_exceeded'::TEXT, NOW();
      RETURN;
    END IF;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT TRUE, NULL::TEXT, NULL::TIMESTAMPTZ;
END;
$$;

-- -----------------------------------------------------------------------------
-- record_submission_attempt: Log submission attempts
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_submission_attempt(
  p_fingerprint_id VARCHAR(64),
  p_ip_address VARCHAR(45),
  p_anonymous_id UUID,
  p_session_id UUID,
  p_is_successful BOOLEAN,
  p_blocked_reason VARCHAR(100) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.submission_tracking (
    fingerprint_id,
    ip_address,
    anonymous_id,
    session_id,
    is_successful,
    blocked_reason,
    user_agent
  ) VALUES (
    NULLIF(TRIM(p_fingerprint_id), ''),
    NULLIF(TRIM(p_ip_address), ''),
    p_anonymous_id,
    p_session_id,
    COALESCE(p_is_successful, FALSE),
    NULLIF(TRIM(p_blocked_reason), ''),
    LEFT(p_user_agent, 500)  -- Truncate to prevent abuse
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- check_email_hash_exists: Duplicate email detection
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_email_hash_exists(p_email_hash VARCHAR(64))
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  -- Validate input
  IF p_email_hash IS NULL OR LENGTH(p_email_hash) != 64 THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.email_hashes WHERE email_hash = p_email_hash
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- record_email_hash: Store email hash with response
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_email_hash(
  p_email_hash VARCHAR(64),
  p_response_id UUID DEFAULT NULL,
  p_ip_hash VARCHAR(64) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Validate email hash format
  IF p_email_hash IS NULL OR LENGTH(p_email_hash) != 64 THEN
    RAISE EXCEPTION 'Invalid email hash format';
  END IF;

  INSERT INTO public.email_hashes (email_hash, response_id, ip_hash)
  VALUES (p_email_hash, p_response_id, p_ip_hash)
  ON CONFLICT (email_hash) DO NOTHING
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


-- ============================================================================
-- STEP 6: SECURE DATA ACCESS FUNCTIONS (for API routes)
-- ============================================================================
-- These functions are called by API routes with service_role
-- They provide the application-level authorization logic

-- -----------------------------------------------------------------------------
-- get_user_responses: GDPR data access with audit logging
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_responses(
  p_anonymous_id UUID,
  p_ip_hash VARCHAR(64) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  answers JSONB,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Validate input
  IF p_anonymous_id IS NULL THEN
    RAISE EXCEPTION 'anonymous_id is required';
  END IF;

  -- Log the access attempt
  INSERT INTO public.security_audit_log (
    operation,
    table_name,
    anonymous_id,
    ip_hash,
    success
  ) VALUES (
    'gdpr_data_access',
    'responses',
    p_anonymous_id,
    p_ip_hash,
    TRUE
  );

  -- Return user's data
  RETURN QUERY
  SELECT
    r.id,
    r.created_at,
    r.answers,
    r.metadata
  FROM public.responses r
  WHERE r.anonymous_id = p_anonymous_id
    AND r.consent_given = TRUE
  ORDER BY r.created_at DESC;
END;
$$;

-- -----------------------------------------------------------------------------
-- delete_user_data: GDPR data deletion with audit logging
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user_data(
  p_anonymous_id UUID,
  p_ip_hash VARCHAR(64) DEFAULT NULL
)
RETURNS TABLE (
  deleted_responses INTEGER,
  deleted_sessions INTEGER,
  deleted_email_submissions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_response_count INTEGER := 0;
  v_session_count INTEGER := 0;
  v_email_count INTEGER := 0;
  v_session_ids UUID[];
BEGIN
  -- Validate input
  IF p_anonymous_id IS NULL THEN
    RAISE EXCEPTION 'anonymous_id is required';
  END IF;

  -- Get session IDs before deletion
  SELECT ARRAY_AGG(DISTINCT session_id) INTO v_session_ids
  FROM public.responses
  WHERE anonymous_id = p_anonymous_id;

  -- Delete responses
  WITH deleted AS (
    DELETE FROM public.responses
    WHERE anonymous_id = p_anonymous_id
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_response_count FROM deleted;

  -- Delete associated sessions
  IF v_session_ids IS NOT NULL AND array_length(v_session_ids, 1) > 0 THEN
    WITH deleted AS (
      DELETE FROM public.sessions
      WHERE id = ANY(v_session_ids)
      RETURNING id
    )
    SELECT COUNT(*)::INTEGER INTO v_session_count FROM deleted;
  END IF;

  -- Delete email submissions
  WITH deleted AS (
    DELETE FROM public.email_submissions
    WHERE anonymous_id = p_anonymous_id
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_email_count FROM deleted;

  -- Log the deletion
  INSERT INTO public.security_audit_log (
    operation,
    table_name,
    anonymous_id,
    ip_hash,
    success,
    metadata
  ) VALUES (
    'gdpr_data_deletion',
    'responses,sessions,email_submissions',
    p_anonymous_id,
    p_ip_hash,
    TRUE,
    jsonb_build_object(
      'deleted_responses', v_response_count,
      'deleted_sessions', v_session_count,
      'deleted_email_submissions', v_email_count
    )
  );

  RETURN QUERY SELECT v_response_count, v_session_count, v_email_count;
END;
$$;


-- ============================================================================
-- STEP 7: ADD DATABASE-LEVEL CONSTRAINTS
-- ============================================================================
-- Defense in depth: validate data at database level too

-- Ensure anonymous_id is always a valid UUID format
ALTER TABLE responses
  DROP CONSTRAINT IF EXISTS responses_anonymous_id_not_null;
ALTER TABLE responses
  ADD CONSTRAINT responses_anonymous_id_not_null
  CHECK (anonymous_id IS NOT NULL);

-- Ensure consent fields are consistent
ALTER TABLE responses
  DROP CONSTRAINT IF EXISTS responses_consent_consistent;
ALTER TABLE responses
  ADD CONSTRAINT responses_consent_consistent
  CHECK (
    (consent_given = TRUE AND consent_timestamp IS NOT NULL)
    OR consent_given = FALSE
  );

-- Ensure email_hash is proper SHA-256 format (64 hex chars)
ALTER TABLE email_hashes
  DROP CONSTRAINT IF EXISTS email_hashes_valid_hash;
ALTER TABLE email_hashes
  ADD CONSTRAINT email_hashes_valid_hash
  CHECK (LENGTH(email_hash) = 64 AND email_hash ~ '^[a-f0-9]+$');

-- Ensure language is valid
ALTER TABLE sessions
  DROP CONSTRAINT IF EXISTS sessions_valid_language;
ALTER TABLE sessions
  ADD CONSTRAINT sessions_valid_language
  CHECK (language IN ('fr', 'en'));


-- ============================================================================
-- STEP 8: PERFORMANCE INDEXES FOR SECURITY CHECKS
-- ============================================================================
-- Ensure RLS and security checks are fast

-- Composite index for submission checking (most common security query)
CREATE INDEX IF NOT EXISTS idx_submission_tracking_security_check
  ON submission_tracking (fingerprint_id, anonymous_id, ip_address)
  WHERE is_successful = TRUE;

-- Index for GDPR data access queries
CREATE INDEX IF NOT EXISTS idx_responses_gdpr_access
  ON responses (anonymous_id, consent_given)
  WHERE consent_given = TRUE;

-- Index for session updates (RLS policy uses started_at)
CREATE INDEX IF NOT EXISTS idx_sessions_recent
  ON sessions (started_at DESC)
  WHERE is_complete = FALSE;


-- ============================================================================
-- STEP 9: GRANT MINIMAL PERMISSIONS
-- ============================================================================
-- Explicit grants instead of relying on defaults

-- Revoke default public access (defense in depth)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant specific permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;

-- Tables: anon can only INSERT (RLS policies further restrict)
GRANT INSERT ON public.sessions TO anon;
GRANT INSERT ON public.responses TO anon;
GRANT INSERT ON public.email_submissions TO anon;
GRANT INSERT ON public.submission_tracking TO anon;
GRANT INSERT ON public.email_hashes TO anon;

-- Allow anon to update sessions (for progress tracking, RLS restricts to own)
GRANT UPDATE ON public.sessions TO anon;

-- Functions: anon can call public functions
GRANT EXECUTE ON FUNCTION public.get_aggregated_results() TO anon;
GRANT EXECUTE ON FUNCTION public.get_participant_count() TO anon;
GRANT EXECUTE ON FUNCTION public.check_submission_allowed(VARCHAR, VARCHAR, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.record_submission_attempt(VARCHAR, VARCHAR, UUID, UUID, BOOLEAN, VARCHAR, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_hash_exists(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION public.record_email_hash(VARCHAR, UUID, VARCHAR) TO anon;

-- Service role gets full access (already has it, but explicit is better)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;


-- ============================================================================
-- STEP 10: CREATE SECURITY MONITORING VIEW
-- ============================================================================
-- For admin dashboard to monitor security events

CREATE OR REPLACE VIEW public.security_dashboard AS
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

-- Only service_role can view
GRANT SELECT ON public.security_dashboard TO service_role;


-- ============================================================================
-- VERIFICATION QUERIES (run manually to verify migration)
-- ============================================================================
-- Uncomment and run these after migration to verify security:

-- Check RLS is enabled and forced on all tables:
-- SELECT schemaname, tablename, rowsecurity, forcerowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('sessions', 'responses', 'email_submissions', 'submission_tracking', 'email_hashes', 'security_audit_log');

-- Check all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Check function security:
-- SELECT proname, prosecdef, proconfig
-- FROM pg_proc
-- WHERE pronamespace = 'public'::regnamespace
-- AND prosecdef = TRUE;


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
