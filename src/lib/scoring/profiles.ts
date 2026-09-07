/**
 * Profile matching - scoring core v2 (docs/SCORING_V2_SPEC.md §1.5)
 *
 * Attribution is HEURISTIC. The pipeline is:
 *   1. weighted L1 distance to each profile's ideal ranges, computed only on
 *      dimensions with a value, weights renormalised over those dimensions;
 *   2. score = 100 * exp(-0.5 * distance), never rounded before sorting;
 *   3. bonuses are added IN SCORE SPACE (points), then clamped to [0, 100];
 *   4. no normalisation across profiles - allMatches carries raw scores.
 *
 * Fewer than MIN_VALUED_DIMENSIONS valued dimensions => no primary profile.
 *
 * Tuning note: ideal ranges, dimension weights and the bonus table below were
 * adjusted against __tests__/profiles.simulation.test.ts (>= 200 simulated
 * respondents per persona, target profile must rank first in >= 80 % of draws).
 * They are expert-set, not derived from a cluster analysis of real data.
 */

import type { Answers } from '@/data';
import type {
  SevenDimensions,
  DimensionKey,
  PrimaryProfile,
  SubProfileType,
  ProfileMatch,
  SubProfileMatch,
  ProfileSpectrum,
  ProfileConfidence,
  ProfileInterpretation,
  AdvancedInsight,
  TensionPoint,
  GrowthArea,
} from './types';
import { calculateAllDimensions, computeCoreSubscores, DIMENSION_KEYS } from './dimensions';
import { calculateSocialDesirability } from './bias';
import { computeUsageGap } from './usage-gap';
import { PROFILE_DEFINITIONS, SUB_PROFILE_DEFINITIONS } from './constants';

// ==========================================
// ALGORITHM PARAMETERS (expert-set, not validated)
// ==========================================

/** score = 100 * exp(-EXPONENTIAL_DECAY * distance) */
const EXPONENTIAL_DECAY = 0.5;
/** Below this many valued dimensions, no profile is attributed */
export const MIN_VALUED_DIMENSIONS = 4;
/** Points added per unit of bonus, applied in score space */
const BONUS_POINTS_PER_UNIT = 6;
/** Self-labelling (theo_orientation) counts half as much as behavioural bonuses */
const THEO_ORIENTATION_WEIGHT = 0.5;
const SECONDARY_THRESHOLD = 10;
const TERTIARY_THRESHOLD = 5;

// ==========================================
// DISTANCE
// ==========================================

/**
 * Weighted L1 distance to a profile's ideal ranges.
 * Null dimensions are skipped and their weight removed from the denominator.
 */
function calculateProfileDistance(
  dimensions: SevenDimensions,
  profileId: PrimaryProfile,
): { distance: number; valuedCount: number } {
  const profile = PROFILE_DEFINITIONS[profileId];
  let totalDistance = 0;
  let totalWeight = 0;
  let valuedCount = 0;

  for (const dimKey of DIMENSION_KEYS) {
    const dimValue = dimensions[dimKey].value;
    if (dimValue === null) continue;
    valuedCount++;

    const [idealMin, idealMax] = profile.idealDimensions[dimKey];
    const weight = profile.weights[dimKey];

    let distance = 0;
    if (dimValue < idealMin) distance = idealMin - dimValue;
    else if (dimValue > idealMax) distance = dimValue - idealMax;

    totalDistance += distance * weight;
    totalWeight += weight;
  }

  return {
    distance: totalWeight > 0 ? totalDistance / totalWeight : Number.POSITIVE_INFINITY,
    valuedCount,
  };
}

// ==========================================
// BONUSES (in bonus units, converted to points by the caller)
// ==========================================

function getTheologicalOrientationBonus(profileId: PrimaryProfile, answers: Answers): number {
  const orientation = typeof answers['theo_orientation'] === 'string' ? answers['theo_orientation'] : '';

  if (orientation === 'traditionaliste') {
    if (profileId === 'gardien_tradition') return 1.5;
    if (profileId === 'prudent_eclaire') return 1.0;
    if (profileId === 'innovateur_ancre') return 1.0;
    if (profileId === 'progressiste_critique') return -0.5;
    if (profileId === 'pionnier_spirituel') return -0.5;
  }

  if (orientation === 'progressiste') {
    if (profileId === 'progressiste_critique') return 1.5;
    if (profileId === 'pionnier_spirituel') return 1.2;
    if (profileId === 'gardien_tradition') return -1.0;
  }

  if (orientation === 'modere') {
    if (profileId === 'equilibriste') return 1.0;
    if (profileId === 'pragmatique_moderne') return 0.8;
    if (profileId === 'prudent_eclaire') return 0.6;
  }

  if (orientation === 'ne_sait_pas') {
    if (profileId === 'explorateur') return 1.5;
    if (profileId === 'equilibriste') return 0.3;
  }

  return 0;
}

/** Answer-pattern bonuses the dimension distance alone cannot capture */
function getSpecialProfileBonus(
  profileId: PrimaryProfile,
  dimensions: SevenDimensions,
  answers: Answers,
): number {
  let bonus = 0;
  const orientation = typeof answers['theo_orientation'] === 'string' ? answers['theo_orientation'] : '';
  const value = (key: DimensionKey): number | null => dimensions[key].value;
  const atLeast = (key: DimensionKey, threshold: number): boolean => {
    const v = value(key);
    return v !== null && v >= threshold;
  };
  const atMost = (key: DimensionKey, threshold: number): boolean => {
    const v = value(key);
    return v !== null && v <= threshold;
  };

  if (profileId === 'progressiste_critique') {
    // Ethical concern alone is not enough: the profile also questions the
    // nature of AI, hence the psychologicalPerception gate.
    if (atLeast('ethicalConcern', 4) && atLeast('psychologicalPerception', 3)) bonus += 1.0;
    if (atLeast('ethicalConcern', 4.5) && atLeast('psychologicalPerception', 3)) bonus += 0.6;
    if (atLeast('psychologicalPerception', 3.5) && atLeast('ethicalConcern', 3.5)) bonus += 0.4;
  }

  if (profileId === 'equilibriste') {
    let centeredCount = 0;
    for (const key of ['aiOpenness', 'sacredBoundary', 'ethicalConcern', 'futureOrientation'] as DimensionKey[]) {
      const v = value(key);
      if (v !== null && v >= 2.5 && v <= 3.5) centeredCount++;
    }
    if (centeredCount >= 4) bonus += 1.3;
    else if (centeredCount === 3) bonus += 0.6;
    else if (centeredCount <= 1) bonus -= 0.4;
  }

  if (profileId === 'pionnier_spirituel') {
    if (atMost('sacredBoundary', 2.5) && atLeast('aiOpenness', 4)) bonus += 1.2;
    if (atLeast('futureOrientation', 4.5)) bonus += 0.5;
    if (atMost('sacredBoundary', 2)) bonus += 0.5;
    if (atLeast('ethicalConcern', 4)) bonus -= 0.5;
  }

  if (profileId === 'innovateur_ancre') {
    if (atLeast('religiosity', 4) && atLeast('aiOpenness', 4)) bonus += 1.2;
    if (atMost('religiosity', 3.5)) bonus -= 0.5;
  }

  if (profileId === 'pragmatique_moderne') {
    if (atMost('ethicalConcern', 2.25) && atLeast('aiOpenness', 3.75)) bonus += 0.8;
    if (atLeast('ethicalConcern', 3.5)) bonus -= 0.5;
    if (atLeast('religiosity', 4.25)) bonus -= 0.4;
  }

  if (profileId === 'gardien_tradition') {
    if (atLeast('sacredBoundary', 4.25) && atMost('aiOpenness', 2) && atMost('futureOrientation', 2.5)) {
      bonus += 0.8;
    }
  }

  if (profileId === 'prudent_eclaire') {
    // Distinguishes from gardien: still a user, but a selective one
    if (atLeast('sacredBoundary', 3.5) && atLeast('aiOpenness', 2) && atMost('aiOpenness', 3.5)) {
      bonus += 0.9;
    }
  }

  if (profileId === 'explorateur') {
    let uncertaintyCount = 0;
    const uncertaintyItems = [
      'psych_godspeed_conscience',
      'psych_imago_dei',
      'psych_anxiete_remplacement',
      'theo_inspiration',
      'theo_utilite_percue',
      'communaute_perception_pairs',
    ];
    for (const key of uncertaintyItems) {
      if (answers[key] === 'ne_sait_pas') uncertaintyCount++;
    }
    if (uncertaintyCount >= 3) bonus += 1.2;
    else if (uncertaintyCount === 2) bonus += 0.6;

    if (atMost('religiosity', 2.5)) bonus += 0.5;

    const anciennete = typeof answers['profil_anciennete_foi'] === 'string' ? answers['profil_anciennete_foi'] : '';
    if (anciennete === 'moins_1_an' || anciennete === '1_5_ans') bonus += 0.5;
    if (typeof answers['profil_statut'] === 'string' && answers['profil_statut'] === 'curieux') bonus += 0.5;
    if (orientation !== '' && orientation !== 'ne_sait_pas') bonus -= 0.4;
  }

  return bonus;
}

// ==========================================
// SCORING & RANKING
// ==========================================

function distanceToScore(distance: number): number {
  if (!Number.isFinite(distance)) return 0;
  return 100 * Math.exp(-EXPONENTIAL_DECAY * distance);
}

/**
 * Deterministic tie-breaker: confidence of the dimension this profile weights
 * most (weight ties resolved alphabetically), then the profile id.
 */
function tieBreakConfidence(dimensions: SevenDimensions, profileId: PrimaryProfile): number {
  const weights = PROFILE_DEFINITIONS[profileId].weights;
  const ordered = [...DIMENSION_KEYS].sort((a, b) => {
    if (weights[b] !== weights[a]) return weights[b] - weights[a];
    return a.localeCompare(b);
  });
  return dimensions[ordered[0]].confidence;
}

function calculateAllProfileMatches(
  dimensions: SevenDimensions,
  answers: Answers,
): ProfileMatch[] {
  const profiles = Object.keys(PROFILE_DEFINITIONS) as PrimaryProfile[];

  const matches: ProfileMatch[] = profiles.map((profileId) => {
    const { distance } = calculateProfileDistance(dimensions, profileId);
    const bonusUnits =
      getTheologicalOrientationBonus(profileId, answers) * THEO_ORIENTATION_WEIGHT +
      getSpecialProfileBonus(profileId, dimensions, answers);
    const matchScore = Math.max(
      0,
      Math.min(100, distanceToScore(distance) + bonusUnits * BONUS_POINTS_PER_UNIT),
    );
    return { profile: profileId, matchScore, distance };
  });

  matches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    const confidenceDelta =
      tieBreakConfidence(dimensions, b.profile) - tieBreakConfidence(dimensions, a.profile);
    if (confidenceDelta !== 0) return confidenceDelta;
    return a.profile.localeCompare(b.profile);
  });

  return matches;
}

function computeProfileConfidence(matches: ProfileMatch[]): ProfileConfidence {
  const primary = matches[0];
  if (!primary) return 'low';
  const gap = primary.matchScore - (matches[1]?.matchScore ?? 0);
  if (primary.matchScore >= 60 && gap >= 15) return 'high';
  if (primary.matchScore >= 45) return 'medium';
  return 'low';
}

// ==========================================
// SUB-PROFILE
// ==========================================

function determineSubProfile(
  dimensions: SevenDimensions,
  primaryProfile: PrimaryProfile,
  answers: Answers,
): SubProfileMatch {
  const subProfileIds = PROFILE_DEFINITIONS[primaryProfile].subProfiles;

  let bestMatch: SubProfileType = subProfileIds[0];
  let bestScore = -Infinity;

  for (const subId of subProfileIds) {
    const subDef = SUB_PROFILE_DEFINITIONS[subId];
    let score = 0;

    for (const pattern of subDef.idealPattern) {
      const dimValue = dimensions[pattern.dimension].value;
      if (dimValue === null) continue;

      if (pattern.emphasis === 'high') {
        if (dimValue >= 4) score += 2;
        else if (dimValue >= 3.5) score += 1;
      } else if (pattern.emphasis === 'low') {
        if (dimValue <= 2) score += 2;
        else if (dimValue <= 2.5) score += 1;
      } else if (dimValue >= 2.5 && dimValue <= 3.5) {
        score += 1.5;
      }
    }

    score += getSubProfileBonus(subId, answers, dimensions);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = subId;
    }
  }

  return {
    subProfile: bestMatch,
    matchScore: Math.round(Math.min(100, Math.max(0, bestScore) * 20)),
    description: SUB_PROFILE_DEFINITIONS[bestMatch].description,
  };
}

function getSubProfileBonus(
  subId: SubProfileType,
  answers: Answers,
  dimensions: SevenDimensions,
): number {
  let bonus = 0;

  const statut = typeof answers['profil_statut'] === 'string' ? answers['profil_statut'] : '';
  const clergy = ['clerge', 'religieux', 'responsable_non_ordonne'].includes(statut);
  const formationSouhait =
    typeof answers['futur_formation_souhait'] === 'string' ? answers['futur_formation_souhait'] : '';
  const domainesInteret = Array.isArray(answers['futur_domaines_interet'])
    ? answers['futur_domaines_interet']
    : [];
  const atLeast = (key: DimensionKey, threshold: number): boolean => {
    const v = dimensions[key].value;
    return v !== null && v >= threshold;
  };
  const atMost = (key: DimensionKey, threshold: number): boolean => {
    const v = dimensions[key].value;
    return v !== null && v <= threshold;
  };

  switch (subId) {
    case 'protecteur_sacre':
      if (atLeast('sacredBoundary', 4.5)) bonus += 1;
      break;
    case 'sage_prudent':
      if (formationSouhait === 'peut_etre') bonus += 0.5;
      break;
    case 'berger_communautaire':
      if (clergy) bonus += 1;
      if (atLeast('communityContext', 4)) bonus += 0.5;
      break;
    case 'analyste_spirituel':
      if (formationSouhait === 'oui_tres' || formationSouhait === 'oui_assez') bonus += 1;
      break;
    case 'discerneur_pastoral':
      if (clergy) bonus += 0.8;
      break;
    case 'evangeliste_digital':
      if (domainesInteret.includes('communication')) bonus += 1;
      if (domainesInteret.includes('catechese')) bonus += 0.5;
      break;
    case 'theologien_techno':
      if (atLeast('psychologicalPerception', 3.5)) bonus += 0.5;
      break;
    case 'pont_generationnel':
      if (atLeast('communityContext', 3.5)) bonus += 0.5;
      break;
    case 'efficace_engage':
      if (domainesInteret.includes('administration')) bonus += 1;
      break;
    case 'communicateur_digital':
      if (domainesInteret.includes('communication')) bonus += 1;
      break;
    case 'optimisateur_pastoral':
      if (clergy && domainesInteret.includes('accompagnement')) bonus += 1;
      break;
    case 'visionnaire':
      if (atLeast('futureOrientation', 4.5)) bonus += 1;
      break;
    case 'experimentateur':
      if (domainesInteret.length >= 4) bonus += 0.5;
      break;
    case 'ethicien':
      if (answers['psych_aias_opacity'] === 'oui_fortement') bonus += 1;
      break;
    case 'novice_technologique':
      if (atLeast('religiosity', 4) && atMost('aiOpenness', 2.5)) bonus += 1;
      break;
    case 'chercheur_seculier':
      if (atMost('religiosity', 2.5) && atLeast('aiOpenness', 3)) bonus += 1;
      break;
    default:
      break;
  }

  return bonus;
}

// ==========================================
// INTERPRETATION (descriptive, no Barnum)
// ==========================================

function generateInterpretation(
  dimensions: SevenDimensions,
  primary: ProfileMatch,
  secondary: ProfileMatch | null,
  subProfile: SubProfileMatch,
): ProfileInterpretation {
  const primaryDef = PROFILE_DEFINITIONS[primary.profile];
  const subDef = SUB_PROFILE_DEFINITIONS[subProfile.subProfile];

  let headline = primaryDef.title;
  if (secondary && primary.matchScore - secondary.matchScore < 15) {
    headline += ` et ${PROFILE_DEFINITIONS[secondary.profile].title} à égalité proche`;
  }

  const narrative = `${primaryDef.fullDescription} ${subDef.description}`;

  const value = (key: DimensionKey): number | null => dimensions[key].value;
  const atLeast = (key: DimensionKey, threshold: number): boolean => {
    const v = value(key);
    return v !== null && v >= threshold;
  };
  const atMost = (key: DimensionKey, threshold: number): boolean => {
    const v = value(key);
    return v !== null && v <= threshold;
  };

  const uniqueAspects: string[] = [];
  if (atLeast('religiosity', 4) && atLeast('aiOpenness', 4)) {
    uniqueAspects.push("Centralité religieuse haute et usage de l'IA fréquent coexistent dans vos réponses");
  }
  if (atLeast('ethicalConcern', 4) && atLeast('aiOpenness', 3.5)) {
    uniqueAspects.push("Préoccupation éthique haute malgré un usage déclaré fréquent");
  }
  if (atLeast('sacredBoundary', 4) && atLeast('futureOrientation', 3.5)) {
    uniqueAspects.push("Frontière sacrée haute et intentions d'usage futures déclarées");
  }
  if (atMost('communityContext', 2.5) && atLeast('religiosity', 3.5)) {
    uniqueAspects.push("Centralité religieuse haute dans un contexte communautaire peu engagé sur le sujet");
  }
  if (uniqueAspects.length === 0) {
    uniqueAspects.push('Aucune combinaison de dimensions ne se détache nettement');
  }

  const blindSpots: string[] = [];
  if (atMost('aiOpenness', 2)) {
    blindSpots.push("Peu d'usages déclarés : les réponses reposent surtout sur des positions de principe");
  }
  if (atLeast('aiOpenness', 4.5) && atMost('ethicalConcern', 2)) {
    blindSpots.push("Usage fréquent associé à une préoccupation éthique basse");
  }
  if (atLeast('communityContext', 4.5)) {
    blindSpots.push("Positions très proches de celles attribuées à votre communauté");
  }
  if (atMost('sacredBoundary', 1.5)) {
    blindSpots.push("Très peu d'actes spirituels exclus d'une médiation par l'IA");
  }
  if (blindSpots.length === 0) {
    blindSpots.push('Aucun écart notable entre les dimensions');
  }

  const strengths = [primaryDef.coreMotivation, ...subDef.distinguishingTraits.slice(0, 2)];

  return { headline, narrative, uniqueAspects, blindSpots, strengths };
}

// ==========================================
// INSIGHTS (descriptive readings of the scores)
// ==========================================

function generateAdvancedInsights(dimensions: SevenDimensions): AdvancedInsight[] {
  const insights: AdvancedInsight[] = [];
  const value = (key: DimensionKey): number | null => dimensions[key].value;

  const religiosity = value('religiosity');
  if (religiosity !== null && religiosity >= 4) {
    insights.push({
      category: 'spiritual',
      icon: '🙏',
      title: 'Centralité religieuse haute',
      message:
        "Vos réponses au CRS-5 situent la religion dans la zone haute de l'échelle, sur la pensée, la pratique et l'expérience.",
      priority: 5,
    });
  } else if (religiosity !== null && religiosity <= 2) {
    insights.push({
      category: 'spiritual',
      icon: '🌱',
      title: 'Centralité religieuse basse',
      message:
        "Vos réponses au CRS-5 situent la religion dans la zone basse de l'échelle, avec une pratique déclarée peu fréquente.",
      priority: 4,
    });
  }

  const aiOpenness = value('aiOpenness');
  if (aiOpenness !== null && aiOpenness >= 4.5) {
    insights.push({
      category: 'technological',
      icon: '⚡',
      title: "Usage de l'IA fréquent",
      message:
        "Vous déclarez un usage fréquent de l'IA et plusieurs contextes d'utilisation différents.",
      priority: 4,
    });
  } else if (aiOpenness !== null && aiOpenness <= 1.8) {
    insights.push({
      category: 'technological',
      icon: '🛡️',
      title: "Usage de l'IA rare",
      message: "Vous déclarez peu ou pas d'usage de l'IA, dans un ou aucun contexte.",
      priority: 3,
    });
  }

  const sacredBoundary = value('sacredBoundary');
  if (sacredBoundary !== null && sacredBoundary >= 4.5) {
    insights.push({
      category: 'spiritual',
      icon: '⛪',
      title: 'Frontière sacrée haute',
      message:
        "Vous excluez la plupart des actes spirituels proposés de toute médiation par un outil génératif.",
      priority: 4,
    });
  } else if (sacredBoundary !== null && sacredBoundary <= 1.5) {
    insights.push({
      category: 'spiritual',
      icon: '🌊',
      title: 'Frontière sacrée basse',
      message: "Vous n'excluez presque aucun acte spirituel d'une médiation par un outil génératif.",
      priority: 3,
    });
  }

  const ethicalConcern = value('ethicalConcern');
  if (ethicalConcern !== null && ethicalConcern >= 4.5) {
    insights.push({
      category: 'ethical',
      icon: '⚖️',
      title: 'Préoccupation éthique haute',
      message:
        "Vos réponses sur l'utilité perçue, l'opacité des systèmes et l'image de Dieu se situent dans la zone haute de l'échelle.",
      priority: 4,
    });
  }

  const psychologicalPerception = value('psychologicalPerception');
  if (psychologicalPerception !== null && psychologicalPerception >= 4.5) {
    insights.push({
      category: 'developmental',
      icon: '🤔',
      title: "Perception anthropomorphe de l'IA",
      message:
        "Vous attribuez à l'IA des propriétés proches de l'humain sur les items de nature et de conscience.",
      priority: 3,
    });
  }

  const communityContext = value('communityContext');
  if (communityContext !== null && communityContext >= 4.5) {
    insights.push({
      category: 'relational',
      icon: '👥',
      title: 'Contexte communautaire favorable et actif',
      message:
        "Vous décrivez une communauté plutôt favorable à l'IA, où le sujet est discuté régulièrement.",
      priority: 3,
    });
  }

  const futureOrientation = value('futureOrientation');
  if (futureOrientation !== null && futureOrientation >= 4.5) {
    insights.push({
      category: 'developmental',
      icon: '🚀',
      title: "Intentions d'usage déclarées",
      message: "Vous déclarez à la fois une intention d'usage et un souhait de formation.",
      priority: 3,
    });
  } else if (futureOrientation !== null && futureOrientation <= 1.5) {
    insights.push({
      category: 'developmental',
      icon: '⚓',
      title: "Aucune intention d'usage déclarée",
      message: "Vous ne déclarez ni intention d'usage ni souhait de formation à court terme.",
      priority: 2,
    });
  }

  insights.sort((a, b) => b.priority - a.priority);
  return insights.slice(0, 4);
}

// ==========================================
// TENSIONS (i18n keys resolved by the UI)
// ==========================================

function identifyTensions(dimensions: SevenDimensions): TensionPoint[] {
  const tensions: TensionPoint[] = [];
  const atLeast = (key: DimensionKey, threshold: number): boolean => {
    const v = dimensions[key].value;
    return v !== null && v >= threshold;
  };
  const atMost = (key: DimensionKey, threshold: number): boolean => {
    const v = dimensions[key].value;
    return v !== null && v <= threshold;
  };

  if (atLeast('aiOpenness', 3.5) && atLeast('sacredBoundary', 4)) {
    tensions.push({
      dimension1: 'aiOpenness',
      dimension2: 'sacredBoundary',
      description: 'tension_ai_sacred',
      suggestion: 'tension_ai_sacred_suggestion',
    });
  }

  if (atLeast('ethicalConcern', 4) && atLeast('futureOrientation', 4)) {
    tensions.push({
      dimension1: 'ethicalConcern',
      dimension2: 'futureOrientation',
      description: 'tension_ethical_future',
      suggestion: 'tension_ethical_future_suggestion',
    });
  }

  if (atMost('communityContext', 2) && atLeast('religiosity', 4)) {
    tensions.push({
      dimension1: 'communityContext',
      dimension2: 'religiosity',
      description: 'tension_community_faith',
      suggestion: 'tension_community_faith_suggestion',
    });
  }

  if (atLeast('psychologicalPerception', 4) && atMost('ethicalConcern', 2)) {
    tensions.push({
      dimension1: 'psychologicalPerception',
      dimension2: 'ethicalConcern',
      description: 'tension_perception_ethics',
      suggestion: 'tension_perception_ethics_suggestion',
    });
  }

  return tensions.slice(0, 3);
}

// ==========================================
// "PISTES DE RÉFLEXION" (neutral, never prescriptive)
// ==========================================

/**
 * Emitted as i18n keys, resolved by the UI under "Pistes de réflexion, si vous
 * le souhaitez". Each entry points at an observed gap between two dimensions;
 * none of them recommends adopting or dropping a tool.
 */
function identifyGrowthAreas(dimensions: SevenDimensions): GrowthArea[] {
  const growthAreas: GrowthArea[] = [];
  const atLeast = (key: DimensionKey, threshold: number): boolean => {
    const v = dimensions[key].value;
    return v !== null && v >= threshold;
  };
  const atMost = (key: DimensionKey, threshold: number): boolean => {
    const v = dimensions[key].value;
    return v !== null && v <= threshold;
  };

  if (atMost('aiOpenness', 2.5) && atLeast('futureOrientation', 3.5)) {
    growthAreas.push({
      area: 'exploration_tech',
      currentState: 'exploration_tech_current',
      potentialGrowth: 'exploration_tech_potential',
      actionableStep: 'exploration_tech_action',
    });
  }

  if (atMost('communityContext', 2) && atLeast('religiosity', 3)) {
    growthAreas.push({
      area: 'community_dialogue',
      currentState: 'community_dialogue_current',
      potentialGrowth: 'community_dialogue_potential',
      actionableStep: 'community_dialogue_action',
    });
  }

  if (atMost('ethicalConcern', 2) && atLeast('aiOpenness', 4)) {
    growthAreas.push({
      area: 'ethical_reflection',
      currentState: 'ethical_reflection_current',
      potentialGrowth: 'ethical_reflection_potential',
      actionableStep: 'ethical_reflection_action',
    });
  }

  if (atLeast('sacredBoundary', 4.5) && atLeast('aiOpenness', 4)) {
    growthAreas.push({
      area: 'guided_experimentation',
      currentState: 'guided_experimentation_current',
      potentialGrowth: 'guided_experimentation_potential',
      actionableStep: 'guided_experimentation_action',
    });
  }

  return growthAreas.slice(0, 3);
}

// ==========================================
// MAIN
// ==========================================

export function calculateProfileSpectrum(answers: Answers): ProfileSpectrum {
  const dimensions = calculateAllDimensions(answers);
  const core = computeCoreSubscores(answers);
  const socialDesirability = calculateSocialDesirability(answers);
  const usageGap = computeUsageGap(answers);

  const valuedCount = DIMENSION_KEYS.filter((key) => dimensions[key].value !== null).length;
  const allMatches = calculateAllProfileMatches(dimensions, answers);

  if (valuedCount < MIN_VALUED_DIMENSIONS) {
    return {
      primary: null,
      secondary: null,
      tertiary: null,
      allMatches,
      subProfile: null,
      dimensions,
      core,
      attribution: 'heuristic',
      profileConfidence: 'low',
      socialDesirability,
      usageGap,
      interpretation: null,
      insights: generateAdvancedInsights(dimensions),
      tensions: identifyTensions(dimensions),
      growthAreas: identifyGrowthAreas(dimensions),
    };
  }

  const primary = allMatches[0];
  const secondary = allMatches[1] && allMatches[1].matchScore >= SECONDARY_THRESHOLD ? allMatches[1] : null;
  const tertiary = allMatches[2] && allMatches[2].matchScore >= TERTIARY_THRESHOLD ? allMatches[2] : null;
  const subProfile = determineSubProfile(dimensions, primary.profile, answers);

  return {
    primary,
    secondary,
    tertiary,
    allMatches,
    subProfile,
    dimensions,
    core,
    attribution: 'heuristic',
    profileConfidence: computeProfileConfidence(allMatches),
    socialDesirability,
    usageGap,
    interpretation: generateInterpretation(dimensions, primary, secondary, subProfile),
    insights: generateAdvancedInsights(dimensions),
    tensions: identifyTensions(dimensions),
    growthAreas: identifyGrowthAreas(dimensions),
  };
}

// ==========================================
// CONVENIENCE ACCESSORS
// ==========================================

export function getSimpleProfile(answers: Answers): PrimaryProfile | null {
  return calculateProfileSpectrum(answers).primary?.profile ?? null;
}

export function getEnhancedProfileData(answers: Answers) {
  const spectrum = calculateProfileSpectrum(answers);
  if (!spectrum.primary || !spectrum.subProfile || !spectrum.interpretation) {
    return {
      profile: null,
      title: null,
      emoji: null,
      description: null,
      matchPercentage: null,
      secondaryProfile: null,
      dimensions: spectrum.dimensions,
      core: spectrum.core,
      attribution: spectrum.attribution,
      profileConfidence: spectrum.profileConfidence,
      strengths: [],
      blindSpots: [],
      insights: spectrum.insights,
      tensions: spectrum.tensions,
      growthAreas: spectrum.growthAreas,
    };
  }

  const primaryDef = PROFILE_DEFINITIONS[spectrum.primary.profile];
  const subDef = SUB_PROFILE_DEFINITIONS[spectrum.subProfile.subProfile];

  return {
    profile: spectrum.primary.profile,
    title: `${primaryDef.title} - ${subDef.title}`,
    emoji: `${primaryDef.emoji}${subDef.emoji}`,
    description: spectrum.interpretation.narrative,
    matchPercentage: Math.round(spectrum.primary.matchScore),
    secondaryProfile: spectrum.secondary
      ? {
          profile: spectrum.secondary.profile,
          title: PROFILE_DEFINITIONS[spectrum.secondary.profile].title,
          matchPercentage: Math.round(spectrum.secondary.matchScore),
        }
      : null,
    dimensions: spectrum.dimensions,
    core: spectrum.core,
    attribution: spectrum.attribution,
    profileConfidence: spectrum.profileConfidence,
    strengths: spectrum.interpretation.strengths,
    blindSpots: spectrum.interpretation.blindSpots,
    insights: spectrum.insights,
    tensions: spectrum.tensions,
    growthAreas: spectrum.growthAreas,
  };
}
