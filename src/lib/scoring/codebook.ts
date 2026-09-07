/**
 * CODEBOOK - "IA & Foi" scoring documentation (FAIR)
 *
 * VERSION: 2.0.0
 * LAST UPDATED: 2026-09-07
 *
 * What this file documents, and what it does NOT claim:
 * - CRS-5 is used in an ADAPTED form (item wording localised, practice
 *   frequencies recoded per Huber & Huber, 2012, for both public and private
 *   practice; the same recode table applies to archived v1 answers).
 *   Status: `adapted`.
 * - The social-desirability items are an AD HOC SELECTION of 5 Marlowe-Crowne
 *   items (Crowne & Marlowe, 1960). They are NOT a validated short form; no
 *   "Form C" claim is made. They produce a covariate flag, never a correction.
 * - Godspeed (Bartneck et al., 2009) and AIAS (Wang & Wang, 2022) only INSPIRED
 *   the perception and opacity items; the originals are not administered.
 * - The other five dimensions are exploratory ad hoc constructs.
 * - No population parameters, no client-side percentiles: empirical ranks are
 *   served by GET /api/results/norms once N >= 30.
 *
 * @see docs/SCORING_V2_SPEC.md
 */

import { DIMENSION_ITEM_SPECS, MIN_ITEMS, MIN_ITEMS_RELIGIOSITY } from './dimensions';
import { ITEM_SCORE_MAPS, SCALE_ITEM_SPECS, COUNT_ITEM_SPECS, MATRIX_TASK_WEIGHTS } from './score-maps';
import { PROFILE_DEFINITIONS } from './constants';
import { MC_KEYED_RESPONSES, MC_MIN_ITEMS, MC_FLAG_THRESHOLD } from './bias';
import type { DimensionKey, DimensionRanges, DimensionWeights, PrimaryProfile } from './types';

// ==========================================
// DIMENSIONS
// ==========================================

export type ValidationStatus = 'adapted' | 'inspired_by' | 'exploratory';

export interface QuestionContribution {
  questionId: string;
  weight: number;
  scoringLogic: string;
  /** Routing predicate, when the item is not asked to everyone */
  conditionalOn?: string;
  /** Part of the universal common core */
  core: boolean;
}

export interface DimensionCodebook {
  id: DimensionKey;
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  scale: { min: number; max: number };
  validationStatus: ValidationStatus;
  sourceInstrument: string | null;
  minItems: number;
  aggregation: string;
  missingPolicy: string;
  questions: QuestionContribution[];
}

const SCORING_LOGIC: Record<string, string> = {
  crs_intellect: 'jamais=1, rarement=2, occasionnellement=3, souvent=4, tres_souvent=5',
  crs_ideology: 'pas_du_tout=1, peu=2, moderement=3, beaucoup=4, totalement=5',
  crs_public_practice:
    'recodage Huber : pluri_hebdo=5, hebdo=4, mensuel=3, quelques_fois_an=2, rarement=2, jamais=1 ; valeurs identiques en v1 et en v2',
  crs_private_practice:
    'recodage Huber : pluri_quotidien=5, quotidien=5, hebdomadaire=4, mensuel=3, rarement=2, jamais=1 ; v1 occasionnellement = donnée manquante',
  crs_experience: 'jamais=1, rarement=2, occasionnellement=3, souvent=4, tres_souvent=5',
  ctrl_ia_frequence: 'jamais=1, essaye=2, occasionnel=3, regulier=4, quotidien=5',
  ctrl_ia_confort: 'direct 1-5 slider',
  digital_attitude_generale: 'tres_negatif=1 ... tres_positif=5',
  ctrl_ia_contextes: 'count: 1 + 0.8 * number of contexts, capped at 5',
  min_pred_usage: 'jamais=1, rare=2, regulier=4, systematique=5',
  min_pred_nature:
    'matrix: weighted delegation level (plan 1, exegese 2, illustration 1, images 1, redaction 3) rescaled to 1-5',
  min_admin_burden: 'direct 1-5 slider',
  theo_inspiration: 'possible=1, possible_indirect=2, peu_probable=4, impossible=5',
  theo_liturgie_ia: 'reversed slider (6 - value): acceptability inverts into boundary',
  theo_activites_sacrees: 'aucune=1, else 1 + 0.9 * number of protected activities, capped at 5',
  theo_mediation_humaine:
    'non_pas_necessairement=1, partiellement=2, oui_pour_essentiel=4, oui_absolument=5',
  min_pred_sentiment: 'direct slider: high = uncomfortable = stronger boundary',
  min_care_email: 'non=5, oui_relu=3, oui_tel_quel=1 (v1 non_jamais=5, oui_brouillon=3, oui_souvent=1)',
  laic_substitution_priere: 'non=5, oui_negatif=3, oui_neutre=2, oui_positif=1',
  laic_conseil_spirituel: 'jamais=5, complement=3, oui_possible=2, deja_fait=1',
  theo_utilite_percue: 'reversed: tres_positif=1 ... tres_negatif=5',
  psych_aias_opacity: 'non_confiance=1, non_indifferent=1.5, peu=2.5, oui_moderement=4, oui_fortement=5',
  psych_imago_dei: 'pas_du_tout=1 ... totalement=5',
  psych_godspeed_nature: '1_machine=1 ... 5_humain=5',
  psych_godspeed_conscience: 'impossible=1, imitation=2, incertain=3, possible_emergence=4, probable=5',
  psych_anxiete_remplacement:
    'non_impossible=1, non_peu_probable=2, possible_partiel=3, oui_probable=4, oui_certain=5',
  communaute_position_officielle:
    'valence only: oui_defavorable=1, oui_prudent=3, oui_favorable=5; "non" and "ne sait pas" are missing',
  communaute_perception_pairs:
    'valence: hostile=1, mefiant=2, neutre=3, opinions_variees=3, favorable=4, tres_favorable=5',
  communaute_discussions: 'jamais=1, rarement=2, parfois=3, souvent=4, organise=5',
  futur_intention_usage: 'non_certain=1 ... oui_certain=5',
  futur_formation_souhait: 'non_pas_du_tout=1 ... oui_tres=5',
  futur_domaines_interet: 'aucun_domaines=1, else 1 + 0.6 * number of domains, capped at 5',
};

const CONDITIONAL_ON: Record<string, string> = {
  ctrl_ia_contextes: 'ctrl_ia_frequence !== jamais',
  min_pred_usage: 'isClergy',
  min_pred_nature: 'clergyUsesAI',
  min_admin_burden: 'clergyUsesAI',
  min_pred_sentiment: 'clergyUsesAI',
  min_care_email: 'isClergy',
  laic_substitution_priere: 'isLayperson',
  laic_conseil_spirituel: 'isLayperson',
};

const DIMENSION_META: Record<
  DimensionKey,
  {
    name: { fr: string; en: string };
    description: { fr: string; en: string };
    validationStatus: ValidationStatus;
    sourceInstrument: string | null;
  }
> = {
  religiosity: {
    name: { fr: 'Centralité de la religiosité (CRS-5, adapté)', en: 'Centrality of religiosity (CRS-5, adapted)' },
    description: {
      fr: 'Moyenne brute des 5 items CRS-5, sans correction de désirabilité sociale',
      en: 'Raw mean of the 5 CRS-5 items, with no social-desirability correction',
    },
    validationStatus: 'adapted',
    sourceInstrument: 'CRS-5 (Huber & Huber, 2012), adapted wording',
  },
  aiOpenness: {
    name: { fr: "Ouverture à l'IA", en: 'AI openness' },
    description: {
      fr: "Fréquence d'usage déclarée, maîtrise perçue et attitude générale envers le numérique",
      en: 'Declared usage frequency, perceived proficiency and general attitude toward digital tools',
    },
    validationStatus: 'exploratory',
    sourceInstrument: null,
  },
  sacredBoundary: {
    name: { fr: 'Frontière sacrée', en: 'Sacred boundary' },
    description: {
      fr: "Étendue des actes spirituels que le répondant exclut d'une médiation par l'IA",
      en: 'Extent of spiritual acts the respondent excludes from AI mediation',
    },
    validationStatus: 'exploratory',
    sourceInstrument: null,
  },
  ethicalConcern: {
    name: { fr: 'Préoccupation éthique', en: 'Ethical concern' },
    description: {
      fr: "Inquiétude exprimée sur l'utilité, l'opacité des systèmes et l'anthropologie théologique",
      en: 'Concern about usefulness, system opacity and theological anthropology',
    },
    validationStatus: 'inspired_by',
    sourceInstrument: 'Items inspired by AIAS (Wang & Wang, 2022); the scale itself is not administered',
  },
  psychologicalPerception: {
    name: { fr: "Perception de l'IA", en: 'AI perception' },
    description: {
      fr: "Attribution de traits humains, de conscience et de capacité de remplacement à l'IA",
      en: 'Attribution of human traits, consciousness and replacement capability to AI',
    },
    validationStatus: 'inspired_by',
    sourceInstrument: 'Items inspired by the Godspeed series (Bartneck et al., 2009); the scale itself is not administered',
  },
  communityContext: {
    name: { fr: 'Contexte communautaire', en: 'Community context' },
    description: {
      fr: "Valence de la position communautaire et fréquence des échanges sur l'IA",
      en: 'Valence of the community stance and frequency of discussions about AI',
    },
    validationStatus: 'exploratory',
    sourceInstrument: null,
  },
  futureOrientation: {
    name: { fr: 'Orientation future', en: 'Future orientation' },
    description: {
      fr: "Intentions d'usage, souhait de formation et étendue des domaines d'intérêt",
      en: 'Usage intentions, training interest and breadth of domains of interest',
    },
    validationStatus: 'exploratory',
    sourceInstrument: null,
  },
};

const DIMENSION_IDS = Object.keys(DIMENSION_META) as DimensionKey[];

export const DIMENSION_CODEBOOK: Record<DimensionKey, DimensionCodebook> = DIMENSION_IDS.reduce(
  (acc, id) => {
    acc[id] = {
      id,
      ...DIMENSION_META[id],
      scale: { min: 1, max: 5 },
      minItems: id === 'religiosity' ? MIN_ITEMS_RELIGIOSITY : MIN_ITEMS,
      aggregation:
        'Weighted mean over answered items; value = null below minItems; confidence = nItems / maxItems',
      missingPolicy:
        '"ne sait pas", "sans réponse", unanswered and unrecognised values are excluded from the mean and never imputed',
      questions: DIMENSION_ITEM_SPECS[id].map((spec) => ({
        questionId: spec.id,
        weight: spec.weight,
        scoringLogic: SCORING_LOGIC[spec.id] ?? 'see src/lib/scoring/score-maps.ts',
        conditionalOn: CONDITIONAL_ON[spec.id],
        core: spec.core === true,
      })),
    };
    return acc;
  },
  {} as Record<DimensionKey, DimensionCodebook>,
);

/** Items excluded from every dimension and kept as covariates only */
export const COVARIATES_ONLY: string[] = [
  'profil_age',
  'profil_genre',
  'profil_statut',
  'profil_education',
  'profil_pays',
  'profil_milieu',
  'profil_secteur',
  'profil_anciennete_foi',
  'profil_annees_ministere',
  'profil_taille_communaute',
  'profil_formation_theologique',
  'profil_confession',
  'theo_orientation',
  'theo_risque_futur',
  'digital_outils_existants',
];

// ==========================================
// PROFILES (derived from the single source of truth)
// ==========================================

export interface ProfileCodebook {
  id: PrimaryProfile;
  name: string;
  emoji: string;
  idealDimensions: DimensionRanges;
  weights: DimensionWeights;
  subProfiles: string[];
}

export const PROFILE_CODEBOOK: Record<PrimaryProfile, ProfileCodebook> = (
  Object.keys(PROFILE_DEFINITIONS) as PrimaryProfile[]
).reduce(
  (acc, id) => {
    const def = PROFILE_DEFINITIONS[id];
    acc[id] = {
      id,
      name: def.title,
      emoji: def.emoji,
      idealDimensions: def.idealDimensions,
      weights: def.weights,
      subProfiles: def.subProfiles,
    };
    return acc;
  },
  {} as Record<PrimaryProfile, ProfileCodebook>,
);

// ==========================================
// SOCIAL DESIRABILITY
// ==========================================

export interface SocialDesirabilityCodebook {
  instrument: string;
  status: 'ad_hoc_selection';
  citation: string;
  itemCount: number;
  items: { questionId: string; keyedResponse: string; description: string }[];
  scoring: string;
  flagRule: string;
  usage: string;
}

export const SOCIAL_DESIRABILITY_CODEBOOK: SocialDesirabilityCodebook = {
  instrument: 'Sélection ad hoc de 5 items de la Marlowe-Crowne Social Desirability Scale',
  status: 'ad_hoc_selection',
  citation:
    'Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. Journal of Consulting Psychology, 24(4), 349-354.',
  itemCount: 5,
  items: [
    { questionId: 'ctrl_mc_1', keyedResponse: MC_KEYED_RESPONSES.ctrl_mc_1, description: 'Never needs encouragement to get going' },
    { questionId: 'ctrl_mc_2', keyedResponse: MC_KEYED_RESPONSES.ctrl_mc_2, description: 'Never intensely disliked anyone' },
    { questionId: 'ctrl_mc_3', keyedResponse: MC_KEYED_RESPONSES.ctrl_mc_3, description: 'Never rebels against authority' },
    { questionId: 'ctrl_mc_4', keyedResponse: MC_KEYED_RESPONSES.ctrl_mc_4, description: 'Always courteous' },
    { questionId: 'ctrl_mc_5', keyedResponse: MC_KEYED_RESPONSES.ctrl_mc_5, description: 'Never took advantage of anyone' },
  ],
  scoring: `Share of answered items endorsed in the keyed direction, normalised to 0-1; null below ${MC_MIN_ITEMS} answered items`,
  flagRule: `flag = true when nItems >= ${MC_MIN_ITEMS} and score >= ${MC_FLAG_THRESHOLD}`,
  usage:
    'Covariate flag only. No dimension score is deflated, no confidence multiplier is applied.',
};

// ==========================================
// ALGORITHM PARAMETERS
// ==========================================

export interface AlgorithmParameter {
  name: string;
  description: string;
  value: number;
  empiricallyValidated: boolean;
  justification: string;
}

export const ALGORITHM_PARAMETERS: AlgorithmParameter[] = [
  {
    name: 'EXPONENTIAL_DECAY',
    description: 'score = 100 * exp(-DECAY * weighted distance to the ideal ranges)',
    value: 0.5,
    empiricallyValidated: false,
    justification: 'Expert choice: distance 2 ~ 37 % match, distance 4 ~ 14 % match',
  },
  {
    name: 'MIN_VALUED_DIMENSIONS',
    description: 'Below this many non-null dimensions, no profile is attributed',
    value: 4,
    empiricallyValidated: false,
    justification: 'A profile drawn from 3 dimensions or fewer is not interpretable',
  },
  {
    name: 'BONUS_POINTS_PER_UNIT',
    description: 'Conversion of a pattern bonus unit into match-score points',
    value: 6,
    empiricallyValidated: false,
    justification: 'Bonuses are applied in score space, after the distance conversion',
  },
  {
    name: 'THEO_ORIENTATION_WEIGHT',
    description: 'Multiplier applied to the theo_orientation self-label bonus',
    value: 0.5,
    empiricallyValidated: false,
    justification: 'Self-labelling weighs half as much as answer-pattern bonuses (spec §1.5)',
  },
  {
    name: 'MIN_ITEMS',
    description: 'Minimum answered items for a dimension to be valued',
    value: MIN_ITEMS,
    empiricallyValidated: false,
    justification: 'A single item is not a dimension',
  },
  {
    name: 'MIN_ITEMS_RELIGIOSITY',
    description: 'Minimum answered CRS-5 items',
    value: MIN_ITEMS_RELIGIOSITY,
    empiricallyValidated: false,
    justification: '4 of the 5 CRS-5 items are required for a defensible mean',
  },
];

// ==========================================
// FAIR METADATA
// ==========================================

export interface FAIRMetadata {
  identifier: string | null;
  version: string;
  license: string;
  creator: string;
  dateCreated: string;
  dateModified: string;
  description: { fr: string; en: string };
  keywords: string[];
  instruments: { name: string; status: ValidationStatus; note: string }[];
  exploratoryConstructs: string[];
  limitationsAcknowledged: string[];
  recommendedCitations: string[];
}

export const FAIR_METADATA: FAIRMetadata = {
  identifier: null,
  version: '2.0.0',
  license: 'CC-BY-4.0',
  creator: 'Romain Girardi',
  dateCreated: '2025-01-01',
  dateModified: '2026-09-07',
  description: {
    fr: "Système de scoring de l'étude « IA & Foi chrétienne ». Outil exploratoire : les profils sont une attribution heuristique, pas un diagnostic.",
    en: 'Scoring system for the "AI & Christian faith" study. Exploratory tool: profiles are a heuristic attribution, not a diagnosis.',
  },
  keywords: [
    'artificial intelligence',
    'religion',
    'Christianity',
    'CRS-5',
    'social desirability',
    'spirituality',
  ],
  instruments: [
    {
      name: 'CRS-5 (Huber & Huber, 2012)',
      status: 'adapted',
      note: 'Wording localised and practice frequencies recoded per the authors (public and private); not administered verbatim',
    },
    {
      name: 'Marlowe-Crowne items (Crowne & Marlowe, 1960)',
      status: 'exploratory',
      note: 'Ad hoc selection of 5 items, not a validated short form',
    },
    {
      name: 'Godspeed series (Bartneck et al., 2009)',
      status: 'inspired_by',
      note: 'Two items inspired by the anthropomorphism dimension',
    },
    {
      name: 'AIAS (Wang & Wang, 2022)',
      status: 'inspired_by',
      note: 'One opacity item inspired by the AI anxiety scale',
    },
  ],
  exploratoryConstructs: [
    'AI openness',
    'Sacred boundary',
    'Ethical concern',
    'Community context',
    'Future orientation',
  ],
  limitationsAcknowledged: [
    'Profile attribution is heuristic: ideal ranges and weights are expert-set, not derived from cluster analysis',
    'Five of seven dimensions are ad hoc constructs without factor analysis',
    'The 5 social-desirability items are not a validated short form',
    'No client-side percentile: comparisons require the empirical norms endpoint and N >= 30',
    'Self-selected sample, not representative of any Christian population',
    'Cross-cultural validity not established (French and English only)',
  ],
  recommendedCitations: [
    'Huber, S., & Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). Religions, 3(3), 710-724. https://doi.org/10.3390/rel3030710',
    'Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. Journal of Consulting Psychology, 24(4), 349-354.',
    'Reynolds, W. M. (1982). Development of reliable and valid short forms of the Marlowe-Crowne Social Desirability Scale. Journal of Clinical Psychology, 38(1), 119-125. (cited for context on short forms; none of them is used here)',
    'Bartneck, C., Kulić, D., Croft, E., & Zoghbi, S. (2009). Measurement instruments for the anthropomorphism, animacy, likeability, perceived intelligence, and perceived safety of robots. International Journal of Social Robotics, 1(1), 71-81.',
    'Wang, Y. Y., & Wang, Y. S. (2022). Development and validation of an artificial intelligence anxiety scale. Interactive Learning Environments, 30(4), 619-634.',
  ],
};

// ==========================================
// EXPORT
// ==========================================

export function exportCodebookAsJSON(): string {
  return JSON.stringify(
    {
      _metadata: {
        exportDate: new Date().toISOString(),
        version: FAIR_METADATA.version,
        description: 'Scoring methodology codebook for the "IA & Foi" survey',
      },
      fairMetadata: FAIR_METADATA,
      dimensions: DIMENSION_CODEBOOK,
      covariatesOnly: COVARIATES_ONLY,
      profiles: PROFILE_CODEBOOK,
      socialDesirability: SOCIAL_DESIRABILITY_CODEBOOK,
      algorithmParameters: ALGORITHM_PARAMETERS,
      itemScoreMaps: ITEM_SCORE_MAPS,
      scaleItems: SCALE_ITEM_SPECS,
      countItems: COUNT_ITEM_SPECS,
      matrixItems: MATRIX_TASK_WEIGHTS,
    },
    null,
    2,
  );
}
