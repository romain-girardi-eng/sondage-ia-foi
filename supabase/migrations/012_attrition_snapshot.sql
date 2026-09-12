-- ============================================================================
-- ATTRITION SNAPSHOT — archive the drop-off table before the 90-day purge
-- ============================================================================
-- The privacy policy promises that abandoned sessions are deleted after 90
-- days (migration 010, `purge_expired_data`). The pre-registration promises an
-- attrition analysis. Both cannot be true at once: once the rows are gone, the
-- analysis has no input.
--
-- This migration reconciles them with an aggregate that outlives the raw rows.
-- Immediately before the purge, the sessions about to be deleted are counted by
-- (instrument version, entry variant, how far the respondent got) and only the
-- counts are kept. No session id, no timestamp, no answer content, no user
-- agent: the archived table cannot be joined back to a person.
--
-- Three design points:
--
-- 1. Same window as the purge. `snapshot_attrition` and `purge_expired_data`
--    both look at sessions older than 90 days with no linked response, and the
--    cron calls the snapshot FIRST. Because NOW() only moves forward between
--    the two calls, every archived session is then deleted: a session cannot be
--    counted twice across two runs.
--
-- 2. k-anonymity. A (version, variant, progress) cell is archived only from
--    five sessions, exactly the K_MIN of migration 011. A cell of one is a
--    person, and a very unusual drop-off point is identifying.
--
-- 3. `last_question_id` holds the NUMBER of answered items, rendered as text.
--    The routing order lives in TypeScript (`getVisibleQuestions`), not in SQL,
--    and `jsonb` does not preserve key insertion order, so the identifier of
--    the last answered question cannot be recovered here. The count is the
--    faithful fallback: it is monotone in progress, which is what an attrition
--    curve needs. Internal meta keys (prefixed with "_", see migration 008) are
--    excluded so the count matches the number of real answers.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- STEP 1: carry the two strata on the session itself
-- ----------------------------------------------------------------------------
-- `responses.metadata` already carries `instrumentVersion` and `entryVariant`,
-- but an abandoned session has no response, so the strata must be stored where
-- they survive: on the session row. Both are nullable — a session saved before
-- this migration has neither, and NULL is the honest value for "unknown", not a
-- default that would silently invent a stratum.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS instrument_version TEXT;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS entry_variant TEXT;

COMMENT ON COLUMN public.sessions.instrument_version IS
  'Instrument version served to this session, e.g. "2.0.0". NULL if unknown.';

COMMENT ON COLUMN public.sessions.entry_variant IS
  'Entry point of this session ("general", "cnef", ...). NULL if unknown.';


-- ----------------------------------------------------------------------------
-- STEP 2: the archive table
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.attrition_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  instrument_version TEXT,
  entry_variant TEXT,
  last_question_id TEXT,
  sessions BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attrition_snapshots_snapshot_at
  ON public.attrition_snapshots (snapshot_at DESC);

COMMENT ON TABLE public.attrition_snapshots IS
  'Anonymised drop-off counts archived before the 90-day session purge. One row per (instrument version, entry variant, number of answered items) reaching five sessions.';

COMMENT ON COLUMN public.attrition_snapshots.last_question_id IS
  'Number of non-meta answered keys at abandonment, as text. See the header of migration 012 for why this is a count and not a question id.';

COMMENT ON COLUMN public.attrition_snapshots.sessions IS
  'Number of abandoned sessions in this cell, always five or more.';

-- RLS: service_role only, same shape as security_audit_log (migration 005).
-- Nothing here is public: an attrition table is research metadata, not a
-- published aggregate.
ALTER TABLE public.attrition_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attrition_snapshots FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.attrition_snapshots FROM PUBLIC;
REVOKE ALL ON TABLE public.attrition_snapshots FROM anon;
REVOKE ALL ON TABLE public.attrition_snapshots FROM authenticated;
GRANT SELECT, INSERT ON TABLE public.attrition_snapshots TO service_role;

DROP POLICY IF EXISTS "service_role_all_attrition_snapshots" ON public.attrition_snapshots;
CREATE POLICY "service_role_all_attrition_snapshots" ON public.attrition_snapshots
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);


-- ----------------------------------------------------------------------------
-- STEP 3: snapshot_attrition — archive, then let the purge delete
-- ----------------------------------------------------------------------------
-- `p_older_than` MUST stay equal to the window of `purge_expired_data`
-- (migration 010, currently 90 days). A shorter window would archive sessions
-- the purge does not delete, and they would be archived again on the next run.

CREATE OR REPLACE FUNCTION public.snapshot_attrition(
  p_older_than INTERVAL DEFAULT INTERVAL '90 days'
)
RETURNS TABLE (
  snapshot_rows INTEGER,
  archived_sessions BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rows INTEGER := 0;
  v_sessions BIGINT := 0;
BEGIN
  WITH abandoned AS (
    SELECT
      s.instrument_version AS instrument_version,
      s.entry_variant AS entry_variant,
      (
        SELECT COUNT(*)
        FROM jsonb_object_keys(COALESCE(s.partial_answers, '{}'::jsonb)) AS t(answer_key)
        WHERE LEFT(t.answer_key, 1) <> '_'
      )::TEXT AS last_question_id
    FROM public.sessions s
    WHERE s.started_at < NOW() - p_older_than
      AND NOT EXISTS (
        SELECT 1 FROM public.responses r WHERE r.session_id = s.id
      )
  ),
  grouped AS (
    SELECT
      a.instrument_version,
      a.entry_variant,
      a.last_question_id,
      COUNT(*)::BIGINT AS cell_sessions
    FROM abandoned a
    GROUP BY a.instrument_version, a.entry_variant, a.last_question_id
    HAVING COUNT(*) >= 5
  ),
  inserted AS (
    INSERT INTO public.attrition_snapshots (
      instrument_version,
      entry_variant,
      last_question_id,
      sessions
    )
    SELECT
      g.instrument_version,
      g.entry_variant,
      g.last_question_id,
      g.cell_sessions
    FROM grouped g
    RETURNING attrition_snapshots.sessions AS inserted_sessions
  )
  SELECT COUNT(*)::INTEGER, COALESCE(SUM(i.inserted_sessions), 0)::BIGINT
  INTO v_rows, v_sessions
  FROM inserted i;

  INSERT INTO public.security_audit_log (operation, table_name, success, metadata)
  VALUES (
    'attrition_snapshot',
    'attrition_snapshots',
    TRUE,
    jsonb_build_object(
      'snapshot_rows', v_rows,
      'archived_sessions', v_sessions
    )
  );

  RETURN QUERY SELECT v_rows, v_sessions;
END;
$$;

REVOKE ALL ON FUNCTION public.snapshot_attrition(INTERVAL) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.snapshot_attrition(INTERVAL) FROM anon;
REVOKE ALL ON FUNCTION public.snapshot_attrition(INTERVAL) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.snapshot_attrition(INTERVAL) TO service_role;

COMMENT ON FUNCTION public.snapshot_attrition(INTERVAL) IS
  'Archives anonymised drop-off counts for the sessions the retention purge is about to delete. Called by the purge cron before purge_expired_data().';


-- ============================================================================
-- VERIFICATION QUERIES (run manually after applying)
-- ============================================================================
-- New session columns:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'sessions'
--   AND column_name IN ('instrument_version', 'entry_variant');

-- Grants on the archive table and the function:
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants
-- WHERE table_schema = 'public' AND table_name = 'attrition_snapshots';
-- SELECT grantee, privilege_type FROM information_schema.role_routine_grants
-- WHERE routine_schema = 'public' AND routine_name = 'snapshot_attrition';

-- Dry run without writing (same aggregate, no INSERT):
-- SELECT s.instrument_version, s.entry_variant, COUNT(*)
-- FROM public.sessions s
-- WHERE s.started_at < NOW() - INTERVAL '90 days'
--   AND NOT EXISTS (SELECT 1 FROM public.responses r WHERE r.session_id = s.id)
-- GROUP BY 1, 2 HAVING COUNT(*) >= 5;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
