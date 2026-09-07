/**
 * Single source of truth for item scoring.
 *
 * One item is scored in exactly one way; a dimension never re-scores an item
 * with a different map. Instrument v2 option values and the v1 values still
 * present in the database both resolve here.
 *
 * Any value absent from a map is treated as MISSING (excluded from the mean),
 * as are the documented missing codes below. Nothing is ever imputed.
 */

import type { AnswerValue } from '@/data';

/** Codes that mean "no usable answer" on any item */
export const MISSING_VALUES: readonly string[] = [
  '',
  'ne_sait_pas',
  'sans_reponse',
  'prefere_ne_pas_repondre',
  'ne_souhaite_pas',
];

export function isMissing(value: AnswerValue | undefined | null): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return MISSING_VALUES.includes(value);
  if (typeof value === 'number') return !Number.isFinite(value);
  if (Array.isArray(value)) return value.length === 0;
  return Object.keys(value).length === 0;
}

// ==========================================
// ORDINAL CHOICE ITEMS
// ==========================================

/**
 * itemId -> option value -> 1-5 score.
 * v1 values kept alongside v2 values so archived responses keep scoring.
 */
export const ITEM_SCORE_MAPS: Record<string, Record<string, number>> = {
  // --- CRS-5 (raw, Huber & Huber 2012 recoding) ---
  crs_intellect: {
    jamais: 1,
    rarement: 2,
    occasionnellement: 3,
    souvent: 4,
    tres_souvent: 5,
  },
  crs_ideology: {
    pas_du_tout: 1,
    peu: 2,
    moderement: 3,
    beaucoup: 4,
    totalement: 5,
  },
  crs_public_practice: {
    jamais: 1,
    rarement: 2,
    quelques_fois_an: 3,
    mensuel: 4,
    hebdomadaire: 5,
    hebdomadaire_plus: 5,
    // v1: `hebdo` and `pluri_hebdo` both fold into `hebdomadaire_plus`
    hebdo: 5,
    pluri_hebdo: 5,
  },
  // v1 `occasionnellement` has no v2 equivalent (the weekly anchor was missing)
  // and is deliberately absent, i.e. treated as missing.
  crs_private_practice: {
    jamais: 1,
    rarement: 2,
    mensuel: 3,
    hebdomadaire: 4,
    quotidien: 5,
    pluri_quotidien: 5,
  },
  crs_experience: {
    jamais: 1,
    rarement: 2,
    occasionnellement: 3,
    souvent: 4,
    tres_souvent: 5,
  },

  // --- AI openness ---
  ctrl_ia_frequence: {
    jamais: 1,
    essaye: 2,
    occasionnel: 3,
    regulier: 4,
    quotidien: 5,
  },
  digital_attitude_generale: {
    tres_negatif: 1,
    negatif: 2,
    neutre: 3,
    positif: 4,
    tres_positif: 5,
  },
  min_pred_usage: {
    jamais: 1,
    rare: 2,
    regulier: 4,
    systematique: 5,
  },

  // --- Sacred boundary (5 = strongest boundary) ---
  theo_inspiration: {
    impossible: 5,
    peu_probable: 4,
    possible_indirect: 2,
    possible: 1,
  },
  theo_mediation_humaine: {
    oui_absolument: 5,
    oui_pour_essentiel: 4,
    partiellement: 2,
    non_pas_necessairement: 1,
  },
  min_care_email: {
    non: 5,
    oui_relu: 3,
    oui_tel_quel: 1,
    // v1 recoding (docs/INSTRUMENT_V2_CHANGES.md §3); v1 `oui_souvent`
    // measured responsiveness, not delegation, and stays unscored.
    non_jamais: 5,
    oui_brouillon: 3,
  },
  laic_substitution_priere: {
    non: 5,
    oui_negatif: 3,
    oui_neutre: 2,
    oui_positif: 1,
  },
  laic_conseil_spirituel: {
    jamais: 5,
    complement: 3,
    oui_possible: 2,
    deja_fait: 1,
  },

  // --- Ethical concern (5 = most concerned) ---
  theo_utilite_percue: {
    tres_negatif: 5,
    negatif: 4,
    neutre: 3,
    positif: 2,
    tres_positif: 1,
  },
  psych_aias_opacity: {
    non_confiance: 1,
    non_indifferent: 1.5,
    peu: 2.5,
    oui_moderement: 4,
    oui_fortement: 5,
  },
  psych_imago_dei: {
    pas_du_tout: 1,
    peu: 2,
    moderement: 3,
    beaucoup: 4,
    totalement: 5,
  },

  // --- Psychological perception (5 = most human-like attribution) ---
  psych_godspeed_nature: {
    '1_machine': 1,
    '2_machine_plus': 2,
    '3_neutre': 3,
    '4_humain_moins': 4,
    '5_humain': 5,
  },
  psych_godspeed_conscience: {
    impossible: 1,
    imitation: 2,
    incertain: 3,
    possible_emergence: 4,
    probable: 5,
  },
  psych_anxiete_remplacement: {
    non_impossible: 1,
    non_peu_probable: 2,
    possible_partiel: 3,
    oui_probable: 4,
    oui_certain: 5,
  },

  // --- Community context (valence of the surrounding community) ---
  communaute_position_officielle: {
    oui_defavorable: 1,
    oui_prudent: 3,
    oui_favorable: 5,
    // "non" (no official position) carries no valence -> missing
  },
  communaute_perception_pairs: {
    hostile: 1,
    mefiant: 2,
    neutre: 3,
    opinions_variees: 3,
    favorable: 4,
    tres_favorable: 5,
  },
  communaute_discussions: {
    jamais: 1,
    rarement: 2,
    parfois: 3,
    souvent: 4,
    organise: 5,
  },

  // --- Future orientation ---
  futur_intention_usage: {
    non_certain: 1,
    non_probable: 2,
    peut_etre: 3,
    oui_probable: 4,
    oui_certain: 5,
  },
  futur_formation_souhait: {
    non_pas_du_tout: 1,
    non_pas_vraiment: 2,
    peut_etre: 3,
    oui_assez: 4,
    oui_tres: 5,
  },
};

/**
 * Option values that are valid answers but deliberately unscored on their item
 * (they carry no position on the underlying continuum).
 */
export const UNSCORED_OPTIONS: Record<string, readonly string[]> = {
  communaute_position_officielle: ['non'],
};

// ==========================================
// NUMERIC SCALE ITEMS (1-5 sliders)
// ==========================================

export interface ScaleItemSpec {
  /** true when a high slider value means a LOW dimension score */
  reverse: boolean;
}

export const SCALE_ITEM_SPECS: Record<string, ScaleItemSpec> = {
  ctrl_ia_confort: { reverse: false },
  min_admin_burden: { reverse: false },
  min_pred_sentiment: { reverse: false }, // high = uncomfortable = strong boundary
  theo_liturgie_ia: { reverse: true }, // high = acceptable = weak boundary
};

export const SCALE_MIN = 1;
export const SCALE_MAX = 5;

// ==========================================
// COUNT ITEMS (multi-select)
// ==========================================

/** Convention: any option whose value starts with this prefix is exclusive */
export const EXCLUSIVE_OPTION_PREFIX = 'aucun';

export function isExclusiveOption(value: string): boolean {
  return value.startsWith(EXCLUSIVE_OPTION_PREFIX);
}

export interface CountItemSpec {
  /** Known exclusive "none of these" options; selecting one gives `floor` */
  exclusive: readonly string[];
  /** score = 1 + count * step, capped at 5 */
  step: number;
  floor: number;
}

export const COUNT_ITEM_SPECS: Record<string, CountItemSpec> = {
  ctrl_ia_contextes: { exclusive: [], step: 0.8, floor: 1 },
  theo_activites_sacrees: { exclusive: ['aucune'], step: 0.9, floor: 1 },
  futur_domaines_interet: { exclusive: ['aucun_domaines', 'aucun'], step: 0.6, floor: 1 },
};

// ==========================================
// MATRIX ITEMS
// ==========================================

/**
 * min_pred_nature: delegation level (0-3) per preaching task.
 * Task weights reflect theological sensitivity of the delegated work.
 */
export const MATRIX_TASK_WEIGHTS: Record<string, Record<string, number>> = {
  min_pred_nature: {
    plan: 1,
    exegese: 2,
    illustration: 1,
    images: 1,
    redaction: 3,
  },
};

export const MATRIX_MAX_LEVEL = 3;
