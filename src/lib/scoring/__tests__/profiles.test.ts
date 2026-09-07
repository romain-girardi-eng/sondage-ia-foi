import { describe, it, expect } from 'vitest';
import { calculateProfileSpectrum, getSimpleProfile, getEnhancedProfileData } from '../profiles';
import { PROFILE_DEFINITIONS, SUB_PROFILE_DEFINITIONS } from '../constants';
import { DIMENSION_KEYS } from '../dimensions';
import type { PrimaryProfile } from '../types';
import {
  moderateAnswers,
  gardienTraditionAnswers,
  pionnierSpirituelAnswers,
  progressisteCritiqueAnswers,
  explorateurAnswers,
  crsOnlyAnswers,
  emptyAnswers,
} from './fixtures';
import type { Answers } from '@/data';

describe('spectrum shape', () => {
  it('exposes the 8 profiles sorted by raw score, without normalising to 100', () => {
    const spectrum = calculateProfileSpectrum(moderateAnswers);
    expect(spectrum.allMatches).toHaveLength(8);
    for (let i = 1; i < spectrum.allMatches.length; i++) {
      expect(spectrum.allMatches[i - 1].matchScore).toBeGreaterThanOrEqual(
        spectrum.allMatches[i].matchScore,
      );
    }
    const total = spectrum.allMatches.reduce((sum, m) => sum + m.matchScore, 0);
    expect(total).not.toBeCloseTo(100, 5);
  });

  it('keeps raw (unrounded) match scores', () => {
    const spectrum = calculateProfileSpectrum(moderateAnswers);
    const hasFraction = spectrum.allMatches.some((m) => !Number.isInteger(m.matchScore));
    expect(hasFraction).toBe(true);
  });

  it('labels the attribution as heuristic and carries the v2 payload', () => {
    const spectrum = calculateProfileSpectrum(moderateAnswers);
    expect(spectrum.attribution).toBe('heuristic');
    expect(['low', 'medium', 'high']).toContain(spectrum.profileConfidence);
    expect(spectrum.core).toHaveProperty('sacredBoundaryCore');
    expect(spectrum.core).toHaveProperty('aiOpennessCore');
    expect(spectrum.socialDesirability).toHaveProperty('flag');
    expect(['none', 'uses_general_not_spiritual', 'uses_both', 'no_use']).toContain(
      spectrum.usageGap,
    );
    for (const key of DIMENSION_KEYS) {
      expect(spectrum.dimensions).toHaveProperty(key);
    }
  });
});

describe('no profile without enough dimensions', () => {
  it('returns primary === null for empty answers', () => {
    const spectrum = calculateProfileSpectrum(emptyAnswers);
    expect(spectrum.primary).toBeNull();
    expect(spectrum.subProfile).toBeNull();
    expect(spectrum.interpretation).toBeNull();
    expect(spectrum.profileConfidence).toBe('low');
    expect(getSimpleProfile(emptyAnswers)).toBeNull();
  });

  it('returns primary === null when only religiosity is valued', () => {
    expect(calculateProfileSpectrum(crsOnlyAnswers).primary).toBeNull();
  });

  it('returns a primary once at least 4 dimensions are valued', () => {
    expect(calculateProfileSpectrum(moderateAnswers).primary).not.toBeNull();
  });
});

describe('primary assignment on archetypal answers', () => {
  const cases: Array<[string, Answers, PrimaryProfile]> = [
    ['gardien_tradition', gardienTraditionAnswers, 'gardien_tradition'],
    ['pionnier_spirituel', pionnierSpirituelAnswers, 'pionnier_spirituel'],
    ['progressiste_critique', progressisteCritiqueAnswers, 'progressiste_critique'],
    ['explorateur', explorateurAnswers, 'explorateur'],
  ];

  for (const [name, answers, expected] of cases) {
    it(`assigns ${name}`, () => {
      expect(calculateProfileSpectrum(answers).primary?.profile).toBe(expected);
    });
  }
});

describe('deterministic ordering', () => {
  it('produces the exact same ranking on repeated calls', () => {
    const first = calculateProfileSpectrum(moderateAnswers).allMatches.map((m) => m.profile);
    const second = calculateProfileSpectrum(moderateAnswers).allMatches.map((m) => m.profile);
    expect(second).toEqual(first);
  });

  it('breaks exact ties alphabetically when confidences are equal', () => {
    // Symmetrical answers: several profiles land on the same score, and the
    // tie-break must be stable rather than dependent on object key order.
    const spectrum = calculateProfileSpectrum(moderateAnswers);
    const groups = new Map<number, string[]>();
    for (const match of spectrum.allMatches) {
      const bucket = groups.get(match.matchScore) ?? [];
      bucket.push(match.profile);
      groups.set(match.matchScore, bucket);
    }
    for (const bucket of groups.values()) {
      if (bucket.length > 1) {
        expect(bucket).toEqual([...bucket].sort((a, b) => a.localeCompare(b)));
      }
    }
  });
});

describe('sub-profiles', () => {
  it('picks a sub-profile that belongs to the primary profile', () => {
    for (const answers of [gardienTraditionAnswers, pionnierSpirituelAnswers, moderateAnswers]) {
      const spectrum = calculateProfileSpectrum(answers);
      const primary = spectrum.primary?.profile;
      expect(primary).toBeDefined();
      const subId = spectrum.subProfile?.subProfile;
      expect(subId).toBeDefined();
      expect(PROFILE_DEFINITIONS[primary as PrimaryProfile].subProfiles).toContain(subId);
      expect(SUB_PROFILE_DEFINITIONS[subId!].description.length).toBeGreaterThan(0);
    }
  });
});

describe('descriptions carry no Barnum phrasing', () => {
  const banned = [
    "n'est pas",
    'rare et précieux',
    'sagesse',
    'exceptionnel',
    '15 %',
    '15%',
    'les plus ouverts',
  ];

  it('avoids banned phrasing in profile and sub-profile texts', () => {
    const texts: string[] = [];
    for (const def of Object.values(PROFILE_DEFINITIONS)) {
      texts.push(def.shortDescription, def.fullDescription, def.coreMotivation, def.primaryFear);
    }
    for (const def of Object.values(SUB_PROFILE_DEFINITIONS)) {
      texts.push(def.description, ...def.distinguishingTraits);
    }
    for (const text of texts) {
      for (const phrase of banned) {
        expect(text.toLowerCase()).not.toContain(phrase.toLowerCase());
      }
    }
  });

  it('avoids banned phrasing in generated insights', () => {
    for (const answers of [gardienTraditionAnswers, pionnierSpirituelAnswers, moderateAnswers]) {
      for (const insight of calculateProfileSpectrum(answers).insights) {
        for (const phrase of banned) {
          expect(insight.message.toLowerCase()).not.toContain(phrase.toLowerCase());
        }
      }
    }
  });
});

describe('French typography in user-facing strings', () => {
  it('uses non-breaking spaces before : ; ? ! and %', () => {
    const texts: string[] = [];
    for (const def of Object.values(PROFILE_DEFINITIONS)) {
      texts.push(def.title, def.shortDescription, def.fullDescription, def.coreMotivation, def.primaryFear, def.communicationStyle);
    }
    for (const def of Object.values(SUB_PROFILE_DEFINITIONS)) {
      texts.push(def.title, def.description, ...def.distinguishingTraits);
    }
    for (const spectrum of [
      calculateProfileSpectrum(gardienTraditionAnswers),
      calculateProfileSpectrum(pionnierSpirituelAnswers),
    ]) {
      for (const insight of spectrum.insights) texts.push(insight.title, insight.message);
      if (spectrum.interpretation) {
        texts.push(
          spectrum.interpretation.headline,
          spectrum.interpretation.narrative,
          ...spectrum.interpretation.uniqueAspects,
          ...spectrum.interpretation.blindSpots,
        );
      }
    }
    for (const text of texts) {
      expect(text).not.toMatch(/ [:;?!%]/);
    }
  });
});

describe('accessors', () => {
  it('exposes enhanced data with a rounded match percentage', () => {
    const data = getEnhancedProfileData(gardienTraditionAnswers);
    expect(data.profile).toBe('gardien_tradition');
    expect(Number.isInteger(data.matchPercentage)).toBe(true);
    expect(data.attribution).toBe('heuristic');
  });

  it('degrades gracefully when no profile can be attributed', () => {
    const data = getEnhancedProfileData(emptyAnswers);
    expect(data.profile).toBeNull();
    expect(data.matchPercentage).toBeNull();
    expect(data.strengths).toEqual([]);
  });
});
