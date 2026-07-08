/**
 * Unit Tests for Legacy Compatibility Exports (src/lib/scoring/index.ts)
 *
 * These wrap the dimension/profile system for backward compatibility but
 * still feed user-facing surfaces directly (FeedbackScreen, PDF report,
 * admin dashboards). Boundary behavior of the threshold/bucketing helpers
 * matters because it determines which label ("resistant"/"enthousiaste",
 * "non_religieux"/"tres_religieux"...) a respondent is shown.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCRS5Score,
  calculateAIAdoptionScore,
  getReligiosityLevel,
  getAIAdoptionLevel,
  getTheologicalOrientation,
  getSpiritualAIProfile,
  calculateGeneralAIScore,
  calculateSpiritualAIScore,
  calculateSpiritualResistanceIndex,
  getResistanceLevel,
  getPercentileComparison,
  generateInsights,
  getSubProfileData,
  getDimensionScores,
} from '../index';
import { calculateReligiosityDimension, calculateAIOpennessDimension } from '../dimensions';
import {
  gardienTraditionAnswers,
  pionnierSpirituelAnswers,
  equilibristeAnswers,
  emptyAnswers,
  clergyAnswers,
  clergyNoAIAnswers,
  laypersonAnswers,
} from './fixtures';
import type { Answers } from '@/data';

// ==========================================
// calculateCRS5Score / calculateAIAdoptionScore
// (thin delegates to the dimension calculators)
// ==========================================

describe('calculateCRS5Score', () => {
  it('delegates exactly to calculateReligiosityDimension().value', () => {
    [gardienTraditionAnswers, pionnierSpirituelAnswers, equilibristeAnswers, emptyAnswers].forEach(
      (answers) => {
        expect(calculateCRS5Score(answers)).toBe(calculateReligiosityDimension(answers).value);
      }
    );
  });

  it('always returns a finite number within [1, 5]', () => {
    [gardienTraditionAnswers, pionnierSpirituelAnswers, emptyAnswers].forEach((answers) => {
      const score = calculateCRS5Score(answers);
      expect(Number.isFinite(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(5);
    });
  });

  it('does not throw on empty answers', () => {
    expect(() => calculateCRS5Score(emptyAnswers)).not.toThrow();
  });
});

describe('calculateAIAdoptionScore', () => {
  it('delegates exactly to calculateAIOpennessDimension().value', () => {
    [gardienTraditionAnswers, pionnierSpirituelAnswers, equilibristeAnswers, emptyAnswers].forEach(
      (answers) => {
        expect(calculateAIAdoptionScore(answers)).toBe(
          calculateAIOpennessDimension(answers).value
        );
      }
    );
  });

  it('always returns a finite number within [1, 5]', () => {
    [gardienTraditionAnswers, pionnierSpirituelAnswers, emptyAnswers].forEach((answers) => {
      const score = calculateAIAdoptionScore(answers);
      expect(Number.isFinite(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(5);
    });
  });
});

// ==========================================
// getReligiosityLevel - exact threshold edges
// ==========================================

describe('getReligiosityLevel', () => {
  it('returns non_religieux strictly below 2', () => {
    expect(getReligiosityLevel(1)).toBe('non_religieux');
    expect(getReligiosityLevel(1.99)).toBe('non_religieux');
  });

  it('returns peu_religieux on [2, 3)', () => {
    expect(getReligiosityLevel(2)).toBe('peu_religieux');
    expect(getReligiosityLevel(2.5)).toBe('peu_religieux');
    expect(getReligiosityLevel(2.99)).toBe('peu_religieux');
  });

  it('returns religieux on [3, 4)', () => {
    expect(getReligiosityLevel(3)).toBe('religieux');
    expect(getReligiosityLevel(3.5)).toBe('religieux');
    expect(getReligiosityLevel(3.99)).toBe('religieux');
  });

  it('returns tres_religieux at and above 4', () => {
    expect(getReligiosityLevel(4)).toBe('tres_religieux');
    expect(getReligiosityLevel(4.5)).toBe('tres_religieux');
    expect(getReligiosityLevel(5)).toBe('tres_religieux');
  });

  it('is monotonically non-decreasing in severity as score increases', () => {
    const order = ['non_religieux', 'peu_religieux', 'religieux', 'tres_religieux'];
    const scores = [1, 1.99, 2, 2.99, 3, 3.99, 4, 5];
    let lastIndex = -1;
    scores.forEach((score) => {
      const idx = order.indexOf(getReligiosityLevel(score));
      expect(idx).toBeGreaterThanOrEqual(lastIndex);
      lastIndex = idx;
    });
  });
});

// ==========================================
// getAIAdoptionLevel - exact threshold edges
// ==========================================

describe('getAIAdoptionLevel', () => {
  it('returns resistant strictly below 2', () => {
    expect(getAIAdoptionLevel(1)).toBe('resistant');
    expect(getAIAdoptionLevel(1.99)).toBe('resistant');
  });

  it('returns prudent on [2, 3)', () => {
    expect(getAIAdoptionLevel(2)).toBe('prudent');
    expect(getAIAdoptionLevel(2.5)).toBe('prudent');
    expect(getAIAdoptionLevel(2.99)).toBe('prudent');
  });

  it('returns ouvert on [3, 4)', () => {
    expect(getAIAdoptionLevel(3)).toBe('ouvert');
    expect(getAIAdoptionLevel(3.5)).toBe('ouvert');
    expect(getAIAdoptionLevel(3.99)).toBe('ouvert');
  });

  it('returns enthousiaste at and above 4', () => {
    expect(getAIAdoptionLevel(4)).toBe('enthousiaste');
    expect(getAIAdoptionLevel(5)).toBe('enthousiaste');
  });
});

// ==========================================
// getTheologicalOrientation
// ==========================================

describe('getTheologicalOrientation', () => {
  it('returns the theo_orientation answer when it is a string', () => {
    expect(getTheologicalOrientation({ theo_orientation: 'progressiste' })).toBe('progressiste');
    expect(getTheologicalOrientation({ theo_orientation: 'traditionaliste' })).toBe(
      'traditionaliste'
    );
  });

  it("falls back to 'ne_sait_pas' when unanswered", () => {
    expect(getTheologicalOrientation(emptyAnswers)).toBe('ne_sait_pas');
  });

  it("falls back to 'ne_sait_pas' when the answer is not a string (defensive typing)", () => {
    const malformed: Answers = { theo_orientation: 3 };
    expect(getTheologicalOrientation(malformed)).toBe('ne_sait_pas');
  });
});

// ==========================================
// getSpiritualAIProfile
// ==========================================

describe('getSpiritualAIProfile', () => {
  it('returns a primary profile identifier without throwing', () => {
    expect(() => getSpiritualAIProfile(gardienTraditionAnswers)).not.toThrow();
    const profile = getSpiritualAIProfile(gardienTraditionAnswers);
    expect(typeof profile).toBe('string');
    expect(profile.length).toBeGreaterThan(0);
  });

  it('handles empty answers without throwing', () => {
    expect(() => getSpiritualAIProfile(emptyAnswers)).not.toThrow();
  });
});

// ==========================================
// calculateGeneralAIScore
// ==========================================

describe('calculateGeneralAIScore', () => {
  it('returns the fallback value 1 for empty answers (no items to average)', () => {
    expect(calculateGeneralAIScore(emptyAnswers)).toBe(1);
  });

  it('averages frequency, comfort, and context-count sub-scores', () => {
    const answers: Answers = {
      ctrl_ia_frequence: 'quotidien', // 5
      ctrl_ia_confort: 5, // 5
      ctrl_ia_contextes: ['travail_pro', 'creation'], // min(5, 1+2) = 3
    };
    // (5 + 5 + 3) / 3 = 4.333... -> rounded to 1 decimal
    expect(calculateGeneralAIScore(answers)).toBeCloseTo(4.3, 5);
  });

  it('caps the context-count sub-score at 5 regardless of how many contexts are selected', () => {
    const fewContexts = calculateGeneralAIScore({ ctrl_ia_contextes: ['a'] });
    const manyContexts = calculateGeneralAIScore({
      ctrl_ia_contextes: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    });
    // 1 context -> min(5, 2) = 2; 8 contexts -> min(5, 9) = 5
    expect(fewContexts).toBe(2);
    expect(manyContexts).toBe(5);
  });

  it('ignores an unrecognized frequency value (not counted as an item)', () => {
    const withUnknownFreq = calculateGeneralAIScore({ ctrl_ia_frequence: 'not_a_real_value' });
    // No recognized item at all -> falls back to 1
    expect(withUnknownFreq).toBe(1);
  });

  it('does not throw on empty answers', () => {
    expect(() => calculateGeneralAIScore(emptyAnswers)).not.toThrow();
  });
});

// ==========================================
// calculateSpiritualAIScore
// ==========================================

describe('calculateSpiritualAIScore', () => {
  it('returns the fallback value 1 for empty answers', () => {
    expect(calculateSpiritualAIScore(emptyAnswers)).toBe(1);
  });

  it('scores clergy preaching usage from min_pred_usage', () => {
    const systematique = calculateSpiritualAIScore({ min_pred_usage: 'systematique' });
    const jamais = calculateSpiritualAIScore({ min_pred_usage: 'jamais' });
    expect(systematique).toBeGreaterThan(jamais);
  });

  it('scores pastoral care usage from min_care_email', () => {
    const often = calculateSpiritualAIScore({ min_care_email: 'oui_souvent' });
    const never = calculateSpiritualAIScore({ min_care_email: 'non_jamais' });
    expect(often).toBeGreaterThan(never);
  });

  it("scores the 'spirituel' AI usage context as a strong signal", () => {
    const withSpiritual = calculateSpiritualAIScore({
      ctrl_ia_contextes: ['spirituel', 'travail_pro'],
    });
    const withoutSpiritual = calculateSpiritualAIScore({
      ctrl_ia_contextes: ['travail_pro'],
    });
    expect(withSpiritual).toBeGreaterThan(withoutSpiritual);
  });

  it('handles the full clergy fixture without throwing', () => {
    expect(() => calculateSpiritualAIScore(clergyAnswers)).not.toThrow();
    expect(() => calculateSpiritualAIScore(clergyNoAIAnswers)).not.toThrow();
    expect(() => calculateSpiritualAIScore(laypersonAnswers)).not.toThrow();
  });

  // Regression: the local prière/conseil maps had gone stale against the
  // schema option values ('oui_bof'/'oui' vs the real 'oui_positif' /
  // 'oui_neutre' / 'oui_negatif'), silently dropping those answers from
  // the average. The function now uses the shared LAIC_PRIERE_SCORES /
  // LAIC_CONSEIL_SCORES maps from score-maps.ts.
  it('scores a positive laic_substitution_priere answer higher than a negative one', () => {
    const positive = calculateSpiritualAIScore({ laic_substitution_priere: 'oui_positif' });
    const negative = calculateSpiritualAIScore({ laic_substitution_priere: 'oui_negatif' });
    expect(positive).toBeGreaterThan(negative);
  });

  it('counts every schema option of the two laïc questions in the average', () => {
    // 'non' (prière) and 'jamais' (conseil) legitimately score 1, which is
    // indistinguishable from the no-items fallback, so they are not asserted.
    for (const value of ['oui_positif', 'oui_neutre', 'oui_negatif']) {
      expect(calculateSpiritualAIScore({ laic_substitution_priere: value })).not.toBe(1);
    }
    for (const value of ['complement', 'oui_possible', 'deja_fait', 'ne_sait_pas']) {
      expect(calculateSpiritualAIScore({ laic_conseil_spirituel: value })).not.toBe(1);
    }
  });
});

// ==========================================
// calculateSpiritualResistanceIndex / getResistanceLevel
// ==========================================

describe('calculateSpiritualResistanceIndex', () => {
  it('is the rounded (to 1 decimal) difference between general and spiritual AI scores', () => {
    const answers: Answers = {
      ctrl_ia_frequence: 'quotidien',
      ctrl_ia_confort: 5,
      ctrl_ia_contextes: ['travail_pro'],
      min_pred_usage: 'jamais',
    };
    const general = calculateGeneralAIScore(answers);
    const spiritual = calculateSpiritualAIScore(answers);
    const index = calculateSpiritualResistanceIndex(answers);
    expect(index).toBeCloseTo(Math.round((general - spiritual) * 10) / 10, 5);
  });

  it('does not throw on empty answers', () => {
    expect(() => calculateSpiritualResistanceIndex(emptyAnswers)).not.toThrow();
  });
});

describe('getResistanceLevel', () => {
  it('returns aucune at and below 0', () => {
    expect(getResistanceLevel(0)).toBe('aucune');
    expect(getResistanceLevel(-2)).toBe('aucune');
  });

  it('returns faible on (0, 1)', () => {
    expect(getResistanceLevel(0.1)).toBe('faible');
    expect(getResistanceLevel(0.99)).toBe('faible');
  });

  it('returns moderee on [1, 2)', () => {
    expect(getResistanceLevel(1)).toBe('moderee');
    expect(getResistanceLevel(1.99)).toBe('moderee');
  });

  it('returns forte at and above 2', () => {
    expect(getResistanceLevel(2)).toBe('forte');
    expect(getResistanceLevel(4)).toBe('forte');
  });
});

// ==========================================
// getPercentileComparison
// ==========================================

describe('getPercentileComparison', () => {
  it('returns 50 when the score equals the population mean', () => {
    expect(getPercentileComparison(3.5, 'religiosity')).toBe(50);
    expect(getPercentileComparison(2.8, 'ai_adoption')).toBe(50);
  });

  it('increases for scores above the mean and clamps at 99', () => {
    expect(getPercentileComparison(5, 'religiosity')).toBe(95);
    expect(getPercentileComparison(5, 'ai_adoption')).toBe(99);
  });

  it('decreases for scores below the mean and clamps at 1', () => {
    expect(getPercentileComparison(1, 'religiosity')).toBe(1);
    expect(getPercentileComparison(1, 'ai_adoption')).toBe(3);
  });

  it('always stays within [1, 99] for extreme degenerate inputs', () => {
    expect(getPercentileComparison(1000, 'religiosity')).toBeLessThanOrEqual(99);
    expect(getPercentileComparison(-1000, 'religiosity')).toBeGreaterThanOrEqual(1);
    expect(getPercentileComparison(1000, 'ai_adoption')).toBeLessThanOrEqual(99);
    expect(getPercentileComparison(-1000, 'ai_adoption')).toBeGreaterThanOrEqual(1);
  });
});

// ==========================================
// generateInsights
// ==========================================

describe('generateInsights', () => {
  it('returns at most 3 insights, each with the required legacy fields', () => {
    const insights = generateInsights(equilibristeAnswers);
    expect(Array.isArray(insights)).toBe(true);
    expect(insights.length).toBeLessThanOrEqual(3);
    insights.forEach((insight) => {
      expect(['spirituality', 'technology', 'ethics', 'community']).toContain(insight.category);
      expect(typeof insight.icon).toBe('string');
      expect(insight.title.length).toBeGreaterThan(0);
      expect(insight.message.length).toBeGreaterThan(0);
    });
  });

  it('does not throw on empty answers', () => {
    expect(() => generateInsights(emptyAnswers)).not.toThrow();
  });
});

// ==========================================
// getSubProfileData
// ==========================================

describe('getSubProfileData', () => {
  it('returns the sub-profile definition for a valid id', () => {
    const data = getSubProfileData('protecteur_sacre');
    expect(data).toBeDefined();
    expect(data?.id).toBe('protecteur_sacre');
  });

  it('returns undefined for an unknown id', () => {
    expect(getSubProfileData('not_a_real_sub_profile')).toBeUndefined();
  });
});

// ==========================================
// getDimensionScores
// ==========================================

describe('getDimensionScores', () => {
  it('returns all 7 dimension scores matching calculateAllDimensions', () => {
    const dims = getDimensionScores(equilibristeAnswers);
    expect(dims).toHaveProperty('religiosity');
    expect(dims).toHaveProperty('aiOpenness');
    expect(dims).toHaveProperty('sacredBoundary');
    expect(dims).toHaveProperty('ethicalConcern');
    expect(dims).toHaveProperty('psychologicalPerception');
    expect(dims).toHaveProperty('communityInfluence');
    expect(dims).toHaveProperty('futureOrientation');
  });

  it('does not throw on empty answers', () => {
    expect(() => getDimensionScores(emptyAnswers)).not.toThrow();
  });
});
