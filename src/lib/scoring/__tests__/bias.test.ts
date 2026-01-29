/**
 * Unit Tests for Social Desirability Bias Calculation
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSocialDesirabilityScore,
  getBiasConfidenceMultiplier,
  adjustScoreForBias,
} from '../bias';
import {
  highBiasAnswers,
  lowBiasAnswers,
  equilibristeAnswers,
  emptyAnswers,
} from './fixtures';

// ==========================================
// MARLOWE-CROWNE SCORE CALCULATION
// ==========================================

describe('calculateSocialDesirabilityScore', () => {
  it('should return high bias score (10) when all answers match target', () => {
    const result = calculateSocialDesirabilityScore(highBiasAnswers);
    expect(result).toBe(10);
  });

  it('should return low bias score (0) when no answers match target', () => {
    const result = calculateSocialDesirabilityScore(lowBiasAnswers);
    expect(result).toBe(0);
  });

  it('should return neutral score (5) for empty answers', () => {
    const result = calculateSocialDesirabilityScore(emptyAnswers);
    expect(result).toBe(5);
  });

  it('should return partial score for mixed answers', () => {
    // equilibristeAnswers has low bias (no targets)
    const result = calculateSocialDesirabilityScore(equilibristeAnswers);
    expect(result).toBe(0);
  });

  it('should return value between 0 and 10', () => {
    const scores = [
      calculateSocialDesirabilityScore(highBiasAnswers),
      calculateSocialDesirabilityScore(lowBiasAnswers),
      calculateSocialDesirabilityScore(equilibristeAnswers),
    ];

    scores.forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  it('should handle partial MC answers', () => {
    const partialAnswers = {
      ctrl_mc_1: 'false', // Target
      ctrl_mc_2: 'true',  // Target
      // Missing mc_3, mc_4, mc_5
    };

    const result = calculateSocialDesirabilityScore(partialAnswers);
    // 2 out of 2 answered = 100% bias = 10
    expect(result).toBe(10);
  });

  it('should calculate correct proportion for 3/5 target matches', () => {
    const threeOfFive = {
      ctrl_mc_1: 'false', // Target
      ctrl_mc_2: 'true',  // Target
      ctrl_mc_3: 'false', // Target
      ctrl_mc_4: 'false', // NOT target (target is true)
      ctrl_mc_5: 'true',  // NOT target (target is false)
    };

    const result = calculateSocialDesirabilityScore(threeOfFive);
    // 3/5 = 0.6, * 10 = 6
    expect(result).toBe(6);
  });
});

// ==========================================
// BIAS CONFIDENCE MULTIPLIER
// ==========================================

describe('getBiasConfidenceMultiplier', () => {
  it('should return 1.0 for low bias (0-3)', () => {
    expect(getBiasConfidenceMultiplier(0)).toBe(1.0);
    expect(getBiasConfidenceMultiplier(2)).toBe(1.0);
    expect(getBiasConfidenceMultiplier(3)).toBe(1.0);
  });

  it('should return 0.9 for moderate bias (4-6)', () => {
    expect(getBiasConfidenceMultiplier(4)).toBe(0.9);
    expect(getBiasConfidenceMultiplier(5)).toBe(0.9);
    expect(getBiasConfidenceMultiplier(6)).toBe(0.9);
  });

  it('should return 0.8 for high bias (7-8)', () => {
    expect(getBiasConfidenceMultiplier(7)).toBe(0.8);
    expect(getBiasConfidenceMultiplier(8)).toBe(0.8);
  });

  it('should return 0.7 for very high bias (9-10)', () => {
    expect(getBiasConfidenceMultiplier(9)).toBe(0.7);
    expect(getBiasConfidenceMultiplier(10)).toBe(0.7);
  });

  it('should return decreasing multipliers as bias increases', () => {
    const mult0 = getBiasConfidenceMultiplier(0);
    const mult5 = getBiasConfidenceMultiplier(5);
    const mult8 = getBiasConfidenceMultiplier(8);
    const mult10 = getBiasConfidenceMultiplier(10);

    expect(mult0).toBeGreaterThan(mult5);
    expect(mult5).toBeGreaterThan(mult8);
    expect(mult8).toBeGreaterThan(mult10);
  });
});

// ==========================================
// SCORE ADJUSTMENT FOR BIAS
// ==========================================

describe('adjustScoreForBias', () => {
  it('should not adjust score for low bias (<=4)', () => {
    const rawScore = 4.5;
    expect(adjustScoreForBias(rawScore, 0, 0.8)).toBe(rawScore);
    expect(adjustScoreForBias(rawScore, 2, 0.8)).toBe(rawScore);
    expect(adjustScoreForBias(rawScore, 4, 0.8)).toBe(rawScore);
  });

  it('should deflate score for high bias', () => {
    const rawScore = 4.5;
    const adjusted = adjustScoreForBias(rawScore, 10, 0.8);
    expect(adjusted).toBeLessThan(rawScore);
  });

  it('should deflate more for higher sensitivity', () => {
    const rawScore = 4.5;
    const biasScore = 8;

    const lowSensitivity = adjustScoreForBias(rawScore, biasScore, 0.2);
    const highSensitivity = adjustScoreForBias(rawScore, biasScore, 0.8);

    // High sensitivity should result in more deflation
    expect(highSensitivity).toBeLessThan(lowSensitivity);
  });

  it('should not deflate below 1', () => {
    const rawScore = 1.5;
    const adjusted = adjustScoreForBias(rawScore, 10, 1.0);
    expect(adjusted).toBeGreaterThanOrEqual(1);
  });

  it('should handle zero sensitivity (no adjustment)', () => {
    const rawScore = 4.5;
    const adjusted = adjustScoreForBias(rawScore, 10, 0);
    expect(adjusted).toBe(rawScore);
  });

  it('should preserve score precision (1 decimal place)', () => {
    const rawScore = 4.5;
    const adjusted = adjustScoreForBias(rawScore, 7, 0.5);
    const decimals = (adjusted.toString().split('.')[1] || '').length;
    expect(decimals).toBeLessThanOrEqual(1);
  });
});

// ==========================================
// INTEGRATION: BIAS IN DIMENSION CONTEXT
// ==========================================

describe('Bias integration scenarios', () => {
  it('should correctly identify high social desirability profile', () => {
    const bias = calculateSocialDesirabilityScore(highBiasAnswers);
    const multiplier = getBiasConfidenceMultiplier(bias);

    expect(bias).toBe(10);
    expect(multiplier).toBe(0.7);
  });

  it('should correctly identify low social desirability profile', () => {
    const bias = calculateSocialDesirabilityScore(lowBiasAnswers);
    const multiplier = getBiasConfidenceMultiplier(bias);

    expect(bias).toBe(0);
    expect(multiplier).toBe(1.0);
  });

  it('should produce significant adjustment for religiosity dimension (high sensitivity)', () => {
    // Religiosity has sensitivity 0.8
    const rawReligiosity = 5.0;
    const highBias = 10;

    const adjusted = adjustScoreForBias(rawReligiosity, highBias, 0.8);

    // With max bias and high sensitivity, should see significant deflation
    expect(adjusted).toBeLessThan(4.5);
  });

  it('should produce minimal adjustment for AI openness dimension (low sensitivity)', () => {
    // AI Openness has sensitivity 0.2
    const rawAIOpenness = 4.0;
    const highBias = 10;

    const adjusted = adjustScoreForBias(rawAIOpenness, highBias, 0.2);

    // With low sensitivity, adjustment should be smaller
    expect(adjusted).toBeGreaterThan(3.5);
  });
});
