/**
 * Persona recovery simulation (docs/SCORING_V2_SPEC.md §1.5).
 *
 * 250 simulated respondents per persona, drawn around a target level per
 * dimension with gaussian noise (sd 0.7 on a 1-5 item scale, i.e. roughly one
 * option of drift per item). The three non-balanced personas must recover
 * their target profile as rank 1 in at least 80 % of the draws.
 *
 * Tuning performed to reach that bar (all in profiles.ts / constants.ts):
 * - prudent_eclaire: ideal aiOpenness widened to [2, 3.5] and a +0.9 bonus for
 *   "high boundary but still a user", so that a selective user is not absorbed
 *   by gardien_tradition;
 * - gardien_tradition: its +0.8 pattern bonus now also requires a low
 *   futureOrientation, which is what separates it from prudent_eclaire;
 * - progressiste_critique: its ethical-concern bonus is gated on
 *   psychologicalPerception >= 3, otherwise it captured every cautious
 *   respondent with a high ethical score;
 * - equilibriste: ranges tightened to 2.75-3.25 on its 4 central dimensions
 *   (per spec) and the "centred" bonus raised to compensate.
 *
 * Recovery rates at seed 20260907: traditionaliste 100 %, innovateur 91.6 %,
 * prudent 86.4 %, equilibre 52 % (the balanced persona is only asserted to be
 * modal: with the tightened ranges it is deliberately hard to capture, which
 * is the point of the tightening).
 */

import { describe, it, expect } from 'vitest';
import { calculateProfileSpectrum } from '../profiles';
import { PERSONAS, generateCohort } from './personas';

const COHORT_SIZE = 250;
const SEED = 20260907;
const RECOVERY_THRESHOLD = 0.8;

function recoveryRate(personaIndex: number): { rate: number; distribution: Map<string, number> } {
  const persona = PERSONAS[personaIndex];
  const cohort = generateCohort(persona, COHORT_SIZE, SEED);
  const distribution = new Map<string, number>();
  let hits = 0;

  for (const answers of cohort) {
    const primary = calculateProfileSpectrum(answers).primary?.profile ?? 'aucun';
    distribution.set(primary, (distribution.get(primary) ?? 0) + 1);
    if (primary === persona.targetProfile) hits++;
  }

  return { rate: hits / cohort.length, distribution };
}

describe('persona recovery', () => {
  for (const [index, persona] of PERSONAS.entries()) {
    if (persona.name === 'equilibre') continue;

    it(`recovers ${persona.targetProfile} for the "${persona.name}" persona in >= 80 % of draws`, () => {
      const { rate, distribution } = recoveryRate(index);
      expect(
        rate,
        `distribution: ${[...distribution.entries()].map(([k, v]) => `${k}=${v}`).join(' ')}`,
      ).toBeGreaterThanOrEqual(RECOVERY_THRESHOLD);
    });
  }

  it('always attributes a profile when the questionnaire is complete', () => {
    for (const [index] of PERSONAS.entries()) {
      const { distribution } = recoveryRate(index);
      expect(distribution.get('aucun')).toBeUndefined();
    }
  });

  it('keeps the balanced persona modal on equilibriste', () => {
    const balancedIndex = PERSONAS.findIndex((persona) => persona.name === 'equilibre');
    const { distribution } = recoveryRate(balancedIndex);
    const ranked = [...distribution.entries()].sort((a, b) => b[1] - a[1]);
    expect(ranked[0][0]).toBe('equilibriste');
  });

  it('is deterministic for a given seed', () => {
    const first = recoveryRate(0).rate;
    const second = recoveryRate(0).rate;
    expect(second).toBe(first);
  });
});
