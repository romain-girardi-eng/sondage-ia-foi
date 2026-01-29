/**
 * Test Fixtures for Scoring Module
 * Mock answers for different profiles, edge cases, clergy vs layperson scenarios
 */

import type { Answers } from '@/data';

// ==========================================
// HELPER: Create base answers with common fields
// ==========================================

function createBaseAnswers(overrides: Partial<Answers> = {}): Answers {
  return {
    // Profile info
    profil_statut: 'laic_pratiquant',
    profil_confession: 'catholique',
    profil_age: '36-50',
    profil_genre: 'homme',
    profil_pays: 'france',
    profil_anciennete_foi: 'plus_20_ans',
    profil_taille_communaute: 'moyenne',

    // Basic AI usage (moderate defaults)
    ctrl_ia_frequence: 'occasionnel',
    ctrl_ia_confort: 3,
    ctrl_ia_contextes: ['travail'],
    digital_attitude_generale: 'neutre',

    // Theological orientation
    theo_orientation: 'modere',
    theo_inspiration: 'possible_indirect',
    theo_liturgie_ia: 3,
    theo_activites_sacrees: ['confession', 'eucharistie'],
    theo_mediation_humaine: 'partiellement',
    theo_risque_futur: 'autre',
    theo_utilite_percue: 'neutre',

    // Psychological
    psych_godspeed_nature: '3_neutre',
    psych_godspeed_conscience: 'incertain',
    psych_imago_dei: 'moderement',
    psych_anxiete_remplacement: 'possible_partiel',
    psych_aias_opacity: 'peu',

    // Community
    communaute_position_officielle: 'ne_sait_pas',
    communaute_discussions: 'rarement',
    communaute_perception_pairs: 'neutre',

    // Future
    futur_intention_usage: 'peut_etre',
    futur_formation_souhait: 'peut_etre',
    futur_domaines_interet: ['administration'],

    // CRS-5 (moderate religiosity)
    crs_intellect: 'occasionnellement',
    crs_ideology: 'moderement',
    crs_public_practice: 'mensuel',
    crs_private_practice: 'occasionnellement',
    crs_experience: 'moderement',

    // Marlowe-Crowne (low bias)
    ctrl_mc_1: 'true',  // NOT target (target is 'false')
    ctrl_mc_2: 'false', // NOT target (target is 'true')
    ctrl_mc_3: 'true',  // NOT target (target is 'false')
    ctrl_mc_4: 'false', // NOT target (target is 'true')
    ctrl_mc_5: 'true',  // NOT target (target is 'false')

    ...overrides,
  };
}

// ==========================================
// PROFILE-SPECIFIC FIXTURES
// ==========================================

/**
 * Gardien de la Tradition profile
 * High religiosity, low AI openness, high sacred boundary
 */
export const gardienTraditionAnswers: Answers = createBaseAnswers({
  profil_statut: 'clerge',
  theo_orientation: 'traditionaliste',

  // High religiosity (CRS-5)
  crs_intellect: 'tres_souvent',
  crs_ideology: 'totalement',
  crs_public_practice: 'pluri_hebdo',
  crs_private_practice: 'pluri_quotidien',
  crs_experience: 'totalement',

  // Low AI openness
  ctrl_ia_frequence: 'jamais',
  ctrl_ia_confort: 1,
  ctrl_ia_contextes: [],
  digital_attitude_generale: 'negatif',

  // High sacred boundary
  theo_liturgie_ia: 1,
  theo_activites_sacrees: ['confession', 'eucharistie', 'predication', 'benediction', 'accompagnement'],
  theo_mediation_humaine: 'oui_absolument',
  theo_inspiration: 'impossible',

  // High ethical concern
  theo_risque_futur: 'deshumanisation',
  theo_utilite_percue: 'negatif',

  // High community influence
  communaute_position_officielle: 'oui_prudent',
  communaute_discussions: 'souvent',
  communaute_perception_pairs: 'mefiant',

  // Low future orientation
  futur_intention_usage: 'non_certain',
  futur_formation_souhait: 'non_pas_du_tout',
  futur_domaines_interet: ['aucun'],
});

/**
 * Pionnier Spirituel profile
 * High AI openness, low sacred boundary, progressive orientation
 */
export const pionnierSpirituelAnswers: Answers = createBaseAnswers({
  theo_orientation: 'progressiste',

  // Moderate-high religiosity
  crs_intellect: 'souvent',
  crs_ideology: 'beaucoup',
  crs_public_practice: 'hebdo',
  crs_private_practice: 'quotidien',
  crs_experience: 'beaucoup',

  // Very high AI openness
  ctrl_ia_frequence: 'quotidien',
  ctrl_ia_confort: 5,
  ctrl_ia_contextes: ['travail', 'personnel', 'spirituel', 'creatif'],
  digital_attitude_generale: 'tres_positif',

  // Low sacred boundary
  theo_liturgie_ia: 5,
  theo_activites_sacrees: ['aucune'],
  theo_mediation_humaine: 'non_pas_necessairement',
  theo_inspiration: 'possible',

  // Low ethical concern
  theo_risque_futur: 'aucune',
  theo_utilite_percue: 'tres_positif',

  // Moderate community
  communaute_discussions: 'parfois',

  // Very high future orientation
  futur_intention_usage: 'oui_certain',
  futur_formation_souhait: 'oui_tres',
  futur_domaines_interet: ['priere_meditation', 'catechese', 'communication', 'administration', 'accompagnement'],
});

/**
 * Equilibriste Spirituel profile
 * Balanced/moderate on all dimensions
 */
export const equilibristeAnswers: Answers = createBaseAnswers({
  theo_orientation: 'modere',

  // Moderate religiosity
  crs_intellect: 'occasionnellement',
  crs_ideology: 'moderement',
  crs_public_practice: 'mensuel',
  crs_private_practice: 'occasionnellement',
  crs_experience: 'moderement',

  // Moderate AI openness
  ctrl_ia_frequence: 'occasionnel',
  ctrl_ia_confort: 3,
  ctrl_ia_contextes: ['travail', 'personnel'],
  digital_attitude_generale: 'neutre',

  // Moderate sacred boundary
  theo_liturgie_ia: 3,
  theo_activites_sacrees: ['confession', 'eucharistie'],
  theo_mediation_humaine: 'partiellement',
  theo_inspiration: 'possible_indirect',

  // Moderate ethical concern
  theo_risque_futur: 'autre',
  theo_utilite_percue: 'neutre',

  // Moderate everything else
  psych_godspeed_nature: '3_neutre',
  psych_godspeed_conscience: 'incertain',
  psych_imago_dei: 'moderement',

  communaute_discussions: 'parfois',

  futur_intention_usage: 'peut_etre',
  futur_formation_souhait: 'peut_etre',
});

/**
 * Progressiste Critique profile
 * High ethical concern, moderate AI openness, progressive theology
 */
export const progressisteCritiqueAnswers: Answers = createBaseAnswers({
  theo_orientation: 'progressiste',

  // Moderate religiosity
  crs_intellect: 'souvent',
  crs_ideology: 'beaucoup',
  crs_public_practice: 'hebdo',
  crs_private_practice: 'souvent',
  crs_experience: 'beaucoup',

  // Moderate AI openness
  ctrl_ia_frequence: 'occasionnel',
  ctrl_ia_confort: 3,
  ctrl_ia_contextes: ['travail', 'personnel'],
  digital_attitude_generale: 'neutre',

  // Moderate sacred boundary
  theo_liturgie_ia: 2,
  theo_activites_sacrees: ['confession', 'eucharistie', 'accompagnement'],
  theo_mediation_humaine: 'oui_pour_essentiel',

  // Very high ethical concern
  theo_risque_futur: 'deshumanisation',
  theo_utilite_percue: 'neutre',
  psych_aias_opacity: 'oui_fortement',
  psych_imago_dei: 'beaucoup',
  psych_anxiete_remplacement: 'possible_partiel',

  // High psychological perception
  psych_godspeed_nature: '4_humain_moins',
  psych_godspeed_conscience: 'possible_emergence',

  // Moderate future orientation
  futur_intention_usage: 'oui_probable',
  futur_formation_souhait: 'oui_assez',
});

/**
 * Explorateur profile
 * Theological uncertainty, lower religiosity, exploring
 */
export const explorateurAnswers: Answers = createBaseAnswers({
  profil_statut: 'curieux',
  theo_orientation: 'ne_sait_pas',
  profil_anciennete_foi: '1_5_ans',

  // Lower religiosity
  crs_intellect: 'rarement',
  crs_ideology: 'peu',
  crs_public_practice: 'quelques_fois_an',
  crs_private_practice: 'rarement',
  crs_experience: 'peu',

  // Moderate AI openness
  ctrl_ia_frequence: 'occasionnel',
  ctrl_ia_confort: 3,
  ctrl_ia_contextes: ['personnel'],
  digital_attitude_generale: 'positif',

  // Many "ne_sait_pas" answers
  theo_inspiration: 'ne_sait_pas',
  theo_utilite_percue: 'ne_sait_pas',
  psych_godspeed_conscience: 'incertain',
  psych_imago_dei: 'ne_sait_pas',
  psych_anxiete_remplacement: 'ne_sait_pas',
  theo_risque_futur: 'ne_sait_pas',

  // Low community influence
  communaute_position_officielle: 'ne_sait_pas',
  communaute_discussions: 'jamais',
  communaute_perception_pairs: 'ne_sait_pas',

  // Moderate-high future orientation
  futur_intention_usage: 'peut_etre',
  futur_formation_souhait: 'oui_assez',
});

/**
 * Innovateur Ancré profile
 * High religiosity AND high AI openness, traditionalist theology
 */
export const innovateurAncreAnswers: Answers = createBaseAnswers({
  profil_statut: 'clerge',
  theo_orientation: 'traditionaliste',

  // Very high religiosity
  crs_intellect: 'tres_souvent',
  crs_ideology: 'totalement',
  crs_public_practice: 'pluri_hebdo',
  crs_private_practice: 'pluri_quotidien',
  crs_experience: 'totalement',

  // Very high AI openness
  ctrl_ia_frequence: 'quotidien',
  ctrl_ia_confort: 5,
  ctrl_ia_contextes: ['travail', 'personnel', 'creatif', 'spirituel'],
  digital_attitude_generale: 'tres_positif',

  // Lower sacred boundary (permeable)
  theo_liturgie_ia: 4,
  theo_activites_sacrees: ['confession'],
  theo_mediation_humaine: 'partiellement',
  theo_inspiration: 'possible_indirect',

  // Moderate ethical concern
  theo_risque_futur: 'paresse',
  theo_utilite_percue: 'positif',

  // High future orientation
  futur_intention_usage: 'oui_certain',
  futur_formation_souhait: 'oui_tres',
  futur_domaines_interet: ['catechese', 'communication', 'administration'],
});

// ==========================================
// CLERGY-SPECIFIC FIXTURES
// ==========================================

/**
 * Clergy member with ministry questions answered
 */
export const clergyAnswers: Answers = createBaseAnswers({
  profil_statut: 'clerge',

  // Ministry-specific
  min_pred_usage: 'regulier',
  min_pred_sentiment: 3,
  min_care_email: 'oui_brouillon',
  min_admin_burden: 4,
});

/**
 * Clergy who never uses AI for ministry
 */
export const clergyNoAIAnswers: Answers = createBaseAnswers({
  profil_statut: 'clerge',

  ctrl_ia_frequence: 'jamais',
  ctrl_ia_confort: 1,
  ctrl_ia_contextes: [],

  // Ministry-specific - never uses
  min_pred_usage: 'jamais',
  min_care_email: 'non_jamais',
  min_admin_burden: 2,
});

// ==========================================
// LAYPERSON-SPECIFIC FIXTURES
// ==========================================

/**
 * Layperson with specific lay questions answered
 */
export const laypersonAnswers: Answers = createBaseAnswers({
  profil_statut: 'laic_engagé',

  // Lay-specific
  laic_substitution_priere: 'oui_neutre',
  laic_conseil_spirituel: 'complement',
});

/**
 * Layperson who would never use AI for spiritual purposes
 */
export const laypersonNoSpiritualAIAnswers: Answers = createBaseAnswers({
  profil_statut: 'laic_pratiquant',

  ctrl_ia_frequence: 'regulier',
  ctrl_ia_confort: 4,
  ctrl_ia_contextes: ['travail', 'personnel'], // No 'spirituel'

  // Lay-specific - resistant
  laic_substitution_priere: 'non',
  laic_conseil_spirituel: 'jamais',
});

// ==========================================
// BIAS SCENARIO FIXTURES
// ==========================================

/**
 * High social desirability bias (all MC items answered in "target" direction)
 */
export const highBiasAnswers: Answers = createBaseAnswers({
  ctrl_mc_1: 'false', // Target (claims easy to work without encouragement)
  ctrl_mc_2: 'true',  // Target (claims never disliked anyone)
  ctrl_mc_3: 'false', // Target (claims never rebels)
  ctrl_mc_4: 'true',  // Target (claims always courteous)
  ctrl_mc_5: 'false', // Target (claims never taken advantage)
});

/**
 * Low social desirability bias (no MC items in target direction)
 */
export const lowBiasAnswers: Answers = createBaseAnswers({
  ctrl_mc_1: 'true',  // NOT target
  ctrl_mc_2: 'false', // NOT target
  ctrl_mc_3: 'true',  // NOT target
  ctrl_mc_4: 'false', // NOT target
  ctrl_mc_5: 'true',  // NOT target
});

// ==========================================
// EDGE CASE FIXTURES
// ==========================================

/**
 * Minimal answers - only required fields
 */
export const minimalAnswers: Answers = {
  profil_statut: 'laic_pratiquant',
  profil_confession: 'catholique',
  ctrl_ia_frequence: 'occasionnel',
  crs_intellect: 'occasionnellement',
  crs_ideology: 'moderement',
  crs_public_practice: 'mensuel',
  crs_private_practice: 'occasionnellement',
  crs_experience: 'moderement',
};

/**
 * Empty answers (edge case)
 */
export const emptyAnswers: Answers = {};

/**
 * Extreme high values across the board
 */
export const extremeHighAnswers: Answers = createBaseAnswers({
  crs_intellect: 'tres_souvent',
  crs_ideology: 'totalement',
  crs_public_practice: 'pluri_hebdo',
  crs_private_practice: 'pluri_quotidien',
  crs_experience: 'totalement',

  ctrl_ia_frequence: 'quotidien',
  ctrl_ia_confort: 5,
  ctrl_ia_contextes: ['travail', 'personnel', 'spirituel', 'creatif'],

  theo_liturgie_ia: 5,
  futur_intention_usage: 'oui_certain',
  futur_formation_souhait: 'oui_tres',
});

/**
 * Extreme low values across the board
 */
export const extremeLowAnswers: Answers = createBaseAnswers({
  crs_intellect: 'jamais',
  crs_ideology: 'pas_du_tout',
  crs_public_practice: 'jamais',
  crs_private_practice: 'jamais',
  crs_experience: 'pas_du_tout',

  ctrl_ia_frequence: 'jamais',
  ctrl_ia_confort: 1,
  ctrl_ia_contextes: [],

  theo_liturgie_ia: 1,
  futur_intention_usage: 'non_certain',
  futur_formation_souhait: 'non_pas_du_tout',
});
