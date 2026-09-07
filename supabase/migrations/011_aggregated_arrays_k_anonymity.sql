-- ============================================================================
-- SCORING V2 - Aggregated results: expand arrays/matrices + k-anonymity
-- ============================================================================
-- Two problems with the previous definition (migrations 005 -> 008):
--
-- 1. Every answer was counted through `value::text`, so a multi-select answer
--    produced a single cell keyed by the whole JSON array (e.g.
--    '["general", "spirituel"]') and a matrix answer a single cell keyed by the
--    whole JSON object. The public dashboard could therefore never read a
--    per-option count. Arrays are now expanded with jsonb_array_elements_text
--    (one cell per selected option) and objects with jsonb_each (one cell per
--    "row:col" pair). Scalars keep one cell, but are now unquoted (`#>> '{}'`)
--    so the keys match the option values used by the survey schema.
--
-- 2. No k-anonymity. A rare combination (single respondent in a country, a
--    unique denomination...) was published as a cell of count 1. Cells below
--    K_MIN are now merged into a single '_autres' bucket per question, and a
--    question whose total is itself below K_MIN is not returned at all.
--
-- Exclusions from migrations 007/008 are preserved: free-text questions,
-- internal "_" meta keys, and the consent filter.
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
DECLARE
  k_min CONSTANT INT := 5;
BEGIN
  RETURN QUERY
  WITH answered AS (
    SELECT e.key AS q_key, e.value AS q_value
    FROM public.responses r, jsonb_each(r.answers) AS e(key, value)
    WHERE r.consent_given = TRUE
      -- Free-text questions hold verbatim responses (re-identification risk).
      AND e.key NOT IN ('commentaires_libres')
      -- Internal/meta keys (prefixed with "_") are not survey answers.
      AND e.key NOT LIKE '\_%'
  ),
  cells AS (
    -- Scalars (choice, scale, boolean): one cell, unquoted.
    SELECT a.q_key, a.q_value #>> '{}' AS answer_value
    FROM answered a
    WHERE jsonb_typeof(a.q_value) NOT IN ('array', 'object')

    UNION ALL

    -- Arrays (multi-select): one cell per selected option. The CASE guard is
    -- required because a set-returning function is evaluated before the WHERE
    -- clause could filter non-array rows out.
    SELECT a.q_key, elem
    FROM answered a
    CROSS JOIN LATERAL jsonb_array_elements_text(
      CASE WHEN jsonb_typeof(a.q_value) = 'array' THEN a.q_value ELSE '[]'::jsonb END
    ) AS elem

    UNION ALL

    -- Objects (matrix): one cell per "row:col" pair.
    SELECT a.q_key, m.mkey || ':' || COALESCE(m.mvalue #>> '{}', '')
    FROM answered a
    CROSS JOIN LATERAL jsonb_each(
      CASE WHEN jsonb_typeof(a.q_value) = 'object' THEN a.q_value ELSE '{}'::jsonb END
    ) AS m(mkey, mvalue)
  ),
  counted AS (
    SELECT c.q_key, c.answer_value, COUNT(*)::BIGINT AS answer_count
    FROM cells c
    -- JSON nulls and empty strings are non-answers, not a modality.
    WHERE c.answer_value IS NOT NULL AND c.answer_value <> ''
    GROUP BY c.q_key, c.answer_value
  ),
  totals AS (
    SELECT c.q_key, SUM(c.answer_count)::BIGINT AS q_total
    FROM counted c
    GROUP BY c.q_key
  ),
  bucketed AS (
    SELECT
      c.q_key,
      CASE WHEN c.answer_count < k_min THEN '_autres' ELSE c.answer_value END AS answer_value,
      c.answer_count
    FROM counted c
    JOIN totals t ON t.q_key = c.q_key
    -- A question answered by fewer than k_min participants is withheld entirely.
    WHERE t.q_total >= k_min
  ),
  merged AS (
    SELECT b.q_key, b.answer_value, SUM(b.answer_count)::BIGINT AS answer_count
    FROM bucketed b
    GROUP BY b.q_key, b.answer_value
  )
  SELECT
    m.q_key AS question_id,
    jsonb_object_agg(m.answer_value, m.answer_count ORDER BY m.answer_count DESC) AS distribution,
    SUM(m.answer_count)::BIGINT AS total_responses
  FROM merged m
  GROUP BY m.q_key;
END;
$$;

-- Grants unchanged from migration 005 (CREATE OR REPLACE preserves them; these
-- statements are idempotent and keep the migration self-contained).
GRANT EXECUTE ON FUNCTION public.get_aggregated_results() TO anon;
GRANT EXECUTE ON FUNCTION public.get_aggregated_results() TO service_role;

COMMENT ON FUNCTION public.get_aggregated_results() IS
  'Public aggregates: arrays/matrices expanded, cells < 5 merged into _autres, questions with total < 5 withheld.';

-- Rollback: re-run migration 008's definition of get_aggregated_results().
