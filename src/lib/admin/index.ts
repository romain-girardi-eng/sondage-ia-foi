/**
 * Admin Library Exports
 */

export { generateMockStats, type MockStats } from './mock-stats';
export {
  // Types
  type SegmentStats,
  type DimensionStat,
  type KeyFinding,
  type ProfileCluster,
  type SegmentDataItem,
  type DimensionRecord,
  type CorrelationFact,
  // Thresholds
  MIN_SEGMENT_N,
  MIN_CORRELATION_N,
  // Functions
  getRoleCategory,
  emptySegmentDataItem,
  buildSegmentStats,
  calculateDimensionStats,
  computeCorrelations,
  buildCorrelationMatrix,
  generateKeyFindings,
  getCompletionMinutes,
  calculateScoreDistributions,
  calculateAverage,
  // Statistical primitives
  mean,
  sampleStdDev,
  pearson,
  fisherCi95,
  pValueForCorrelation,
  benjaminiHochberg,
  calculateMedian,
  calculateDistribution,
} from './stats-helpers';
