-- ============================================================================
-- SCORING V2 - Public aggregates: screen-out exclusion, array/matrix expansion,
--               respondent-level k-anonymity
-- ============================================================================
-- Three problems with the previous definitions (migrations 005 -> 008):
--
-- 1. Screened-out submissions (`metadata->>'screenedOut' = 'true'`, see
--    SCORING_V2_SPEC §1.9) were counted like any other response. They answered
--    no scored item, so they inflated the participant count, the 30-participant
--    publication gate and every option-share denominator. They are now excluded
--    from both public aggregate functions. This predicate is defined here for
--    SQL and once in TypeScript (`isScreenedOut` in the admin stats route).
--
-- 2. Every answer was counted through `value::text`, so a multi-select answer
--    produced a single cell keyed by the whole JSON array (e.g.
--    '["general", "spirituel"]') and a matrix answer a single cell keyed by the
--    whole JSON object. The public dashboard could therefore never read a
--    per-option count. Arrays are now expanded with jsonb_array_elements_text
--    (one cell per selected option) and objects with jsonb_each (one cell per
--    "row:col" pair). Scalars keep one cell, but are now unquoted (`#>> '{}'`)
--    so the keys match the option values used by the survey schema.
--
-- 3. k-anonymity was leaky on two counts. Cells below K_MIN were relabelled
--    '_autres' but that merged bucket was published whatever its size, so a
--    single respondent could still be isolated behind a generic label. And the
--    per-question gate summed *cells*, not people: two respondents ticking
--    three options each produced a total of six and passed a threshold of five.
--    The gate now counts DISTINCT respondents, and a cell (the '_autres' bucket
--    included) is published only once it reaches K_MIN on its own.
--
-- Consequences of the new rule, on the review's own examples:
--   - binary item, true = 40 / false = 2 (42 respondents): the question passes
--     (42 >= 5), `false` is merged into '_autres' (2 < 5) and '_autres' is then
--     dropped (2 < 5). Published: {"true": 40}, total_responses = 40,
--     respondents = 42. The two dissenters are never published as a cell.
--   - `prefere_ne_pas_repondre` = 1: merged into '_autres', which stays at 1
--     and is dropped. Nothing about that respondent is published.
--   - 2 respondents x 3 options on a multi-select: respondents = 2 < 5, the
--     whole question is withheld (it used to pass with a cell total of 6).
--
-- `total_responses` is therefore the sum of the PUBLISHED cells (selections for
-- a multi-select, respondents for a scalar item) and never matches
-- `respondents` when something was withheld. Percentages must be computed on
-- `respondents`, which is the number of distinct people who answered.
--
-- Exclusions from migrations 007/008 are preserved: free-text questions,
-- internal "_" meta keys, and the consent filter.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- get_participant_count: public count of unique participants
-- ----------------------------------------------------------------------------
-- Same signature, same SECURITY DEFINER / empty search_path pattern and same
-- grants as migration 005; only the screen-out exclusion is added.

CREATE OR REPLACE FUNCTION public.get_participant_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT r.anonymous_id)::BIGINT
    FROM public.responses r
    WHERE r.consent_given = TRUE
      -- Screened-out submissions are outside the study population.
      AND COALESCE(r.metadata ->> 'screenedOut', '') <> 'true'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_participant_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_participant_count() TO service_role;

COMMENT ON FUNCTION public.get_participant_count() IS
  'Public participant count: consented, non screened-out respondents.';


-- ----------------------------------------------------------------------------
-- get_aggregated_results: public distributions
-- ----------------------------------------------------------------------------
-- The RETURNS TABLE gains a `respondents` column, and PostgreSQL refuses to
-- change a function's return type in place, so the previous signature is
-- dropped first. DROP also drops its grants, which are re-issued below.

DROP FUNCTION IF EXISTS public.get_aggregated_results();

CREATE FUNCTION public.get_aggregated_results()
RETURNS TABLE (
  question_id TEXT,
  distribution JSONB,
  total_responses BIGINT,
  respondents BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  k_min CONSTANT INT := 5;
BEGIN
  RETURN QUERY
  WITH answered AS (
    -- The response id is carried through the expansion so a question can be
    -- gated on people rather than on cells.
    SELECT r.id AS response_id, e.key AS q_key, e.value AS q_value
    FROM public.responses r, jsonb_each(r.answers) AS e(key, value)
    WHERE r.consent_given = TRUE
      -- Screened-out submissions are outside the study population.
      AND COALESCE(r.metadata ->> 'screenedOut', '') <> 'true'
      -- Free-text questions hold verbatim responses (re-identification risk).
      AND e.key NOT IN ('commentaires_libres')
      -- Internal/meta keys (prefixed with "_") are not survey answers.
      AND e.key NOT LIKE '\_%'
  ),
  cells AS (
    -- Scalars (choice, scale, boolean): one cell, unquoted.
    SELECT a.response_id, a.q_key, a.q_value #>> '{}' AS answer_value
    FROM answered a
    WHERE jsonb_typeof(a.q_value) NOT IN ('array', 'object')

    UNION ALL

    -- Arrays (multi-select): one cell per selected option. The CASE guard is
    -- required because a set-returning function is evaluated before the WHERE
    -- clause could filter non-array rows out.
    SELECT a.response_id, a.q_key, elem
    FROM answered a
    CROSS JOIN LATERAL jsonb_array_elements_text(
      CASE WHEN jsonb_typeof(a.q_value) = 'array' THEN a.q_value ELSE '[]'::jsonb END
    ) AS elem

    UNION ALL

    -- Objects (matrix): one cell per "row:col" pair.
    SELECT a.response_id, a.q_key, m.mkey || ':' || COALESCE(m.mvalue #>> '{}', '')
    FROM answered a
    CROSS JOIN LATERAL jsonb_each(
      CASE WHEN jsonb_typeof(a.q_value) = 'object' THEN a.q_value ELSE '{}'::jsonb END
    ) AS m(mkey, mvalue)
  ),
  usable AS (
    -- JSON nulls and empty strings are non-answers, not a modality.
    SELECT c.response_id, c.q_key, c.answer_value
    FROM cells c
    WHERE c.answer_value IS NOT NULL AND c.answer_value <> ''
  ),
  eligible AS (
    -- k-anonymity gate #1: at least k_min distinct people answered.
    SELECT u.q_key, COUNT(DISTINCT u.response_id)::BIGINT AS respondent_count
    FROM usable u
    GROUP BY u.q_key
    HAVING COUNT(DISTINCT u.response_id) >= k_min
  ),
  counted AS (
    SELECT u.q_key, u.answer_value, COUNT(*)::BIGINT AS answer_count
    FROM usable u
    JOIN eligible e ON e.q_key = u.q_key
    GROUP BY u.q_key, u.answer_value
  ),
  labelled AS (
    -- Rare modalities lose their name before being merged.
    SELECT
      c.q_key,
      CASE WHEN c.answer_count < k_min THEN '_autres' ELSE c.answer_value END AS answer_value,
      c.answer_count
    FROM counted c
  ),
  merged AS (
    SELECT l.q_key, l.answer_value, SUM(l.answer_count)::BIGINT AS answer_count
    FROM labelled l
    GROUP BY l.q_key, l.answer_value
  ),
  published AS (
    -- k-anonymity gate #2: every published cell, '_autres' included, holds at
    -- least k_min observations. A bucket that stays under it is dropped.
    SELECT m.q_key, m.answer_value, m.answer_count
    FROM merged m
    WHERE m.answer_count >= k_min
  )
  SELECT
    p.q_key AS question_id,
    jsonb_object_agg(p.answer_value, p.answer_count ORDER BY p.answer_count DESC) AS distribution,
    SUM(p.answer_count)::BIGINT AS total_responses,
    e.respondent_count AS respondents
  FROM published p
  JOIN eligible e ON e.q_key = p.q_key
  GROUP BY p.q_key, e.respondent_count;
END;
$$;

-- Grants re-issued: the DROP above removed the ones from migration 005.
GRANT EXECUTE ON FUNCTION public.get_aggregated_results() TO anon;
GRANT EXECUTE ON FUNCTION public.get_aggregated_results() TO service_role;

COMMENT ON FUNCTION public.get_aggregated_results() IS
  'Public aggregates: screened-out rows excluded, arrays/matrices expanded, questions with fewer than 5 distinct respondents withheld, cells under 5 merged into _autres and dropped unless the bucket itself reaches 5.';

-- Rollback: DROP FUNCTION public.get_aggregated_results(); then re-run
-- migration 008's definition, and re-run migration 005's definition of
-- get_participant_count().
