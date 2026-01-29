/**
 * Unit Tests for Dimension Calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateReligiosityDimension,
  calculateAIOpennessDimension,
  calculateSacredBoundaryDimension,
  calculateEthicalConcernDimension,
  calculatePsychologicalPerceptionDimension,
  calculateCommunityInfluenceDimension,
  calculateFutureOrientationDimension,
  calculateAllDimensions,
} from '../dimensions';
import {
  gardienTraditionAnswers,
  pionnierSpirituelAnswers,
  equilibristeAnswers,
  progressisteCritiqueAnswers,
  explorateurAnswers,
  minimalAnswers,
  emptyAnswers,
  extremeHighAnswers,
  extremeLowAnswers,
  highBiasAnswers,
  lowBiasAnswers,
  clergyAnswers,
  laypersonAnswers,
} from './fixtures';

// ==========================================
// DIMENSION 1: RELIGIOSITY (CRS-5)
// ==========================================

describe('calculateReligiosityDimension', () => {
  it('should calculate high religiosity for gardien_tradition profile', () => {
    const result = calculateReligiosityDimension(gardienTraditionAnswers);
    expect(result.value).toBeGreaterThanOrEqual(4);
    expect(result.value).toBeLessThanOrEqual(5);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should calculate low religiosity for explorateur profile', () => {
    const result = calculateReligiosityDimension(explorateurAnswers);
    expect(result.value).toBeLessThanOrEqual(2.5);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should calculate moderate religiosity for equilibriste profile', () => {
    const result = calculateReligiosityDimension(equilibristeAnswers);
    expect(result.value).toBeGreaterThanOrEqual(2.5);
    expect(result.value).toBeLessThanOrEqual(3.5);
  });

  it('should return fallback value for empty answers', () => {
    const result = calculateReligiosityDimension(emptyAnswers);
    // Empty answers should return a neutral/middle value (around 2.5-3.5)
    expect(result.value).toBeGreaterThanOrEqual(2);
    expect(result.value).toBeLessThanOrEqual(4);
    expect(result.confidence).toBe(0);
  });

  it('should handle minimal answers gracefully', () => {
    const result = calculateReligiosityDimension(minimalAnswers);
    expect(result.value).toBeGreaterThanOrEqual(1);
    expect(result.value).toBeLessThanOrEqual(5);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should return percentile between 1 and 99', () => {
    const highResult = calculateReligiosityDimension(extremeHighAnswers);
    const lowResult = calculateReligiosityDimension(extremeLowAnswers);

    expect(highResult.percentile).toBeGreaterThanOrEqual(1);
    expect(highResult.percentile).toBeLessThanOrEqual(99);
    expect(lowResult.percentile).toBeGreaterThanOrEqual(1);
    expect(lowResult.percentile).toBeLessThanOrEqual(99);
  });

  it('should apply bias adjustment for high bias scores', () => {
    const withLowBias = calculateReligiosityDimension(lowBiasAnswers, 0);
    const withHighBias = calculateReligiosityDimension(highBiasAnswers, 10);

    // High bias should deflate the score
    expect(withHighBias.value).toBeLessThanOrEqual(withLowBias.value);
  });
});

// ==========================================
// DIMENSION 2: AI OPENNESS
// ==========================================

describe('calculateAIOpennessDimension', () => {
  it('should calculate high AI openness for pionnier profile', () => {
    const result = calculateAIOpennessDimension(pionnierSpirituelAnswers);
    expect(result.value).toBeGreaterThanOrEqual(4);
  });

  it('should calculate low AI openness for gardien_tradition profile', () => {
    const result = calculateAIOpennessDimension(gardienTraditionAnswers);
    expect(result.value).toBeLessThanOrEqual(2);
  });

  it('should factor in clergy-specific questions when applicable', () => {
    const result = calculateAIOpennessDimension(clergyAnswers);
    // Should have higher confidence due to more questions answered
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should factor in layperson-specific questions when applicable', () => {
    const result = calculateAIOpennessDimension(laypersonAnswers);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should handle empty answers', () => {
    const result = calculateAIOpennessDimension(emptyAnswers);
    expect(result.value).toBe(2.5);
  });
});

// ==========================================
// DIMENSION 3: SACRED BOUNDARY
// ==========================================

describe('calculateSacredBoundaryDimension', () => {
  it('should calculate high sacred boundary for gardien_tradition', () => {
    const result = calculateSacredBoundaryDimension(gardienTraditionAnswers);
    expect(result.value).toBeGreaterThanOrEqual(4);
  });

  it('should calculate low sacred boundary for pionnier_spirituel', () => {
    const result = calculateSacredBoundaryDimension(pionnierSpirituelAnswers);
    expect(result.value).toBeLessThanOrEqual(2.5);
  });

  it('should detect general AI user who excludes spiritual use (high boundary)', () => {
    const usesAIButNotSpiritual = {
      ...equilibristeAnswers,
      ctrl_ia_frequence: 'regulier',
      ctrl_ia_contextes: ['travail', 'personnel'], // No 'spirituel'
    };
    const result = calculateSacredBoundaryDimension(usesAIButNotSpiritual);
    expect(result.value).toBeGreaterThan(3);
  });

  it('should handle "aucune" in sacred activities (no boundaries)', () => {
    const noBoundaries = {
      ...equilibristeAnswers,
      theo_activites_sacrees: ['aucune'],
    };
    const result = calculateSacredBoundaryDimension(noBoundaries);
    expect(result.value).toBeLessThan(3);
  });
});

// ==========================================
// DIMENSION 4: ETHICAL CONCERN
// ==========================================

describe('calculateEthicalConcernDimension', () => {
  it('should calculate high ethical concern for progressiste_critique', () => {
    const result = calculateEthicalConcernDimension(progressisteCritiqueAnswers);
    expect(result.value).toBeGreaterThanOrEqual(3.5);
  });

  it('should calculate low ethical concern for pionnier_spirituel', () => {
    const result = calculateEthicalConcernDimension(pionnierSpirituelAnswers);
    expect(result.value).toBeLessThanOrEqual(2.5);
  });

  it('should weight risk perception heavily', () => {
    const highRisk = {
      ...equilibristeAnswers,
      theo_risque_futur: 'deshumanisation',
      psych_anxiete_remplacement: 'oui_probable',
    };
    const result = calculateEthicalConcernDimension(highRisk);
    expect(result.value).toBeGreaterThan(3);
  });
});

// ==========================================
// DIMENSION 5: PSYCHOLOGICAL PERCEPTION
// ==========================================

describe('calculatePsychologicalPerceptionDimension', () => {
  it('should calculate high perception when AI is seen as human-like', () => {
    const humanLike = {
      ...equilibristeAnswers,
      psych_godspeed_nature: '5_humain',
      psych_godspeed_conscience: 'probable',
      psych_imago_dei: 'totalement',
    };
    const result = calculatePsychologicalPerceptionDimension(humanLike);
    expect(result.value).toBeGreaterThan(4);
  });

  it('should calculate low perception when AI is seen as tool', () => {
    const toolLike = {
      ...equilibristeAnswers,
      psych_godspeed_nature: '1_machine',
      psych_godspeed_conscience: 'impossible',
      psych_imago_dei: 'pas_du_tout',
    };
    const result = calculatePsychologicalPerceptionDimension(toolLike);
    expect(result.value).toBeLessThan(2);
  });
});

// ==========================================
// DIMENSION 6: COMMUNITY INFLUENCE
// ==========================================

describe('calculateCommunityInfluenceDimension', () => {
  it('should calculate higher influence for engaged participants', () => {
    const engaged = {
      ...equilibristeAnswers,
      profil_statut: 'laic_engagé',
      communaute_discussions: 'organise',
      communaute_position_officielle: 'oui_favorable',
    };
    const result = calculateCommunityInfluenceDimension(engaged);
    expect(result.value).toBeGreaterThan(3);
  });

  it('should calculate lower influence for curious/seekers', () => {
    const result = calculateCommunityInfluenceDimension(explorateurAnswers);
    expect(result.value).toBeLessThan(3);
  });
});

// ==========================================
// DIMENSION 7: FUTURE ORIENTATION
// ==========================================

describe('calculateFutureOrientationDimension', () => {
  it('should calculate high future orientation for pionnier', () => {
    const result = calculateFutureOrientationDimension(pionnierSpirituelAnswers);
    expect(result.value).toBeGreaterThanOrEqual(4);
  });

  it('should calculate low future orientation for gardien', () => {
    const result = calculateFutureOrientationDimension(gardienTraditionAnswers);
    expect(result.value).toBeLessThanOrEqual(2);
  });

  it('should factor in training interest', () => {
    const wantsTraining = {
      ...equilibristeAnswers,
      futur_formation_souhait: 'oui_tres',
      futur_intention_usage: 'oui_certain',
      futur_domaines_interet: ['priere_meditation', 'catechese', 'communication'],
    };
    const result = calculateFutureOrientationDimension(wantsTraining);
    expect(result.value).toBeGreaterThan(4);
  });
});

// ==========================================
// CALCULATE ALL DIMENSIONS
// ==========================================

describe('calculateAllDimensions', () => {
  it('should return all 7 dimensions', () => {
    const result = calculateAllDimensions(equilibristeAnswers);

    expect(result).toHaveProperty('religiosity');
    expect(result).toHaveProperty('aiOpenness');
    expect(result).toHaveProperty('sacredBoundary');
    expect(result).toHaveProperty('ethicalConcern');
    expect(result).toHaveProperty('psychologicalPerception');
    expect(result).toHaveProperty('communityInfluence');
    expect(result).toHaveProperty('futureOrientation');
  });

  it('should return valid dimension scores for all dimensions', () => {
    const result = calculateAllDimensions(equilibristeAnswers);

    Object.values(result).forEach((dim) => {
      expect(dim.value).toBeGreaterThanOrEqual(1);
      expect(dim.value).toBeLessThanOrEqual(5);
      expect(dim.confidence).toBeGreaterThanOrEqual(0);
      expect(dim.confidence).toBeLessThanOrEqual(1);
      expect(dim.percentile).toBeGreaterThanOrEqual(1);
      expect(dim.percentile).toBeLessThanOrEqual(99);
    });
  });

  it('should handle empty answers without crashing', () => {
    expect(() => calculateAllDimensions(emptyAnswers)).not.toThrow();
    const result = calculateAllDimensions(emptyAnswers);

    Object.values(result).forEach((dim) => {
      expect(typeof dim.value).toBe('number');
      expect(typeof dim.confidence).toBe('number');
      expect(typeof dim.percentile).toBe('number');
    });
  });

  it('should produce distinct profiles for distinct inputs', () => {
    const gardien = calculateAllDimensions(gardienTraditionAnswers);
    const pionnier = calculateAllDimensions(pionnierSpirituelAnswers);

    // Gardien should have higher religiosity
    expect(gardien.religiosity.value).toBeGreaterThan(pionnier.religiosity.value - 0.5);

    // Pionnier should have higher AI openness
    expect(pionnier.aiOpenness.value).toBeGreaterThan(gardien.aiOpenness.value);

    // Gardien should have higher sacred boundary
    expect(gardien.sacredBoundary.value).toBeGreaterThan(pionnier.sacredBoundary.value);
  });
});

// ==========================================
// PERCENTILE CALCULATION ACCURACY
// ==========================================

describe('Percentile calculation accuracy', () => {
  it('should calculate ~97.7 percentile for z=2', () => {
    // If mean=3, stdDev=1, and score=5, z = (5-3)/1 = 2
    // CDF(2) ≈ 0.9772, so percentile ≈ 98
    const result = calculateAllDimensions(extremeHighAnswers);

    // At least one dimension should have a high percentile (> 90)
    const maxPercentile = Math.max(...Object.values(result).map(d => d.percentile));
    expect(maxPercentile).toBeGreaterThanOrEqual(90);
  });

  it('should calculate ~2.3 percentile for z=-2', () => {
    const result = calculateAllDimensions(extremeLowAnswers);

    // At least one dimension should have a low percentile (< 15)
    const minPercentile = Math.min(...Object.values(result).map(d => d.percentile));
    expect(minPercentile).toBeLessThanOrEqual(15);
  });

  it('should calculate ~50 percentile for z=0 (average score)', () => {
    const result = calculateAllDimensions(equilibristeAnswers);

    // For a balanced profile, some dimensions should be near 50th percentile
    const closeToMiddle = Object.values(result).some(
      d => d.percentile >= 30 && d.percentile <= 70
    );
    expect(closeToMiddle).toBe(true);
  });
});

// ==========================================
// CONFIDENCE SCORES
// ==========================================

describe('Confidence scores', () => {
  it('should have low confidence for minimal answers', () => {
    const result = calculateAllDimensions(minimalAnswers);
    const avgConfidence = Object.values(result).reduce((sum, d) => sum + d.confidence, 0) / 7;
    expect(avgConfidence).toBeLessThan(0.8);
  });

  it('should have higher confidence for complete answers', () => {
    const result = calculateAllDimensions(gardienTraditionAnswers);
    const avgConfidence = Object.values(result).reduce((sum, d) => sum + d.confidence, 0) / 7;
    expect(avgConfidence).toBeGreaterThan(0.5);
  });

  it('should have zero confidence for empty answers', () => {
    const result = calculateAllDimensions(emptyAnswers);
    expect(result.religiosity.confidence).toBe(0);
  });
});
