-- ============================================================================
-- SESSION ANONYMOUS ID — reach abandoned sessions for export and erasure
-- ============================================================================
-- The survey now saves progress server-side while the questionnaire is being
-- filled (POST /api/survey/partial), so an abandoned session holds partial
-- answers without ever producing a response. delete_user_data and
-- export_user_data (migration 010) only found sessions through a response or a
-- submission_tracking row: an abandoned session was out of reach of the
-- /mes-donnees page until the 90-day purge.
--
-- The session now carries the respondent's anonymous_id (written by both the
-- partial save and the final submit), and both functions also match on it.
-- Additive only: a nullable column, an index, and two functions replaced with
-- the same signature and return shape. No existing row is modified; sessions
-- saved before this migration keep a NULL anonymous_id and stay reachable
-- through their response, as before.
-- ============================================================================

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS anonymous_id UUID;

COMMENT ON COLUMN public.sessions.anonymous_id IS
  'Respondent anonymous id (same value as responses.anonymous_id). Lets GDPR export/erasure reach sessions that never produced a response. NULL for sessions saved before migration 013.';

CREATE INDEX IF NOT EXISTS idx_sessions_anonymous_id
  ON public.sessions(anonymous_id)
  WHERE anonymous_id IS NOT NULL;


-- ----------------------------------------------------------------------------
-- delete_user_data and export_user_data, from migration 010, with sessions
-- also matched on sessions.anonymous_id. Everything else is unchanged.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.delete_user_data(
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
  -- Sessions linked through a response, or directly through their own
  -- anonymous_id (an abandoned session has no response, migration 013).
  SELECT ARRAY_AGG(DISTINCT sid) INTO v_session_ids
  FROM (
    SELECT session_id AS sid FROM public.responses WHERE anonymous_id = p_anonymous_id
    UNION
    SELECT id AS sid FROM public.sessions WHERE anonymous_id = p_anonymous_id
  ) linked;

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
      WHERE s.anonymous_id = p_anonymous_id
         OR s.id IN (
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
