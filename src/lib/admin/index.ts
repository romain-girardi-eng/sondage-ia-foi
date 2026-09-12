/**
 * Admin Library Exports
 */

export { generateMockStats, generateLockedMockStats, type MockStats } from './mock-stats';
export {
  // Types
  type SegmentStats,
  type DimensionStat,
  type KeyFinding,
  type ProfileCluster,
  type SegmentDataItem,
  type DimensionRecord,
  type CorrelationFact,
  type CorrelationsLock,
  type ExploitableCandidate,
  // Thresholds
  MIN_SEGMENT_N,
  MIN_CORRELATION_N,
  CONFIRMATORY_N,
  // Functions
  getRoleCategory,
  emptySegmentDataItem,
  buildSegmentStats,
  calculateDimensionStats,
  computeCorrelations,
  buildCorrelationMatrix,
  buildCorrelationsLock,
  isExploitableV2Response,
  suppressBivariateFindings,
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
