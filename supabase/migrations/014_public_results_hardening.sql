-- 014: public results hardening (methodological audit of 3 November 2026).
--
-- 1. The threshold of 30 participants moves into the function itself: it used to
--    live in the API route only, while the public key could call the function.
-- 2. The function leaves the public key: only the server calls it now.
-- 3. Reworded items are no longer pooled: on the CNEF version the CRS-5 items and
--    the other items listed below do not say the same thing, so the pooled
--    distribution counts the frozen wording only (addendum 1).
-- 4. p_entry gives the results of one entry point under the same rules, for the
--    partner report (admin route /api/results/partner).
--
-- Apply AFTER the application has been deployed: the route must already use the
-- service role, or the public dashboard goes blank.

DROP FUNCTION IF EXISTS public.get_aggregated_results();

CREATE FUNCTION public.get_aggregated_results(p_entry TEXT DEFAULT NULL)
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
  min_participants CONSTANT INT := 30;
  participants BIGINT;
BEGIN
  SELECT COUNT(DISTINCT r.anonymous_id) INTO participants
  FROM public.responses r
  WHERE r.consent_given = TRUE
    AND COALESCE(r.metadata ->> 'screenedOut', '') <> 'true'
    AND (p_entry IS NULL OR COALESCE(r.metadata ->> 'entryVariant', 'general') = p_entry);

  IF participants < min_participants THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH answered AS (
    -- The response id is carried through the expansion so a question can be
    -- gated on people rather than on cells.
    SELECT r.id AS response_id, e.key AS q_key, e.value AS q_value
    FROM public.responses r, jsonb_each(r.answers) AS e(key, value)
    WHERE r.consent_given = TRUE
      -- Screened-out submissions are outside the study population.
      AND COALESCE(r.metadata ->> 'screenedOut', '') <> 'true'
      AND (p_entry IS NULL OR COALESCE(r.metadata ->> 'entryVariant', 'general') = p_entry)
      -- Free-text questions hold verbatim responses (re-identification risk).
      AND e.key NOT IN ('commentaires_libres')
      -- Internal/meta keys (prefixed with "_") are not survey answers.
      AND e.key NOT LIKE '\_%'
      -- Two wordings are not one distribution: in the pooled view these items
      -- keep the frozen wording only.
      AND NOT (
        p_entry IS NULL
        AND COALESCE(r.metadata ->> 'wordingVariant', '') = 'cnef-2026-10'
        AND e.key IN (
          'crs_intellect', 'crs_ideology', 'crs_public_practice', 'crs_private_practice',
          'crs_experience', 'theo_inspiration', 'profil_formation_theologique',
          'profil_anciennete_foi', 'psych_anxiete_remplacement'
        )
      )
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

REVOKE ALL ON FUNCTION public.get_aggregated_results(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_aggregated_results(TEXT) TO service_role;
