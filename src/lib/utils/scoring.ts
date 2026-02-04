/**
 * Scoring Utility Functions
 * Shared calculation helpers for dimension scoring
 */

/**
 * Calculate weighted average from parallel arrays of scores and weights
 * Returns the weighted mean rounded to one decimal place
 */
export function calculateWeightedAverage(
  scores: number[],
  weights: number[]
): number {
  if (scores.length === 0 || scores.length !== weights.length) {
    return 0;
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (let i = 0; i < scores.length; i++) {
    weightedSum += scores[i] * weights[i];
    totalWeight += weights[i];
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
