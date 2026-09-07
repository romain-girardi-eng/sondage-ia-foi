/**
 * Admin Statistics Helper Functions
 * Business logic for calculating admin dashboard statistics.
 *
 * Disclosure and inference rules (SCORING_V2_SPEC §1.8):
 * - a segment below MIN_SEGMENT_N publishes null means and null SDs, never a
 *   number computed on a handful of identifiable people;
 * - a correlation is computed only from MIN_CORRELATION_N pairwise-complete
 *   observations, and always travels with its 95 % CI and its BH-adjusted p.
 */

import { calculateMedian, calculateDistribution } from "@/lib/utils/statistics";
import {
  benjaminiHochberg,
  fisherCI,
  pearson as pearsonR,
  pValueFromR,
  sampleSd,
} from "@/lib/analysis/statistics";

export { calculateMedian, calculateDistribution };

// The numeric core lives in `@/lib/analysis/statistics` and is shared with the
// interpretation module: one Pearson, one Fisher interval, one incomplete beta,
// one Benjamini-Hochberg. The thin wrappers below only keep the signatures this
// admin module and its callers already use.
export { benjaminiHochberg };

/** Below this, a segment is too small to publish an average without risking re-identification. */
export const MIN_SEGMENT_N = 5;

/** Below this, a correlation coefficient is too unstable to be reported at all. */
export const MIN_CORRELATION_N = 20;

// Types
export interface SegmentStats {
  count: number;
  avgReligiosity: number | null;
  avgAiAdoption: number | null;
  sdReligiosity: number | null;
  sdAiAdoption: number | null;
  profileDistribution: Record<string, number>;
  /** Counts of the ordinal usage gap (SCORING_V2_SPEC §1.7). */
  usageGapDistribution: Record<string, number>;
  dimensionAverages: Record<string, number | null>;
  dimensionSds: Record<string, number | null>;
}

export interface DimensionStat {
  n: number;
  mean: number | null;
  stdDev: number | null;
  median: number | null;
  distribution: number[];
}

export interface KeyFinding {
  type: 'correlation' | 'segment' | 'pattern';
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
}

export interface ProfileCluster {
  profile: string;
  count: number;
  avgReligiosity: number;
  avgAiOpenness: number;
}

export interface SegmentDataItem {
  religiosity: Array<number | null>;
  aiAdoption: Array<number | null>;
  profiles: Record<string, number>;
  usageGap: Record<string, number>;
  dimensions: Record<string, Array<number | null>>;
}

/** One respondent's dimension scores, nulls included (SCORING_V2_SPEC §1.4). */
export type DimensionRecord = Record<string, number | null>;

/** Shape fixed by SCORING_V2_SPEC §2. */
export interface CorrelationFact {
  x: string;
  y: string;
  r: number;
  n: number;
  ci95: [number, number];
  pRaw: number;
  pAdjusted: number;
  sharedItems: string[];
}

// Callers pass `DIMENSION_ITEMS` from '@/lib/scoring'. The empty default keeps
// this module free of a scoring import: with no map, no pair can be flagged as
// a method artefact, which is also v2's expectation since each item feeds
// exactly one dimension (SCORING_V2_SPEC §1.3).
const NO_DIMENSION_ITEMS: Partial<Record<string, string[]>> = {};

// ---------------------------------------------------------------------------
// Numeric primitives
// ---------------------------------------------------------------------------

function present(values: Array<number | null>): number[] {
  return values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Sample standard deviation (n − 1). The population formula in
 * `@/lib/utils/statistics` understates the spread of a survey sample.
 */
export function sampleStdDev(values: number[]): number | null {
  return sampleSd(values);
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function roundOrNull(value: number | null, decimals: number): number | null {
  return value === null ? null : round(value, decimals);
}

/** Pearson r on already-paired, complete observations. */
export function pearson(x: number[], y: number[]): number | null {
  return pearsonR(x, y)?.r ?? null;
}

/**
 * 95 % confidence interval for r through Fisher's z transform. Degenerate
 * cases (|r| = 1, n <= 3) collapse the interval onto the point estimate rather
 * than inventing a width.
 */
export function fisherCi95(r: number, n: number): [number, number] {
  return fisherCI(r, n, 0.95) ?? [r, r];
}

/**
 * Two-sided p-value for r under H0: rho = 0, via t = r·sqrt((n−2)/(1−r²))
 * with n−2 degrees of freedom. Undefined below three observations, where the
 * conservative answer is "no evidence".
 */
export function pValueForCorrelation(r: number, n: number): number {
  if (n < 3) return 1;
  const p = pValueFromR(r, n);
  return Number.isFinite(p) ? p : 1;
}

// ---------------------------------------------------------------------------
// Segment / dimension statistics
// ---------------------------------------------------------------------------

/**
 * Get role category (clergy vs laity)
 */
export function getRoleCategory(role: string): 'clergy' | 'laity' | 'other' {
  if (['clerge', 'religieux', 'responsable_non_ordonne'].includes(role)) return 'clergy';
  if (['laic_engagé', 'laic_pratiquant', 'curieux'].includes(role)) return 'laity';
  return 'other';
}

export function emptySegmentDataItem(dimensionKeys: string[]): SegmentDataItem {
  const dimensions: Record<string, Array<number | null>> = {};
  for (const key of dimensionKeys) dimensions[key] = [];
  return { religiosity: [], aiAdoption: [], profiles: {}, usageGap: {}, dimensions };
}

/**
 * Mean and SD of one measure inside a segment, both null unless at least
 * MIN_SEGMENT_N respondents actually have a value for it. The segment size is
 * not enough: a dimension can be measured on a single person inside a segment
 * of forty, and that person's score must not be published as an average.
 */
function measure(values: Array<number | null>): { mean: number | null; sd: number | null } {
  const usable = present(values);
  if (usable.length < MIN_SEGMENT_N) return { mean: null, sd: null };
  return { mean: roundOrNull(mean(usable), 2), sd: roundOrNull(sampleStdDev(usable), 2) };
}

/**
 * Build segment statistics from raw segment data.
 *
 * Two disclosure rules apply (SCORING_V2_SPEC §1.8):
 * - a segment below MIN_SEGMENT_N publishes its size and nothing else, the
 *   profile and usage-gap distributions included: a distribution over four
 *   people is a list of four people;
 * - above it, each measure is published only if its own non-null count reaches
 *   MIN_SEGMENT_N.
 */
export function buildSegmentStats(data: SegmentDataItem): SegmentStats {
  const count = data.religiosity.length;
  const dimensionAverages: Record<string, number | null> = {};
  const dimensionSds: Record<string, number | null> = {};

  if (count < MIN_SEGMENT_N) {
    for (const key of Object.keys(data.dimensions)) {
      dimensionAverages[key] = null;
      dimensionSds[key] = null;
    }
    return {
      count,
      avgReligiosity: null,
      avgAiAdoption: null,
      sdReligiosity: null,
      sdAiAdoption: null,
      profileDistribution: {},
      usageGapDistribution: {},
      dimensionAverages,
      dimensionSds,
    };
  }

  for (const key of Object.keys(data.dimensions)) {
    const { mean: m, sd } = measure(data.dimensions[key]);
    dimensionAverages[key] = m;
    dimensionSds[key] = sd;
  }

  const religiosity = measure(data.religiosity);
  const aiAdoption = measure(data.aiAdoption);

  return {
    count,
    avgReligiosity: religiosity.mean,
    avgAiAdoption: aiAdoption.mean,
    sdReligiosity: religiosity.sd,
    sdAiAdoption: aiAdoption.sd,
    profileDistribution: data.profiles,
    usageGapDistribution: data.usageGap,
    dimensionAverages,
    dimensionSds,
  };
}

/**
 * Calculate dimension statistics from dimension data.
 * Fewer than MIN_SEGMENT_N usable values: n only, no mean and no SD.
 */
export function calculateDimensionStats(
  dimensionData: Record<string, Array<number | null>>
): Record<string, DimensionStat> {
  const stats: Record<string, DimensionStat> = {};

  for (const key of Object.keys(dimensionData)) {
    const values = present(dimensionData[key]);
    if (values.length < MIN_SEGMENT_N) {
      stats[key] = { n: values.length, mean: null, stdDev: null, median: null, distribution: [] };
      continue;
    }
    stats[key] = {
      n: values.length,
      mean: roundOrNull(mean(values), 2),
      stdDev: roundOrNull(sampleStdDev(values), 2),
      median: round(calculateMedian(values), 2),
      distribution: calculateDistribution(values),
    };
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Correlations
// ---------------------------------------------------------------------------

function sharedItemsBetween(
  x: string,
  y: string,
  dimensionItems: Partial<Record<string, string[]>>
): string[] {
  const itemsX = dimensionItems[x];
  const itemsY = dimensionItems[y];
  if (!itemsX || !itemsY) return [];
  const setY = new Set(itemsY);
  return itemsX.filter((item) => setY.has(item));
}

/**
 * Every pairwise-complete correlation with at least MIN_CORRELATION_N
 * observations, with Fisher CI and a BH adjustment over that exact family.
 */
export function computeCorrelations(
  records: DimensionRecord[],
  keys: string[],
  dimensionItems: Partial<Record<string, string[]>> = NO_DIMENSION_ITEMS
): CorrelationFact[] {
  const facts: Array<Omit<CorrelationFact, 'pAdjusted'>> = [];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const x = keys[i];
      const y = keys[j];
      const xs: number[] = [];
      const ys: number[] = [];

      for (const record of records) {
        const a = record[x];
        const b = record[y];
        if (typeof a === 'number' && typeof b === 'number') {
          xs.push(a);
          ys.push(b);
        }
      }

      if (xs.length < MIN_CORRELATION_N) continue;

      const r = pearson(xs, ys);
      if (r === null) continue;

      const n = xs.length;
      const [lo, hi] = fisherCi95(r, n);
      facts.push({
        x,
        y,
        r: round(r, 3),
        n,
        ci95: [round(lo, 3), round(hi, 3)],
        pRaw: pValueForCorrelation(r, n),
        sharedItems: sharedItemsBetween(x, y, dimensionItems),
      });
    }
  }

  const adjusted = benjaminiHochberg(facts.map((f) => f.pRaw));

  return facts.map((fact, index) => ({
    ...fact,
    pRaw: round(fact.pRaw, 5),
    pAdjusted: round(adjusted[index], 5),
  }));
}

/**
 * Square matrix view of the correlation facts, for the legacy heatmap.
 * Null unless every pair reached MIN_CORRELATION_N: a matrix with holes would
 * invite reading absence as zero.
 */
export function buildCorrelationMatrix(
  facts: CorrelationFact[],
  keys: string[]
): Record<string, Record<string, number>> | null {
  const expectedPairs = (keys.length * (keys.length - 1)) / 2;
  if (facts.length < expectedPairs) return null;

  const matrix: Record<string, Record<string, number>> = {};
  for (const key of keys) {
    matrix[key] = { [key]: 1 };
  }
  for (const fact of facts) {
    matrix[fact.x][fact.y] = fact.r;
    matrix[fact.y][fact.x] = fact.r;
  }
  return matrix;
}

// ---------------------------------------------------------------------------
// Narrative findings
// ---------------------------------------------------------------------------

/**
 * Generate key findings from analyzed data. Every sentence is backed by a
 * number that was actually computed; nothing is inferred when it is null.
 */
export function generateKeyFindings(
  segmentedAnalysis: Record<string, Record<string, SegmentStats>>,
  correlations: CorrelationFact[],
  dimensionStats: Record<string, DimensionStat>,
  totalResponses: number
): KeyFinding[] {
  const findings: KeyFinding[] = [];

  const significant = correlations
    .filter((c) => c.pAdjusted < 0.05)
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  for (const fact of significant.slice(0, 2)) {
    findings.push({
      type: 'correlation',
      title: fact.r > 0 ? 'Corrélation positive' : 'Corrélation négative',
      description: `« ${fact.x} » et « ${fact.y} » : r = ${fact.r} (IC 95 % [${fact.ci95[0]} ; ${fact.ci95[1]}], n = ${fact.n}, p ajusté = ${fact.pAdjusted}).`,
      significance: Math.abs(fact.r) > 0.5 ? 'high' : 'medium',
    });
  }

  const clergy = segmentedAnalysis.byRole?.clergy;
  const laity = segmentedAnalysis.byRole?.laity;

  if (clergy?.avgReligiosity !== null && clergy?.avgReligiosity !== undefined &&
      laity?.avgReligiosity !== null && laity?.avgReligiosity !== undefined) {
    const diff = Math.abs(clergy.avgReligiosity - laity.avgReligiosity);
    if (diff > 0.5) {
      findings.push({
        type: 'segment',
        title: 'Écart clergé/laïcs sur la religiosité',
        description: `Religiosité moyenne : clergé ${clergy.avgReligiosity.toFixed(1)} (n = ${clergy.count}), laïcs ${laity.avgReligiosity.toFixed(1)} (n = ${laity.count}), écart de ${diff.toFixed(1)} point.`,
        significance: diff > 1 ? 'high' : 'medium',
      });
    }
  }

  if (clergy?.avgAiAdoption !== null && clergy?.avgAiAdoption !== undefined &&
      laity?.avgAiAdoption !== null && laity?.avgAiAdoption !== undefined) {
    const aiDiff = Math.abs(clergy.avgAiAdoption - laity.avgAiAdoption);
    if (aiDiff > 0.3) {
      findings.push({
        type: 'segment',
        title: 'Écart clergé/laïcs sur l’ouverture à l’IA',
        description: `Ouverture à l’IA : clergé ${clergy.avgAiAdoption.toFixed(1)} (n = ${clergy.count}), laïcs ${laity.avgAiAdoption.toFixed(1)} (n = ${laity.count}).`,
        significance: aiDiff > 0.6 ? 'high' : 'medium',
      });
    }
  }

  const sacred = dimensionStats.sacredBoundary;
  if (sacred?.mean !== null && sacred?.mean !== undefined && sacred.mean > 3.5) {
    findings.push({
      type: 'pattern',
      title: 'Frontière sacrée élevée',
      description: `Frontière sacrée moyenne de ${sacred.mean.toFixed(1)}/5 (n = ${sacred.n}, ET ${sacred.stdDev ?? '—'}).`,
      significance: 'medium',
    });
  }

  const future = dimensionStats.futureOrientation;
  if (future?.mean !== null && future?.mean !== undefined && future.mean > 3.5) {
    findings.push({
      type: 'pattern',
      title: 'Orientation future favorable',
      description: `Orientation future moyenne de ${future.mean.toFixed(1)}/5 (n = ${future.n}, ET ${future.stdDev ?? '—'}).`,
      significance: 'medium',
    });
  }

  if (totalResponses >= 100) {
    findings.push({
      type: 'pattern',
      title: 'Taille d’échantillon',
      description: `${totalResponses} réponses complètes collectées.`,
      significance: totalResponses >= 500 ? 'high' : 'medium',
    });
  }

  return findings.slice(0, 6);
}

/**
 * Get completion time in minutes from metadata
 */
export function getCompletionMinutes(
  metadata: {
    completionTime?: number;
    timeSpent?: number;
    startedAt?: string;
    completedAt?: string;
  } | null,
  createdAt?: string,
  updatedAt?: string
): number | null {
  if (metadata?.completionTime && metadata.completionTime > 0) {
    return metadata.completionTime;
  }

  if (typeof metadata?.timeSpent === "number" && metadata.timeSpent > 0) {
    return Math.round((metadata.timeSpent / 60000) * 10) / 10;
  }

  if (metadata?.startedAt && metadata?.completedAt) {
    const start = Date.parse(metadata.startedAt);
    const end = Date.parse(metadata.completedAt);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
      return Math.round(((end - start) / 60000) * 10) / 10;
    }
  }

  if (createdAt && updatedAt) {
    const created = Date.parse(createdAt);
    const updated = Date.parse(updatedAt);
    if (!Number.isNaN(created) && !Number.isNaN(updated) && updated > created) {
      return Math.round(((updated - created) / 60000) * 10) / 10;
    }
  }

  return null;
}

/**
 * Calculate score distributions for histograms
 */
export function calculateScoreDistributions(
  religiosityScores: number[],
  aiAdoptionScores: number[]
): {
  religiosityDistribution: Record<string, number>;
  aiAdoptionDistribution: Record<string, number>;
} {
  const religiosityDistribution = { "1-2": 0, "2-3": 0, "3-4": 0, "4-5": 0 } as Record<string, number>;
  religiosityScores.forEach((s) => {
    if (s < 2) religiosityDistribution["1-2"]++;
    else if (s < 3) religiosityDistribution["2-3"]++;
    else if (s < 4) religiosityDistribution["3-4"]++;
    else religiosityDistribution["4-5"]++;
  });

  const aiAdoptionDistribution = { "1-2": 0, "2-3": 0, "3-4": 0, "4-5": 0 } as Record<string, number>;
  aiAdoptionScores.forEach((s) => {
    if (s < 2) aiAdoptionDistribution["1-2"]++;
    else if (s < 3) aiAdoptionDistribution["2-3"]++;
    else if (s < 4) aiAdoptionDistribution["3-4"]++;
    else aiAdoptionDistribution["4-5"]++;
  });

  return { religiosityDistribution, aiAdoptionDistribution };
}

/**
 * Calculate average with rounding. Null on an empty set rather than 0, which
 * would read as a measured value.
 */
export function calculateAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}
