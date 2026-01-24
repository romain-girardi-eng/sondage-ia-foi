/**
 * Advanced Profiling Types
 * Multi-dimensional spiritual-AI profile typology
 */

// ==========================================
// DIMENSION TYPES
// ==========================================

export interface DimensionScore {
  value: number;        // 1-5 scale
  confidence: number;   // 0-1 how confident we are (based on answered questions)
  percentile: number;   // 1-99 vs population
}

export interface SevenDimensions {
  religiosity: DimensionScore;          // Centrality of faith
  aiOpenness: DimensionScore;           // General AI adoption willingness
  sacredBoundary: DimensionScore;       // Resistance to AI in sacred spaces
  ethicalConcern: DimensionScore;       // Worry about AI implications
  psychologicalPerception: DimensionScore; // Views on AI nature/consciousness
  communityInfluence: DimensionScore;   // Social context impact
  futureOrientation: DimensionScore;    // Trajectory and openness to change
}

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
  matchScore: number;     // 0-100 percentage match
  distance: number;       // Distance from ideal (lower = better fit)
}

export interface SubProfileMatch {
  subProfile: SubProfileType;
  matchScore: number;
  description: string;
}

// ==========================================
// COMPREHENSIVE PROFILE RESULT
// ==========================================

export interface ProfileSpectrum {
  // Primary classification
  primary: ProfileMatch;
  secondary: ProfileMatch | null;
  tertiary: ProfileMatch | null;

  // All profile matches (for visualization)
  allMatches: ProfileMatch[];

  // Sub-profile within primary
  subProfile: SubProfileMatch;

  // Raw dimensions
  dimensions: SevenDimensions;

  // Narrative interpretation
  interpretation: ProfileInterpretation;

  // Personalized insights based on unique combination
  insights: AdvancedInsight[];

  // Tension points (where dimensions conflict)
  tensions: TensionPoint[];

  // Growth opportunities
  growthAreas: GrowthArea[];
}

export interface ProfileInterpretation {
  headline: string;           // One-line summary
  narrative: string;          // 2-3 sentence description
  uniqueAspects: string[];    // What makes this combination unique
  blindSpots: string[];       // Potential blind spots
  strengths: string[];        // Core strengths
}

export interface AdvancedInsight {
  category: 'spiritual' | 'technological' | 'ethical' | 'relational' | 'developmental';
  icon: string;
  title: string;
  message: string;
  priority: number;  // 1-5, higher = more important
}

export interface TensionPoint {
  dimension1: keyof SevenDimensions;
  dimension2: keyof SevenDimensions;
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

export interface ProfileDefinition {
  id: PrimaryProfile;
  title: string;
  emoji: string;
  shortDescription: string;
  fullDescription: string;
  idealDimensions: {
    religiosity: [number, number];      // [min, max] ideal range
    aiOpenness: [number, number];
    sacredBoundary: [number, number];
    ethicalConcern: [number, number];
    psychologicalPerception: [number, number];
    communityInfluence: [number, number];
    futureOrientation: [number, number];
  };
  weights: {
    religiosity: number;
    aiOpenness: number;
    sacredBoundary: number;
    ethicalConcern: number;
    psychologicalPerception: number;
    communityInfluence: number;
    futureOrientation: number;
  };
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
    dimension: keyof SevenDimensions;
    emphasis: 'high' | 'low' | 'moderate';
  }[];
}

// ==========================================
// HELPER TYPES
// ==========================================

export interface DimensionLabel {
  dimension: keyof SevenDimensions;
  label: string;
  labelEn: string;
  description: string;
  lowDescription: string;
  highDescription: string;
}
