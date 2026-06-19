-- ============================================================================
-- PRIVACY/CONSISTENCY MIGRATION - Exclude internal meta keys from aggregates
-- ============================================================================
-- Some responses carry internal bookkeeping keys prefixed with "_" (e.g.
-- _legacy_protestante, used to preserve the pre-migration evangelical value
-- after the charismatic/non-charismatic schema change). These are not survey
-- answers and must not appear in the public aggregate endpoint. Extends
-- migration 007 (which already excludes free-text questions).
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
      -- Free-text questions hold verbatim responses (re-identification risk).
      AND key NOT IN ('commentaires_libres')
      -- Internal/meta keys (prefixed with "_") are not survey answers.
      AND key NOT LIKE '\_%'
    GROUP BY key, value::text
  ) subq
  GROUP BY key;
END;
$$;
