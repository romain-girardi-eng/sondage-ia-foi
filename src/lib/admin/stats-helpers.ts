/**
 * Admin Statistics Helper Functions
 * Business logic for calculating admin dashboard statistics
 */

import { calculateStdDev, calculateMedian, calculateCorrelation, calculateDistribution } from "@/lib/utils/statistics";

// Re-export statistical functions for convenience
export { calculateStdDev, calculateMedian, calculateCorrelation, calculateDistribution };

// Types
export interface SegmentStats {
  count: number;
  avgReligiosity: number;
  avgAiAdoption: number;
  avgResistance: number;
  profileDistribution: Record<string, number>;
  dimensionAverages: Record<string, number>;
}

export interface DimensionStat {
  mean: number;
  stdDev: number;
  median: number;
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
  religiosity: number[];
  aiAdoption: number[];
  resistance: number[];
  profiles: Record<string, number>;
  dimensions: Record<string, number[]>;
}

/**
 * Get role category (clergy vs laity)
 */
export function getRoleCategory(role: string): 'clergy' | 'laity' | 'other' {
  if (['clerge', 'religieux'].includes(role)) return 'clergy';
  if (['laic_engagé', 'laic_pratiquant', 'curieux'].includes(role)) return 'laity';
  return 'other';
}

/**
 * Build segment statistics from raw segment data
 */
export function buildSegmentStats(data: SegmentDataItem): SegmentStats {
  const count = data.religiosity.length;
  if (count === 0) {
    return {
      count: 0,
      avgReligiosity: 0,
      avgAiAdoption: 0,
      avgResistance: 0,
      profileDistribution: {},
      dimensionAverages: {},
    };
  }

  const dimensionAverages: Record<string, number> = {};
  for (const k of Object.keys(data.dimensions)) {
    const vals = data.dimensions[k];
    dimensionAverages[k] = vals.length > 0
      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100
      : 0;
  }

  return {
    count,
    avgReligiosity: Math.round((data.religiosity.reduce((a, b) => a + b, 0) / count) * 100) / 100,
    avgAiAdoption: Math.round((data.aiAdoption.reduce((a, b) => a + b, 0) / count) * 100) / 100,
    avgResistance: Math.round((data.resistance.reduce((a, b) => a + b, 0) / count) * 100) / 100,
    profileDistribution: data.profiles,
    dimensionAverages,
  };
}

/**
 * Calculate dimension statistics from dimension data
 */
export function calculateDimensionStats(
  dimensionData: Record<string, number[]>
): Record<string, DimensionStat> {
  const stats: Record<string, DimensionStat> = {};

  for (const key of Object.keys(dimensionData)) {
    const values = dimensionData[key];
    if (values.length > 0) {
      const mean = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
      stats[key] = {
        mean,
        stdDev: calculateStdDev(values, mean),
        median: Math.round(calculateMedian(values) * 100) / 100,
        distribution: calculateDistribution(values),
      };
    }
  }

  return stats;
}

/**
 * Calculate correlation matrix for all dimensions
 */
export function calculateCorrelationMatrix(
  dimensionData: Record<string, number[]>
): Record<string, Record<string, number>> {
  const dimensionKeys = Object.keys(dimensionData);
  const matrix: Record<string, Record<string, number>> = {};

  for (const dim1 of dimensionKeys) {
    matrix[dim1] = {};
    for (const dim2 of dimensionKeys) {
      if (dim1 === dim2) {
        matrix[dim1][dim2] = 1;
      } else {
        matrix[dim1][dim2] = calculateCorrelation(dimensionData[dim1], dimensionData[dim2]);
      }
    }
  }

  return matrix;
}

/**
 * Generate key findings from analyzed data
 */
export function generateKeyFindings(
  segmentedAnalysis: Record<string, Record<string, SegmentStats>>,
  correlationMatrix: Record<string, Record<string, number>>,
  dimensionStats: Record<string, DimensionStat>,
  totalResponses: number
): KeyFinding[] {
  const findings: KeyFinding[] = [];

  // Find strongest correlations
  const dimensions = Object.keys(correlationMatrix);
  let strongestPositive = { dims: ['', ''], value: 0 };
  let strongestNegative = { dims: ['', ''], value: 0 };

  for (let i = 0; i < dimensions.length; i++) {
    for (let j = i + 1; j < dimensions.length; j++) {
      const corr = correlationMatrix[dimensions[i]][dimensions[j]];
      if (corr > strongestPositive.value) {
        strongestPositive = { dims: [dimensions[i], dimensions[j]], value: corr };
      }
      if (corr < strongestNegative.value) {
        strongestNegative = { dims: [dimensions[i], dimensions[j]], value: corr };
      }
    }
  }

  if (strongestPositive.value > 0.3) {
    findings.push({
      type: 'correlation',
      title: 'Corrélation positive forte',
      description: `Les dimensions "${strongestPositive.dims[0]}" et "${strongestPositive.dims[1]}" montrent une corrélation positive significative (r=${strongestPositive.value}).`,
      significance: strongestPositive.value > 0.5 ? 'high' : 'medium'
    });
  }

  if (strongestNegative.value < -0.3) {
    findings.push({
      type: 'correlation',
      title: 'Corrélation négative notable',
      description: `Les dimensions "${strongestNegative.dims[0]}" et "${strongestNegative.dims[1]}" montrent une corrélation négative (r=${strongestNegative.value}).`,
      significance: strongestNegative.value < -0.5 ? 'high' : 'medium'
    });
  }

  // Segment differences
  if (segmentedAnalysis.byRole?.clergy && segmentedAnalysis.byRole?.laity) {
    const clergyRel = segmentedAnalysis.byRole.clergy.avgReligiosity;
    const laityRel = segmentedAnalysis.byRole.laity.avgReligiosity;
    const diff = Math.abs(clergyRel - laityRel);

    if (diff > 0.5) {
      findings.push({
        type: 'segment',
        title: 'Différence clergé/laïcs notable',
        description: `La religiosité moyenne diffère de ${diff.toFixed(1)} points entre le clergé (${clergyRel.toFixed(1)}) et les laïcs (${laityRel.toFixed(1)}).`,
        significance: diff > 1 ? 'high' : 'medium'
      });
    }

    const clergyAi = segmentedAnalysis.byRole.clergy.avgAiAdoption;
    const laityAi = segmentedAnalysis.byRole.laity.avgAiAdoption;
    const aiDiff = Math.abs(clergyAi - laityAi);

    if (aiDiff > 0.3) {
      findings.push({
        type: 'segment',
        title: 'Adoption IA différenciée',
        description: `L'adoption de l'IA varie entre le clergé (${clergyAi.toFixed(1)}) et les laïcs (${laityAi.toFixed(1)}).`,
        significance: aiDiff > 0.6 ? 'high' : 'medium'
      });
    }
  }

  // Pattern findings
  if (dimensionStats.sacredBoundary?.mean > 3.5) {
    findings.push({
      type: 'pattern',
      title: 'Frontière sacrée élevée',
      description: `La population maintient une frontière sacrée moyenne de ${dimensionStats.sacredBoundary.mean.toFixed(1)}/5, indiquant une réticence à utiliser l'IA dans les contextes spirituels.`,
      significance: 'high'
    });
  }

  if (dimensionStats.futureOrientation?.mean > 3.5) {
    findings.push({
      type: 'pattern',
      title: 'Orientation future positive',
      description: `${Math.round(dimensionStats.futureOrientation.mean / 5 * 100)}% de la population envisage d'augmenter leur usage de l'IA.`,
      significance: 'medium'
    });
  }

  // Sample size indicator
  if (totalResponses >= 100) {
    findings.push({
      type: 'pattern',
      title: 'Échantillon significatif',
      description: `Avec ${totalResponses} réponses, l'échantillon permet des analyses statistiques fiables.`,
      significance: totalResponses >= 500 ? 'high' : 'medium'
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
 * Calculate average with rounding
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}
