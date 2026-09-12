'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, GitCompare, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SURVEY_QUESTIONS } from '@/data/surveySchema';
import { DIMENSION_ITEMS } from '@/lib/scoring';
import {
  DEFAULT_COLLECTED_COVARIATES,
  NBSP,
  NNBSP,
  describeFact,
  frInterval,
  frNumber,
  frPValue,
  interpretMatrix,
} from '@/lib/analysis';
import type { CorrelationFact, InterpretedCorrelation } from '@/lib/analysis';
import type { CorrelationsLock } from '@/lib/admin';
import {
  MECHANISM_LABELS,
  bestGrade,
  gradeBarClass,
  gradeChipClass,
  groupByHypothesis,
  sortByAbsoluteR,
  variableLabel,
} from './correlation-helpers';

/**
 * Covariables réellement présentes dans l'instrument. Une covariable annoncée
 * par le catalogue mais absente du questionnaire ne doit pas être comptée comme
 * contrôlable : c'est ce qui pénalise la certitude interprétative.
 */
const COLLECTED_COVARIATES: readonly string[] = (() => {
  const asked = new Set(SURVEY_QUESTIONS.map((question) => question.id));
  return DEFAULT_COLLECTED_COVARIATES.filter((id) => asked.has(id));
})();

function CertaintyBar({ label, value, grade }: { label: string; value: number; grade: 'A' | 'B' | 'C' | 'D' }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="font-mono text-foreground/70">{frNumber(value)}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', gradeBarClass(grade))}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

function InterpretationCard({
  item,
  isPreferred,
}: {
  item: InterpretedCorrelation['interpretations'][number];
  isPreferred: boolean;
}) {
  const { certainty } = item;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-3',
        isPreferred ? 'border-foreground/25 bg-muted/60' : 'border-border bg-card'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
              {MECHANISM_LABELS[item.mechanism]}
            </span>
            {isPreferred && (
              <span className="text-xs px-2 py-0.5 rounded-full border border-foreground/25 text-foreground/80">
                Explication préférée
              </span>
            )}
          </div>
          <p className="text-sm text-foreground mt-2">{item.label}</p>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full border shrink-0',
            gradeChipClass(certainty.grade)
          )}
        >
          Grade {certainty.grade}
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{item.rationale}</p>

      <div className="grid sm:grid-cols-3 gap-3">
        <CertaintyBar label="Statistique" value={certainty.statistical} grade={certainty.grade} />
        <CertaintyBar label="Interprétative" value={certainty.interpretive} grade={certainty.grade} />
        <CertaintyBar label="Globale" value={certainty.overall} grade={certainty.grade} />
      </div>

      {certainty.caveats.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground/70 mb-1">{`Réserves${NBSP}:`}</p>
          <ul className="space-y-1">
            {certainty.caveats.map((caveat) => (
              <li key={caveat} className="text-xs text-muted-foreground flex gap-2">
                <span aria-hidden className="text-muted-foreground/50">
                  •
                </span>
                <span>{caveat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <p className="text-muted-foreground">
          <span className="text-foreground/70">{`Comment trancher${NBSP}: `}</span>
          {item.testable ?? 'Rien dans les données collectées ne permet de trancher.'}
        </p>
        <p className="text-muted-foreground">
          <span className="text-foreground/70">{`Confondeurs cités${NBSP}: `}</span>
          {item.confounders.length > 0 ? item.confounders.join(', ') : 'aucun'}
        </p>
      </div>
    </div>
  );
}

function FactDetails({ interpreted }: { interpreted: InterpretedCorrelation }) {
  const { interpretations, preferred } = interpreted;

  if (interpretations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune interprétation n’a été produite pour cette paire.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-mono">{describeFact(interpreted.fact)}</p>
      {preferred === null && (
        <p className="text-sm text-amber-400">
          {`Interprétation ambiguë${NBSP}: deux explications à égalité.`}
        </p>
      )}
      {interpretations.map((item, index) => (
        <InterpretationCard
          key={`${item.mechanism}-${index}`}
          item={item}
          isPreferred={preferred !== null && preferred.mechanism === item.mechanism && preferred.label === item.label}
        />
      ))}
    </div>
  );
}

function HypothesesList({ interpreted }: { interpreted: readonly InterpretedCorrelation[] }) {
  const rows = useMemo(() => groupByHypothesis(interpreted), [interpreted]);

  return (
    <div className="space-y-2">
      {rows.map(({ hypothesis, interpreted: match }) => (
        <div key={hypothesis.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{hypothesis.id}</span>
                {` — ${hypothesis.statement}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {`Variables${NBSP}: ${variableLabel(hypothesis.variables[0])} × ${variableLabel(hypothesis.variables[1])}`}
              </p>
            </div>
            {match ? (
              (() => {
                const grade = bestGrade(match);
                return grade ? (
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full border shrink-0',
                      gradeChipClass(grade)
                    )}
                  >
                    Grade {grade}
                  </span>
                ) : null;
              })()
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground shrink-0">
                {`non calculable${NBSP}: n < 20`}
              </span>
            )}
          </div>
          {match && (
            <p className="text-xs text-muted-foreground font-mono mt-2">{describeFact(match.fact)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function CorrelationsSection({
  facts,
  lock,
}: {
  facts: readonly CorrelationFact[];
  lock?: CorrelationsLock;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const interpreted = useMemo(
    () =>
      interpretMatrix(facts, {
        dimensionItems: DIMENSION_ITEMS,
        collectedCovariates: COLLECTED_COVARIATES,
      }),
    [facts]
  );

  const sorted = useMemo(() => sortByAbsoluteR(interpreted), [interpreted]);

  if (lock?.locked) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Corrélations et interprétations
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {`Statistiques bivariées verrouillées jusqu’à ${lock.required} réponses exploitables v2 (préenregistrement, section 4.3). Actuellement${NBSP}: ${lock.exploitable}.`}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {`Les statistiques descriptives (moyennes, distributions) restent disponibles dans les autres onglets, sous les mêmes règles de k-anonymat.`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-muted-foreground" />
          Corrélations et interprétations
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {`Une corrélation est un fait, une interprétation est une hypothèse graduée. Les explications concurrentes sont pré-spécifiées et notées${NNBSP}; aucune ne démontre une causalité.`}
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {`Aucune corrélation calculée${NBSP}: il faut au moins 20 observations complètes par paire de variables.`}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left py-2 px-2 font-medium">Variables</th>
                <th className="text-center py-2 px-2 font-medium">r</th>
                <th className="text-center py-2 px-2 font-medium">{`IC 95${NNBSP}%`}</th>
                <th className="text-center py-2 px-2 font-medium">n</th>
                <th className="text-center py-2 px-2 font-medium">p ajusté</th>
                <th className="text-center py-2 px-2 font-medium">Items partagés</th>
                <th className="text-left py-2 px-2 font-medium">État</th>
              </tr>
            </thead>
            {sorted.map((item) => {
              const { fact } = item;
              const key = `${fact.x}|${fact.y}`;
              const isOpen = expanded === key;
              const grade = bestGrade(item);
              return (
                <tbody key={key}>
                  <tr
                    className="border-b border-border hover:bg-muted cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : key)}
                  >
                    <td className="py-3 px-2">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        className="flex items-center gap-2 text-left text-foreground"
                        onClick={(event) => {
                          event.stopPropagation();
                          setExpanded(isOpen ? null : key);
                        }}
                      >
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <span>
                          {variableLabel(fact.x)} × {variableLabel(fact.y)}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-foreground">{frNumber(fact.r)}</td>
                    <td className="py-3 px-2 text-center font-mono text-muted-foreground">
                      {frInterval(fact.ci95)}
                    </td>
                    <td className="py-3 px-2 text-center text-muted-foreground">{fact.n}</td>
                    <td className="py-3 px-2 text-center font-mono text-muted-foreground">
                      {frPValue(fact.pAdjusted)}
                    </td>
                    <td className="py-3 px-2 text-center text-muted-foreground">
                      {fact.sharedItems.length > 0 ? fact.sharedItems.join(', ') : '—'}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {grade && (
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full border',
                              gradeChipClass(grade)
                            )}
                          >
                            Grade {grade}
                          </span>
                        )}
                        {fact.sharedItems.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-400">
                            artefact de méthode
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-border">
                      <td colSpan={7} className="py-4 px-2 bg-muted/30">
                        <FactDetails interpreted={item} />
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </table>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Hypothèses préenregistrées (H1 à H8)</h4>
        <HypothesesList interpreted={interpreted} />
      </div>
    </div>
  );
}
