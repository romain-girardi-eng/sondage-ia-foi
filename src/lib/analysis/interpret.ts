/**
 * Mise en concurrence d’interprétations pour une corrélation observée.
 * Une corrélation est un fait, une interprétation est une hypothèse graduée.
 */

import { benjaminiHochberg } from './statistics';
import { GENERIC_INTERPRETIVE_CAP, certaintyScore } from './certainty';
import { NBSP, NNBSP, frInterval, frNumber, frPValue } from './format';
import {
  DEFAULT_COLLECTED_COVARIATES,
  findCatalogEntry,
  type CatalogEntry,
} from './interpretationCatalog';
import type {
  AnalysisContext,
  CertaintyScore,
  CorrelationFact,
  InterpretedCorrelation,
  Interpretation,
} from './types';

/**
 * Écart minimal d’`overall` entre la première et la deuxième interprétation
 * pour désigner une explication préférée. Heuristique, pas une calibration.
 */
export const PREFERENCE_MARGIN = 0.15;

/**
 * Covariables retenues comme confondeurs génériques quand la paire n’est pas au
 * catalogue. Choisies pour leur transversalité, pas pour une paire donnée.
 */
export const GENERIC_CONFOUNDER_CANDIDATES: readonly string[] = [
  'profil_age',
  'profil_education',
  'profil_statut',
  'profil_secteur',
  'theo_orientation',
  'ctrl_ia_frequence',
];

export interface InterpretOptions extends Partial<AnalysisContext> {
  /** Plafond interprétatif imposé, par exemple pour une famille exploratoire. */
  interpretiveCap?: number;
  /** Catalogue de substitution, utile aux tests. */
  lookup?: (x: string, y: string) => CatalogEntry | undefined;
}

function resolveContext(options: InterpretOptions = {}): AnalysisContext {
  return {
    collectedCovariates: options.collectedCovariates ?? DEFAULT_COLLECTED_COVARIATES,
    dimensionItems: options.dimensionItems,
    crossSectional: options.crossSectional !== false,
    selfSelected: options.selfSelected !== false,
  };
}

/**
 * Complète `sharedItems` à partir du mapping item -> dimension fourni par
 * l’appelant, quand le fait ne le porte pas déjà.
 */
export function withSharedItems(
  fact: CorrelationFact,
  dimensionItems?: Record<string, string[]>,
): CorrelationFact {
  if (fact.sharedItems.length > 0 || !dimensionItems) return fact;
  const xItems = dimensionItems[fact.x];
  const yItems = dimensionItems[fact.y];
  if (!xItems || !yItems) return fact;
  const ySet = new Set(yItems);
  const shared = xItems.filter((item) => ySet.has(item));
  return shared.length > 0 ? { ...fact, sharedItems: shared } : fact;
}

/** Mécanismes génériques quand la paire n’a pas d’entrée pré-spécifiée. */
export function genericInterpretations(
  fact: CorrelationFact,
  context: AnalysisContext,
): Interpretation[] {
  const collected = new Set(context.collectedCovariates);
  const out: Interpretation[] = [];

  if (fact.sharedItems.length > 0) {
    out.push({
      mechanism: 'method_artifact',
      label: 'Des items communs aux deux mesures suffiraient à produire l’association',
      rationale:
        'Quand deux scores partagent des items, une part de leur covariation est mécanique. C’est l’explication à écarter en premier avant toute lecture substantielle.',
      confounders: [],
      testable: `Recalculer la corrélation après retrait de ${fact.sharedItems.join(', ')}.`,
    });
  }

  for (const covariate of GENERIC_CONFOUNDER_CANDIDATES) {
    if (!collected.has(covariate) || covariate === fact.x || covariate === fact.y) continue;
    out.push({
      mechanism: 'confounder',
      label: `La variable ${covariate} pourrait expliquer la relation`,
      rationale:
        'Aucune interprétation n’a été pré-spécifiée pour cette paire. Ce mécanisme est proposé par défaut, au titre des covariables collectées, et non parce qu’une théorie le désigne.',
      confounders: [covariate],
      testable: `Contrôler par ${covariate} et vérifier si le r subsiste.`,
    });
  }

  out.push({
    mechanism: 'selection',
    label: 'L’auto-sélection des répondants pourrait produire l’association',
    rationale:
      'L’échantillon est de convenance et le questionnaire annonce son sujet. Conditionner sur la participation peut créer une association absente de la population de référence.',
    confounders: [],
    testable: 'Comparer les sessions complètes et abandonnées sur les items déjà répondus.',
  });

  return out;
}

/** Interprète une corrélation en classant des explications concurrentes. */
export function interpretCorrelation(
  input: CorrelationFact,
  options: InterpretOptions = {},
): InterpretedCorrelation {
  const context = resolveContext(options);
  const fact = withSharedItems(input, context.dimensionItems);
  const lookup = options.lookup ?? findCatalogEntry;
  const entry = lookup(fact.x, fact.y);
  const preSpecified = entry !== undefined;
  const candidates = preSpecified ? entry.interpretations : genericInterpretations(fact, context);
  const cap = options.interpretiveCap ?? (preSpecified ? 1 : GENERIC_INTERPRETIVE_CAP);

  const scored: Array<Interpretation & { certainty: CertaintyScore }> = candidates
    .map((interpretation) => ({
      ...interpretation,
      certainty: certaintyScore(interpretation, fact, context, cap),
    }))
    .sort((a, b) => b.certainty.overall - a.certainty.overall);

  let preferred: Interpretation | null = null;
  if (scored.length > 0) {
    const top = scored[0];
    const runnerUp = scored[1];
    const clear = runnerUp === undefined
      ? top.certainty.overall > 0
      : top.certainty.overall - runnerUp.certainty.overall >= PREFERENCE_MARGIN;
    if (clear) {
      preferred = {
        mechanism: top.mechanism,
        label: top.label,
        rationale: top.rationale,
        confounders: top.confounders,
        testable: top.testable,
      };
    }
  }

  return { fact, interpretations: scored, preferred };
}

/**
 * Interprète une famille de corrélations. La correction Benjamini-Hochberg est
 * appliquée à toute la famille avant l’interprétation, et recalculée depuis
 * `pRaw` si un seul `pAdjusted` manque.
 */
export function interpretMatrix(
  facts: readonly CorrelationFact[],
  options: InterpretOptions = {},
): InterpretedCorrelation[] {
  if (facts.length === 0) return [];
  const needsAdjustment = facts.some((fact) => !Number.isFinite(fact.pAdjusted));
  const adjusted = needsAdjustment ? benjaminiHochberg(facts.map((fact) => fact.pRaw)) : null;
  return facts.map((fact, index) =>
    interpretCorrelation(
      adjusted === null ? fact : { ...fact, pAdjusted: adjusted[index] },
      options,
    ),
  );
}

/** Une phrase neutre décrivant le fait, sans aucune lecture causale. */
export function describeFact(fact: CorrelationFact): string {
  const parts = [
    `r${NBSP}= ${frNumber(fact.r)}`,
    `IC 95${NNBSP}% ${frInterval(fact.ci95)}`,
    `n${NBSP}= ${fact.n}`,
    `p ajusté${NBSP}= ${frPValue(fact.pAdjusted)}`,
  ];
  return parts.join(', ');
}
