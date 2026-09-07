/**
 * Usage gap (docs/SCORING_V2_SPEC.md §1.7)
 *
 * Replaces the former "spiritual resistance index". It is a descriptive,
 * ordinal comparison of declared general AI use against declared use inside
 * the spiritual/ministry domain. No motivational inference is attached to it:
 * a gap is an observation, not a resistance.
 */

import type { Answers } from '@/data';
import type { UsageGap } from './types';
import { getStringAnswer, getArrayAnswer } from '@/lib/utils/answers';

const SPIRITUAL_CONTEXT = 'spirituel';

function usesAIGenerally(answers: Answers): boolean | null {
  const freq = getStringAnswer(answers, 'ctrl_ia_frequence');
  if (freq === '' || freq === 'sans_reponse' || freq === 'ne_sait_pas') return null;
  return freq !== 'jamais';
}

function usesAISpiritually(answers: Answers): boolean {
  if (getArrayAnswer(answers, 'ctrl_ia_contextes').includes(SPIRITUAL_CONTEXT)) return true;

  const predUsage = getStringAnswer(answers, 'min_pred_usage');
  if (predUsage !== '' && predUsage !== 'jamais') return true;

  const careEmail = getStringAnswer(answers, 'min_care_email');
  if (careEmail === 'oui_relu' || careEmail === 'oui_tel_quel') return true;
  if (careEmail === 'oui_brouillon' || careEmail === 'oui_souvent') return true; // v1

  const priere = getStringAnswer(answers, 'laic_substitution_priere');
  if (priere.startsWith('oui')) return true;

  return getStringAnswer(answers, 'laic_conseil_spirituel') === 'deja_fait';
}

/**
 * 'none' means undetermined: the general-usage item is missing, so no gap can
 * be computed. Spiritual use declared without any general use is reported as
 * 'uses_both' (the respondent does use AI).
 */
export function computeUsageGap(answers: Answers): UsageGap {
  const general = usesAIGenerally(answers);
  const spiritual = usesAISpiritually(answers);

  if (general === null) return spiritual ? 'uses_both' : 'none';
  if (general && spiritual) return 'uses_both';
  if (general && !spiritual) return 'uses_general_not_spiritual';
  if (!general && spiritual) return 'uses_both';
  return 'no_use';
}
