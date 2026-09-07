/**
 * Pure helpers for the admin « Corrélations et interprétations » section.
 *
 * Kept out of the component so the grade palette and the hypothesis matching
 * can be tested without rendering anything.
 */

import { HYPOTHESES, pairKey } from '@/lib/analysis';
import type {
  CertaintyScore,
  Hypothesis,
  HypothesisId,
  InterpretedCorrelation,
  Mechanism,
} from '@/lib/analysis';

export type Grade = CertaintyScore['grade'];

/**
 * Semantic grade colours, deliberately distinct from the dashboard accent
 * (blue / purple): a grade must never read as « selected » or « primary ».
 */
export const GRADE_STYLES: Record<Grade, { chip: string; bar: string; caption: string }> = {
  A: {
    chip: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    bar: 'bg-emerald-500',
    caption: 'Certitude la plus élevée du barème',
  },
  B: {
    chip: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    bar: 'bg-slate-400',
    caption: 'Certitude moyenne',
  },
  C: {
    chip: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    bar: 'bg-amber-500',
    caption: 'Certitude faible',
  },
  D: {
    chip: 'bg-red-500/15 text-red-400 border-red-500/30',
    bar: 'bg-red-500',
    caption: 'Certitude très faible',
  },
};

export function gradeChipClass(grade: Grade): string {
  return GRADE_STYLES[grade].chip;
}

export function gradeBarClass(grade: Grade): string {
  return GRADE_STYLES[grade].bar;
}

/** Mécanismes, en français, formulés sans engagement causal. */
export const MECHANISM_LABELS: Record<Mechanism, string> = {
  x_causes_y: 'X agirait sur Y',
  y_causes_x: 'Y agirait sur X',
  confounder: 'Variable tierce',
  selection: 'Biais de sélection',
  method_artifact: 'Artefact de méthode',
  construct_overlap: 'Recouvrement de construits',
};

/** Libellés FR des variables affichées dans le tableau des faits. */
export const VARIABLE_LABELS: Record<string, string> = {
  religiosity: 'Religiosité (CRS-5)',
  aiOpenness: 'Ouverture à l’IA',
  sacredBoundary: 'Frontière sacrée',
  ethicalConcern: 'Préoccupation éthique',
  psychologicalPerception: 'Perception psychologique',
  communityContext: 'Contexte communautaire',
  futureOrientation: 'Orientation future',
  sacredBoundaryCore: 'Frontière sacrée (noyau commun)',
  aiOpennessCore: 'Ouverture à l’IA (noyau commun)',
};

export function variableLabel(id: string): string {
  return VARIABLE_LABELS[id] ?? id;
}

/** La meilleure interprétation d'un fait, ou null si aucune n'a été produite. */
export function bestGrade(interpreted: InterpretedCorrelation): Grade | null {
  const best = interpreted.interpretations[0];
  return best ? best.certainty.grade : null;
}

/** Faits triés par |r| décroissant. Ne mute pas l'entrée. */
export function sortByAbsoluteR(
  interpreted: readonly InterpretedCorrelation[],
): InterpretedCorrelation[] {
  return [...interpreted].sort((a, b) => Math.abs(b.fact.r) - Math.abs(a.fact.r));
}

export interface HypothesisRow {
  hypothesis: Hypothesis;
  /** Le fait correspondant s'il a pu être calculé (n >= 20), sinon null. */
  interpreted: InterpretedCorrelation | null;
}

/**
 * Associe chaque hypothèse H1 à H8 au fait calculé sur la même paire de
 * variables, quel que soit l'ordre. Une hypothèse sans fait reste dans la
 * liste : ne pas avoir pu la tester est une information.
 */
export function groupByHypothesis(
  interpreted: readonly InterpretedCorrelation[],
): HypothesisRow[] {
  const byPair = new Map<string, InterpretedCorrelation>();
  for (const item of interpreted) {
    byPair.set(pairKey(item.fact.x, item.fact.y), item);
  }

  return (Object.keys(HYPOTHESES) as HypothesisId[]).map((id) => {
    const hypothesis = HYPOTHESES[id];
    const key = pairKey(hypothesis.variables[0], hypothesis.variables[1]);
    return { hypothesis, interpreted: byPair.get(key) ?? null };
  });
}
