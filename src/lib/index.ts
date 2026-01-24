export { cn } from "./utils";
export { LanguageProvider, useLanguage } from "./i18n";
export { getMockResults, type AggregatedResult } from "./dataService";
// Legacy exports for backward compatibility
export {
  calculateCRS5Score,
  getReligiosityLevel,
  RELIGIOSITY_LABELS,
  calculateGeneralAIScore,
  calculateSpiritualAIScore,
  calculateSpiritualResistanceIndex,
  getResistanceLevel,
  RESISTANCE_LABELS,
  calculateAIAdoptionScore,
  getAIAdoptionLevel,
  AI_ADOPTION_LABELS,
  getSpiritualAIProfile,
  PROFILE_DATA,
  getPercentileComparison,
  generateInsights,
  type ReligiosityLevel,
  type AIAdoptionLevel,
  type ResistanceLevel,
  type TheologicalOrientation,
  type SpiritualAIProfile,
  type PersonalizedInsight,
} from "./scoring/index";

// New advanced profiling system
export {
  calculateProfileSpectrum,
  getEnhancedProfileData,
  calculateAllDimensions,
  PROFILE_DEFINITIONS,
  SUB_PROFILE_DEFINITIONS,
  DIMENSION_LABELS,
  PROFILE_COLORS,
  DIMENSION_COLORS,
  type ProfileSpectrum,
  type SevenDimensions,
  type PrimaryProfile,
  type SubProfileType,
  type DimensionScore,
  type ProfileMatch,
  type SubProfileMatch,
  type AdvancedInsight,
  type TensionPoint,
  type GrowthArea,
} from "./scoring/index";
