import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { calculateAllDimensions } from '@/lib/scoring';
import type { Answers } from '@/data';

// Empirical norms replace the former model-based percentiles: a respondent's
// rank is read against the distribution actually observed, never against a
// hypothetical normal population.
const MIN_N_FOR_NORMS = 30;

// Responses collected under v1.x and v2.0.0 are pooled: the item score maps in
// `@/lib/scoring/score-maps` resolve both vocabularies onto the same 1-5 scale,
// so the dimensions are semantically comparable across versions (documented in
// METHODOLOGY.md). What must not be faked is the provenance, so the endpoint
// reports how many rows came from each version instead of stamping a single one.
const UNKNOWN_INSTRUMENT_VERSION = 'unknown';

const DIMENSION_KEYS = [
  'religiosity',
  'aiOpenness',
  'sacredBoundary',
  'ethicalConcern',
  'psychologicalPerception',
  'communityContext',
  'futureOrientation',
] as const;

export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export interface DimensionNorm {
  n: number;
  /** Percentiles 1 to 99, ascending. */
  quantiles: number[];
}

export type NormsApiResponse =
  | { n: number; mode: 'insufficient' }
  | {
      n: number;
      /** Row count per instrument version found in the pool, 'unknown' when absent. */
      instrumentVersions: Record<string, number>;
      dimensions: Record<DimensionKey, DimensionNorm>;
    };

/**
 * Percentile with linear interpolation between order statistics
 * (the "type 7" definition used by R and NumPy).
 */
function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return Number.NaN;
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function quantiles99(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  return Array.from({ length: 99 }, (_, i) => quantile(sorted, (i + 1) / 100));
}

interface NormsRow {
  answers: Record<string, unknown> | null;
  metadata: { instrumentVersion?: string | null } | null;
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = rateLimit(`results:${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const headers = {
      ...getRateLimitHeaders(rateLimitResult),
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
    };

    if (!isServiceRoleConfigured) {
      return NextResponse.json({ n: 0, mode: 'insufficient' as const }, { status: 200, headers });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ n: 0, mode: 'insufficient' as const }, { status: 200, headers });
    }

    const { data, error } = await supabase
      .from('responses')
      .select('answers, metadata')
      .eq('consent_given', true)
      // Screened-out respondents answered no scored item; they must not weigh
      // on the norms.
      .or('metadata->>screenedOut.is.null,metadata->>screenedOut.neq.true');

    if (error) {
      console.error('Norms query error:', error);
      return NextResponse.json({ n: 0, mode: 'insufficient' as const }, { status: 200, headers });
    }

    const rows = (data as NormsRow[] | null) ?? [];

    const perDimension: Record<DimensionKey, number[]> = {
      religiosity: [],
      aiOpenness: [],
      sacredBoundary: [],
      ethicalConcern: [],
      psychologicalPerception: [],
      communityContext: [],
      futureOrientation: [],
    };

    const instrumentVersions: Record<string, number> = {};
    let n = 0;

    for (const row of rows) {
      if (!row.answers) continue;
      n += 1;
      const version = row.metadata?.instrumentVersion;
      const versionKey =
        typeof version === 'string' && version.trim() !== ''
          ? version.trim()
          : UNKNOWN_INSTRUMENT_VERSION;
      instrumentVersions[versionKey] = (instrumentVersions[versionKey] || 0) + 1;
      try {
        const d = calculateAllDimensions(row.answers as Answers);
        const values: Array<[DimensionKey, number | null]> = [
          ['religiosity', d.religiosity.value],
          ['aiOpenness', d.aiOpenness.value],
          ['sacredBoundary', d.sacredBoundary.value],
          ['ethicalConcern', d.ethicalConcern.value],
          ['psychologicalPerception', d.psychologicalPerception.value],
          ['communityContext', d.communityContext.value],
          ['futureOrientation', d.futureOrientation.value],
        ];
        for (const [key, value] of values) {
          if (typeof value === 'number' && Number.isFinite(value)) {
            perDimension[key].push(value);
          }
        }
      } catch (scoringError) {
        console.error('Norms scoring error:', scoringError);
      }
    }

    if (n < MIN_N_FOR_NORMS) {
      return NextResponse.json({ n, mode: 'insufficient' as const }, { status: 200, headers });
    }

    const dimensions = {} as Record<DimensionKey, DimensionNorm>;
    for (const key of DIMENSION_KEYS) {
      const values = perDimension[key];
      dimensions[key] = {
        n: values.length,
        quantiles: values.length > 0 ? quantiles99(values) : [],
      };
    }

    return NextResponse.json(
      { n, instrumentVersions, dimensions },
      { status: 200, headers }
    );
  } catch (err) {
    console.error('Norms error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
