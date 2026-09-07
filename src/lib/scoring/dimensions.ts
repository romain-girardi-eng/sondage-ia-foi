/**
 * Seven dimensions - scoring core v2
 *
 * Rules (docs/SCORING_V2_SPEC.md §1.3):
 * - every item feeds exactly ONE dimension;
 * - no demographic variable enters a dimension (they stay covariates);
 * - "ne sait pas" / "sans réponse" / unanswered are MISSING, never imputed;
 * - a dimension with fewer than MIN_ITEMS answered items has `value = null`;
 * - `confidence = nItems / maxItems`, where maxItems counts the items this
 *   respondent could have been asked given the clergy/laity routing;
 * - religiosity is the raw CRS-5 mean, with no social-desirability correction.
 *
 * Validation status: religiosity uses CRS-5 (adapted); psychologicalPerception
 * is inspired by Godspeed and AIAS items; the other five dimensions are
 * exploratory ad hoc constructs awaiting factor analysis.
 */

import {
  ITEM_SCORE_MAPS,
  SCALE_ITEM_SPECS,
  COUNT_ITEM_SPECS,
  MATRIX_TASK_WEIGHTS,
  MATRIX_MAX_LEVEL,
  SCALE_MIN,
  SCALE_MAX,
  isMissing,
  isExclusiveOption,
} from './score-maps';
import type { Answers } from '@/data';
import type {
  CoreSubscores,
  DimensionKey,
  DimensionScore,
  SevenDimensions,
} from './types';
import { isClergy, isLayperson, clergyUsesAI, getStringAnswer } from '@/lib/utils/answers';

export { isMissing };

// ==========================================
// THRESHOLDS
// ==========================================

export const MIN_ITEMS = 2;
export const MIN_ITEMS_RELIGIOSITY = 4;

// ==========================================
// ITEM -> DIMENSION MAP
// ==========================================

export interface DimensionItemSpec {
  id: string;
  weight: number;
  /** Whether the survey routing exposes this item to this respondent */
  applicable?: (answers: Answers) => boolean;
  /** Part of the "common core" comparable across clergy and laypeople */
  core?: boolean;
}

const usesAIAtAll = (answers: Answers): boolean => {
  const freq = getStringAnswer(answers, 'ctrl_ia_frequence');
  return freq !== '' && freq !== 'jamais';
};

export const DIMENSION_ITEM_SPECS: Record<DimensionKey, DimensionItemSpec[]> = {
  religiosity: [
    { id: 'crs_intellect', weight: 1, core: true },
    { id: 'crs_ideology', weight: 1, core: true },
    { id: 'crs_public_practice', weight: 1, core: true },
    { id: 'crs_private_practice', weight: 1, core: true },
    { id: 'crs_experience', weight: 1, core: true },
  ],
  aiOpenness: [
    { id: 'ctrl_ia_frequence', weight: 1, core: true },
    { id: 'ctrl_ia_confort', weight: 1, core: true },
    { id: 'digital_attitude_generale', weight: 1, core: true },
    { id: 'ctrl_ia_contextes', weight: 1, applicable: usesAIAtAll },
    { id: 'min_pred_usage', weight: 1, applicable: isClergy },
    { id: 'min_pred_nature', weight: 1, applicable: clergyUsesAI },
    { id: 'min_admin_burden', weight: 0.5, applicable: clergyUsesAI },
  ],
  sacredBoundary: [
    { id: 'theo_inspiration', weight: 1, core: true },
    { id: 'theo_liturgie_ia', weight: 1, core: true },
    { id: 'theo_activites_sacrees', weight: 1, core: true },
    { id: 'theo_mediation_humaine', weight: 1, core: true },
    { id: 'min_pred_sentiment', weight: 1, applicable: clergyUsesAI },
    { id: 'min_care_email', weight: 1, applicable: isClergy },
    { id: 'laic_substitution_priere', weight: 1, applicable: isLayperson },
    { id: 'laic_conseil_spirituel', weight: 1, applicable: isLayperson },
  ],
  ethicalConcern: [
    { id: 'theo_utilite_percue', weight: 1, core: true },
    { id: 'psych_aias_opacity', weight: 1, core: true },
    { id: 'psych_imago_dei', weight: 1, core: true },
  ],
  psychologicalPerception: [
    { id: 'psych_godspeed_nature', weight: 1, core: true },
    { id: 'psych_godspeed_conscience', weight: 1, core: true },
    { id: 'psych_anxiete_remplacement', weight: 1, core: true },
  ],
  communityContext: [
    { id: 'communaute_position_officielle', weight: 1, core: true },
    { id: 'communaute_perception_pairs', weight: 1, core: true },
    { id: 'communaute_discussions', weight: 1, core: true },
  ],
  futureOrientation: [
    { id: 'futur_intention_usage', weight: 1, core: true },
    { id: 'futur_formation_souhait', weight: 1, core: true },
    { id: 'futur_domaines_interet', weight: 1, core: true },
  ],
};

export const DIMENSION_KEYS: readonly DimensionKey[] = [
  'religiosity',
  'aiOpenness',
  'sacredBoundary',
  'ethicalConcern',
  'psychologicalPerception',
  'communityContext',
  'futureOrientation',
] as const;

/** Exact question ids feeding each dimension (for shared-item detection) */
export const DIMENSION_ITEMS: Record<DimensionKey, string[]> = DIMENSION_KEYS.reduce(
  (acc, key) => {
    acc[key] = DIMENSION_ITEM_SPECS[key].map((spec) => spec.id);
    return acc;
  },
  {} as Record<DimensionKey, string[]>,
);

export const MIN_ITEMS_BY_DIMENSION: Record<DimensionKey, number> = {
  religiosity: MIN_ITEMS_RELIGIOSITY,
  aiOpenness: MIN_ITEMS,
  sacredBoundary: MIN_ITEMS,
  ethicalConcern: MIN_ITEMS,
  psychologicalPerception: MIN_ITEMS,
  communityContext: MIN_ITEMS,
  futureOrientation: MIN_ITEMS,
};

// ==========================================
// ITEM SCORING
// ==========================================

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Score a single item on the 1-5 dimension metric.
 * Returns null for every missing or unrecognised value.
 */
export function scoreItem(itemId: string, answers: Answers): number | null {
  const raw = answers[itemId];
  if (isMissing(raw)) return null;

  const optionMap = ITEM_SCORE_MAPS[itemId];
  if (optionMap) {
    if (typeof raw !== 'string') return null;
    const score = optionMap[raw];
    return typeof score === 'number' ? score : null;
  }

  const scaleSpec = SCALE_ITEM_SPECS[itemId];
  if (scaleSpec) {
    if (typeof raw !== 'number') return null;
    const bounded = clamp(raw, SCALE_MIN, SCALE_MAX);
    return scaleSpec.reverse ? SCALE_MIN + SCALE_MAX - bounded : bounded;
  }

  const countSpec = COUNT_ITEM_SPECS[itemId];
  if (countSpec) {
    if (!Array.isArray(raw)) return null;
    // Exclusive "aucun*" options are matched by prefix too, so a renamed
    // option in the instrument cannot silently inflate the count score.
    if (raw.some((value) => countSpec.exclusive.includes(value) || isExclusiveOption(value))) {
      return countSpec.floor;
    }
    return clamp(1 + raw.length * countSpec.step, 1, 5);
  }

  const taskWeights = MATRIX_TASK_WEIGHTS[itemId];
  if (taskWeights) {
    if (typeof raw !== 'object' || Array.isArray(raw)) return null;
    let weightedLevel = 0;
    let maxWeightedLevel = 0;
    for (const [task, weight] of Object.entries(taskWeights)) {
      const level = raw[task];
      if (typeof level !== 'number' || !Number.isFinite(level)) continue;
      weightedLevel += clamp(level, 0, MATRIX_MAX_LEVEL) * weight;
      maxWeightedLevel += MATRIX_MAX_LEVEL * weight;
    }
    if (maxWeightedLevel === 0) return null;
    return 1 + (weightedLevel / maxWeightedLevel) * 4;
  }

  return null;
}

function isApplicable(spec: DimensionItemSpec, answers: Answers): boolean {
  // An item that carries an answer was evidently shown, whatever the routing
  // predicate says (schema versions drift); this also keeps nItems <= maxItems.
  if (!isMissing(answers[spec.id])) return true;
  return spec.applicable ? spec.applicable(answers) : true;
}

function aggregate(
  specs: DimensionItemSpec[],
  answers: Answers,
  minItems: number,
): DimensionScore {
  let weightedSum = 0;
  let totalWeight = 0;
  let nItems = 0;
  let maxItems = 0;

  for (const spec of specs) {
    if (!isApplicable(spec, answers)) continue;
    maxItems++;
    const score = scoreItem(spec.id, answers);
    if (score === null) continue;
    nItems++;
    weightedSum += score * spec.weight;
    totalWeight += spec.weight;
  }

  const value =
    nItems >= minItems && totalWeight > 0
      ? Math.round((weightedSum / totalWeight) * 100) / 100
      : null;

  return {
    value,
    confidence: maxItems > 0 ? nItems / maxItems : 0,
    nItems,
    maxItems,
    percentile: null,
  };
}

function calculateDimension(key: DimensionKey, answers: Answers): DimensionScore {
  return aggregate(DIMENSION_ITEM_SPECS[key], answers, MIN_ITEMS_BY_DIMENSION[key]);
}

// ==========================================
// PUBLIC DIMENSION FUNCTIONS
// ==========================================

/** Raw CRS-5 mean (Huber & Huber, 2012), minimum 4 items, no bias correction */
export function calculateReligiosityDimension(answers: Answers): DimensionScore {
  return calculateDimension('religiosity', answers);
}

export function calculateAIOpennessDimension(answers: Answers): DimensionScore {
  return calculateDimension('aiOpenness', answers);
}

export function calculateSacredBoundaryDimension(answers: Answers): DimensionScore {
  return calculateDimension('sacredBoundary', answers);
}

export function calculateEthicalConcernDimension(answers: Answers): DimensionScore {
  return calculateDimension('ethicalConcern', answers);
}

export function calculatePsychologicalPerceptionDimension(answers: Answers): DimensionScore {
  return calculateDimension('psychologicalPerception', answers);
}

export function calculateCommunityContextDimension(answers: Answers): DimensionScore {
  return calculateDimension('communityContext', answers);
}

export function calculateFutureOrientationDimension(answers: Answers): DimensionScore {
  return calculateDimension('futureOrientation', answers);
}

export function calculateAllDimensions(answers: Answers): SevenDimensions {
  return {
    religiosity: calculateReligiosityDimension(answers),
    aiOpenness: calculateAIOpennessDimension(answers),
    sacredBoundary: calculateSacredBoundaryDimension(answers),
    ethicalConcern: calculateEthicalConcernDimension(answers),
    psychologicalPerception: calculatePsychologicalPerceptionDimension(answers),
    communityContext: calculateCommunityContextDimension(answers),
    futureOrientation: calculateFutureOrientationDimension(answers),
  };
}

// ==========================================
// COMMON-CORE SUB-SCORES
// ==========================================

const coreSpecs = (key: DimensionKey): DimensionItemSpec[] =>
  DIMENSION_ITEM_SPECS[key].filter((spec) => spec.core === true);

/**
 * Sub-scores computed on universal items only, so clergy and laypeople can be
 * compared without the conditional ministry/lay items shifting the mean.
 */
export function computeCoreSubscores(answers: Answers): CoreSubscores {
  return {
    sacredBoundaryCore: aggregate(coreSpecs('sacredBoundary'), answers, MIN_ITEMS),
    aiOpennessCore: aggregate(coreSpecs('aiOpenness'), answers, MIN_ITEMS),
  };
}
