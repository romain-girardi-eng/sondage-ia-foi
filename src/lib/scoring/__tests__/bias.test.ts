import { describe, it, expect } from 'vitest';
import {
  calculateSocialDesirability,
  MC_ITEM_IDS,
  MC_KEYED_RESPONSES,
  MC_MIN_ITEMS,
} from '../bias';
import * as bias from '../bias';
import {
  highSocialDesirabilityAnswers,
  lowSocialDesirabilityAnswers,
  emptyAnswers,
} from './fixtures';
import type { Answers } from '@/data';

function keyed(count: number): Answers {
  const answers: Answers = {};
  MC_ITEM_IDS.forEach((itemId, index) => {
    const keyedValue = MC_KEYED_RESPONSES[itemId];
    answers[itemId] = index < count ? keyedValue : keyedValue === 'true' ? 'false' : 'true';
  });
  return answers;
}

describe('calculateSocialDesirability', () => {
  it('returns 1 when every item is answered in the keyed direction', () => {
    const result = calculateSocialDesirability(highSocialDesirabilityAnswers);
    expect(result.score).toBe(1);
    expect(result.nItems).toBe(5);
    expect(result.flag).toBe(true);
  });

  it('returns 0 when no item is answered in the keyed direction', () => {
    const result = calculateSocialDesirability(lowSocialDesirabilityAnswers);
    expect(result.score).toBe(0);
    expect(result.flag).toBe(false);
  });

  it('normalises to the number of answered items', () => {
    const result = calculateSocialDesirability(keyed(3));
    expect(result.nItems).toBe(5);
    expect(result.score).toBeCloseTo(0.6, 5);
    expect(result.flag).toBe(false);
  });

  it('flags at 4 out of 5', () => {
    const result = calculateSocialDesirability(keyed(4));
    expect(result.score).toBeCloseTo(0.8, 5);
    expect(result.flag).toBe(true);
  });

  it('returns a null score below the minimum answered items', () => {
    const partial: Answers = { ctrl_mc_1: 'false', ctrl_mc_2: 'true', ctrl_mc_3: 'false' };
    const result = calculateSocialDesirability(partial);
    expect(result.nItems).toBe(3);
    expect(result.nItems).toBeLessThan(MC_MIN_ITEMS);
    expect(result.score).toBeNull();
    expect(result.flag).toBe(false);
  });

  it('returns a null score and no flag for empty answers', () => {
    const result = calculateSocialDesirability(emptyAnswers);
    expect(result).toEqual({ score: null, nItems: 0, flag: false });
  });

  it('excludes sans_reponse from the denominator', () => {
    const answers: Answers = { ...keyed(5), ctrl_mc_5: 'sans_reponse' };
    const result = calculateSocialDesirability(answers);
    expect(result.nItems).toBe(4);
    expect(result.score).toBe(1);
  });
});

describe('no bias correction survives', () => {
  it('exports neither adjustScoreForBias nor getBiasConfidenceMultiplier', () => {
    expect('adjustScoreForBias' in bias).toBe(false);
    expect('getBiasConfidenceMultiplier' in bias).toBe(false);
  });
});
