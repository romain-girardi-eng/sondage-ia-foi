/**
 * Client-side helpers for the empirical norms served by GET /api/results/norms
 * (docs/SCORING_V2_SPEC.md §1.6 and §3).
 *
 * Model-based percentiles are gone: a respondent is never told they are in the
 * "top X %" of a hypothetical population. The only comparison shown is an
 * empirical rank against the participants actually collected, and only once
 * that dimension reaches MIN_PARTICIPANTS_FOR_COMPARISON respondents.
 */

import type { DimensionKey } from '@/lib/scoring/types';

/** Below this many respondents on a dimension, no comparison is displayed. */
export const MIN_PARTICIPANTS_FOR_COMPARISON = 30;

export interface DimensionNorm {
  n: number;
  /** Percentiles 1 to 99, ascending. */
  quantiles: number[];
}

export type NormsResponse =
  | { mode: 'insufficient'; n: number }
  | {
      mode: 'ready';
      n: number;
      instrumentVersion: string;
      dimensions: Partial<Record<DimensionKey, DimensionNorm>>;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseDimensionNorm(value: unknown): DimensionNorm | null {
  if (!isRecord(value)) return null;
  const { n, quantiles } = value;
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  if (!Array.isArray(quantiles)) return null;
  const parsed = quantiles.filter(
    (q): q is number => typeof q === 'number' && Number.isFinite(q),
  );
  if (parsed.length !== quantiles.length) return null;
  return { n, quantiles: parsed };
}

/**
 * Defensive parser: the endpoint is public and cached, so the client never
 * trusts its shape. Anything unexpected degrades to `null`, which the UI reads
 * as "no comparison available".
 */
export function parseNormsResponse(payload: unknown): NormsResponse | null {
  if (!isRecord(payload)) return null;

  const n = typeof payload.n === 'number' && Number.isFinite(payload.n) ? payload.n : null;
  if (n === null) return null;

  if (payload.mode === 'insufficient') {
    return { mode: 'insufficient', n };
  }

  if (!isRecord(payload.dimensions)) return null;

  const dimensions: Partial<Record<DimensionKey, DimensionNorm>> = {};
  for (const [key, value] of Object.entries(payload.dimensions)) {
    const norm = parseDimensionNorm(value);
    if (norm) dimensions[key as DimensionKey] = norm;
  }

  return {
    mode: 'ready',
    n,
    instrumentVersion:
      typeof payload.instrumentVersion === 'string' ? payload.instrumentVersion : 'unknown',
    dimensions,
  };
}

/**
 * Empirical rank: the smallest index i such that `score <= quantiles[i]`.
 * With the 99 ascending quantiles served by the endpoint, that index is the
 * number of percentile cut-points the score sits above, i.e. the share of
 * participants the respondent scores above. A score above every cut-point
 * returns `quantiles.length`.
 */
export function computeEmpiricalRank(score: number, quantiles: number[]): number | null {
  if (quantiles.length === 0 || !Number.isFinite(score)) return null;
  const index = quantiles.findIndex((q) => score <= q);
  return index === -1 ? quantiles.length : index;
}

export interface DimensionComparison {
  /** Percentage of participants this score sits above. */
  rank: number;
  /** Number of participants the comparison is computed on. */
  n: number;
}

/**
 * The comparison for one dimension, or `null` when it must not be shown:
 * norms still insufficient, dimension missing, fewer than 30 participants on
 * that dimension, or an unmeasured score.
 */
export function getDimensionComparison(
  norms: NormsResponse | null,
  dimension: DimensionKey,
  score: number | null,
): DimensionComparison | null {
  if (norms === null || norms.mode === 'insufficient') return null;
  if (score === null) return null;

  const norm = norms.dimensions[dimension];
  if (!norm || norm.n < MIN_PARTICIPANTS_FOR_COMPARISON) return null;

  const rank = computeEmpiricalRank(score, norm.quantiles);
  if (rank === null) return null;

  return { rank, n: norm.n };
}
