export { cn } from "./utils";
export { useHasAnimated, useMemoizedProfileSpectrum } from "./hooks/index";
export { LanguageProvider, useLanguage, getLocalizedPath } from "./i18n";
export { ThemeProvider, useTheme } from "./theme";
export { getMockResults, type AggregatedResult } from "./dataService";

// Scoring v2 public surface (docs/SCORING_V2_SPEC.md)
export {
  calculateCRS5Score,
  getReligiosityLevel,
  RELIGIOSITY_LABELS,
  calculateAIAdoptionScore,
  getAIAdoptionLevel,
  AI_ADOPTION_LABELS,
  calculateSocialDesirability,
  computeUsageGap,
  computeCoreSubscores,
  DIMENSION_KEYS,
  DIMENSION_ITEMS,
  getSpiritualAIProfile,
  PROFILE_DATA,
  generateInsights,
  type ReligiosityLevel,
  type AIAdoptionLevel,
  type TheologicalOrientation,
  type SpiritualAIProfile,
  type PersonalizedInsight,
  type SocialDesirability,
  type UsageGap,
  type CoreSubscores,
  type DimensionKey,
} from "./scoring/index";

// Profiles and dimensions
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
  type ProfileConfidence,
  type AdvancedInsight,
  type TensionPoint,
  type GrowthArea,
} from "./scoring/index";
