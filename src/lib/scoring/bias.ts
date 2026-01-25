/**
 * Social Desirability Bias Calculation
 * Based on Marlowe-Crowne Social Desirability Scale (Short Form C)
 */

import type { Answers } from '@/data';

/**
 * Keying for Marlowe-Crowne items
 * Maps the answer that indicates HIGH social desirability (bias)
 */
const MC_TARGETS: Record<string, string> = {
  'ctrl_mc_1': 'false', // "Hard to work without encouragement" -> False claims independence
  'ctrl_mc_2': 'true',  // "Never intensely disliked anyone" -> True claims saintliness
  'ctrl_mc_3': 'false', // "Rebel against authority" -> False claims perfect rationality
  'ctrl_mc_4': 'true',  // "Always courteous" -> True claims perfect manners
  'ctrl_mc_5': 'false', // "Taken advantage of someone" -> False claims moral perfection
};

/**
 * Calculate the raw Social Desirability Score (0-10 normalized)
 * Higher score = Higher likelihood of biased self-reporting
 */
export function calculateSocialDesirabilityScore(answers: Answers): number {
  let biasPoints = 0;
  let answeredCount = 0;

  for (const [key, target] of Object.entries(MC_TARGETS)) {
    const answer = answers[key];
    if (typeof answer === 'string') {
      answeredCount++;
      // Check if answer matches the "high bias" target
      if (answer === target) {
        biasPoints++;
      }
    }
  }

  if (answeredCount === 0) return 5; // Neutral default if missing

  // Normalize to 0-10 scale
  return (biasPoints / answeredCount) * 10;
}

/**
 * Get a confidence multiplier based on bias score.
 * 0-3 bias: 1.0 (High confidence)
 * 4-6 bias: 0.9 (Moderate confidence)
 * 7-8 bias: 0.8 (Low confidence)
 * 9-10 bias: 0.7 (Very low confidence)
 */
export function getBiasConfidenceMultiplier(biasScore: number): number {
  if (biasScore <= 3) return 1.0;
  if (biasScore <= 6) return 0.9;
  if (biasScore <= 8) return 0.8;
  return 0.7;
}

/**
 * Adjust a dimension score based on social desirability bias.
 * 
 * @param rawScore The calculated score (1-5)
 * @param biasScore The bias score (0-10)
 * @param sensitivity How susceptible this dimension is to faking (0-1)
 *                    e.g., Religiosity = 0.8 (highly susceptible)
 *                    e.g., AI Openness = 0.3 (less susceptible)
 */
export function adjustScoreForBias(
  rawScore: number, 
  biasScore: number, 
  sensitivity: number
): number {
  // If bias is low, no adjustment needed
  if (biasScore <= 4) return rawScore;

  // Calculate adjustment magnitude
  // A bias score of 10 results in max adjustment
  // A sensitivity of 1 results in max adjustment
  
  // We generally assume bias leads to INFLATION of positive traits
  // So we typically deflate the score.
  
  const biasFactor = (biasScore - 4) / 6; // 0 to 1 scale for bias > 4
  const maxDeflation = 1.0; // Max points to deduct
  
  const adjustment = biasFactor * sensitivity * maxDeflation;
  
  return Math.max(1, Math.round((rawScore - adjustment) * 10) / 10);
}
