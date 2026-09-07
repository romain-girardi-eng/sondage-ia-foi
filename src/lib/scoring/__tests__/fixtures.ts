/**
 * Test fixtures for the scoring core.
 * All option values below exist in the instrument (v1 or v2).
 */

import type { Answers } from '@/data';

function base(overrides: Partial<Answers> = {}): Answers {
  return {
    profil_statut: 'laic_pratiquant',
    profil_confession: 'catholique',
    profil_age: '36-50',
    profil_anciennete_foi: 'plus_20_ans',

    theo_orientation: 'modere',

    // religiosity (moderate)
    crs_intellect: 'occasionnellement',
    crs_ideology: 'moderement',
    crs_public_practice: 'mensuel',
    crs_private_practice: 'mensuel',
    crs_experience: 'occasionnellement',

    // aiOpenness (moderate)
    ctrl_ia_frequence: 'occasionnel',
    ctrl_ia_confort: 3,
    ctrl_ia_contextes: ['travail_pro', 'recherche_info'],
    digital_attitude_generale: 'neutre',

    // sacredBoundary (moderate)
    theo_inspiration: 'possible_indirect',
    theo_liturgie_ia: 3,
    theo_activites_sacrees: ['sacrements', 'predication'],
    theo_mediation_humaine: 'partiellement',

    // ethicalConcern (moderate)
    theo_utilite_percue: 'neutre',
    psych_aias_opacity: 'peu',
    psych_imago_dei: 'moderement',

    // psychologicalPerception (moderate)
    psych_godspeed_nature: '3_neutre',
    psych_godspeed_conscience: 'incertain',
    psych_anxiete_remplacement: 'possible_partiel',

    // communityContext (moderate)
    communaute_position_officielle: 'oui_prudent',
    communaute_perception_pairs: 'neutre',
    communaute_discussions: 'parfois',

    // futureOrientation (moderate)
    futur_intention_usage: 'peut_etre',
    futur_formation_souhait: 'peut_etre',
    futur_domaines_interet: ['administration'],

    // Marlowe-Crowne, none in the keyed direction
    ctrl_mc_1: 'true',
    ctrl_mc_2: 'false',
    ctrl_mc_3: 'true',
    ctrl_mc_4: 'false',
    ctrl_mc_5: 'true',

    ...overrides,
  };
}

export const moderateAnswers: Answers = base();

export const gardienTraditionAnswers: Answers = base({
  theo_orientation: 'traditionaliste',

  crs_intellect: 'tres_souvent',
  crs_ideology: 'totalement',
  crs_public_practice: 'hebdo',
  crs_private_practice: 'pluri_quotidien',
  crs_experience: 'tres_souvent',

  ctrl_ia_frequence: 'jamais',
  ctrl_ia_confort: 1,
  digital_attitude_generale: 'negatif',

  theo_inspiration: 'impossible',
  theo_liturgie_ia: 1,
  theo_activites_sacrees: [
    'sacrements',
    'predication',
    'priere_personnelle',
    'accompagnement',
    'discernement',
  ],
  theo_mediation_humaine: 'oui_absolument',

  theo_utilite_percue: 'negatif',
  psych_aias_opacity: 'oui_moderement',
  psych_imago_dei: 'beaucoup',

  communaute_position_officielle: 'oui_defavorable',
  communaute_perception_pairs: 'mefiant',
  communaute_discussions: 'rarement',

  futur_intention_usage: 'non_certain',
  futur_formation_souhait: 'non_pas_du_tout',
  futur_domaines_interet: ['aucun_domaines'],
});

export const pionnierSpirituelAnswers: Answers = base({
  theo_orientation: 'progressiste',

  crs_intellect: 'souvent',
  crs_ideology: 'beaucoup',
  crs_public_practice: 'mensuel',
  crs_private_practice: 'quotidien',
  crs_experience: 'souvent',

  ctrl_ia_frequence: 'quotidien',
  ctrl_ia_confort: 5,
  ctrl_ia_contextes: ['travail_pro', 'recherche_info', 'creation', 'loisirs', 'spirituel'],
  digital_attitude_generale: 'tres_positif',

  theo_inspiration: 'possible',
  theo_liturgie_ia: 5,
  theo_activites_sacrees: ['aucune'],
  theo_mediation_humaine: 'non_pas_necessairement',

  theo_utilite_percue: 'tres_positif',
  psych_aias_opacity: 'non_confiance',
  psych_imago_dei: 'peu',

  psych_godspeed_nature: '4_humain_moins',
  psych_godspeed_conscience: 'possible_emergence',

  futur_intention_usage: 'oui_certain',
  futur_formation_souhait: 'oui_tres',
  futur_domaines_interet: ['priere_meditation', 'catechese', 'communication', 'administration'],
});

export const progressisteCritiqueAnswers: Answers = base({
  theo_orientation: 'progressiste',

  ctrl_ia_frequence: 'occasionnel',
  ctrl_ia_confort: 3,

  theo_utilite_percue: 'negatif',
  psych_aias_opacity: 'oui_fortement',
  psych_imago_dei: 'totalement',

  psych_godspeed_nature: '4_humain_moins',
  psych_godspeed_conscience: 'possible_emergence',
  psych_anxiete_remplacement: 'oui_probable',

  futur_intention_usage: 'oui_probable',
  futur_formation_souhait: 'oui_assez',
});

export const explorateurAnswers: Answers = base({
  profil_statut: 'curieux',
  profil_anciennete_foi: '1_5_ans',
  theo_orientation: 'ne_sait_pas',

  crs_intellect: 'rarement',
  crs_ideology: 'peu',
  crs_public_practice: 'quelques_fois_an',
  crs_private_practice: 'rarement',
  crs_experience: 'rarement',

  theo_inspiration: 'ne_sait_pas',
  theo_utilite_percue: 'ne_sait_pas',
  psych_imago_dei: 'ne_sait_pas',
  psych_anxiete_remplacement: 'ne_sait_pas',
  communaute_perception_pairs: 'ne_sait_pas',
  communaute_position_officielle: 'ne_sait_pas',
});

export const clergyAnswers: Answers = base({
  profil_statut: 'clerge',
  min_pred_usage: 'regulier',
  min_pred_nature: { plan: 2, exegese: 2, illustration: 1, images: 0, redaction: 1 },
  min_pred_sentiment: 3,
  min_care_email: 'oui_relu',
  min_admin_burden: 4,
});

export const clergyNoAIAnswers: Answers = base({
  profil_statut: 'clerge',
  ctrl_ia_frequence: 'jamais',
  ctrl_ia_confort: 1,
  min_pred_usage: 'jamais',
  min_care_email: 'non',
});

export const nonOrdainedLeaderAnswers: Answers = base({
  profil_statut: 'responsable_non_ordonne',
  min_pred_usage: 'rare',
  min_care_email: 'non',
});

export const laypersonAnswers: Answers = base({
  profil_statut: 'laic_engagé',
  laic_substitution_priere: 'oui_neutre',
  laic_conseil_spirituel: 'complement',
});

export const laypersonNoSpiritualAIAnswers: Answers = base({
  profil_statut: 'laic_pratiquant',
  ctrl_ia_frequence: 'regulier',
  ctrl_ia_confort: 4,
  ctrl_ia_contextes: ['travail_pro', 'recherche_info'],
  laic_substitution_priere: 'non',
  laic_conseil_spirituel: 'jamais',
});

/** All 5 Marlowe-Crowne items answered in the keyed (desirable) direction */
export const highSocialDesirabilityAnswers: Answers = base({
  ctrl_mc_1: 'false',
  ctrl_mc_2: 'true',
  ctrl_mc_3: 'false',
  ctrl_mc_4: 'true',
  ctrl_mc_5: 'false',
});

export const lowSocialDesirabilityAnswers: Answers = base();

/** Only CRS-5 answered: religiosity valued, every other dimension null */
export const crsOnlyAnswers: Answers = {
  crs_intellect: 'souvent',
  crs_ideology: 'beaucoup',
  crs_public_practice: 'mensuel',
  crs_private_practice: 'quotidien',
  crs_experience: 'souvent',
};

export const emptyAnswers: Answers = {};

/** Every scored item answered with a documented missing code */
export const allMissingAnswers: Answers = {
  crs_intellect: 'sans_reponse',
  crs_ideology: 'sans_reponse',
  crs_public_practice: 'sans_reponse',
  crs_private_practice: 'sans_reponse',
  crs_experience: 'sans_reponse',
  theo_inspiration: 'ne_sait_pas',
  theo_mediation_humaine: 'ne_sait_pas',
  theo_utilite_percue: 'ne_sait_pas',
  psych_imago_dei: 'ne_sait_pas',
  psych_anxiete_remplacement: 'ne_sait_pas',
  communaute_position_officielle: 'ne_sait_pas',
  communaute_perception_pairs: 'ne_sait_pas',
  futur_intention_usage: 'ne_sait_pas',
};
