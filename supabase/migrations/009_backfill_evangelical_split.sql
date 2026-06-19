-- ============================================================================
-- DATA MIGRATION - Backfill pre-cutover evangelical responses (2026-06-19)
-- ============================================================================
-- The evangelical charismatic/non-charismatic split moved from
-- profil_confession_protestante (values evangelique=non-charismatic,
-- pentecotiste=charismatic) to the canonical field profil_confession_evangelique
-- (non_charismatique | charismatique). The meaning of 'evangelique' changed
-- (now the evangelical umbrella). This migration remaps the responses collected
-- under the old instrument losslessly, preserving the original value in the
-- internal key _legacy_protestante.
--
-- Idempotent: guards ensure re-running is a no-op. This is the reproducible
-- record of the backfill that was first applied to production via the
-- Supabase Management API on 2026-06-19.
-- ============================================================================

-- Charismatic: legacy value 'pentecotiste'
UPDATE responses
SET answers = answers
    || jsonb_build_object('_legacy_protestante', answers->'profil_confession_protestante')
    || jsonb_build_object('profil_confession_protestante', to_jsonb('evangelique'::text))
    || jsonb_build_object('profil_confession_evangelique', to_jsonb('charismatique'::text))
WHERE consent_given = TRUE
  AND answers->>'profil_confession_protestante' = 'pentecotiste';

-- Non-charismatic: legacy 'evangelique' (old meaning) without the new field yet
UPDATE responses
SET answers = answers
    || jsonb_build_object('_legacy_protestante', answers->'profil_confession_protestante')
    || jsonb_build_object('profil_confession_evangelique', to_jsonb('non_charismatique'::text))
WHERE consent_given = TRUE
  AND answers->>'profil_confession_protestante' = 'evangelique'
  AND answers->>'profil_confession_evangelique' IS NULL;

-- Orphan check (must return 0 rows): any evangelical without the canonical field.
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM responses
  WHERE consent_given = TRUE
    AND answers->>'profil_confession_protestante' = 'evangelique'
    AND answers->>'profil_confession_evangelique' IS NULL;
  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Backfill incomplete: % evangelical row(s) missing profil_confession_evangelique', orphan_count;
  END IF;
END $$;
