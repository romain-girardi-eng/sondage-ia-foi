/**
 * Seven Dimension Calculation Functions
 * Each function calculates a specific dimension score (1-5) with confidence rating
 *
 * ============================================================================
 * METHODOLOGICAL LIMITATIONS - FAIR COMPLIANCE NOTICE
 * ============================================================================
 *
 * VALIDATION STATUS:
 * - Religiosity: ✅ VALIDATED - Uses CRS-5 (Huber & Huber, 2012)
 * - Psychological Perception: ⚠️ PARTIAL - Uses partial Godspeed Scale (Bartneck et al., 2009)
 * - AI Openness: ❌ EXPLORATORY - Ad-hoc construct, no factor analysis validation
 * - Sacred Boundary: ❌ EXPLORATORY - Ad-hoc construct, no factor analysis validation
 * - Ethical Concern: ❌ EXPLORATORY - Ad-hoc construct, no factor analysis validation
 * - Community Influence: ❌ EXPLORATORY - Ad-hoc construct, no factor analysis validation
 * - Future Orientation: ❌ EXPLORATORY - Ad-hoc construct, no factor analysis validation
 *
 * POPULATION PARAMETERS:
 * The POPULATION_PARAMS values are PROVISIONAL ESTIMATES, not empirically validated.
 * They will be recalibrated after collecting N≥500 responses.
 * Current values are based on reasonable assumptions about a religious survey population.
 *
 * QUESTION WEIGHTS:
 * All question weights are based on face validity and expert judgment, NOT derived
 * from confirmatory factor analysis. Weights should be re-evaluated after empirical
 * validation phase.
 *
 * PERCENTILE CALCULATIONS:
 * Percentiles are calculated using a normal CDF against PROVISIONAL population
 * parameters. These may be biased if the actual population differs from assumptions.
 *
 * @see score-maps.ts for centralized score mappings
 */

import {
  CRS_SCORE_MAP,
  AI_FREQUENCY_SCORES,
  MINISTRY_USAGE_SCORES,
  CARE_EMAIL_SCORES,
  LAIC_PRIERE_SCORES,
  LAIC_CONSEIL_SCORES,
} from './score-maps';
import type { Answers } from '@/data';
import type { DimensionScore, SevenDimensions } from './types';
import { calculateSocialDesirabilityScore, adjustScoreForBias } from './bias';
import {
  getStringAnswer,
  getNumberAnswer,
  getArrayAnswer,
  isClergy,
  isLayperson,
} from '@/lib/utils/answers';
import { calculateWeightedAverage } from '@/lib/utils/scoring';

/**
 * Standard normal cumulative distribution function (CDF)
 * Uses Abramowitz & Stegun approximation for the error function (erf)
 * Reference: Handbook of Mathematical Functions, Formula 7.1.26
 * Maximum error: 1.5×10^-7
 */
function normalCDF(z: number): number {
  // Coefficients for Abramowitz & Stegun approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  // Handle sign
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z) / Math.sqrt(2);

  // Approximation formula
  const t = 1.0 / (1.0 + p * absZ);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calculate percentile using proper normal distribution CDF
 * Converts a raw score to a percentile based on population parameters
 */
function calculatePercentile(score: number, mean: number, stdDev: number): number {
  // Guard against division by zero
  if (stdDev === 0) return 50;

  const zScore = (score - mean) / stdDev;
  const percentile = Math.round(normalCDF(zScore) * 100);

  // Clamp to 1-99 range (avoid claiming perfect 0 or 100)
  return Math.max(1, Math.min(99, percentile));
}

/**
 * PROVISIONAL Population Distribution Parameters
 *
 * ⚠️ IMPORTANT: These are ESTIMATED values, NOT empirically derived.
 *
 * These parameters will be recalibrated after collecting N≥500 responses.
 * Current estimates are based on:
 * - religiosity: Skewed high (3.8 ± 0.9) - religious survey self-selects devout participants
 * - aiOpenness: Lower mean (2.4 ± 1.1) - religious context may reduce tech enthusiasm
 * - sacredBoundary: Above neutral (3.5 ± 1.0) - expected protection of sacred domains
 * - ethicalConcern: High (3.8 ± 0.8) - ethical vigilance is normative in religious contexts
 * - psychologicalPerception: Neutral (3.0 ± 0.9) - uncertainty expected on AI nature
 * - communityInfluence: Moderate (2.8 ± 0.9) - variable community engagement
 * - futureOrientation: Slightly positive (3.2 ± 1.0) - cautious openness to future
 *
 * RECALIBRATION PLAN:
 * 1. After N=200: Exploratory analysis of actual distributions
 * 2. After N=500: Replace with empirical mean/stdDev
 * 3. Document as "empirically calibrated" once updated
 *
 * @see METHODOLOGY.md Section 8.2 for full documentation
 */
const POPULATION_PARAMS = {
  religiosity: { mean: 3.8, stdDev: 0.9 }, // Skewed high for a religious survey
  aiOpenness: { mean: 2.4, stdDev: 1.1 }, // Generally lower, but high variance
  sacredBoundary: { mean: 3.5, stdDev: 1.0 }, // Tendency to protect the sacred
  ethicalConcern: { mean: 3.8, stdDev: 0.8 }, // High concern is normative
  psychologicalPerception: { mean: 3.0, stdDev: 0.9 }, // Neutral/Uncertain
  communityInfluence: { mean: 2.8, stdDev: 0.9 }, // Moderate
  futureOrientation: { mean: 3.2, stdDev: 1.0 }, // Slightly positive skew
};

// ==========================================
// DIMENSION 1: RELIGIOSITY (CRS-5)
// ==========================================

export function calculateReligiosityDimension(answers: Answers, biasScore?: number): DimensionScore {
  const crsQuestions = [
    'crs_intellect',
    'crs_ideology',
    'crs_public_practice',
    'crs_private_practice',
    'crs_experience'
  ];

  let total = 0;
  let count = 0;

  for (const qId of crsQuestions) {
    const answer = getStringAnswer(answers, qId);
    if (answer && CRS_SCORE_MAP[answer] !== undefined) {
      total += CRS_SCORE_MAP[answer];
      count++;
    }
  }

  const rawValue = count > 0 ? Math.round((total / count) * 10) / 10 : 3;
  
  // Apply bias correction (High sensitivity: 0.8)
  const bias = biasScore ?? calculateSocialDesirabilityScore(answers);
  const value = adjustScoreForBias(rawValue, bias, 0.8);
  
  const confidence = count / crsQuestions.length;
  const params = POPULATION_PARAMS.religiosity;

  return {
    value,
    confidence,
    percentile: calculatePercentile(value, params.mean, params.stdDev),
  };
}

// ==========================================
// DIMENSION 2: AI OPENNESS
// ==========================================

export function calculateAIOpennessDimension(answers: Answers, biasScore?: number): DimensionScore {
  const scores: number[] = [];
  const weights: number[] = [];

  // General AI frequency (high weight)
  const freq = getStringAnswer(answers, 'ctrl_ia_frequence');
  if (freq && AI_FREQUENCY_SCORES[freq]) {
    scores.push(AI_FREQUENCY_SCORES[freq]);
    weights.push(2);
  }

  // AI comfort level (high weight)
  const comfort = getNumberAnswer(answers, 'ctrl_ia_confort');
  if (comfort !== null) {
    scores.push(comfort);
    weights.push(2);
  }

  // Number of AI contexts (medium weight)
  const contextes = getArrayAnswer(answers, 'ctrl_ia_contextes');
  if (contextes.length > 0 || freq === 'jamais') {
    const contextScore = freq === 'jamais' ? 1 : Math.min(5, 1 + contextes.length * 0.7);
    scores.push(contextScore);
    weights.push(1.5);
  }

  // Digital attitude (low weight - captures general tech attitude)
  const digitalAttitude = getStringAnswer(answers, 'digital_attitude_generale');
  const attitudeMap: Record<string, number> = {
    'tres_positif': 5, 'positif': 4, 'neutre': 3, 'negatif': 2, 'tres_negatif': 1
  };
  if (digitalAttitude && attitudeMap[digitalAttitude]) {
    scores.push(attitudeMap[digitalAttitude]);
    weights.push(0.8);
  }

  // Ministry-specific usage (for clergy)
  if (isClergy(answers)) {
    const predUsage = getStringAnswer(answers, 'min_pred_usage');
    if (predUsage && MINISTRY_USAGE_SCORES[predUsage]) {
      scores.push(MINISTRY_USAGE_SCORES[predUsage]);
      weights.push(1.5);
    }

    const careEmail = getStringAnswer(answers, 'min_care_email');
    if (careEmail && CARE_EMAIL_SCORES[careEmail]) {
      scores.push(CARE_EMAIL_SCORES[careEmail]);
      weights.push(1);
    }

    const adminBurden = getNumberAnswer(answers, 'min_admin_burden');
    if (adminBurden !== null) {
      scores.push(adminBurden);
      weights.push(0.8);
    }

    // Matrix question: min_pred_nature - AI usage delegation level by task
    // Task sensitivity weights: redaction (3) > exegese (2) > plan/illustration/images (1)
    const predNature = answers['min_pred_nature'];
    if (predNature && typeof predNature === 'object' && !Array.isArray(predNature)) {
      const taskWeights: Record<string, number> = {
        plan: 1,        // Structure - organizational, low theological sensitivity
        exegese: 2,     // Biblical research - core theological work
        illustration: 1, // Finding illustrations - supportive content
        images: 1,      // Image generation - visual aids
        redaction: 3,   // Writing paragraphs - highest sensitivity, actual sermon words
      };

      let matrixScore = 0;
      let maxPossible = 0;

      for (const [task, weight] of Object.entries(taskWeights)) {
        const delegation = (predNature as Record<string, number>)[task];
        if (typeof delegation === 'number') {
          matrixScore += delegation * weight;
          maxPossible += 3 * weight; // max delegation (3) × weight
        }
      }

      // Normalize to 1-5 scale
      if (maxPossible > 0) {
        const normalizedScore = 1 + (matrixScore / maxPossible) * 4;
        scores.push(normalizedScore);
        weights.push(1.5); // Medium-high weight - reveals actual delegation behavior
      }
    }
  }

  // Lay-specific usage
  if (isLayperson(answers)) {
    const laicPriere = getStringAnswer(answers, 'laic_substitution_priere');
    if (laicPriere && LAIC_PRIERE_SCORES[laicPriere]) {
      scores.push(LAIC_PRIERE_SCORES[laicPriere]);
      weights.push(1.2);
    }

    const laicConseil = getStringAnswer(answers, 'laic_conseil_spirituel');
    if (laicConseil && LAIC_CONSEIL_SCORES[laicConseil]) {
      scores.push(LAIC_CONSEIL_SCORES[laicConseil]);
      weights.push(1.2);
    }
  }

  const rawValue = scores.length > 0 ? calculateWeightedAverage(scores, weights) : 2.5;

  // Low bias sensitivity for AI Openness (0.2)
  const bias = biasScore ?? calculateSocialDesirabilityScore(answers);
  const value = adjustScoreForBias(rawValue, bias, 0.2);

  const confidence = Math.min(1, scores.length / 5);
  const params = POPULATION_PARAMS.aiOpenness;

  return {
    value,
    confidence,
    percentile: calculatePercentile(value, params.mean, params.stdDev),
  };
}

// ==========================================
// DIMENSION 3: SACRED BOUNDARY
// Measures resistance to AI in sacred/spiritual contexts specifically
// ==========================================

export function calculateSacredBoundaryDimension(answers: Answers, biasScore?: number): DimensionScore {
  const scores: number[] = [];
  const weights: number[] = [];

  // General AI use vs spiritual AI use difference
  const freq = getStringAnswer(answers, 'ctrl_ia_frequence');
  const contextes = getArrayAnswer(answers, 'ctrl_ia_contextes');
  const usesAIGenerally = freq && freq !== 'jamais';
  const usesAISpiritual = contextes.includes('spirituel');

  // Key indicator: uses AI but NOT for spiritual = high boundary
  if (usesAIGenerally && !usesAISpiritual) {
    scores.push(4.5);
    weights.push(1.5);
  } else if (usesAISpiritual) {
    scores.push(2);
    weights.push(1.5);
  } else if (!usesAIGenerally) {
    // Doesn't use AI at all - boundary is less relevant
    scores.push(3);
    weights.push(0.8);
  }

  // Theo inspiration question: can AI transmit grace?
  const theoInspiration = getStringAnswer(answers, 'theo_inspiration');
  const inspirationMap: Record<string, number> = {
    'impossible': 5,
    'peu_probable': 4,
    'possible_indirect': 3,
    'possible': 1.5,
    'ne_sait_pas': 3,
  };
  if (theoInspiration && inspirationMap[theoInspiration]) {
    scores.push(inspirationMap[theoInspiration]);
    weights.push(1.5);
  }

  // NEW: Liturgical AI acceptability (scale 1-5, inverted: low acceptance = high boundary)
  const liturgieIA = getNumberAnswer(answers, 'theo_liturgie_ia');
  if (liturgieIA !== null) {
    // Invert: 1 (not acceptable) -> 5 (high boundary), 5 (acceptable) -> 1 (low boundary)
    scores.push(6 - liturgieIA);
    weights.push(2);
  }

  // NEW: Sacred activities that should NEVER involve AI (more = higher boundary)
  const activitesSacrees = getArrayAnswer(answers, 'theo_activites_sacrees');
  if (activitesSacrees.length > 0) {
    if (activitesSacrees.includes('aucune')) {
      // "None - AI can help everywhere" = very low boundary
      scores.push(1);
      weights.push(2);
    } else {
      // More activities protected = higher boundary (max 5 items, excluding 'aucune')
      const boundaryScore = Math.min(5, 1 + activitesSacrees.length * 0.9);
      scores.push(boundaryScore);
      weights.push(2);
    }
  }

  // NEW: Human mediation requirement
  const mediationHumaine = getStringAnswer(answers, 'theo_mediation_humaine');
  const mediationMap: Record<string, number> = {
    'oui_absolument': 5,
    'oui_pour_essentiel': 4,
    'partiellement': 3,
    'non_pas_necessairement': 1.5,
    'ne_sait_pas': 3,
  };
  if (mediationHumaine && mediationMap[mediationHumaine]) {
    scores.push(mediationMap[mediationHumaine]);
    weights.push(1.8);
  }

  // Clergy: sentiment when using AI for preaching (guilt = high boundary)
  if (isClergy(answers)) {
    const sentiment = getNumberAnswer(answers, 'min_pred_sentiment');
    if (sentiment !== null) {
      // High sentiment = uncomfortable = high boundary
      scores.push(sentiment);
      weights.push(1.2);
    }

    const predUsage = getStringAnswer(answers, 'min_pred_usage');
    if (predUsage === 'jamais') {
      scores.push(5);
      weights.push(1);
    } else if (predUsage === 'systematique') {
      scores.push(1.5);
      weights.push(1);
    }

    const careEmail = getStringAnswer(answers, 'min_care_email');
    if (careEmail === 'non_jamais') {
      scores.push(5);
      weights.push(0.8);
    }

    // Matrix question: min_pred_nature - HIGH delegation on redaction = LOW boundary
    // Focus on 'redaction' (writing paragraphs) as most theologically sensitive
    const predNature = answers['min_pred_nature'];
    if (predNature && typeof predNature === 'object' && !Array.isArray(predNature)) {
      const delegation = (predNature as Record<string, number>)['redaction'];
      if (typeof delegation === 'number') {
        // delegation 0 (not used) -> 5 (high boundary)
        // delegation 3 (as-is) -> 1 (low boundary - fully trusts AI to write sermon)
        const boundaryScore = 5 - (delegation * 4 / 3);
        scores.push(boundaryScore);
        weights.push(1.5); // Important indicator of sacred boundary
      }
    }
  }

  // Lay: attitude toward AI-generated prayer and spiritual advice
  if (isLayperson(answers)) {
    const laicPriere = getStringAnswer(answers, 'laic_substitution_priere');
    if (laicPriere === 'non') {
      scores.push(4.5);
      weights.push(1);
    } else if (laicPriere) {
      scores.push(2);
      weights.push(1);
    }

    const laicConseil = getStringAnswer(answers, 'laic_conseil_spirituel');
    if (laicConseil === 'jamais') {
      scores.push(5);
      weights.push(1);
    } else if (laicConseil === 'deja_fait') {
      scores.push(1);
      weights.push(1);
    }
  }

  const rawValue = scores.length > 0 ? calculateWeightedAverage(scores, weights) : 3;

  // Moderate sensitivity (0.5) - declaring one protects the sacred is socially desirable
  const bias = biasScore ?? calculateSocialDesirabilityScore(answers);
  const value = adjustScoreForBias(rawValue, bias, 0.5);

  const confidence = Math.min(1, scores.length / 6);
  const params = POPULATION_PARAMS.sacredBoundary;

  return {
    value,
    confidence,
    percentile: calculatePercentile(value, params.mean, params.stdDev),
  };
}

// ==========================================
// DIMENSION 4: ETHICAL CONCERN
// ==========================================

export function calculateEthicalConcernDimension(answers: Answers, biasScore?: number): DimensionScore {
  const scores: number[] = [];
  const weights: number[] = [];

  // Primary concern about AI in Church
  const risqueFutur = getStringAnswer(answers, 'theo_risque_futur');
  const risqueMap: Record<string, number> = {
    'paresse': 4,
    'deshumanisation': 4.5,
    'heresie': 4.5,
    'autre': 3.5,
    'aucune': 1,
    'ne_sait_pas': 2.5,
  };
  if (risqueFutur && risqueMap[risqueFutur]) {
    scores.push(risqueMap[risqueFutur]);
    weights.push(2);
  }

  // Overall perceived utility (inverse = concern)
  const utilitePercue = getStringAnswer(answers, 'theo_utilite_percue');
  const utiliteMap: Record<string, number> = {
    'tres_negatif': 5,
    'negatif': 4,
    'neutre': 3,
    'positif': 2,
    'tres_positif': 1,
    'ne_sait_pas': 3,
  };
  if (utilitePercue && utiliteMap[utilitePercue]) {
    scores.push(utiliteMap[utilitePercue]);
    weights.push(1.5);
  }

  // Fear of replacement
  const anxieteRemplacement = getStringAnswer(answers, 'psych_anxiete_remplacement');
  const anxieteMap: Record<string, number> = {
    'non_impossible': 1.5,
    'non_peu_probable': 2,
    'possible_partiel': 3.5,
    'oui_probable': 4.5,
    'oui_certain': 5,
    'ne_sait_pas': 3,
  };
  if (anxieteRemplacement && anxieteMap[anxieteRemplacement]) {
    scores.push(anxieteMap[anxieteRemplacement]);
    weights.push(1.5);
  }

  // AIAS: Sociotechnical Blindness / Opacity Concern
  const opacityConcern = getStringAnswer(answers, 'psych_aias_opacity');
  const opacityMap: Record<string, number> = {
    'non_confiance': 1,
    'non_indifferent': 1.5,
    'peu': 2.5,
    'oui_moderement': 4,
    'oui_fortement': 5,
  };
  if (opacityConcern && opacityMap[opacityConcern]) {
    scores.push(opacityMap[opacityConcern]);
    weights.push(1.5);
  }

  // Clergy: guilt/discomfort when using AI
  if (isClergy(answers)) {
    const sentiment = getNumberAnswer(answers, 'min_pred_sentiment');
    if (sentiment !== null) {
      scores.push(sentiment);
      weights.push(1.2);
    }
  }

  // Imago Dei concern (theological anthropology worry)
  const imagoDei = getStringAnswer(answers, 'psych_imago_dei');
  const imagoMap: Record<string, number> = {
    'pas_du_tout': 1,
    'peu': 2,
    'moderement': 3,
    'beaucoup': 4,
    'totalement': 5,
    'ne_sait_pas': 2.5,
  };
  if (imagoDei && imagoMap[imagoDei]) {
    scores.push(imagoMap[imagoDei]);
    weights.push(1.3);
  }

  const rawValue = scores.length > 0 ? calculateWeightedAverage(scores, weights) : 3;

  // High sensitivity (0.7) - expressing ethical concern is seen as virtuous
  const bias = biasScore ?? calculateSocialDesirabilityScore(answers);
  const value = adjustScoreForBias(rawValue, bias, 0.7);

  const confidence = Math.min(1, scores.length / 4);
  const params = POPULATION_PARAMS.ethicalConcern;

  return {
    value,
    confidence,
    percentile: calculatePercentile(value, params.mean, params.stdDev),
  };
}

// ==========================================
// DIMENSION 5: PSYCHOLOGICAL PERCEPTION
// How they perceive AI's nature and its relationship to humanity
// ==========================================

export function calculatePsychologicalPerceptionDimension(answers: Answers, biasScore?: number): DimensionScore {
  const scores: number[] = [];
  const weights: number[] = [];

  // Godspeed: Nature perception (Machine vs Human)
  const godspeedNature = getStringAnswer(answers, 'psych_godspeed_nature');
  const natureMap: Record<string, number> = {
    '1_machine': 1,
    '2_machine_plus': 2,
    '3_neutre': 3,
    '4_humain_moins': 4,
    '5_humain': 5,
  };
  if (godspeedNature && natureMap[godspeedNature]) {
    scores.push(natureMap[godspeedNature]);
    weights.push(2);
  }

  // Godspeed: Consciousness attribution
  const godspeedConscience = getStringAnswer(answers, 'psych_godspeed_conscience');
  const conscienceMap: Record<string, number> = {
    'impossible': 1,
    'imitation': 2,
    'incertain': 3,
    'possible_emergence': 4,
    'probable': 5,
  };
  if (godspeedConscience && conscienceMap[godspeedConscience]) {
    scores.push(conscienceMap[godspeedConscience]);
    weights.push(2.5); // Higher weight for explicit consciousness attribution
  }

  // Imago Dei: does AI challenge human uniqueness?
  const imagoDei = getStringAnswer(answers, 'psych_imago_dei');
  const imagoMap: Record<string, number> = {
    'pas_du_tout': 1,
    'peu': 2,
    'moderement': 3,
    'beaucoup': 4,
    'totalement': 5,
    'ne_sait_pas': 3,
  };
  if (imagoDei && imagoMap[imagoDei]) {
    scores.push(imagoMap[imagoDei]);
    weights.push(1.8);
  }

  // Anxiety about replacement (also used in ethical concern, but relevant here for perception)
  const anxiete = getStringAnswer(answers, 'psych_anxiete_remplacement');
  const anxieteMap: Record<string, number> = {
    'non_impossible': 1,
    'non_peu_probable': 2,
    'possible_partiel': 3,
    'oui_probable': 4,
    'oui_certain': 5,
    'ne_sait_pas': 3,
  };
  if (anxiete && anxieteMap[anxiete]) {
    scores.push(anxieteMap[anxiete]);
    weights.push(1.5);
  }

  // Theo inspiration: can AI text transmit grace?
  const theoInspiration = getStringAnswer(answers, 'theo_inspiration');
  const inspirationMap: Record<string, number> = {
    'impossible': 1,
    'peu_probable': 2,
    'possible_indirect': 3.5,
    'possible': 4.5,
    'ne_sait_pas': 3,
  };
  if (theoInspiration && inspirationMap[theoInspiration]) {
    scores.push(inspirationMap[theoInspiration]);
    weights.push(1.3);
  }

  const rawValue = scores.length > 0 ? calculateWeightedAverage(scores, weights) : 3;

  // Low sensitivity (0.2)
  const bias = biasScore ?? calculateSocialDesirabilityScore(answers);
  const value = adjustScoreForBias(rawValue, bias, 0.2);

  const confidence = Math.min(1, scores.length / 4);
  const params = POPULATION_PARAMS.psychologicalPerception;

  return {
    value,
    confidence,
    percentile: calculatePercentile(value, params.mean, params.stdDev),
  };
}

// ==========================================
// DIMENSION 6: COMMUNITY INFLUENCE
// How much community context shapes their views
// ==========================================

export function calculateCommunityInfluenceDimension(answers: Answers, biasScore?: number): DimensionScore {
  const scores: number[] = [];
  const weights: number[] = [];

  // Church official position awareness
  const positionOfficielle = getStringAnswer(answers, 'communaute_position_officielle');
  const positionMap: Record<string, number> = {
    'oui_favorable': 4,
    'oui_prudent': 4,
    'oui_defavorable': 4,
    'non': 2,
    'ne_sait_pas': 2,
  };
  if (positionOfficielle && positionMap[positionOfficielle]) {
    scores.push(positionMap[positionOfficielle]);
    weights.push(1.5);
  }

  // Frequency of AI discussions in community
  const discussions = getStringAnswer(answers, 'communaute_discussions');
  const discussionsMap: Record<string, number> = {
    'jamais': 1,
    'rarement': 2,
    'parfois': 3,
    'souvent': 4,
    'organise': 5,
  };
  if (discussions && discussionsMap[discussions]) {
    scores.push(discussionsMap[discussions]);
    weights.push(2);
  }

  // Perception of community attitude
  const perceptionPairs = getStringAnswer(answers, 'communaute_perception_pairs');
  // If they know how their community feels, they're more community-influenced
  const perceptionEngagement: Record<string, number> = {
    'tres_favorable': 4,
    'favorable': 3.5,
    'neutre': 3,
    'mefiant': 3.5,
    'hostile': 4,
    'ne_sait_pas': 1.5,
  };
  if (perceptionPairs && perceptionEngagement[perceptionPairs]) {
    scores.push(perceptionEngagement[perceptionPairs]);
    weights.push(1.5);
  }

  // Theological orientation - those who identify strongly may be more community-tied
  const theoOrientation = getStringAnswer(answers, 'theo_orientation');
  if (theoOrientation === 'traditionaliste' || theoOrientation === 'progressiste') {
    scores.push(3.5);
    weights.push(0.8);
  } else if (theoOrientation === 'ne_sait_pas') {
    scores.push(2);
    weights.push(0.8);
  }

  // Engaged laypeople may be more community-connected
  const statut = getStringAnswer(answers, 'profil_statut');
  if (statut === 'laic_engagé' || statut === 'clerge' || statut === 'religieux') {
    scores.push(4);
    weights.push(1);
  } else if (statut === 'curieux') {
    scores.push(2);
    weights.push(1);
  }

  // Community size (larger = potentially more influence)
  const tailleCommunaute = getStringAnswer(answers, 'profil_taille_communaute');
  const tailleMap: Record<string, number> = {
    'tres_petite': 2.5,
    'petite': 3,
    'moyenne': 3.5,
    'grande': 4,
    'tres_grande': 4,
    'ne_sait_pas': 2.5,
  };
  if (tailleCommunaute && tailleMap[tailleCommunaute]) {
    scores.push(tailleMap[tailleCommunaute]);
    weights.push(0.7);
  }

  const rawValue = scores.length > 0 ? calculateWeightedAverage(scores, weights) : 2.5;

  // Moderate sensitivity (0.3)
  const bias = biasScore ?? calculateSocialDesirabilityScore(answers);
  const value = adjustScoreForBias(rawValue, bias, 0.3);

  const confidence = Math.min(1, scores.length / 4);
  const params = POPULATION_PARAMS.communityInfluence;

  return {
    value,
    confidence,
    percentile: calculatePercentile(value, params.mean, params.stdDev),
  };
}

// ==========================================
// DIMENSION 7: FUTURE ORIENTATION
// Openness to evolving relationship with AI
// ==========================================

export function calculateFutureOrientationDimension(answers: Answers, biasScore?: number): DimensionScore {
  const scores: number[] = [];
  const weights: number[] = [];

  // Intention to increase AI usage
  const intentionUsage = getStringAnswer(answers, 'futur_intention_usage');
  const intentionMap: Record<string, number> = {
    'oui_certain': 5,
    'oui_probable': 4,
    'peut_etre': 3,
    'non_probable': 2,
    'non_certain': 1,
    'ne_sait_pas': 2.5,
  };
  if (intentionUsage && intentionMap[intentionUsage]) {
    scores.push(intentionMap[intentionUsage]);
    weights.push(2);
  }

  // Interest in training
  const formationSouhait = getStringAnswer(answers, 'futur_formation_souhait');
  const formationMap: Record<string, number> = {
    'oui_tres': 5,
    'oui_assez': 4,
    'peut_etre': 3,
    'non_pas_vraiment': 2,
    'non_pas_du_tout': 1,
  };
  if (formationSouhait && formationMap[formationSouhait]) {
    scores.push(formationMap[formationSouhait]);
    weights.push(2);
  }

  // Number of domains of interest
  const domainesInteret = getArrayAnswer(answers, 'futur_domaines_interet');
  if (domainesInteret.length > 0) {
    if (domainesInteret.includes('aucun')) {
      scores.push(1);
    } else {
      const domainScore = Math.min(5, 1 + domainesInteret.length * 0.6);
      scores.push(domainScore);
    }
    weights.push(1.5);
  }

  // Current AI frequency indicates trajectory
  const freq = getStringAnswer(answers, 'ctrl_ia_frequence');
  const freqMap: Record<string, number> = {
    'jamais': 2,
    'essaye': 3,
    'occasionnel': 3.5,
    'regulier': 4,
    'quotidien': 4.5,
  };
  if (freq && freqMap[freq]) {
    scores.push(freqMap[freq]);
    weights.push(1);
  }

  // Age can influence future orientation (younger may be more forward-looking)
  const age = getStringAnswer(answers, 'profil_age');
  const ageMap: Record<string, number> = {
    '18-35': 3.8,
    '36-50': 3.5,
    '51-65': 3,
    '66+': 2.5,
  };
  if (age && ageMap[age]) {
    scores.push(ageMap[age]);
    weights.push(0.6);
  }

  // Digital attitude
  const digitalAttitude = getStringAnswer(answers, 'digital_attitude_generale');
  const attitudeMap: Record<string, number> = {
    'tres_positif': 4.5,
    'positif': 4,
    'neutre': 3,
    'negatif': 2,
    'tres_negatif': 1,
  };
  if (digitalAttitude && attitudeMap[digitalAttitude]) {
    scores.push(attitudeMap[digitalAttitude]);
    weights.push(0.8);
  }

  const rawValue = scores.length > 0 ? calculateWeightedAverage(scores, weights) : 3;

  // Medium sensitivity (0.4) - "Open-mindedness" bias
  const bias = biasScore ?? calculateSocialDesirabilityScore(answers);
  const value = adjustScoreForBias(rawValue, bias, 0.4);

  const confidence = Math.min(1, scores.length / 4);
  const params = POPULATION_PARAMS.futureOrientation;

  return {
    value,
    confidence,
    percentile: calculatePercentile(value, params.mean, params.stdDev),
  };
}

// ==========================================
// MAIN FUNCTION: Calculate All 7 Dimensions
// ==========================================

export function calculateAllDimensions(answers: Answers): SevenDimensions {
  // Calculate bias once
  const biasScore = calculateSocialDesirabilityScore(answers);

  return {
    religiosity: calculateReligiosityDimension(answers, biasScore),
    aiOpenness: calculateAIOpennessDimension(answers, biasScore),
    sacredBoundary: calculateSacredBoundaryDimension(answers, biasScore),
    ethicalConcern: calculateEthicalConcernDimension(answers, biasScore),
    psychologicalPerception: calculatePsychologicalPerceptionDimension(answers, biasScore),
    communityInfluence: calculateCommunityInfluenceDimension(answers, biasScore),
    futureOrientation: calculateFutureOrientationDimension(answers, biasScore),
  };
}