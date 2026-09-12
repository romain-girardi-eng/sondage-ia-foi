#!/usr/bin/env python3
"""Confirmatory analysis for the pre-registered hypotheses H1 to H8.

Reads a CSV export of exploitable v2 responses, keeps the confirmatory cohort
(the first ``--cohort-size`` rows by ``submittedAt``, 200 by default, since the
collection has no end date), recomputes the seven dimensions and the two core
sub-scores with the instrument's own scoring rules, runs the eight
pre-registered tests under two Holm families, and writes a Markdown report plus
a JSON file holding every number, including the SHA-256 of the input and of the
cohort extract. Fewer rows than the cohort size is an error unless
``--allow-partial`` is passed, in which case the report is labelled
« exploratoire ».

The script never reaches the network and never opens a database connection: it
takes a file and writes files. Run it with ``--dry-run`` to exercise the whole
pipeline on a synthetic dataset.

Usage:
    python3 analysis/confirmatory.py --input export.csv --out analysis/out
    python3 analysis/confirmatory.py --input export.csv --cohort-size 200
    python3 analysis/confirmatory.py --input partial.csv --allow-partial
    python3 analysis/confirmatory.py --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

import stats as st  # noqa: E402
from scoring import (  # noqa: E402
    calculate_all_dimensions,
    compute_core_subscores,
    parse_cell,
    score_item,
    social_desirability,
)
from scoring_maps import (  # noqa: E402
    AGE_CODES,
    CHARISMATIC,
    CLERGY_STATUSES,
    COMMUNITY_POSITION_CODES,
    DIMENSION_ITEM_SPECS,
    DIMENSION_KEYS,
    FORMAL_THEOLOGICAL_TRAINING,
    LAY_STATUSES,
    NON_CHARISMATIC,
    NO_FORMAL_THEOLOGICAL_TRAINING,
    THEO_ORIENTATION_CODES,
)

PRIMARY = "primaire"
SECONDARY = "secondaire"

SCORE_COLUMNS = list(DIMENSION_KEYS) + ["sacredBoundaryCore", "aiOpennessCore"]

# Pre-registered stopping rule (PREREGISTRATION 4.3): the confirmatory sample is
# the first COHORT_SIZE exploitable responses in order of submission.
COHORT_SIZE = 200
SUBMITTED_AT = "submittedAt"
STATUS_CONFIRMATORY = "confirmatoire"
STATUS_EXPLORATORY = "exploratoire"


# ---------------------------------------------------------------------------
# Loading
# ---------------------------------------------------------------------------


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_export(path: Path) -> pd.DataFrame:
    """The raw export, every cell kept as text."""
    return pd.read_csv(path, dtype=str, keep_default_na=False)


def parse_rows(frame: pd.DataFrame) -> list[dict[str, object]]:
    """One dict of typed answers per row."""
    return [
        {column: parse_cell(row[column]) for column in frame.columns}
        for _, row in frame.iterrows()
    ]


def load_answers(path: Path) -> list[dict[str, object]]:
    """One dict of typed answers per row of the export."""
    return parse_rows(read_export(path))


class CohortError(ValueError):
    """The export cannot yield the pre-registered cohort."""


def _parse_submitted_at(value: str, row_number: int) -> datetime:
    text = value.strip()
    if not text:
        raise CohortError(f"ligne {row_number} : `{SUBMITTED_AT}` vide")
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError as error:
        raise CohortError(
            f"ligne {row_number} : `{SUBMITTED_AT}` n'est pas une date ISO 8601 ({text!r})"
        ) from error
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


@dataclass
class Cohort:
    rows: pd.DataFrame
    requested: int
    available: int
    partial: bool
    first_submitted_at: str
    last_submitted_at: str

    @property
    def size(self) -> int:
        return int(self.rows.shape[0])

    @property
    def status(self) -> str:
        return STATUS_EXPLORATORY if self.partial else STATUS_CONFIRMATORY

    def as_dict(self) -> dict[str, object]:
        return {
            "rule": (
                f"{self.requested} premières réponses exploitables par ordre de "
                f"soumission (`{SUBMITTED_AT}` croissant)"
            ),
            "requested": self.requested,
            "size": self.size,
            "available": self.available,
            "partial": self.partial,
            "status": self.status,
            "firstSubmittedAt": self.first_submitted_at,
            "lastSubmittedAt": self.last_submitted_at,
        }


def select_cohort(frame: pd.DataFrame, cohort_size: int, allow_partial: bool = False) -> Cohort:
    """The first ``cohort_size`` rows by ``submittedAt``, ties kept in file order.

    Fewer rows than the cohort size is an error unless ``allow_partial`` is set,
    in which case the run is labelled exploratory: it is not the pre-registered
    test.
    """
    if cohort_size < 1:
        raise CohortError("la taille de cohorte doit être au moins 1")
    if SUBMITTED_AT not in frame.columns:
        raise CohortError(f"colonne `{SUBMITTED_AT}` absente de l'export (ISO 8601 requis)")
    stamps = [
        _parse_submitted_at(str(value), number)
        for number, value in enumerate(frame[SUBMITTED_AT].tolist(), start=2)
    ]
    order = sorted(range(len(stamps)), key=lambda index: (stamps[index], index))
    available = len(order)
    partial = available < cohort_size
    if partial and not allow_partial:
        raise CohortError(
            f"{available} ligne(s) dans l'export, {cohort_size} requises pour la "
            "cohorte confirmatoire ; passer --allow-partial pour une analyse exploratoire"
        )
    kept = order[:cohort_size]
    rows = frame.iloc[kept].reset_index(drop=True)
    first = stamps[kept[0]].isoformat() if kept else ""
    last = stamps[kept[-1]].isoformat() if kept else ""
    return Cohort(rows, cohort_size, available, partial, first, last)


def cohort_report_lines(cohort: dict[str, object], sha256: str, extract_file: str) -> list[str]:
    """The cohort block of the report header."""
    lines = [
        f"- Règle d'arrêt{NBSP}: {cohort['rule']}",
        f"- Extrait de la cohorte{NBSP}: `{extract_file}`",
        f"- SHA-256 de la cohorte{NBSP}: `{sha256}`",
        f"- Cohorte{NBSP}: {cohort['size']} ligne(s) retenue(s) sur {cohort['available']} "
        f"(taille demandée{NBSP}: {cohort['requested']})",
        f"- Première réponse de la cohorte ({SUBMITTED_AT}){NBSP}: {cohort['firstSubmittedAt']}",
        f"- Dernière réponse de la cohorte ({SUBMITTED_AT}){NBSP}: {cohort['lastSubmittedAt']}",
    ]
    if cohort["partial"]:
        lines.append(
            f"- **Statut{NBSP}: {STATUS_EXPLORATORY}.** Cohorte incomplète "
            f"({cohort['size']} < {cohort['requested']}){NNBSP}; ce rapport n'est pas le "
            "test préenregistré."
        )
    else:
        lines.append(f"- Statut{NBSP}: {STATUS_CONFIRMATORY}")
    return lines


def build_dataset(answer_rows: list[dict[str, object]]) -> pd.DataFrame:
    """Recompute every score and covariate needed by the eight tests."""
    records: list[dict[str, object]] = []

    for answers in answer_rows:
        dimensions = calculate_all_dimensions(answers)
        cores = compute_core_subscores(answers)
        desirability = social_desirability(answers)

        statut = answers.get("profil_statut")
        statut = statut if isinstance(statut, str) else ""
        training = answers.get("profil_formation_theologique")
        training = training if isinstance(training, str) else ""
        evangelical = answers.get("profil_confession_evangelique")
        evangelical = evangelical if isinstance(evangelical, str) else ""

        record: dict[str, object] = {
            "instrumentVersion": answers.get("instrumentVersion", ""),
            "entryVariant": answers.get("entryVariant", "") or "unknown",
            "mcFlag": desirability["flag"],
            "mcScore": desirability["score"],
            "ageCode": AGE_CODES.get(str(answers.get("profil_age", "")), None),
            "theoCode": THEO_ORIENTATION_CODES.get(str(answers.get("theo_orientation", "")), None),
            "communityCode": COMMUNITY_POSITION_CODES.get(
                str(answers.get("communaute_position_officielle", "")), None
            ),
            "statutGroup": (
                "clergy" if statut in CLERGY_STATUSES
                else "laity" if statut in LAY_STATUSES
                else None
            ),
            "charismaticGroup": (
                evangelical if evangelical in (CHARISMATIC, NON_CHARISMATIC) else None
            ),
            "trainingGroup": (
                "formal" if training in FORMAL_THEOLOGICAL_TRAINING
                else "none" if training in NO_FORMAL_THEOLOGICAL_TRAINING
                else None
            ),
            "aiFrequencyScore": score_item("ctrl_ia_frequence", answers),
        }

        for key in DIMENSION_KEYS:
            record[key] = dimensions[key]["value"]
            record[f"{key}__nItems"] = dimensions[key]["nItems"]
        for key in ("sacredBoundaryCore", "aiOpennessCore"):
            record[key] = cores[key]["value"]
            record[f"{key}__nItems"] = cores[key]["nItems"]

        # Item-level scores, for the reliability coefficients.
        for dimension, specs in DIMENSION_ITEM_SPECS.items():
            for spec in specs:
                record[f"item__{spec.item_id}"] = score_item(spec.item_id, answers)

        records.append(record)

    return pd.DataFrame(records)


# ---------------------------------------------------------------------------
# Hypotheses
# ---------------------------------------------------------------------------


@dataclass
class Pair:
    x: np.ndarray
    y: np.ndarray

    @property
    def n(self) -> int:
        return int(self.x.size)


def _complete_pair(frame: pd.DataFrame, x: str, y: str) -> Pair:
    subset = frame[[x, y]].dropna()
    return Pair(subset[x].to_numpy(dtype=float), subset[y].to_numpy(dtype=float))


def _spearman_hypothesis(
    frame: pd.DataFrame, hypothesis: str, label: str, x: str, y: str, family: str
) -> st.TestResult:
    pair = _complete_pair(frame, x, y)
    if pair.n < 3:
        return st.TestResult(
            hypothesis, label, "Spearman (ex æquo corrigés)", family, "bilatéral",
            pair.n, None, None, "rho", None, notes=["effectif insuffisant"]
        )

    rho, p_value, _ = st.spearman_test(pair.x, pair.y)
    ci = st.bootstrap_ci(
        lambda idx: st.spearman_rho(pair.x[idx], pair.y[idx]), pair.n
    )
    return st.TestResult(
        hypothesis, label, "Spearman (ex æquo corrigés)", family, "bilatéral",
        pair.n, rho, p_value, "rho", rho, ci
    )


def _mann_whitney_hypothesis(
    frame: pd.DataFrame,
    hypothesis: str,
    label: str,
    group_column: str,
    high_group: str,
    low_group: str,
    value_column: str,
    family: str,
    alternative: str,
) -> st.TestResult:
    subset = frame[[group_column, value_column]].dropna()
    high = subset.loc[subset[group_column] == high_group, value_column].to_numpy(dtype=float)
    low = subset.loc[subset[group_column] == low_group, value_column].to_numpy(dtype=float)

    alternative_label = "unilatéral" if alternative != "two-sided" else "bilatéral"
    if high.size < 3 or low.size < 3:
        return st.TestResult(
            hypothesis, label, "Mann-Whitney", family, alternative_label,
            int(high.size + low.size), None, None, "delta de Cliff", None,
            notes=["au moins un groupe sous trois observations"],
            extra={"nHigh": int(high.size), "nLow": int(low.size)},
        )

    statistic, p_value = st.mann_whitney(high, low, alternative=alternative)
    delta = st.cliffs_delta(high, low)

    stacked = np.concatenate([high, low])
    flags = np.concatenate([np.ones(high.size, dtype=bool), np.zeros(low.size, dtype=bool)])

    def estimator(idx: np.ndarray) -> float:
        a = stacked[idx][flags[idx]]
        b = stacked[idx][~flags[idx]]
        if a.size == 0 or b.size == 0:
            raise ValueError("degenerate resample")
        return st.cliffs_delta(a, b)

    ci = st.bootstrap_ci(estimator, int(stacked.size))
    return st.TestResult(
        hypothesis, label, "Mann-Whitney", family, alternative_label,
        int(stacked.size), statistic, p_value, "delta de Cliff", delta, ci,
        extra={"nHigh": int(high.size), "nLow": int(low.size)},
    )


def _jonckheere_hypothesis(
    frame: pd.DataFrame,
    hypothesis: str,
    label: str,
    code_column: str,
    value_column: str,
    family: str,
    permutations: int,
) -> st.TestResult:
    subset = frame[[code_column, value_column]].dropna()
    codes = subset[code_column].to_numpy(dtype=int)
    values = subset[value_column].to_numpy(dtype=float)

    if values.size < 6 or np.unique(codes).size < 2:
        return st.TestResult(
            hypothesis, label, "Jonckheere-Terpstra (permutation)", family, "bilatéral",
            int(values.size), None, None, "tau-b de Kendall", None,
            notes=["effectif ou nombre de niveaux insuffisant"],
        )

    statistic, p_value, n = st.jonckheere_terpstra(values, codes, permutations=permutations)
    tau = st.kendall_tau_b(codes, values)
    ci = st.bootstrap_ci(lambda idx: st.kendall_tau_b(codes[idx], values[idx]), n)

    sizes = {int(level): int(np.sum(codes == level)) for level in np.unique(codes)}
    return st.TestResult(
        hypothesis, label, "Jonckheere-Terpstra (permutation)", family, "bilatéral",
        n, statistic, p_value, "tau-b de Kendall", tau, ci,
        extra={f"n_niveau_{k}": v for k, v in sizes.items()},
    )


def run_hypotheses(frame: pd.DataFrame, permutations: int) -> list[st.TestResult]:
    results: list[st.TestResult] = []

    results.append(
        _spearman_hypothesis(
            frame, "H1", "Religiosité × frontière sacrée (noyau)",
            "religiosity", "sacredBoundaryCore", PRIMARY,
        )
    )

    results.append(
        _mann_whitney_hypothesis(
            frame, "H2",
            "Ouverture à l’IA (noyau) : charismatiques vs non-charismatiques",
            "charismaticGroup", CHARISMATIC, NON_CHARISMATIC, "aiOpennessCore",
            SECONDARY, alternative="two-sided",
        )
    )

    results.append(_h3_regression(frame))

    results.append(
        _jonckheere_hypothesis(
            frame, "H4",
            "Orientation théologique ordonnée × frontière sacrée (noyau)",
            "theoCode", "sacredBoundaryCore", SECONDARY, permutations,
        )
    )

    results.append(
        _mann_whitney_hypothesis(
            frame, "H5", "Frontière sacrée (noyau) : clergé vs laïcs",
            "statutGroup", "clergy", "laity", "sacredBoundaryCore",
            SECONDARY, alternative="two-sided",
        )
    )

    results.append(
        _jonckheere_hypothesis(
            frame, "H6",
            "Position officielle de la communauté (oui_*) × ouverture à l’IA (noyau)",
            "communityCode", "aiOpennessCore", SECONDARY, permutations,
        )
    )

    results.append(_h7_dispersion(frame))

    results.append(
        _spearman_hypothesis(
            frame, "H8", "Fréquence d’usage de l’IA × préoccupation éthique",
            "aiFrequencyScore", "ethicalConcern", PRIMARY,
        )
    )

    return results


def _h3_regression(frame: pd.DataFrame) -> st.TestResult:
    label = "Ouverture à l’IA (noyau) ~ âge + religiosité, coefficient d’âge"
    subset = frame[["aiOpennessCore", "ageCode", "religiosity"]].dropna()
    n = int(subset.shape[0])
    if n < 10:
        return st.TestResult(
            "H3", label, "Régression MCO (test du coefficient)", SECONDARY, "bilatéral",
            n, None, None, "beta (âge)", None, notes=["effectif insuffisant"]
        )

    y = subset["aiOpennessCore"].to_numpy(dtype=float)
    age = subset["ageCode"].to_numpy(dtype=float)
    religiosity = subset["religiosity"].to_numpy(dtype=float)

    fit = st.ols(y, {"age": age, "religiosity": religiosity})
    beta, p_value, _ = fit.coefficient("age")

    def estimator(idx: np.ndarray) -> float:
        resample = st.ols(y[idx], {"age": age[idx], "religiosity": religiosity[idx]})
        return resample.coefficient("age")[0]

    ci = st.bootstrap_ci(estimator, n)
    # The standardised coefficient is beta scaled by the SD ratio; it is only
    # there to read the effect against the thresholds of the plan (section 4.4),
    # the confirmatory statistic and its interval stay unstandardised.
    sd_age = float(np.std(age, ddof=1))
    sd_y = float(np.std(y, ddof=1))
    beta_standardised = beta * sd_age / sd_y if sd_y > 0 else float("nan")
    return st.TestResult(
        "H3", label, "Régression MCO (test du coefficient)", SECONDARY, "bilatéral",
        n, beta, p_value, "beta (âge)", beta, ci,
        extra={
            "betaAgeStandardised": beta_standardised,
            "betaReligiosity": fit.coefficients[fit.names.index("religiosity")],
            "pReligiosity": fit.p_values[fit.names.index("religiosity")],
            "rSquared": fit.r_squared,
        },
    )


def _h7_dispersion(frame: pd.DataFrame) -> st.TestResult:
    label = "Dispersion de la préoccupation éthique : formation théologique formelle vs sans"
    subset = frame[["trainingGroup", "ethicalConcern"]].dropna()
    trained = subset.loc[subset["trainingGroup"] == "formal", "ethicalConcern"].to_numpy(float)
    untrained = subset.loc[subset["trainingGroup"] == "none", "ethicalConcern"].to_numpy(float)

    if trained.size < 3 or untrained.size < 3:
        return st.TestResult(
            "H7", label, "Brown-Forsythe (deux groupes)", SECONDARY, "unilatéral",
            int(trained.size + untrained.size), None, None,
            "rapport des écarts absolus moyens", None,
            notes=["au moins un groupe sous trois observations"],
        )

    statistic, p_value = st.brown_forsythe_one_sided(trained, untrained)
    ratio = st.mad_ratio(trained, untrained)

    stacked = np.concatenate([trained, untrained])
    flags = np.concatenate([np.ones(trained.size, bool), np.zeros(untrained.size, bool)])

    def estimator(idx: np.ndarray) -> float:
        a = stacked[idx][flags[idx]]
        b = stacked[idx][~flags[idx]]
        if a.size < 2 or b.size < 2:
            raise ValueError("degenerate resample")
        return st.mad_ratio(a, b)

    ci = st.bootstrap_ci(estimator, int(stacked.size))
    return st.TestResult(
        "H7", label, "Brown-Forsythe (deux groupes)", SECONDARY, "unilatéral",
        int(stacked.size), statistic, p_value,
        "rapport des écarts absolus moyens", ratio, ci,
        extra={"nFormel": int(trained.size), "nSansFormation": int(untrained.size)},
    )


def apply_holm(results: list[st.TestResult]) -> None:
    """Holm inside each family; nothing is corrected across families.

    A hypothesis declared non-testable (sample below the coded threshold) has
    no p-value: it is reported without one and leaves its family before Holm,
    which shrinks m. The report records this on the hypothesis itself.
    """
    for family in (PRIMARY, SECONDARY):
        family_members = [r for r in results if r.family == family]
        members = [r for r in family_members if r.p_value is not None]
        adjusted = st.holm([r.p_value for r in members])  # type: ignore[misc]
        for result, value in zip(members, adjusted):
            result.p_holm = value
        for result in family_members:
            if result.p_value is None:
                result.notes.append(
                    "non testable : rapportée sans valeur p et retirée de la famille "
                    f"{family} avant Holm (m = {len(members)})"
                )


# ---------------------------------------------------------------------------
# Reliability and description
# ---------------------------------------------------------------------------


# An item answered by fewer than this share of respondents is dropped before the
# reliability coefficients are computed. Without it, a dimension mixing
# clergy-only and laity-only items has zero listwise-complete rows, and alpha is
# reported on nobody (SCORING_V2_SPEC: the routing is by design, not attrition).
MIN_ITEM_COVERAGE = 0.5


def reliability(frame: pd.DataFrame) -> dict[str, dict[str, object]]:
    """Cronbach alpha and approximated ordinal omega per composite."""
    out: dict[str, dict[str, object]] = {}

    composites: list[tuple[str, list[str]]] = [
        (key, [spec.item_id for spec in DIMENSION_ITEM_SPECS[key]]) for key in DIMENSION_KEYS
    ]
    composites.append(
        ("sacredBoundaryCore",
         [s.item_id for s in DIMENSION_ITEM_SPECS["sacredBoundary"] if s.core])
    )
    composites.append(
        ("aiOpennessCore",
         [s.item_id for s in DIMENSION_ITEM_SPECS["aiOpenness"] if s.core])
    )

    rows = max(int(frame.shape[0]), 1)
    for name, items in composites:
        columns = [f"item__{item}" for item in items if f"item__{item}" in frame.columns]
        coverage = {c: float(frame[c].notna().sum()) / rows for c in columns}
        kept = [c for c in columns if coverage[c] >= MIN_ITEM_COVERAGE]
        dropped = [c.removeprefix("item__") for c in columns if c not in kept]

        matrix = frame[kept].dropna() if kept else frame[[]]
        values = matrix.to_numpy(dtype=float)
        usable = values.size > 0 and values.shape[1] >= 2
        out[name] = {
            "items": [c.removeprefix("item__") for c in matrix.columns],
            "itemsDroppedForCoverage": dropped,
            "nComplete": int(values.shape[0]) if usable else 0,
            "alpha": st.cronbach_alpha(values) if usable else None,
            "omegaOrdinalApprox": st.ordinal_omega(values) if usable else None,
        }
    return out


def describe(frame: pd.DataFrame) -> dict[str, object]:
    summary: dict[str, object] = {
        "n": int(frame.shape[0]),
        "byEntryVariant": frame["entryVariant"].value_counts().to_dict(),
        "socialDesirabilityFlagged": int(frame["mcFlag"].sum()),
        "scores": {},
    }
    scores: dict[str, object] = {}
    for column in SCORE_COLUMNS:
        series = frame[column].dropna()
        scores[column] = {
            "n": int(series.size),
            "mean": float(series.mean()) if series.size else None,
            "sd": float(series.std(ddof=1)) if series.size > 1 else None,
            "median": float(series.median()) if series.size else None,
        }
    summary["scores"] = scores
    return summary


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

NBSP = " "
NNBSP = " "
NOT_AVAILABLE = f"n.{NBSP}d."


def _fmt(value: float | None, decimals: int = 3) -> str:
    if value is None or (isinstance(value, float) and not np.isfinite(value)):
        return NOT_AVAILABLE
    return f"{value:.{decimals}f}".replace(".", ",")


def _fmt_p(value: float | None) -> str:
    if value is None or (isinstance(value, float) and not np.isfinite(value)):
        return NOT_AVAILABLE
    if value < 0.001:
        return "< 0,001"
    return f"{value:.4f}".replace(".", ",")


# Extras whose value is a probability, so it gets the p-value formatting.
PROBABILITY_EXTRAS = frozenset({"pReligiosity"})


def _fmt_extra(key: str, value: object) -> str:
    if key in PROBABILITY_EXTRAS and isinstance(value, float):
        return _fmt_p(value)
    return _fmt(value) if isinstance(value, float) else str(value)


def _fmt_ci(ci: tuple[float | None, float | None]) -> str:
    low, high = ci
    if low is None or high is None:
        return NOT_AVAILABLE
    return f"[{_fmt(low)}{NNBSP};{NBSP}{_fmt(high)}]"


def results_table(results: list[st.TestResult]) -> str:
    lines = [
        f"| Hypothèse | Test | Famille | n | Statistique | p | p Holm | Taille d’effet | IC 95{NNBSP}% |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for r in results:
        lines.append(
            f"| {r.hypothesis} | {r.test} ({r.alternative}) | {r.family} | {r.n} | "
            f"{_fmt(r.statistic)} | {_fmt_p(r.p_value)} | {_fmt_p(r.p_holm)} | "
            f"{r.effect_name}{NBSP}= {_fmt(r.effect)} | {_fmt_ci(r.effect_ci)} |"
        )
    return "\n".join(lines)


def build_report(payload: dict[str, object]) -> str:
    main = payload["main"]
    assert isinstance(main, dict)
    results: list[st.TestResult] = main["_objects"]  # type: ignore[assignment]
    description = main["description"]
    assert isinstance(description, dict)

    parts: list[str] = []
    cohort = payload["cohort"]
    assert isinstance(cohort, dict)
    title = "# Analyse confirmatoire, IA et foi"
    if cohort["partial"]:
        title = "# Analyse exploratoire (cohorte incomplète), IA et foi"
    parts.append(title)
    parts.append("")
    parts.append(f"- Exécutée le{NBSP}: {payload['generatedAt']}")
    parts.append(f"- Fichier analysé{NBSP}: `{payload['inputFile']}`")
    parts.append(f"- SHA-256 de l’export{NBSP}: `{payload['inputSha256']}`")
    parts.extend(
        cohort_report_lines(cohort, str(payload["cohortSha256"]), str(payload["cohortFile"]))
    )
    parts.append(f"- Graine{NBSP}: {payload['seed']}")
    parts.append(f"- Permutations (Jonckheere-Terpstra){NBSP}: {payload['permutations']}")
    parts.append(f"- Tirages bootstrap{NBSP}: {payload['bootstrapDraws']}")
    parts.append(f"- Réponses exploitables analysées{NBSP}: {description['n']}")
    parts.append("")
    parts.append(
        "Les huit tests sont corrigés par Holm à l’intérieur de deux familles, "
        "sans correction entre elles : famille primaire {H1, H8}, famille "
        "secondaire {H2, H3, H4, H5, H6, H7}. Toutes les statistiques sont "
        "bilatérales et la direction est lue sur le signe, sauf H7, unilatérale. "
        "Une hypothèse non testable (effectif sous le seuil codé) est rapportée "
        "sans valeur p et retirée de sa famille avant Holm ; sa réserve le dit."
    )
    parts.append("")
    parts.append("## 1. Résultats des tests préenregistrés")
    parts.append("")
    parts.append(results_table(results))
    parts.append("")
    for r in results:
        parts.append(f"**{r.hypothesis}**{NBSP}: {r.label}")
        if r.notes:
            parts.append(f"  - Réserves{NBSP}: {' ; '.join(r.notes)}")
        if r.extra:
            detail = ", ".join(f"{key}{NBSP}= {_fmt_extra(key, value)}" for key, value in r.extra.items())
            parts.append(f"  - Détail{NBSP}: {detail}")
    parts.append("")

    parts.append("## 2. Statistiques descriptives")
    parts.append("")
    parts.append("| Score | n | Moyenne | Écart-type | Médiane |")
    parts.append("| --- | --- | --- | --- | --- |")
    scores = description["scores"]
    assert isinstance(scores, dict)
    for name, values in scores.items():
        parts.append(
            f"| {name} | {values['n']} | {_fmt(values['mean'], 2)} | "
            f"{_fmt(values['sd'], 2)} | {_fmt(values['median'], 2)} |"
        )
    parts.append("")
    parts.append(
        f"Répondants dont le drapeau de désirabilité sociale est levé{NBSP}: "
        f"{description['socialDesirabilityFlagged']}. "
        f"Répartition par porte d’entrée{NBSP}: {description['byEntryVariant']}."
    )
    parts.append("")

    parts.append("## 3. Fidélité des composites")
    parts.append("")
    parts.append(
        "L’omega ordinal est approximé : les saturations sont extraites d’une "
        "solution à un facteur sur la matrice de corrélations de Spearman, "
        "substituée à la matrice polychorique. La valeur est donc indicative et "
        "porte la mention « approx. » partout où elle apparaît."
    )
    parts.append("")
    parts.append(
        "Un item posé à moins de la moitié des répondants (bloc ministère ou "
        "bloc laïc) est retiré avant le calcul : sans cela, une dimension qui "
        "mélange les deux blocs n’a aucune ligne complète et son alpha porterait "
        "sur personne. Les items retirés sont listés."
    )
    parts.append("")
    parts.append("| Composite | Items retenus | Items retirés | n | Alpha de Cronbach | Omega ordinal (approx.) |")
    parts.append("| --- | --- | --- | --- | --- | --- |")
    reliabilities = main["reliability"]
    assert isinstance(reliabilities, dict)
    for name, values in reliabilities.items():
        dropped = ", ".join(values["itemsDroppedForCoverage"]) or "aucun"
        parts.append(
            f"| {name} | {len(values['items'])} | {dropped} | {values['nComplete']} | "
            f"{_fmt(values['alpha'])} | {_fmt(values['omegaOrdinalApprox'])} |"
        )
    parts.append("")

    parts.append("## 4. Analyses de sensibilité")
    parts.append("")
    sensitivity = payload["sensitivity"]
    assert isinstance(sensitivity, dict)
    for name, block in sensitivity.items():
        assert isinstance(block, dict)
        parts.append(f"### {name}")
        parts.append("")
        parts.append(f"n{NBSP}= {block['n']}")
        parts.append("")
        parts.append(results_table(block["_objects"]))  # type: ignore[arg-type]
        parts.append("")

    parts.append("## 5. Limites inscrites au plan")
    parts.append("")
    parts.append(
        "- Les tests supposent l’indépendance des observations ; le recrutement "
        "en boule de neige et par une organisation la viole d’une ampleur non "
        "mesurable. Les intervalles sont à lire comme des bornes optimistes."
    )
    parts.append(
        "- Les scores complets `sacredBoundary` et `aiOpenness` ne sont pas "
        "invariants entre clergé et laïcs ; les hypothèses portent donc sur les "
        "sous-scores de noyau."
    )
    parts.append(
        "- H6 ne porte que sur les répondants déclarant une position officielle "
        "(`oui_*`) : l’effectif utile est indiqué dans le tableau."
    )
    parts.append("")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------


def analyse(frame: pd.DataFrame, permutations: int) -> dict[str, object]:
    results = run_hypotheses(frame, permutations)
    apply_holm(results)
    return {
        "_objects": results,
        "tests": [r.as_dict() for r in results],
        "description": describe(frame),
        "reliability": reliability(frame),
    }


def run(
    input_path: Path,
    out_dir: Path,
    permutations: int,
    cohort_size: int = COHORT_SIZE,
    allow_partial: bool = False,
) -> dict[str, object]:
    export = read_export(input_path)
    cohort = select_cohort(export, cohort_size, allow_partial)

    out_dir.mkdir(parents=True, exist_ok=True)
    cohort_path = out_dir / "cohort_extract.csv"
    cohort.rows.to_csv(cohort_path, index=False, lineterminator="\n")

    answer_rows = parse_rows(cohort.rows)
    frame = build_dataset(answer_rows)

    non_v2 = int((~frame["instrumentVersion"].astype(str).str.startswith("2.")).sum())
    main = analyse(frame, permutations)

    sensitivity: dict[str, object] = {}
    unflagged = frame.loc[~frame["mcFlag"].astype(bool)]
    block = analyse(unflagged, permutations)
    block["n"] = int(unflagged.shape[0])
    sensitivity["Hors répondants dont le drapeau de désirabilité sociale est levé"] = block

    # The eight tests are re-run separately inside each entry channel holding
    # at least 20 exploitable responses; no stratified statistic is computed.
    for variant, subset in frame.groupby("entryVariant"):
        if subset.shape[0] < 20:
            continue
        block = analyse(subset, permutations)
        block["n"] = int(subset.shape[0])
        sensitivity[f"Canal d’entrée : {variant}"] = block

    payload: dict[str, object] = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "inputFile": str(input_path),
        "inputSha256": sha256_of(input_path),
        "cohortFile": str(cohort_path),
        "cohortSha256": sha256_of(cohort_path),
        "cohort": cohort.as_dict(),
        "status": cohort.status,
        "seed": st.SEED,
        "permutations": permutations,
        "bootstrapDraws": st.BOOTSTRAP_DRAWS,
        "rowsRead": int(export.shape[0]),
        "rowsAnalysed": len(answer_rows),
        "rowsNotV2": non_v2,
        "main": main,
        "sensitivity": sensitivity,
    }

    report = build_report(payload)
    (out_dir / "confirmatory_report.md").write_text(report, encoding="utf-8")

    serialisable = json.loads(
        json.dumps(payload, default=_json_default, ensure_ascii=False)
    )
    _strip_objects(serialisable)
    (out_dir / "confirmatory_results.json").write_text(
        json.dumps(serialisable, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return payload


def _json_default(value: object) -> object:
    if isinstance(value, st.TestResult):
        return value.as_dict()
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, (np.bool_,)):
        return bool(value)
    raise TypeError(f"not serialisable: {type(value)!r}")


def _strip_objects(node: object) -> None:
    if isinstance(node, dict):
        node.pop("_objects", None)
        for value in node.values():
            _strip_objects(value)
    elif isinstance(node, list):
        for value in node:
            _strip_objects(value)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", type=Path, help="CSV export of exploitable v2 responses")
    parser.add_argument("--out", type=Path, default=Path(__file__).resolve().parent / "out")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="generate a synthetic dataset and run the full pipeline on it",
    )
    parser.add_argument("--dry-run-n", type=int, default=260, help="synthetic sample size")
    parser.add_argument(
        "--cohort-size",
        type=int,
        default=COHORT_SIZE,
        help=(
            "confirmatory cohort: the first N rows by submittedAt "
            f"(the pre-registered value is {COHORT_SIZE})"
        ),
    )
    parser.add_argument(
        "--allow-partial",
        action="store_true",
        help="run on fewer rows than the cohort size; the report is then labelled exploratoire",
    )
    parser.add_argument(
        "--permutations",
        type=int,
        default=st.PERMUTATIONS,
        help="Jonckheere-Terpstra permutations (the pre-registered value is 10000)",
    )
    args = parser.parse_args(argv)

    out_dir: Path = args.out

    if args.dry_run:
        from synthetic import generate

        out_dir.mkdir(parents=True, exist_ok=True)
        input_path = out_dir / "synthetic_export.csv"
        generate(args.dry_run_n).to_csv(input_path, index=False)
        print(f"[dry-run] jeu synthétique écrit dans {input_path}")
    elif args.input is not None:
        input_path = args.input
        if not input_path.exists():
            parser.error(f"input file not found: {input_path}")
    else:
        parser.error("either --input or --dry-run is required")

    try:
        payload = run(input_path, out_dir, args.permutations, args.cohort_size, args.allow_partial)
    except CohortError as error:
        parser.error(str(error))

    main_block = payload["main"]
    assert isinstance(main_block, dict)
    results: list[st.TestResult] = main_block["_objects"]  # type: ignore[assignment]
    cohort = payload["cohort"]
    assert isinstance(cohort, dict)

    print(f"Lignes lues : {payload['rowsRead']} ; cohorte : {cohort['size']} (hors v2 : {payload['rowsNotV2']})")
    print(f"Statut : {payload['status']}")
    print(f"SHA-256 de l'export : {payload['inputSha256']}")
    print(f"SHA-256 de la cohorte : {payload['cohortSha256']}")
    print(f"Cohorte du {cohort['firstSubmittedAt']} au {cohort['lastSubmittedAt']}")
    for r in results:
        print(
            f"  {r.hypothesis}: n={r.n} p={_fmt_p(r.p_value)} "
            f"p_holm={_fmt_p(r.p_holm)} {r.effect_name}={_fmt(r.effect)} "
            f"IC95={_fmt_ci(r.effect_ci)}"
        )
    print(f"Rapport : {out_dir / 'confirmatory_report.md'}")
    print(f"JSON    : {out_dir / 'confirmatory_results.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
