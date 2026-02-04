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
  // Functions
  getRoleCategory,
  buildSegmentStats,
  calculateDimensionStats,
  calculateCorrelationMatrix,
  generateKeyFindings,
  getCompletionMinutes,
  calculateScoreDistributions,
  calculateAverage,
  // Re-exported statistics
  calculateStdDev,
  calculateMedian,
  calculateCorrelation,
  calculateDistribution,
} from './stats-helpers';
