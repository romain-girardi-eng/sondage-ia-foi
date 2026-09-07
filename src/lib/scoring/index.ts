/**
 * Scoring core v2 - public API
 *
 * - 7 nullable dimensions (docs/SCORING_V2_SPEC.md §1.3)
 * - 8 primary profiles / 24 sub-profiles, HEURISTIC attribution (§1.5)
 * - no percentile computed client-side (§1.6): norms come from
 *   GET /api/results/norms
 * - no social-desirability correction (§1.2): the flag is a covariate
 */

export * from './types';
export * from './constants';
export * from './score-maps';

export {
  calculateReligiosityDimension,
  calculateAIOpennessDimension,
  calculateSacredBoundaryDimension,
  calculateEthicalConcernDimension,
  calculatePsychologicalPerceptionDimension,
  calculateCommunityContextDimension,
  calculateFutureOrientationDimension,
  calculateAllDimensions,
  computeCoreSubscores,
  isMissing,
  DIMENSION_KEYS,
  DIMENSION_ITEMS,
  DIMENSION_ITEM_SPECS,
  MIN_ITEMS,
  MIN_ITEMS_RELIGIOSITY,
  scoreItem,
} from './dimensions';

export {
  calculateSocialDesirability,
  MC_KEYED_RESPONSES,
  MC_ITEM_IDS,
  MC_MIN_ITEMS,
  MC_FLAG_THRESHOLD,
} from './bias';

export { computeUsageGap } from './usage-gap';

export {
  calculateProfileSpectrum,
  getSimpleProfile,
  getEnhancedProfileData,
  MIN_VALUED_DIMENSIONS,
} from './profiles';

// ==========================================
// CONVENIENCE WRAPPERS
// ==========================================

import type { Answers } from '@/data';
import { calculateReligiosityDimension, calculateAIOpennessDimension } from './dimensions';
import { calculateProfileSpectrum, getSimpleProfile } from './profiles';
import { PROFILE_DEFINITIONS, SUB_PROFILE_DEFINITIONS } from './constants';
import type { PrimaryProfile } from './types';

/** Raw CRS-5 mean, or null when fewer than 4 items were answered */
export function calculateCRS5Score(answers: Answers): number | null {
  return calculateReligiosityDimension(answers).value;
}

/** AI openness dimension value, or null when fewer than 2 items were answered */
export function calculateAIAdoptionScore(answers: Answers): number | null {
  return calculateAIOpennessDimension(answers).value;
}

// ==========================================
// RELIGIOSITY CLASSES (Huber & Huber, 2012)
// ==========================================

export type ReligiosityLevel = 'non_religieux' | 'religieux' | 'hautement_religieux';

/**
 * Three Huber classes on the raw CRS-5 mean:
 * 1.0-2.0 non religious, 2.1-3.9 religious, 4.0-5.0 highly religious.
 */
export function getReligiosityLevel(score: number): ReligiosityLevel {
  if (score <= 2.0) return 'non_religieux';
  if (score < 4.0) return 'religieux';
  return 'hautement_religieux';
}

export const RELIGIOSITY_LABELS: Record<ReligiosityLevel, string> = {
  non_religieux: 'Non religieux',
  religieux: 'Religieux',
  hautement_religieux: 'Hautement religieux',
};

// ==========================================
// AI ADOPTION BANDS (descriptive labels for the aiOpenness dimension)
// ==========================================

export type AIAdoptionLevel = 'resistant' | 'prudent' | 'ouvert' | 'enthousiaste';

export function getAIAdoptionLevel(score: number): AIAdoptionLevel {
  if (score < 2) return 'resistant';
  if (score < 3) return 'prudent';
  if (score < 4) return 'ouvert';
  return 'enthousiaste';
}

export const AI_ADOPTION_LABELS: Record<AIAdoptionLevel, string> = {
  resistant: 'Usage rare',
  prudent: 'Usage occasionnel',
  ouvert: 'Usage régulier',
  enthousiaste: 'Usage fréquent',
};

// ==========================================
// THEOLOGICAL SELF-LABEL (covariate, never scored)
// ==========================================

export type TheologicalOrientation = 'traditionaliste' | 'modere' | 'progressiste' | 'ne_sait_pas';

export function getTheologicalOrientation(answers: Answers): TheologicalOrientation {
  const orientation = answers['theo_orientation'];
  if (
    orientation === 'traditionaliste' ||
    orientation === 'modere' ||
    orientation === 'progressiste'
  ) {
    return orientation;
  }
  return 'ne_sait_pas';
}

export const THEOLOGICAL_LABELS: Record<TheologicalOrientation, string> = {
  traditionaliste: 'Traditionaliste',
  modere: 'Modéré',
  progressiste: 'Progressiste',
  ne_sait_pas: 'Non défini',
};

// ==========================================
// PROFILE HELPERS
// ==========================================

export type SpiritualAIProfile = PrimaryProfile;

export function getSpiritualAIProfile(answers: Answers): SpiritualAIProfile | null {
  return getSimpleProfile(answers);
}

/** Compact profile card data, derived from PROFILE_DEFINITIONS */
export const PROFILE_DATA: Record<
  SpiritualAIProfile,
  {
    title: string;
    emoji: string;
    description: string;
    strength: string;
    challenge: string;
  }
> = (Object.keys(PROFILE_DEFINITIONS) as SpiritualAIProfile[]).reduce(
  (acc, id) => {
    const def = PROFILE_DEFINITIONS[id];
    acc[id] = {
      title: def.title,
      emoji: def.emoji,
      description: def.shortDescription,
      strength: def.coreMotivation,
      challenge: def.primaryFear,
    };
    return acc;
  },
  {} as Record<
    SpiritualAIProfile,
    { title: string; emoji: string; description: string; strength: string; challenge: string }
  >,
);

export function getSubProfileData(subProfileId: string) {
  return SUB_PROFILE_DEFINITIONS[subProfileId as keyof typeof SUB_PROFILE_DEFINITIONS];
}

export function getDimensionScores(answers: Answers) {
  return calculateProfileSpectrum(answers).dimensions;
}

// ==========================================
// INSIGHTS (legacy shape used by the feedback screen)
// ==========================================

export interface PersonalizedInsight {
  category: 'spirituality' | 'technology' | 'ethics' | 'community';
  icon: string;
  title: string;
  message: string;
}

export function generateInsights(answers: Answers): PersonalizedInsight[] {
  const spectrum = calculateProfileSpectrum(answers);

  return spectrum.insights
    .map((insight) => ({
      category: (insight.category === 'spiritual'
        ? 'spirituality'
        : insight.category === 'technological'
          ? 'technology'
          : insight.category === 'ethical'
            ? 'ethics'
            : 'community') as PersonalizedInsight['category'],
      icon: insight.icon,
      title: insight.title,
      message: insight.message,
    }))
    .slice(0, 3);
}
