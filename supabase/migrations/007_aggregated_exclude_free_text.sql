-- ============================================================================
-- PRIVACY FIX MIGRATION - Exclude free-text answers from public aggregates
-- ============================================================================
-- get_aggregated_results() iterates over every answer key via jsonb_each, so
-- free-text questions (e.g. commentaires_libres) leaked verbatim responses
-- through the public /api/results/aggregated endpoint. The API route already
-- filters these out, but we harden the database function as defense in depth
-- so the data never leaves Postgres in the first place.
--
-- If a new free-text question is added to the survey schema, add its id to the
-- excluded list below.
-- ============================================================================

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
      -- Free-text questions hold verbatim responses that could re-identify a
      -- participant. Never expose them through the public aggregate function.
      AND key NOT IN ('commentaires_libres')
    GROUP BY key, value::text
  ) subq
  GROUP BY key;
END;
$$;

-- Rollback: re-run migration 005's definition of get_aggregated_results()
-- (without the `AND key NOT IN (...)` clause) to restore the previous behaviour.
