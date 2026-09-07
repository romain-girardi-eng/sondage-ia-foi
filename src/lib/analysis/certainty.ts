/**
 * Gradation de la certitude d'une interprétation (docs/SCORING_V2_SPEC.md §2).
 *
 * AVERTISSEMENT : tous les seuils ci-dessous sont des heuristiques de lecture,
 * pas une calibration validée. Ils servent à ordonner des explications
 * concurrentes et à rendre visibles les réserves, jamais à trancher.
 */

import { NBSP, NNBSP, frNumber, frPValue } from './format';
import type { AnalysisContext, CertaintyScore, CorrelationFact, Interpretation } from './types';

// ==========================================
// SEUILS (heuristiques, non calibrés)
// ==========================================

/** En dessous, aucune certitude statistique n'est accordée. Heuristique alignée sur §1.8. */
export const MIN_N = 20;
/** Effectif au delà duquel l'apport de nouvelles observations est négligé. Heuristique. */
export const N_SATURATION = 200;
/** Effectif en dessous duquel on signale une estimation peu précise. Heuristique. */
export const N_MODEST = 50;
/** Seuils de |r| (Cohen 1988, repris comme convention, pas comme loi). Heuristique. */
export const R_THRESHOLDS = [0.1, 0.3, 0.5] as const;
/** Notes associées aux quatre classes de |r|. Heuristique. */
export const R_SCORES = [0.1, 0.4, 0.7, 1] as const;
/** Largeur d'IC considérée comme totalement non informative. Heuristique. */
export const CI_WIDTH_UNINFORMATIVE = 1;
/** Seuil de décision sur le p ajusté. Convention disciplinaire, pas une propriété du réel. */
export const ALPHA = 0.05;
/** Note conservée quand le p ajusté dépasse alpha, pour ne pas annuler le reste. Heuristique. */
export const NON_SIGNIFICANT_SCORE = 0.35;
/** Pondération des quatre composantes statistiques. Heuristique. */
export const STATISTICAL_WEIGHTS = { n: 0.3, magnitude: 0.25, precision: 0.2, significance: 0.25 } as const;

/** Base interprétative d'un mécanisme causal en design transversal (§2). */
export const BASE_CAUSAL_CROSS_SECTIONAL = 0.5;
/** Base d'un mécanisme causal si le design cessait d'être transversal. Heuristique. */
export const BASE_CAUSAL_LONGITUDINAL = 0.7;
/** Base d'un confondeur mesuré (§2). */
export const BASE_MEASURED_CONFOUNDER = 0.7;
/** Base d'un artefact de méthode quand des items sont partagés (§2). */
export const BASE_METHOD_ARTIFACT_SHARED = 0.9;
/** Base d'un artefact de méthode sans item partagé. Heuristique. */
export const BASE_METHOD_ARTIFACT_UNSHARED = 0.3;
/** Base d'un recouvrement de construit. Heuristique. */
export const BASE_CONSTRUCT_OVERLAP = 0.6;
/** Base d'un recouvrement de construit avec items partagés. Heuristique. */
export const BASE_CONSTRUCT_OVERLAP_SHARED = 0.8;
/** Base d'un biais de sélection sur échantillon auto-sélectionné. Heuristique. */
export const BASE_SELECTION_SELF_SELECTED = 0.55;
/** Base d'un biais de sélection sur échantillon probabiliste. Heuristique. */
export const BASE_SELECTION_PROBABILISTIC = 0.25;
/** Pénalité par confondeur listé mais non collecté (§2). */
export const UNCONTROLLED_CONFOUNDER_PENALTY = 0.2;
/** Plafond interprétatif des mécanismes générés faute d'entrée au catalogue (§2). */
export const GENERIC_INTERPRETIVE_CAP = 0.4;

/** Seuils de note globale. Heuristiques de présentation. */
export const GRADE_THRESHOLDS = { A: 0.75, B: 0.5, C: 0.25 } as const;

const CAUSAL_MECHANISMS = new Set(['x_causes_y', 'y_causes_x']);

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function magnitudeScore(r: number): number {
  const abs = Math.abs(r);
  if (abs < R_THRESHOLDS[0]) return R_SCORES[0];
  if (abs < R_THRESHOLDS[1]) return R_SCORES[1];
  if (abs < R_THRESHOLDS[2]) return R_SCORES[2];
  return R_SCORES[3];
}

/**
 * Certitude statistique 0-1. Nulle sous MIN_N, puis moyenne pondérée de
 * l'effectif (saturé), de la taille d'effet, de la précision de l'IC et du
 * franchissement du seuil alpha après correction.
 */
export function statisticalCertainty(fact: CorrelationFact): number {
  if (!Number.isFinite(fact.r) || fact.n < MIN_N) return 0;
  const nScore = Math.sqrt(Math.min(fact.n, N_SATURATION) / N_SATURATION);
  const rScore = magnitudeScore(fact.r);
  const width = Math.abs(fact.ci95[1] - fact.ci95[0]);
  const precision = clamp01(1 - width / CI_WIDTH_UNINFORMATIVE);
  const significance = Number.isFinite(fact.pAdjusted) && fact.pAdjusted < ALPHA ? 1 : NON_SIGNIFICANT_SCORE;
  return clamp01(
    STATISTICAL_WEIGHTS.n * nScore +
      STATISTICAL_WEIGHTS.magnitude * rScore +
      STATISTICAL_WEIGHTS.precision * precision +
      STATISTICAL_WEIGHTS.significance * significance,
  );
}

function baseInterpretive(
  interpretation: Interpretation,
  fact: CorrelationFact,
  context: AnalysisContext,
): number {
  const shared = fact.sharedItems.length > 0;
  const crossSectional = context.crossSectional !== false;
  const selfSelected = context.selfSelected !== false;
  switch (interpretation.mechanism) {
    case 'x_causes_y':
    case 'y_causes_x':
      return crossSectional ? BASE_CAUSAL_CROSS_SECTIONAL : BASE_CAUSAL_LONGITUDINAL;
    case 'confounder':
      return BASE_MEASURED_CONFOUNDER;
    case 'method_artifact':
      return shared ? BASE_METHOD_ARTIFACT_SHARED : BASE_METHOD_ARTIFACT_UNSHARED;
    case 'construct_overlap':
      return shared ? BASE_CONSTRUCT_OVERLAP_SHARED : BASE_CONSTRUCT_OVERLAP;
    case 'selection':
      return selfSelected ? BASE_SELECTION_SELF_SELECTED : BASE_SELECTION_PROBABILISTIC;
    default:
      return BASE_CAUSAL_CROSS_SECTIONAL;
  }
}

/** Confondeurs cités par l'interprétation mais absents des données collectées. */
export function uncontrolledConfounders(
  interpretation: Interpretation,
  context: AnalysisContext,
): string[] {
  const collected = new Set(context.collectedCovariates);
  return interpretation.confounders.filter((id) => !collected.has(id));
}

/**
 * Certitude interprétative 0-1 : base du mécanisme, pénalisée d'un cran par
 * confondeur listé non collecté, puis plafonnée si l'appelant l'exige.
 */
export function interpretiveCertainty(
  interpretation: Interpretation,
  fact: CorrelationFact,
  context: AnalysisContext,
  cap = 1,
): number {
  const base = baseInterpretive(interpretation, fact, context);
  const missing = uncontrolledConfounders(interpretation, context).length;
  const penalised = base - (missing > 0 ? UNCONTROLLED_CONFOUNDER_PENALTY : 0);
  return clamp01(Math.min(penalised, cap));
}

function gradeFor(overall: number): CertaintyScore['grade'] {
  if (overall >= GRADE_THRESHOLDS.A) return 'A';
  if (overall >= GRADE_THRESHOLDS.B) return 'B';
  if (overall >= GRADE_THRESHOLDS.C) return 'C';
  return 'D';
}

/** Réserves formulées en français, du plus structurel au plus circonstanciel. */
export function caveatsFor(
  interpretation: Interpretation,
  fact: CorrelationFact,
  context: AnalysisContext,
): string[] {
  const caveats: string[] = [];
  const crossSectional = context.crossSectional !== false;
  if (crossSectional && CAUSAL_MECHANISMS.has(interpretation.mechanism)) {
    caveats.push(`Design transversal${NBSP}: le sens de la causalité n'est pas identifiable`);
  }
  if (context.selfSelected !== false) {
    caveats.push('Échantillon de convenance, auto-sélectionné');
  }
  if (fact.sharedItems.length > 0) {
    const list = fact.sharedItems.join(', ');
    caveats.push(
      fact.sharedItems.length === 1
        ? `Les deux mesures partagent l'item ${list}`
        : `Les deux mesures partagent les items ${list}`,
    );
  }
  if (fact.n < MIN_N) {
    caveats.push(`Effectif insuffisant (n${NBSP}= ${fact.n}) pour estimer une corrélation`);
  } else if (fact.n < N_MODEST) {
    caveats.push(`Effectif modeste (n${NBSP}= ${fact.n}), estimation peu précise`);
  }
  if (Number.isFinite(fact.pAdjusted) && fact.pAdjusted >= ALPHA) {
    caveats.push(
      `p ajusté${NBSP}= ${frPValue(fact.pAdjusted)} après correction de Benjamini-Hochberg, au dessus du seuil de ${frNumber(ALPHA, 2)}`,
    );
  }
  if (fact.ci95[0] <= 0 && fact.ci95[1] >= 0) {
    caveats.push(`L'intervalle de confiance à 95${NNBSP}% contient zéro`);
  }
  const missing = uncontrolledConfounders(interpretation, context);
  if (missing.length > 0) {
    caveats.push(`Variables non collectées par l'enquête${NBSP}: ${missing.join(', ')}`);
  }
  return caveats;
}

/** Score de certitude complet. `overall` est la moyenne géométrique des deux volets. */
export function certaintyScore(
  interpretation: Interpretation,
  fact: CorrelationFact,
  context: AnalysisContext,
  cap = 1,
): CertaintyScore {
  const statistical = statisticalCertainty(fact);
  const interpretive = interpretiveCertainty(interpretation, fact, context, cap);
  const overall = Math.sqrt(statistical * interpretive);
  return {
    statistical,
    interpretive,
    overall,
    grade: gradeFor(overall),
    caveats: caveatsFor(interpretation, fact, context),
  };
}
