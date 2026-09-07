import { describe, it, expect } from 'vitest';
import * as scoring from '../index';
import {
  calculateCRS5Score,
  calculateAIAdoptionScore,
  getReligiosityLevel,
  RELIGIOSITY_LABELS,
  getTheologicalOrientation,
  getSpiritualAIProfile,
  getDimensionScores,
  getSubProfileData,
  generateInsights,
  computeUsageGap,
  PROFILE_DATA,
  DIMENSION_KEYS,
  DIMENSION_ITEMS,
} from '../index';
import { calculateReligiosityDimension } from '../dimensions';
import {
  moderateAnswers,
  gardienTraditionAnswers,
  pionnierSpirituelAnswers,
  laypersonNoSpiritualAIAnswers,
  clergyAnswers,
  crsOnlyAnswers,
  emptyAnswers,
} from './fixtures';

describe('removed v1 exports', () => {
  const removed = [
    'getPercentileComparison',
    'calculateSpiritualResistanceIndex',
    'calculateGeneralAIScore',
    'calculateSpiritualAIScore',
    'getResistanceLevel',
    'RESISTANCE_LABELS',
    'calculateSocialDesirabilityScore',
    'getBiasConfidenceMultiplier',
    'adjustScoreForBias',
    'calculateCommunityInfluenceDimension',
  ];

  for (const name of removed) {
    it(`no longer exports ${name}`, () => {
      expect(name in scoring).toBe(false);
    });
  }
});

describe('score wrappers', () => {
  it('delegates the CRS-5 score to the religiosity dimension', () => {
    expect(calculateCRS5Score(moderateAnswers)).toBe(
      calculateReligiosityDimension(moderateAnswers).value,
    );
  });

  it('returns null instead of a default when the items are missing', () => {
    expect(calculateCRS5Score(emptyAnswers)).toBeNull();
    expect(calculateAIAdoptionScore(emptyAnswers)).toBeNull();
  });
});

describe('religiosity classes (Huber)', () => {
  it('uses three classes with the documented cut-offs', () => {
    expect(getReligiosityLevel(1)).toBe('non_religieux');
    expect(getReligiosityLevel(2)).toBe('non_religieux');
    expect(getReligiosityLevel(2.1)).toBe('religieux');
    expect(getReligiosityLevel(3.9)).toBe('religieux');
    expect(getReligiosityLevel(4)).toBe('hautement_religieux');
    expect(getReligiosityLevel(5)).toBe('hautement_religieux');
  });

  it('labels the three classes', () => {
    expect(Object.keys(RELIGIOSITY_LABELS)).toEqual([
      'non_religieux',
      'religieux',
      'hautement_religieux',
    ]);
  });
});

describe('usage gap', () => {
  it('reports a gap for general-only usage', () => {
    expect(computeUsageGap(laypersonNoSpiritualAIAnswers)).toBe('uses_general_not_spiritual');
  });

  it('reports both when a spiritual context is declared', () => {
    expect(computeUsageGap(pionnierSpirituelAnswers)).toBe('uses_both');
  });

  it('reports both for clergy using AI in ministry', () => {
    expect(computeUsageGap(clergyAnswers)).toBe('uses_both');
  });

  it('reports no use when the respondent never uses AI', () => {
    expect(computeUsageGap(gardienTraditionAnswers)).toBe('no_use');
  });

  it('reports none when general usage is unknown', () => {
    expect(computeUsageGap(crsOnlyAnswers)).toBe('none');
  });
});

describe('exported item map', () => {
  it('exposes DIMENSION_KEYS and DIMENSION_ITEMS for shared-item detection', () => {
    expect(DIMENSION_KEYS).toHaveLength(7);
    expect(DIMENSION_KEYS).toContain('communityContext');
    expect(DIMENSION_KEYS).not.toContain('communityInfluence');
    for (const key of DIMENSION_KEYS) {
      expect(DIMENSION_ITEMS[key].length).toBeGreaterThanOrEqual(3);
    }
    expect(DIMENSION_ITEMS.religiosity).toEqual([
      'crs_intellect',
      'crs_ideology',
      'crs_public_practice',
      'crs_private_practice',
      'crs_experience',
    ]);
  });
});

describe('profile helpers', () => {
  it('returns the primary profile or null', () => {
    expect(getSpiritualAIProfile(gardienTraditionAnswers)).toBe('gardien_tradition');
    expect(getSpiritualAIProfile(emptyAnswers)).toBeNull();
  });

  it('exposes card data for the 8 profiles', () => {
    expect(Object.keys(PROFILE_DATA)).toHaveLength(8);
    for (const data of Object.values(PROFILE_DATA)) {
      expect(data.title.length).toBeGreaterThan(0);
      expect(data.description.length).toBeGreaterThan(0);
    }
  });

  it('exposes sub-profile data by id', () => {
    expect(getSubProfileData('protecteur_sacre').parentProfile).toBe('gardien_tradition');
  });

  it('returns dimension scores with the v2 shape', () => {
    const dimensions = getDimensionScores(moderateAnswers);
    expect(dimensions.religiosity).toHaveProperty('nItems');
    expect(dimensions.religiosity).toHaveProperty('maxItems');
    expect(dimensions.religiosity.percentile).toBeNull();
  });

  it('maps insights to the legacy categories', () => {
    const insights = generateInsights(gardienTraditionAnswers);
    expect(insights.length).toBeLessThanOrEqual(3);
    for (const insight of insights) {
      expect(['spirituality', 'technology', 'ethics', 'community']).toContain(insight.category);
    }
  });

  it('reads the theological self-label as a covariate', () => {
    expect(getTheologicalOrientation(gardienTraditionAnswers)).toBe('traditionaliste');
    expect(getTheologicalOrientation(emptyAnswers)).toBe('ne_sait_pas');
  });
});
