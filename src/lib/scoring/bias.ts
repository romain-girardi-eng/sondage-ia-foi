/**
 * Social desirability - ad hoc selection of 5 Marlowe-Crowne items
 * (Crowne & Marlowe, 1960). This is NOT a validated short form: the 5 items
 * were picked for length, so the score is a covariate flag, never a correction
 * factor. No dimension score is ever deflated by it.
 */

import type { Answers } from '@/data';
import type { SocialDesirability } from './types';

/** Answer that indicates the socially desirable ("keyed") direction */
export const MC_KEYED_RESPONSES: Record<string, string> = {
  ctrl_mc_1: 'false', // never needs encouragement to get going
  ctrl_mc_2: 'true',  // never intensely disliked anyone
  ctrl_mc_3: 'false', // never rebels against authority
  ctrl_mc_4: 'true',  // always courteous
  ctrl_mc_5: 'false', // never took advantage of anyone
};

export const MC_ITEM_IDS: string[] = Object.keys(MC_KEYED_RESPONSES);

/** Minimum answered items before the score is interpretable */
export const MC_MIN_ITEMS = 4;

/** Endorsement share at or above which the response set is flagged */
export const MC_FLAG_THRESHOLD = 0.8;

export function calculateSocialDesirability(answers: Answers): SocialDesirability {
  let endorsed = 0;
  let nItems = 0;

  for (const [itemId, keyed] of Object.entries(MC_KEYED_RESPONSES)) {
    const answer = answers[itemId];
    if (typeof answer !== 'string') continue;
    if (answer === '' || answer === 'sans_reponse' || answer === 'ne_sait_pas') continue;
    nItems++;
    if (answer === keyed) endorsed++;
  }

  if (nItems < MC_MIN_ITEMS) {
    return { score: null, nItems, flag: false };
  }

  const score = endorsed / nItems;
  return { score, nItems, flag: score >= MC_FLAG_THRESHOLD };
}
