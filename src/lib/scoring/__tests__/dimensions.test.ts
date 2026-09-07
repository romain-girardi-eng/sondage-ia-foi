import { describe, it, expect } from 'vitest';
import {
  calculateAllDimensions,
  calculateReligiosityDimension,
  calculateAIOpennessDimension,
  calculateSacredBoundaryDimension,
  calculateCommunityContextDimension,
  calculateFutureOrientationDimension,
  computeCoreSubscores,
  scoreItem,
  isMissing,
  DIMENSION_KEYS,
  DIMENSION_ITEMS,
  MIN_ITEMS,
  MIN_ITEMS_RELIGIOSITY,
} from '../dimensions';
import {
  moderateAnswers,
  gardienTraditionAnswers,
  pionnierSpirituelAnswers,
  clergyAnswers,
  laypersonAnswers,
  crsOnlyAnswers,
  emptyAnswers,
  allMissingAnswers,
  highSocialDesirabilityAnswers,
  lowSocialDesirabilityAnswers,
  nonOrdainedLeaderAnswers,
} from './fixtures';
import type { Answers } from '@/data';

describe('missing values', () => {
  it('treats documented codes, empty strings and undefined as missing', () => {
    expect(isMissing(undefined)).toBe(true);
    expect(isMissing('')).toBe(true);
    expect(isMissing('ne_sait_pas')).toBe(true);
    expect(isMissing('sans_reponse')).toBe(true);
    expect(isMissing([])).toBe(true);
    expect(isMissing('souvent')).toBe(false);
    expect(isMissing(3)).toBe(false);
  });

  it('never imputes a missing item into the mean', () => {
    const withMissing: Answers = { ...moderateAnswers, theo_inspiration: 'ne_sait_pas' };
    const full = calculateSacredBoundaryDimension(moderateAnswers);
    const partial = calculateSacredBoundaryDimension(withMissing);
    expect(partial.nItems).toBe(full.nItems - 1);
    expect(partial.maxItems).toBe(full.maxItems);
  });

  it('yields null everywhere when every scored item is a missing code', () => {
    const dimensions = calculateAllDimensions(allMissingAnswers);
    for (const key of DIMENSION_KEYS) {
      expect(dimensions[key].value).toBeNull();
      expect(dimensions[key].nItems).toBe(0);
    }
  });
});

describe('religiosity (raw CRS-5)', () => {
  it('is the unweighted mean of the answered CRS-5 items', () => {
    const answers: Answers = {
      crs_intellect: 'tres_souvent', // 5
      crs_ideology: 'moderement', // 3
      crs_public_practice: 'mensuel', // 4
      crs_private_practice: 'rarement', // 2
      crs_experience: 'souvent', // 4
    };
    const score = calculateReligiosityDimension(answers);
    expect(score.value).toBeCloseTo((5 + 3 + 4 + 2 + 4) / 5, 5);
    expect(score.nItems).toBe(5);
    expect(score.maxItems).toBe(5);
    expect(score.confidence).toBe(1);
  });

  it('scores quotidien and pluri_quotidien identically (Huber recoding)', () => {
    const daily = scoreItem('crs_private_practice', { crs_private_practice: 'quotidien' });
    const multiDaily = scoreItem('crs_private_practice', { crs_private_practice: 'pluri_quotidien' });
    expect(daily).toBe(5);
    expect(multiDaily).toBe(5);
  });

  it('requires 4 items', () => {
    const three: Answers = {
      crs_intellect: 'souvent',
      crs_ideology: 'beaucoup',
      crs_experience: 'souvent',
    };
    expect(calculateReligiosityDimension(three).value).toBeNull();
    expect(MIN_ITEMS_RELIGIOSITY).toBe(4);

    const four: Answers = { ...three, crs_public_practice: 'mensuel' };
    expect(calculateReligiosityDimension(four).value).not.toBeNull();
  });

  it('is unaffected by Marlowe-Crowne answers', () => {
    const biased = calculateReligiosityDimension(highSocialDesirabilityAnswers);
    const unbiased = calculateReligiosityDimension(lowSocialDesirabilityAnswers);
    expect(biased.value).toBe(unbiased.value);
  });

  it('leaves every other dimension untouched by Marlowe-Crowne answers', () => {
    const biased = calculateAllDimensions(highSocialDesirabilityAnswers);
    const unbiased = calculateAllDimensions(lowSocialDesirabilityAnswers);
    for (const key of DIMENSION_KEYS) {
      expect(biased[key].value).toBe(unbiased[key].value);
    }
  });
});

describe('one item, one dimension', () => {
  it('never lists the same question id in two dimensions', () => {
    const seen = new Map<string, string>();
    for (const key of DIMENSION_KEYS) {
      for (const itemId of DIMENSION_ITEMS[key]) {
        expect(seen.has(itemId)).toBe(false);
        seen.set(itemId, key);
      }
    }
  });

  it('excludes demographics and theo_risque_futur from every dimension', () => {
    const excluded = [
      'profil_age',
      'profil_statut',
      'profil_taille_communaute',
      'profil_genre',
      'profil_formation_theologique',
      'theo_risque_futur',
      'theo_orientation',
    ];
    const all = DIMENSION_KEYS.flatMap((key) => DIMENSION_ITEMS[key]);
    for (const itemId of excluded) {
      expect(all).not.toContain(itemId);
    }
  });
});

describe('confidence and routing', () => {
  it('counts clergy items in maxItems only for clergy', () => {
    const clergy = calculateSacredBoundaryDimension(clergyAnswers);
    const lay = calculateSacredBoundaryDimension(laypersonAnswers);
    expect(clergy.maxItems).toBeGreaterThan(4);
    expect(lay.maxItems).toBeGreaterThan(4);
    expect(clergy.maxItems).not.toBe(0);
  });

  it('routes responsable_non_ordonne through the clergy branch', () => {
    const score = calculateSacredBoundaryDimension(nonOrdainedLeaderAnswers);
    expect(score.nItems).toBeGreaterThan(4);
  });

  it('never exceeds a confidence of 1', () => {
    for (const answers of [moderateAnswers, clergyAnswers, laypersonAnswers, emptyAnswers]) {
      const dimensions = calculateAllDimensions(answers);
      for (const key of DIMENSION_KEYS) {
        expect(dimensions[key].confidence).toBeGreaterThanOrEqual(0);
        expect(dimensions[key].confidence).toBeLessThanOrEqual(1);
        expect(dimensions[key].nItems).toBeLessThanOrEqual(dimensions[key].maxItems);
      }
    }
  });

  it('drops ctrl_ia_contextes from maxItems when the respondent never uses AI', () => {
    const never = calculateAIOpennessDimension({
      ctrl_ia_frequence: 'jamais',
      ctrl_ia_confort: 1,
      digital_attitude_generale: 'negatif',
    });
    const user = calculateAIOpennessDimension({
      ctrl_ia_frequence: 'regulier',
      ctrl_ia_confort: 4,
      digital_attitude_generale: 'positif',
      ctrl_ia_contextes: ['travail_pro'],
    });
    expect(never.maxItems).toBe(3);
    expect(user.maxItems).toBe(4);
  });
});

describe('percentiles', () => {
  it('is always null client-side', () => {
    const dimensions = calculateAllDimensions(moderateAnswers);
    for (const key of DIMENSION_KEYS) {
      expect(dimensions[key].percentile).toBeNull();
    }
  });
});

describe('dimension direction', () => {
  it('puts the traditional profile high on sacredBoundary and low on aiOpenness', () => {
    const dimensions = calculateAllDimensions(gardienTraditionAnswers);
    expect(dimensions.sacredBoundary.value).toBeGreaterThanOrEqual(4);
    expect(dimensions.aiOpenness.value).toBeLessThanOrEqual(2);
    expect(dimensions.religiosity.value).toBeGreaterThanOrEqual(4);
  });

  it('puts the pioneer profile low on sacredBoundary and high on aiOpenness', () => {
    const dimensions = calculateAllDimensions(pionnierSpirituelAnswers);
    expect(dimensions.sacredBoundary.value).toBeLessThanOrEqual(2);
    expect(dimensions.aiOpenness.value).toBeGreaterThanOrEqual(4);
  });

  it('scores communityContext on valence, not on awareness', () => {
    const favourable = calculateCommunityContextDimension({
      communaute_position_officielle: 'oui_favorable',
      communaute_perception_pairs: 'tres_favorable',
      communaute_discussions: 'souvent',
    });
    const hostile = calculateCommunityContextDimension({
      communaute_position_officielle: 'oui_defavorable',
      communaute_perception_pairs: 'hostile',
      communaute_discussions: 'souvent',
    });
    expect(favourable.value).toBeGreaterThan(hostile.value as number);
  });

  it('treats "no official position" and "ne sait pas" as missing on communityContext', () => {
    const noPosition = calculateCommunityContextDimension({
      communaute_position_officielle: 'non',
      communaute_perception_pairs: 'neutre',
      communaute_discussions: 'parfois',
    });
    expect(noPosition.nItems).toBe(2);
    expect(scoreItem('communaute_position_officielle', { communaute_position_officielle: 'non' })).toBeNull();
    expect(
      scoreItem('communaute_perception_pairs', { communaute_perception_pairs: 'ne_sait_pas' }),
    ).toBeNull();
  });

  it('scores opinions_variees at the midpoint on peer perception', () => {
    expect(
      scoreItem('communaute_perception_pairs', { communaute_perception_pairs: 'opinions_variees' }),
    ).toBe(3);
  });

  it('reads the exclusive "aucun_domaines" option on futur_domaines_interet', () => {
    const none = calculateFutureOrientationDimension({
      futur_intention_usage: 'non_certain',
      futur_formation_souhait: 'non_pas_du_tout',
      futur_domaines_interet: ['aucun_domaines'],
    });
    expect(scoreItem('futur_domaines_interet', { futur_domaines_interet: ['aucun_domaines'] })).toBe(1);
    expect(none.value).toBe(1);
  });

  it('scores min_care_email with "non" as the strongest boundary', () => {
    expect(scoreItem('min_care_email', { min_care_email: 'non' })).toBe(5);
    expect(scoreItem('min_care_email', { min_care_email: 'oui_relu' })).toBe(3);
    expect(scoreItem('min_care_email', { min_care_email: 'oui_tel_quel' })).toBe(1);
  });

  it('accepts sans_reponse on any item', () => {
    for (const key of DIMENSION_KEYS) {
      for (const itemId of DIMENSION_ITEMS[key]) {
        expect(scoreItem(itemId, { [itemId]: 'sans_reponse' })).toBeNull();
      }
    }
  });
});

describe('core sub-scores', () => {
  it('uses universal items only', () => {
    const clergyCore = computeCoreSubscores(clergyAnswers);
    const layCore = computeCoreSubscores(laypersonAnswers);
    expect(clergyCore.sacredBoundaryCore.maxItems).toBe(4);
    expect(layCore.sacredBoundaryCore.maxItems).toBe(4);
    expect(clergyCore.aiOpennessCore.maxItems).toBe(3);
    expect(layCore.aiOpennessCore.maxItems).toBe(3);
  });

  it('returns null below the minimum item count', () => {
    const core = computeCoreSubscores({ theo_inspiration: 'impossible' });
    expect(core.sacredBoundaryCore.value).toBeNull();
    expect(MIN_ITEMS).toBe(2);
  });
});

describe('empty and partial answers', () => {
  it('returns all-null dimensions for an empty answers object', () => {
    const dimensions = calculateAllDimensions(emptyAnswers);
    for (const key of DIMENSION_KEYS) {
      expect(dimensions[key].value).toBeNull();
      expect(dimensions[key].nItems).toBe(0);
      expect(dimensions[key].confidence).toBe(0);
    }
  });

  it('values religiosity alone when only CRS-5 was answered', () => {
    const dimensions = calculateAllDimensions(crsOnlyAnswers);
    expect(dimensions.religiosity.value).not.toBeNull();
    for (const key of DIMENSION_KEYS.filter((k) => k !== 'religiosity')) {
      expect(dimensions[key].value).toBeNull();
    }
  });
});
