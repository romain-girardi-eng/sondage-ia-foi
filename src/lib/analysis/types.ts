/**
 * Contrats du module d'interprétation des corrélations.
 * Source : docs/SCORING_V2_SPEC.md §2.
 *
 * Principe directeur : une corrélation est un fait, une interprétation est une
 * hypothèse graduée. Rien dans ce module ne conclut à une causalité.
 */

/**
 * Les 7 dimensions de la v2 (§1.3). Défini localement : le module d'analyse ne
 * dépend d'aucun symbole de `@/lib/scoring` à l'exécution.
 */
export type DimensionKey =
  | 'religiosity'
  | 'aiOpenness'
  | 'sacredBoundary'
  | 'ethicalConcern'
  | 'psychologicalPerception'
  | 'communityContext'
  | 'futureOrientation';

export const DIMENSION_KEYS: readonly DimensionKey[] = [
  'religiosity',
  'aiOpenness',
  'sacredBoundary',
  'ethicalConcern',
  'psychologicalPerception',
  'communityContext',
  'futureOrientation',
] as const;

export interface CorrelationFact {
  /** Identifiants de variables (dimension, sous-score ou item brut). */
  x: string;
  y: string;
  r: number;
  n: number;
  /** Intervalle de confiance à 95 % par transformation z de Fisher. */
  ci95: [number, number];
  pRaw: number;
  /** p corrigé Benjamini-Hochberg sur la famille de corrélations calculées. */
  pAdjusted: number;
  /** Items communs aux deux variables. Non vide = artefact de méthode possible. */
  sharedItems: string[];
}

export type Mechanism =
  | 'x_causes_y'
  | 'y_causes_x'
  | 'confounder'
  | 'selection'
  | 'method_artifact'
  | 'construct_overlap';

export interface Interpretation {
  mechanism: Mechanism;
  /** Phrase FR courte, formulée au conditionnel. */
  label: string;
  /** 1 à 3 phrases : plausibilité, littérature ou raisonnement. */
  rationale: string;
  /** Variables collectées qui pourraient expliquer la relation. */
  confounders: string[];
  /** Ce qui permettrait de trancher avec les données collectées. */
  testable: string | null;
}

export interface CertaintyScore {
  /** 0-1 : f(n, |r|, largeur IC, pAdjusted). */
  statistical: number;
  /** 0-1 : plausibilité du mécanisme, pénalisée selon le design. */
  interpretive: number;
  /** Moyenne géométrique des deux. */
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D';
  /** Phrases FR listant ce qui limite la certitude. */
  caveats: string[];
}

export interface InterpretedCorrelation {
  fact: CorrelationFact;
  /** Triées par `overall` décroissant. */
  interpretations: Array<Interpretation & { certainty: CertaintyScore }>;
  /** La mieux notée si son `overall` dépasse la suivante d'au moins 0,15. */
  preferred: Interpretation | null;
}

/**
 * Contexte d'analyse : ce que l'enquête a effectivement collecté et sous quel
 * design. Sert à pénaliser les mécanismes non discriminables.
 */
export interface AnalysisContext {
  /** Identifiants des covariables réellement collectées. */
  collectedCovariates: readonly string[];
  /**
   * Mapping item -> dimension fourni par l'appelant (§1.3). Optionnel : sert
   * uniquement à déduire `sharedItems` quand le fait ne les porte pas.
   */
  dimensionItems?: Record<string, string[]>;
  /** Défaut true : l'enquête est transversale. */
  crossSectional?: boolean;
  /** Défaut true : échantillon de convenance auto-sélectionné. */
  selfSelected?: boolean;
}
