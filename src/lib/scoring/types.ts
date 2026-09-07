/**
 * Scoring core v2 - shared types
 *
 * Every dimension is nullable: a respondent who skipped (or was never asked)
 * the items feeding a dimension gets `value: null`, never an imputed midpoint.
 */

// ==========================================
// DIMENSION TYPES
// ==========================================

export interface DimensionScore {
  /** 1-5 mean of the answered items, or null when nItems < the dimension minimum */
  value: number | null;
  /** nItems / maxItems, 0-1 */
  confidence: number;
  /** Items actually answered (missing values excluded) */
  nItems: number;
  /** Items this respondent could have been asked, given their routing */
  maxItems: number;
  /** Always null client-side; filled only from GET /api/results/norms */
  percentile: number | null;
}

export interface SevenDimensions {
  religiosity: DimensionScore;
  aiOpenness: DimensionScore;
  sacredBoundary: DimensionScore;
  ethicalConcern: DimensionScore;
  psychologicalPerception: DimensionScore;
  communityContext: DimensionScore;
  futureOrientation: DimensionScore;
}

export type DimensionKey = keyof SevenDimensions;

/**
 * Sub-scores restricted to items asked to every respondent, so clergy and
 * laypeople remain comparable.
 */
export interface CoreSubscores {
  sacredBoundaryCore: DimensionScore;
  aiOpennessCore: DimensionScore;
}

// ==========================================
// SOCIAL DESIRABILITY
// ==========================================

export interface SocialDesirability {
  /** Share of items endorsed in the socially desirable direction, 0-1; null if < 4 answered */
  score: number | null;
  nItems: number;
  flag: boolean;
}

// ==========================================
// USAGE GAP (replaces the "spiritual resistance index")
// ==========================================

export type UsageGap =
  | 'none'
  | 'uses_general_not_spiritual'
  | 'uses_both'
  | 'no_use';

// ==========================================
// PROFILE TYPES
// ==========================================

export type PrimaryProfile =
  | 'gardien_tradition'
  | 'prudent_eclaire'
  | 'innovateur_ancre'
  | 'equilibriste'
  | 'pragmatique_moderne'
  | 'pionnier_spirituel'
  | 'progressiste_critique'
  | 'explorateur';

export type SubProfileType =
  // Gardien de la Tradition variants
  | 'protecteur_sacre'
  | 'sage_prudent'
  | 'berger_communautaire'
  // Prudent Éclairé variants
  | 'analyste_spirituel'
  | 'discerneur_pastoral'
  | 'observateur_engage'
  // Innovateur Ancré variants
  | 'pont_generationnel'
  | 'evangeliste_digital'
  | 'theologien_techno'
  // Équilibriste variants
  | 'mediateur'
  | 'chercheur_sens'
  | 'adaptateur_prudent'
  // Pragmatique Moderne variants
  | 'efficace_engage'
  | 'communicateur_digital'
  | 'optimisateur_pastoral'
  // Pionnier Spirituel variants
  | 'visionnaire'
  | 'experimentateur'
  | 'prophete_digital'
  // Progressiste Critique variants
  | 'ethicien'
  | 'reformateur_social'
  | 'philosophe_spirituel'
  // Explorateur variants
  | 'curieux_spirituel'
  | 'novice_technologique'
  | 'chercheur_seculier';

export interface ProfileMatch {
  profile: PrimaryProfile;
  /** 0-100, raw (never normalised across profiles), unrounded */
  matchScore: number;
  /** Weighted L1 distance to the ideal ranges, over valued dimensions only */
  distance: number;
}

export interface SubProfileMatch {
  subProfile: SubProfileType;
  matchScore: number;
  description: string;
}

export type ProfileConfidence = 'low' | 'medium' | 'high';

// ==========================================
// COMPREHENSIVE PROFILE RESULT
// ==========================================

export interface ProfileSpectrum {
  /** null when fewer than 4 dimensions could be valued */
  primary: ProfileMatch | null;
  secondary: ProfileMatch | null;
  tertiary: ProfileMatch | null;

  /** All 8 profiles with raw scores, sorted descending */
  allMatches: ProfileMatch[];

  /** null when there is no primary profile */
  subProfile: SubProfileMatch | null;

  dimensions: SevenDimensions;
  core: CoreSubscores;

  /** Profile assignment is a heuristic, never a diagnosis */
  attribution: 'heuristic';
  profileConfidence: ProfileConfidence;

  socialDesirability: SocialDesirability;
  usageGap: UsageGap;

  /** null when there is no primary profile */
  interpretation: ProfileInterpretation | null;

  insights: AdvancedInsight[];
  tensions: TensionPoint[];
  /** "Pistes de réflexion" - neutral, never prescriptive */
  growthAreas: GrowthArea[];
}

export interface ProfileInterpretation {
  headline: string;
  narrative: string;
  uniqueAspects: string[];
  blindSpots: string[];
  strengths: string[];
}

export interface AdvancedInsight {
  category: 'spiritual' | 'technological' | 'ethical' | 'relational' | 'developmental';
  icon: string;
  title: string;
  message: string;
  priority: number;
}

export interface TensionPoint {
  dimension1: DimensionKey;
  dimension2: DimensionKey;
  description: string;
  suggestion: string;
}

export interface GrowthArea {
  area: string;
  currentState: string;
  potentialGrowth: string;
  actionableStep: string;
}

// ==========================================
// PROFILE DATA STRUCTURES
// ==========================================

export type DimensionRanges = Record<DimensionKey, [number, number]>;
export type DimensionWeights = Record<DimensionKey, number>;

export interface ProfileDefinition {
  id: PrimaryProfile;
  title: string;
  emoji: string;
  shortDescription: string;
  fullDescription: string;
  idealDimensions: DimensionRanges;
  weights: DimensionWeights;
  coreMotivation: string;
  primaryFear: string;
  communicationStyle: string;
  subProfiles: SubProfileType[];
}

export interface SubProfileDefinition {
  id: SubProfileType;
  parentProfile: PrimaryProfile;
  title: string;
  emoji: string;
  description: string;
  distinguishingTraits: string[];
  idealPattern: {
    dimension: DimensionKey;
    emphasis: 'high' | 'low' | 'moderate';
  }[];
}

// ==========================================
// HELPER TYPES
// ==========================================

export interface DimensionLabel {
  dimension: DimensionKey;
  label: string;
  labelEn: string;
  description: string;
  lowDescription: string;
  highDescription: string;
}
