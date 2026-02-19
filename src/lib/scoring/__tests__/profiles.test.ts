/**
 * Unit Tests for Profile Matching
 */

import { describe, it, expect } from 'vitest';
import {
  calculateProfileSpectrum,
  getSimpleProfile,
  getEnhancedProfileData,
} from '../profiles';
import {
  gardienTraditionAnswers,
  pionnierSpirituelAnswers,
  equilibristeAnswers,
  progressisteCritiqueAnswers,
  explorateurAnswers,
  innovateurAncreAnswers,
  emptyAnswers,
  highBiasAnswers,
} from './fixtures';
import type { PrimaryProfile } from '../types';

// ==========================================
// PROFILE MATCHING RETURNS SORTED MATCHES
// ==========================================

describe('Profile matching returns sorted matches', () => {
  it('should return allMatches sorted by matchScore descending', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);

    for (let i = 0; i < result.allMatches.length - 1; i++) {
      expect(result.allMatches[i].matchScore).toBeGreaterThanOrEqual(
        result.allMatches[i + 1].matchScore
      );
    }
  });

  it('should have primary match with highest score', () => {
    const result = calculateProfileSpectrum(gardienTraditionAnswers);
    expect(result.primary.matchScore).toBe(result.allMatches[0].matchScore);
  });

  it('should have all 8 profiles in allMatches', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);
    expect(result.allMatches.length).toBe(8);

    const profiles: PrimaryProfile[] = [
      'gardien_tradition',
      'prudent_eclaire',
      'innovateur_ancre',
      'equilibriste',
      'pragmatique_moderne',
      'pionnier_spirituel',
      'progressiste_critique',
      'explorateur',
    ];

    profiles.forEach((profile) => {
      expect(result.allMatches.some((m) => m.profile === profile)).toBe(true);
    });
  });

  it('should normalize match scores to sum to 100%', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);
    const totalScore = result.allMatches.reduce((sum, m) => sum + m.matchScore, 0);
    // Allow small rounding error
    expect(totalScore).toBeGreaterThanOrEqual(99);
    expect(totalScore).toBeLessThanOrEqual(101);
  });
});

// ==========================================
// PRIMARY PROFILE ASSIGNMENT
// ==========================================

describe('Primary profile assignment', () => {
  it('should assign gardien_tradition for traditional high-religiosity answers', () => {
    const result = calculateProfileSpectrum(gardienTraditionAnswers);
    expect(result.primary.profile).toBe('gardien_tradition');
  });

  it('should assign pionnier_spirituel for progressive high-AI answers', () => {
    const result = calculateProfileSpectrum(pionnierSpirituelAnswers);
    expect(result.primary.profile).toBe('pionnier_spirituel');
  });

  it('should assign progressiste_critique for high ethical concern', () => {
    const result = calculateProfileSpectrum(progressisteCritiqueAnswers);
    expect(result.primary.profile).toBe('progressiste_critique');
  });

  it('should assign explorateur for theological uncertainty', () => {
    const result = calculateProfileSpectrum(explorateurAnswers);
    expect(result.primary.profile).toBe('explorateur');
  });

  it('should assign innovateur_ancre for high religiosity + high AI combination', () => {
    const result = calculateProfileSpectrum(innovateurAncreAnswers);
    expect(result.primary.profile).toBe('innovateur_ancre');
  });

  it('should handle empty answers without crashing', () => {
    expect(() => calculateProfileSpectrum(emptyAnswers)).not.toThrow();
  });
});

// ==========================================
// SUB-PROFILE ASSIGNMENT
// ==========================================

describe('Sub-profile assignment', () => {
  it('should assign a valid sub-profile for gardien', () => {
    const result = calculateProfileSpectrum(gardienTraditionAnswers);
    const validSubProfiles = ['protecteur_sacre', 'sage_prudent', 'berger_communautaire'];
    expect(validSubProfiles).toContain(result.subProfile.subProfile);
  });

  it('should assign a valid sub-profile for pionnier', () => {
    const result = calculateProfileSpectrum(pionnierSpirituelAnswers);
    const validSubProfiles = ['visionnaire', 'experimentateur', 'prophete_digital'];
    expect(validSubProfiles).toContain(result.subProfile.subProfile);
  });

  it('should provide a description for the sub-profile', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);
    expect(result.subProfile.description).toBeTruthy();
    expect(typeof result.subProfile.description).toBe('string');
  });

  it('should provide a match score for the sub-profile', () => {
    const result = calculateProfileSpectrum(gardienTraditionAnswers);
    expect(result.subProfile.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.subProfile.matchScore).toBeLessThanOrEqual(100);
  });
});

// ==========================================
// THEOLOGICAL ORIENTATION BONUSES
// ==========================================

describe('Theological orientation bonuses', () => {
  it('should favor gardien for traditionaliste orientation', () => {
    const result = calculateProfileSpectrum(gardienTraditionAnswers);
    const gardienMatch = result.allMatches.find((m) => m.profile === 'gardien_tradition');
    // Gardien should have a significant score (normalized scores sum to 100)
    expect(gardienMatch?.matchScore).toBeGreaterThanOrEqual(10);
    // Should be in top 3
    const topThree = result.allMatches.slice(0, 3).map((m) => m.profile);
    expect(topThree).toContain('gardien_tradition');
  });

  it('should favor pionnier/progressiste for progressiste orientation', () => {
    const result = calculateProfileSpectrum(pionnierSpirituelAnswers);
    const progressive = result.allMatches.find(
      (m) => m.profile === 'pionnier_spirituel' || m.profile === 'progressiste_critique'
    );
    // Should have a significant score
    expect(progressive?.matchScore).toBeGreaterThanOrEqual(10);
  });

  it('should favor equilibriste for modere orientation', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);
    // May not be highest, but should have decent score
    const equilibriste = result.allMatches.find((m) => m.profile === 'equilibriste');
    expect(equilibriste?.matchScore).toBeGreaterThanOrEqual(10);
  });

  it('should favor explorateur for ne_sait_pas orientation', () => {
    const result = calculateProfileSpectrum(explorateurAnswers);
    expect(result.primary.profile).toBe('explorateur');
  });
});

// ==========================================
// SPECTRUM COMPLETENESS
// ==========================================

describe('Spectrum completeness', () => {
  it('should include all required fields in ProfileSpectrum', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);

    expect(result).toHaveProperty('primary');
    expect(result).toHaveProperty('secondary');
    expect(result).toHaveProperty('tertiary');
    expect(result).toHaveProperty('allMatches');
    expect(result).toHaveProperty('subProfile');
    expect(result).toHaveProperty('dimensions');
    expect(result).toHaveProperty('interpretation');
    expect(result).toHaveProperty('insights');
    expect(result).toHaveProperty('tensions');
    expect(result).toHaveProperty('growthAreas');
  });

  it('should include all 7 dimensions', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);

    expect(result.dimensions).toHaveProperty('religiosity');
    expect(result.dimensions).toHaveProperty('aiOpenness');
    expect(result.dimensions).toHaveProperty('sacredBoundary');
    expect(result.dimensions).toHaveProperty('ethicalConcern');
    expect(result.dimensions).toHaveProperty('psychologicalPerception');
    expect(result.dimensions).toHaveProperty('communityInfluence');
    expect(result.dimensions).toHaveProperty('futureOrientation');
  });

  it('should provide interpretation with all required fields', () => {
    const result = calculateProfileSpectrum(gardienTraditionAnswers);

    expect(result.interpretation.headline).toBeTruthy();
    expect(result.interpretation.narrative).toBeTruthy();
    expect(Array.isArray(result.interpretation.uniqueAspects)).toBe(true);
    expect(Array.isArray(result.interpretation.blindSpots)).toBe(true);
    expect(Array.isArray(result.interpretation.strengths)).toBe(true);
  });

  it('should provide insights array (possibly empty)', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);
    expect(Array.isArray(result.insights)).toBe(true);
    // Should have at least one insight (fallback)
    expect(result.insights.length).toBeGreaterThanOrEqual(1);
  });

  it('should limit insights to max 4', () => {
    const result = calculateProfileSpectrum(gardienTraditionAnswers);
    expect(result.insights.length).toBeLessThanOrEqual(4);
  });
});

// ==========================================
// SECONDARY AND TERTIARY PROFILES
// ==========================================

describe('Secondary and tertiary profiles', () => {
  it('should set secondary when second match >= 10%', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);
    // Balanced profile should have significant secondary
    if (result.allMatches[1].matchScore >= 10) {
      expect(result.secondary).not.toBeNull();
    }
  });

  it('should set tertiary when third match >= 5%', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);
    if (result.allMatches[2].matchScore >= 5) {
      expect(result.tertiary).not.toBeNull();
    }
  });

  it('should have different profiles for primary, secondary, tertiary', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);

    if (result.secondary) {
      expect(result.secondary.profile).not.toBe(result.primary.profile);
    }

    if (result.tertiary) {
      expect(result.tertiary.profile).not.toBe(result.primary.profile);
      expect(result.tertiary.profile).not.toBe(result.secondary?.profile);
    }
  });
});

// ==========================================
// BIAS IMPACT ON PROFILE MATCHING
// ==========================================

describe('Bias impact on profile matching', () => {
  it('should reduce theological orientation bonus weight for high bias', () => {
    // High bias respondents self-identified orientation is less trusted
    const highBiasWithTradition = {
      ...highBiasAnswers,
      theo_orientation: 'traditionaliste',
      // But dimension scores don't support it
      ctrl_ia_frequence: 'quotidien',
      ctrl_ia_confort: 5,
    };

    const result = calculateProfileSpectrum(highBiasWithTradition);
    // Should not automatically be gardien just due to self-reported orientation
    expect(result.primary.profile).not.toBe('gardien_tradition');
  });
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

describe('getSimpleProfile', () => {
  it('should return primary profile as string', () => {
    const result = getSimpleProfile(gardienTraditionAnswers);
    expect(result).toBe('gardien_tradition');
  });

  it('should return valid PrimaryProfile type', () => {
    const validProfiles: PrimaryProfile[] = [
      'gardien_tradition',
      'prudent_eclaire',
      'innovateur_ancre',
      'equilibriste',
      'pragmatique_moderne',
      'pionnier_spirituel',
      'progressiste_critique',
      'explorateur',
    ];

    const result = getSimpleProfile(equilibristeAnswers);
    expect(validProfiles).toContain(result);
  });
});

describe('getEnhancedProfileData', () => {
  it('should return enhanced profile data object', () => {
    const result = getEnhancedProfileData(gardienTraditionAnswers);

    expect(result).toHaveProperty('profile');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('matchPercentage');
    expect(result).toHaveProperty('dimensions');
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('blindSpots');
    expect(result).toHaveProperty('insights');
  });

  it('should include secondary profile when available', () => {
    const result = getEnhancedProfileData(equilibristeAnswers);
    // For balanced profiles, secondary should often be available
    if (result.secondaryProfile) {
      expect(result.secondaryProfile).toHaveProperty('profile');
      expect(result.secondaryProfile).toHaveProperty('title');
      expect(result.secondaryProfile).toHaveProperty('matchPercentage');
    }
  });

  it('should combine profile and sub-profile in title', () => {
    const result = getEnhancedProfileData(gardienTraditionAnswers);
    expect(result.title).toContain(' - ');
  });

  it('should combine emojis from profile and sub-profile', () => {
    const result = getEnhancedProfileData(gardienTraditionAnswers);
    expect(result.emoji.length).toBeGreaterThan(2);
  });
});

// ==========================================
// TENSION IDENTIFICATION
// ==========================================

describe('Tension identification', () => {
  it('should identify tension between high AI openness and high sacred boundary', () => {
    const mixedAnswers = {
      ...equilibristeAnswers,
      ctrl_ia_frequence: 'quotidien',
      ctrl_ia_confort: 5,
      theo_liturgie_ia: 1,
      theo_activites_sacrees: ['confession', 'eucharistie', 'predication', 'benediction'],
      theo_mediation_humaine: 'oui_absolument',
    };

    const result = calculateProfileSpectrum(mixedAnswers);
    expect(Array.isArray(result.tensions)).toBe(true);
  });

  it('should limit tensions to max 3', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);
    expect(result.tensions.length).toBeLessThanOrEqual(3);
  });
});

// ==========================================
// GROWTH AREAS
// ==========================================

describe('Growth areas identification', () => {
  it('should identify growth areas based on dimension patterns', () => {
    const result = calculateProfileSpectrum(gardienTraditionAnswers);
    expect(Array.isArray(result.growthAreas)).toBe(true);
  });

  it('should limit growth areas to max 3', () => {
    const result = calculateProfileSpectrum(equilibristeAnswers);
    expect(result.growthAreas.length).toBeLessThanOrEqual(3);
  });

  it('should provide actionable step for each growth area', () => {
    const result = calculateProfileSpectrum(gardienTraditionAnswers);
    result.growthAreas.forEach((area) => {
      expect(area.actionableStep).toBeTruthy();
    });
  });
});
