/**
 * Rendering rules for values the API is allowed to withhold.
 *
 * A suppressed cell says why it is empty: « n < 5 » when the segment is too
 * small to publish (SCORING_V2_SPEC §1.8), « — » when the value simply could
 * not be computed. Neither is ever replaced by a number.
 */

import { MIN_SEGMENT_N } from '@/lib/admin';
import { frNumber } from '@/lib/analysis';

export const NOT_AVAILABLE = '—';
export const SUPPRESSED = `n < ${MIN_SEGMENT_N}`;

export interface NullableFormatOptions {
  /** Effectif du segment, quand il est connu : décide entre « n < 5 » et « — ». */
  count?: number;
  digits?: number;
}

/** Formate une valeur nullable en français, sans jamais inventer de nombre. */
export function formatNullable(
  value: number | null | undefined,
  { count, digits = 2 }: NullableFormatOptions = {},
): string {
  if (typeof value === 'number' && Number.isFinite(value)) return frNumber(value, digits);
  if (typeof count === 'number' && count < MIN_SEGMENT_N) return SUPPRESSED;
  return NOT_AVAILABLE;
}

/** Écart-type, préfixé de ± seulement quand il existe. */
export function formatStdDev(value: number | null | undefined, count?: number): string {
  const formatted = formatNullable(value, { count });
  return formatted === NOT_AVAILABLE || formatted === SUPPRESSED ? formatted : `±${formatted}`;
}

/** Différence entre deux moyennes, null dès que l'une des deux manque. */
export function difference(a: number | null | undefined, b: number | null | undefined): number | null {
  if (typeof a !== 'number' || typeof b !== 'number') return null;
  return a - b;
}

/**
 * Répondants sans profil attribué, en résidu : l'endpoint ne publie que les
 * profils attribués. Le résidu inclut les parcours dépistés (screen-out) et les
 * répondants dont moins de quatre dimensions ont pu être valuées (§1.5).
 */
export function unattributedCount(
  profiles: Record<string, number>,
  completedResponses: number,
): number {
  const attributed = Object.values(profiles).reduce((sum, count) => sum + count, 0);
  return Math.max(0, completedResponses - attributed);
}

/**
 * Libellés FR de l'écart d'usage ordinal (§1.7).
 *
 * `none` ne veut pas dire « aucun écart » : c'est le cas où l'item d'usage
 * général est manquant, donc où aucun écart ne peut être calculé. Le libeller
 * comme une absence d'écart transformait une donnée manquante en résultat.
 */
export const USAGE_GAP_LABELS: Record<string, string> = {
  none: 'Non calculable (usage général non renseigné)',
  uses_general_not_spiritual: 'Usage général, pas spirituel',
  uses_both: 'Usage général et spirituel',
  no_use: 'Aucun usage',
};

export function usageGapLabel(key: string): string {
  return USAGE_GAP_LABELS[key] ?? key;
}
