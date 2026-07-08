-- ============================================================================
-- GDPR COMPLIANCE MIGRATION
-- ============================================================================
-- Closes gaps between the published privacy policy and the actual data
-- layer:
--   1. submission_tracking.ip_address moves from a raw IP to an HMAC-SHA256
--      hash (the app now hashes client IPs before they ever reach Postgres;
--      see src/lib/security/clientIp.ts). Widening the column is metadata-only
--      and non-destructive.
--   2. delete_user_data (Art. 17 erasure) is extended to also cover
--      submission_tracking, email_hashes, and security_audit_log, which the
--      original (005) version missed entirely.
--   3. export_user_data (Art. 15 access) is added: the previous
--      get_user_responses only returned `responses`, not the full set of
--      personal data actually held. get_user_responses is left in place
--      (unused by the app going forward, but not dropped) in case other
--      tooling still calls it.
--   4. get_session_partial is added so the survey-resume GET path can read
--      an in-progress session under RLS-hardened `sessions` (migration 005
--      revoked anon SELECT on sessions, breaking the anon-client read).
--   5. purge_expired_data implements the retention limits the privacy policy
--      promises but that were never enforced anywhere.
--
-- Note on function replacement: CREATE OR REPLACE FUNCTION cannot change the
-- shape of RETURNS TABLE(...). Where the return columns change (delete_user_data)
-- this migration DROPs the old function signature first. This is a DDL-only
-- operation — no rows are touched.
--
-- NOTHING in this migration deletes or mutates existing rows. See the single
-- commented-out legacy-data cleanup statement near the end, left disabled for
-- the maintainer to run manually and deliberately.
-- ============================================================================

-- ============================================================================
-- STEP 1: WIDEN submission_tracking.ip_address FOR HASHED VALUES
-- ============================================================================
-- HMAC-SHA256 hex digests are 64 characters; the previous VARCHAR(45) was
-- sized for raw IPv6 addresses. Widening a VARCHAR is a metadata-only change
-- in Postgres (no table rewrite, no data loss).

-- The anon INSERT policy (006) references ip_address in its WITH CHECK, and
-- Postgres refuses to alter a column type used in a policy definition. Drop
-- it, widen the column, then recreate it with the exact 006 definition.

DROP POLICY IF EXISTS "anon_insert_submission_tracking" ON public.submission_tracking;

ALTER TABLE public.submission_tracking
  ALTER COLUMN ip_address TYPE VARCHAR(64);

CREATE POLICY "anon_insert_submission_tracking" ON public.submission_tracking
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Must have at least one identifier
    (fingerprint_id IS NOT NULL AND LENGTH(fingerprint_id) > 0)
    OR (anonymous_id IS NOT NULL)
    OR (ip_address IS NOT NULL AND LENGTH(ip_address) > 0)
  );

-- -----------------------------------------------------------------------------
-- check_submission_allowed / record_submission_attempt: match declared param
-- length to the widened column. Postgres does not actually enforce/participate
-- in overload resolution on VARCHAR(n) length modifiers for function
-- parameters, so this CREATE OR REPLACE keeps the existing signature (and its
-- existing grants to `anon` from migration 005) intact — only the body's
-- documented intent changes: p_ip_address is now expected to be a hash, not
-- a raw address.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_submission_allowed(
  p_fingerprint_id VARCHAR(64),
  p_ip_address VARCHAR(64),
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

  -- Check for multiple submissions from the same (hashed) IP (allow up to 5
  -- for shared networks). Equality-based dedup keeps working unchanged on
  -- hashes since two equal IPs always hash to the same value.
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

CREATE OR REPLACE FUNCTION public.record_submission_attempt(
  p_fingerprint_id VARCHAR(64),
  p_ip_address VARCHAR(64),
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
    LEFT(p_user_agent, 500)  -- Truncate to prevent abuse; app no longer sends raw UA
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- MAINTAINER-ONLY, OPT-IN LEGACY DATA CLEANUP (left disabled by default)
-- -----------------------------------------------------------------------------
-- Rows written before this migration may still hold a raw (unhashed) IP
-- address in submission_tracking.ip_address. Hashed values are always exactly
-- 64 hex characters; legacy raw IPv4/IPv6 addresses are not. Once the
-- deployed app is confirmed to only ever send hashed IPs (i.e. after this
-- migration and the corresponding app deploy have both shipped), a maintainer
-- may run the statement below by hand to scrub the legacy raw values. This is
-- intentionally NOT executed by the migration itself.
--
-- UPDATE public.submission_tracking
-- SET ip_address = NULL
-- WHERE ip_address IS NOT NULL
--   AND (LENGTH(ip_address) <> 64 OR ip_address !~ '^[a-f0-9]+$');


-- ============================================================================
-- STEP 2: delete_user_data v2 — full Art. 17 erasure coverage
-- ============================================================================
-- v1 (005) only deleted responses/sessions/email_submissions. This version
-- additionally covers submission_tracking and email_hashes, and anonymizes
-- (rather than deletes) the user's security_audit_log entries — erasing the
-- identifying link while keeping the audit trail's shape intact.
--
-- Linkage found by inspecting 003/004/005:
--   - submission_tracking has its own `anonymous_id` column (direct link) and
--     a `session_id` FK to sessions (secondary link, for tracking rows
--     recorded before/without an anonymous_id).
--   - email_hashes has no anonymous_id column at all; it links via
--     `response_id` (FK to responses) and, independently, its `email_hash`
--     value matches email_submissions.email_hash for the same user. Both
--     linkages are captured BEFORE responses/email_submissions are deleted,
--     since responses.session_id ... ON DELETE CASCADE and
--     email_hashes.response_id ... ON DELETE SET NULL would otherwise erase
--     the linkage before we can use it.
--
-- Changing the RETURNS TABLE shape requires dropping the old function first;
-- this is DDL only, no data is touched.
-- ============================================================================

DROP FUNCTION IF EXISTS public.delete_user_data(UUID, VARCHAR);

CREATE FUNCTION public.delete_user_data(
  p_anonymous_id UUID,
  p_ip_hash VARCHAR(64) DEFAULT NULL
)
RETURNS TABLE (
  deleted_responses INTEGER,
  deleted_sessions INTEGER,
  deleted_email_submissions INTEGER,
  deleted_submission_tracking INTEGER,
  deleted_email_hashes INTEGER,
  anonymized_audit_log INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_response_count INTEGER := 0;
  v_session_count INTEGER := 0;
  v_email_count INTEGER := 0;
  v_tracking_count INTEGER := 0;
  v_hash_count INTEGER := 0;
  v_audit_count INTEGER := 0;
  v_session_ids UUID[];
  v_response_ids UUID[];
  v_email_hash_values TEXT[];
BEGIN
  -- Validate input
  IF p_anonymous_id IS NULL THEN
    RAISE EXCEPTION 'anonymous_id is required';
  END IF;

  -- Capture all linkage BEFORE deleting anything.
  SELECT ARRAY_AGG(DISTINCT session_id) INTO v_session_ids
  FROM public.responses
  WHERE anonymous_id = p_anonymous_id;

  SELECT ARRAY_AGG(id) INTO v_response_ids
  FROM public.responses
  WHERE anonymous_id = p_anonymous_id;

  SELECT ARRAY_AGG(DISTINCT email_hash) INTO v_email_hash_values
  FROM public.email_submissions
  WHERE anonymous_id = p_anonymous_id;

  -- Delete email_hashes linked via response_id or via the raw hash value from
  -- this user's email_submissions rows (captured above, before those rows die).
  WITH deleted AS (
    DELETE FROM public.email_hashes
    WHERE (v_response_ids IS NOT NULL AND response_id = ANY(v_response_ids))
       OR (v_email_hash_values IS NOT NULL AND email_hash = ANY(v_email_hash_values))
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_hash_count FROM deleted;

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

  -- Delete submission_tracking rows, linked directly by anonymous_id or via
  -- the user's session ids.
  WITH deleted AS (
    DELETE FROM public.submission_tracking
    WHERE anonymous_id = p_anonymous_id
       OR (v_session_ids IS NOT NULL AND session_id = ANY(v_session_ids))
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_tracking_count FROM deleted;

  -- Anonymize (not delete) this user's security_audit_log entries: erasure of
  -- the identifying link, while preserving the audit trail for abuse/fraud
  -- monitoring (a legitimate basis to retain the log entries themselves).
  WITH anonymized AS (
    UPDATE public.security_audit_log
    SET anonymous_id = NULL
    WHERE anonymous_id = p_anonymous_id
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_audit_count FROM anonymized;

  -- Log the deletion itself. anonymous_id is intentionally NULL here too —
  -- logging the just-erased identifier back into the log would defeat the
  -- anonymization performed immediately above.
  INSERT INTO public.security_audit_log (
    operation,
    table_name,
    anonymous_id,
    ip_hash,
    success,
    metadata
  ) VALUES (
    'gdpr_data_deletion',
    'responses,sessions,email_submissions,submission_tracking,email_hashes,security_audit_log',
    NULL,
    p_ip_hash,
    TRUE,
    jsonb_build_object(
      'deleted_responses', v_response_count,
      'deleted_sessions', v_session_count,
      'deleted_email_submissions', v_email_count,
      'deleted_submission_tracking', v_tracking_count,
      'deleted_email_hashes', v_hash_count,
      'anonymized_audit_log', v_audit_count
    )
  );

  RETURN QUERY SELECT
    v_response_count,
    v_session_count,
    v_email_count,
    v_tracking_count,
    v_hash_count,
    v_audit_count;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_data(UUID, VARCHAR) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID, VARCHAR) TO service_role;


-- ============================================================================
-- STEP 3: export_user_data — full Art. 15 access, all personal data held
-- ============================================================================
-- get_user_responses (005) only ever returned `responses`. This returns
-- everything linked to the anonymous_id: responses, sessions (including
-- partial_answers/user_agent), email_submissions metadata (never the
-- encrypted email itself — only a boolean indicating one is held),
-- submission_tracking, whether an email_hashes entry exists, and the user's
-- own security_audit_log entries.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.export_user_data(
  p_anonymous_id UUID,
  p_ip_hash VARCHAR(64) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF p_anonymous_id IS NULL THEN
    RAISE EXCEPTION 'anonymous_id is required';
  END IF;

  -- Log the access attempt (mirrors get_user_responses' audit pattern)
  INSERT INTO public.security_audit_log (
    operation,
    table_name,
    anonymous_id,
    ip_hash,
    success
  ) VALUES (
    'gdpr_data_export',
    'responses,sessions,email_submissions,submission_tracking,email_hashes,security_audit_log',
    p_anonymous_id,
    p_ip_hash,
    TRUE
  );

  SELECT jsonb_build_object(
    'responses', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id,
        'created_at', r.created_at,
        'session_id', r.session_id,
        'answers', r.answers,
        'metadata', r.metadata,
        'consent_given', r.consent_given,
        'consent_timestamp', r.consent_timestamp,
        'consent_version', r.consent_version
      ) ORDER BY r.created_at DESC)
      FROM public.responses r
      WHERE r.anonymous_id = p_anonymous_id
    ), '[]'::jsonb),
    'sessions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', s.id,
        'started_at', s.started_at,
        'completed_at', s.completed_at,
        'language', s.language,
        'user_agent', s.user_agent,
        'partial_answers', s.partial_answers,
        'last_question_index', s.last_question_index,
        'is_complete', s.is_complete
      ) ORDER BY s.started_at DESC)
      FROM public.sessions s
      WHERE s.id IN (
        SELECT DISTINCT session_id FROM public.responses WHERE anonymous_id = p_anonymous_id
        UNION
        SELECT DISTINCT session_id FROM public.submission_tracking
        WHERE anonymous_id = p_anonymous_id AND session_id IS NOT NULL
      )
    ), '[]'::jsonb),
    'email_submissions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id,
        'created_at', e.created_at,
        'response_id', e.response_id,
        'marketing_consent', e.marketing_consent,
        'pdf_sent_at', e.pdf_sent_at,
        'pdf_send_attempts', e.pdf_send_attempts,
        'last_error', e.last_error,
        'has_encrypted_email', (e.email_encrypted IS NOT NULL)
      ) ORDER BY e.created_at DESC)
      FROM public.email_submissions e
      WHERE e.anonymous_id = p_anonymous_id
    ), '[]'::jsonb),
    'submission_tracking', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id,
        'created_at', t.created_at,
        'is_successful', t.is_successful,
        'blocked_reason', t.blocked_reason,
        'session_id', t.session_id,
        'ip_address_hash', t.ip_address,
        'fingerprint_id', t.fingerprint_id
      ) ORDER BY t.created_at DESC)
      FROM public.submission_tracking t
      WHERE t.anonymous_id = p_anonymous_id
    ), '[]'::jsonb),
    'has_email_hash', EXISTS (
      SELECT 1 FROM public.email_hashes h
      WHERE h.response_id IN (
        SELECT id FROM public.responses WHERE anonymous_id = p_anonymous_id
      )
      OR h.email_hash IN (
        SELECT email_hash FROM public.email_submissions WHERE anonymous_id = p_anonymous_id
      )
    ),
    'security_audit_log', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'created_at', a.created_at,
        'operation', a.operation,
        'table_name', a.table_name,
        'success', a.success
      ) ORDER BY a.created_at DESC)
      FROM public.security_audit_log a
      WHERE a.anonymous_id = p_anonymous_id
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.export_user_data(UUID, VARCHAR) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.export_user_data(UUID, VARCHAR) TO service_role;


-- ============================================================================
-- STEP 4: get_session_partial — survey resume under hardened RLS
-- ============================================================================
-- Migration 005 revoked anon SELECT on `sessions` (Step 2/4), which broke the
-- GET /api/survey/partial resume path (it read `sessions` with the anon
-- client). This SECURITY DEFINER function replicates exactly what that route
-- needs — an incomplete session by id — and is the one new function in this
-- migration granted to `anon`, matching the "session_id as bearer token"
-- model already documented in migration 005's anon_update_own_session policy.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_session_partial(p_session_id UUID)
RETURNS TABLE (
  id UUID,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  language VARCHAR(2),
  user_agent TEXT,
  partial_answers JSONB,
  last_question_index INTEGER,
  is_complete BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  IF p_session_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.started_at,
    s.completed_at,
    s.language,
    s.user_agent,
    s.partial_answers,
    s.last_question_index,
    s.is_complete
  FROM public.sessions s
  WHERE s.id = p_session_id
    AND s.is_complete = FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.get_session_partial(UUID) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.get_session_partial(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_session_partial(UUID) TO service_role;


-- ============================================================================
-- STEP 5: purge_expired_data — enforce the retention limits the policy promises
-- ============================================================================
-- Never touches `responses` or `email_submissions` — those are the research
-- data the study exists to collect, retained under their own (consent-based)
-- basis, not this operational-metadata retention window.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.purge_expired_data()
RETURNS TABLE (
  purged_sessions INTEGER,
  purged_submission_tracking INTEGER,
  purged_audit_log INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sessions INTEGER := 0;
  v_tracking INTEGER := 0;
  v_audit INTEGER := 0;
BEGIN
  -- Abandoned/incomplete sessions older than 90 days with no linked response.
  WITH deleted AS (
    DELETE FROM public.sessions s
    WHERE s.started_at < NOW() - INTERVAL '90 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.responses r WHERE r.session_id = s.id
      )
    RETURNING s.id
  )
  SELECT COUNT(*)::INTEGER INTO v_sessions FROM deleted;

  -- submission_tracking rows older than 90 days. Safe: the anti-abuse dedup
  -- window is only 30 days, well inside this retention period.
  WITH deleted AS (
    DELETE FROM public.submission_tracking
    WHERE created_at < NOW() - INTERVAL '90 days'
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_tracking FROM deleted;

  -- security_audit_log entries older than 1 year.
  WITH deleted AS (
    DELETE FROM public.security_audit_log
    WHERE created_at < NOW() - INTERVAL '365 days'
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_audit FROM deleted;

  INSERT INTO public.security_audit_log (operation, table_name, success, metadata)
  VALUES (
    'retention_purge',
    'sessions,submission_tracking,security_audit_log',
    TRUE,
    jsonb_build_object(
      'purged_sessions', v_sessions,
      'purged_submission_tracking', v_tracking,
      'purged_audit_log', v_audit
    )
  );

  RETURN QUERY SELECT v_sessions, v_tracking, v_audit;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_data() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_data() TO service_role;


-- ============================================================================
-- STEP 6: STOP REQUIRING REVERSIBLE EMAIL STORAGE
-- ============================================================================
-- The app no longer writes AES-encrypted emails (hash-only policy); the
-- email/submit route currently inserts '' placeholders because these columns
-- were NOT NULL. Dropping the constraint is metadata-only and non-destructive;
-- legacy encrypted rows are preserved (still needed to honor GDPR access
-- requests) until the maintainer decides to scrub them.

ALTER TABLE public.email_submissions
  ALTER COLUMN email_encrypted DROP NOT NULL,
  ALTER COLUMN email_iv DROP NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES (run manually to verify migration)
-- ============================================================================
-- Confirm ip_address is widened:
-- SELECT column_name, character_maximum_length
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'submission_tracking' AND column_name = 'ip_address';

-- Confirm grants on the new/changed functions:
-- SELECT routine_name, grantee, privilege_type
-- FROM information_schema.role_routine_grants
-- WHERE routine_schema = 'public'
-- AND routine_name IN ('delete_user_data', 'export_user_data', 'get_session_partial', 'purge_expired_data')
-- ORDER BY routine_name, grantee;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
