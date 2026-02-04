/**
 * Centralized Score Maps
 * All score mappings used in dimension calculations
 */

/**
 * CRS-5 (Centrality of Religiosity Scale) answer to score mapping
 * Maps answer values to 1-5 scale scores
 */
export const CRS_SCORE_MAP: Record<string, number> = {
  // Frequency labels
  'jamais': 1,
  'pas_du_tout': 1,
  'rarement': 2,
  'peu': 2,
  'occasionnellement': 3,
  'moderement': 3,
  'souvent': 4,
  'beaucoup': 4,
  'tres_souvent': 5,
  'totalement': 5,
  // Practice frequency
  'quelques_fois_an': 2,
  'mensuel': 3,
  'hebdo': 4,
  'pluri_hebdo': 5,
  'quotidien': 4,
  'pluri_quotidien': 5,
};

/**
 * AI usage frequency scores
 */
export const AI_FREQUENCY_SCORES: Record<string, number> = {
  'jamais': 1,
  'essaye': 2,
  'occasionnel': 3,
  'regulier': 4,
  'quotidien': 5,
};

/**
 * Ministry AI usage scores (for clergy)
 */
export const MINISTRY_USAGE_SCORES: Record<string, number> = {
  'jamais': 1,
  'rare': 2,
  'regulier': 4,
  'systematique': 5,
};

/**
 * Pastoral care email AI usage scores
 */
export const CARE_EMAIL_SCORES: Record<string, number> = {
  'non_jamais': 1,
  'oui_brouillon': 3.5,
  'oui_souvent': 5,
};

/**
 * Lay person prayer AI usage scores
 */
export const LAIC_PRIERE_SCORES: Record<string, number> = {
  'non': 1,
  'oui_positif': 5,
  'oui_neutre': 3.5,
  'oui_negatif': 2.5,
};

/**
 * Lay person spiritual counsel AI usage scores
 */
export const LAIC_CONSEIL_SCORES: Record<string, number> = {
  'jamais': 1,
  'complement': 3,
  'oui_possible': 4,
  'deja_fait': 5,
  'ne_sait_pas': 2.5,
};

/**
 * Sacred boundary perception scores
 */
export const SACRED_BOUNDARY_SCORES: Record<string, number> = {
  // Sacred boundary question values
  'oui_acceptable': 1,
  'oui_reserves': 2.5,
  'neutre': 3,
  'non_inappropriate': 4,
  'non_sacrilege': 5,
  // Binary answers
  'oui': 1,
  'non': 5,
  // Agreement scale
  'pas_du_tout': 1,
  'peu': 2,
  'moderement': 3,
  'beaucoup': 4,
  'totalement': 5,
};

/**
 * Ethical concern scores
 */
export const ETHICAL_CONCERN_SCORES: Record<string, number> = {
  'pas_du_tout': 1,
  'peu': 2,
  'moderement': 3,
  'beaucoup': 4,
  'totalement': 5,
};

/**
 * Psychological perception of AI scores
 */
export const PSYCHOLOGICAL_PERCEPTION_SCORES: Record<string, number> = {
  'pas_du_tout': 1,
  'peu': 2,
  'moderement': 3,
  'beaucoup': 4,
  'totalement': 5,
  // Alternative labels
  'non': 1,
  'peut_etre': 3,
  'oui': 5,
};

/**
 * Future orientation scores
 */
export const FUTURE_ORIENTATION_SCORES: Record<string, number> = {
  'moins': 1,
  'pareil': 3,
  'plus': 5,
  'ne_sait_pas': 3,
  // Alternative labels
  'diminuer': 1,
  'maintenir': 3,
  'augmenter': 5,
};

/**
 * Community influence scores
 */
export const COMMUNITY_INFLUENCE_SCORES: Record<string, number> = {
  'oppose': 5,
  'reserve': 4,
  'indifferent': 3,
  'favorable': 2,
  'tres_favorable': 1,
  // Impact perception
  'negatif': 1,
  'neutre': 3,
  'positif': 5,
};
