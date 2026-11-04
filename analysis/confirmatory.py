#!/usr/bin/env python3
"""Confirmatory analysis for the pre-registered hypotheses H1 to H8.

Reads the dedicated CSV export, refuses it if a column the plan depends on is
missing, keeps the exploitable responses and forms two cohorts (addendum 1): the
first ``--cohort-size`` responses given with the frozen instrument, for H1, H3,
H4, H5 and H7, and the first ``--cohort-size`` responses of every entry point,
for H2, H6 and H8. Without any CNEF response the two are the same rows. It then
recomputes the seven dimensions and the two core sub-scores with the
instrument's own scoring rules, runs the eight pre-registered tests under two
Holm families, and writes a Markdown report plus a JSON file holding every
number, including the SHA-256 of the input and of the cohort extract. Fewer rows
than the cohort size is an error unless ``--allow-partial`` is passed, in which
case the report is labelled « exploratoire ».

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
from power_h7 import power as h7_power  # noqa: E402
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
STATUS_DEADLINE = "confirmatoire, date butoir"

# Deadline of the tests (addendum 1, set on 5 November 2026): they run at the
# latest on 31 March 2027, on the exploitable responses recorded before
# 1 April 2027 at 00:00 in Paris (summer time, UTC+2).
DEADLINE = datetime(2027, 3, 31, 22, 0, tzinfo=timezone.utc)

# CNEF version of the questionnaire (addendum 1, docs/PREREGISTRATION_ADDENDUM_1.md).
# Its responses enter the common tests only through the variables left
# unchanged on /cnef (H2, H6, H8). The variables below were reworded, recoded or
# not asked there: they are blanked, so every test that uses them drops these
# rows, and the social desirability flag is not assessed.
CNEF_WORDING_VERSION = "cnef-2026-10"
KNOWN_WORDING_VARIANTS = frozenset({"", CNEF_WORDING_VERSION})
# Tests whose variables stayed comparable on /cnef: they read the cohort of every
# entry point. The others read the cohort of the frozen instrument.
COMMON_TESTS = frozenset({"H2", "H6", "H8"})
# Without these columns the exclusions and the CNEF rule would silently not apply.
REQUIRED_COLUMNS = (
    SUBMITTED_AT,
    "instrumentVersion",
    "entryVariant",
    "wordingVariant",
    "consentGiven",
    "screenedOut",
)
CNEF_NOT_COMPARABLE = (
    "religiosity",
    "sacredBoundary",
    "sacredBoundaryCore",
    "trainingGroup",
    "theoCode",
    "item__crs_intellect",
    "item__crs_ideology",
    "item__crs_public_practice",
    "item__crs_private_practice",
    "item__crs_experience",
    "item__theo_inspiration",
)


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


def check_export(frame: pd.DataFrame) -> None:
    """Refuse an export the plan cannot be applied to."""
    missing = [column for column in REQUIRED_COLUMNS if column not in frame.columns]
    if missing:
        raise CohortError(
            f"colonne(s) absente(s) de l'export : {', '.join(missing)} "
            "(utiliser l'export dédié, /api/results/export?format=csv)"
        )
    unknown = sorted(set(frame["wordingVariant"]) - KNOWN_WORDING_VARIANTS)
    if unknown:
        raise CohortError(f"`wordingVariant` inconnu : {', '.join(unknown)} (addendum requis)")


def exploitable_rows(frame: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, int]]:
    """The exploitable responses (PREREGISTRATION 4.3), and what was set aside."""
    no_consent = frame["consentGiven"] != "true"
    screened = (frame["screenedOut"] == "true") | (
        frame.get("profil_confession", pd.Series("", index=frame.index)) == "sans_religion"
    )
    not_v2 = ~frame["instrumentVersion"].str.startswith("2.")
    excluded = {
        "sansConsentement": int(no_consent.sum()),
        "ecartees": int((screened & ~no_consent).sum()),
        "horsV2": int((not_v2 & ~screened & ~no_consent).sum()),
    }
    return frame.loc[~(no_consent | screened | not_v2)].reset_index(drop=True), excluded


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
    at_deadline: bool = False

    @property
    def size(self) -> int:
        return int(self.rows.shape[0])

    @property
    def status(self) -> str:
        if not self.partial:
            return STATUS_CONFIRMATORY
        return STATUS_DEADLINE if self.at_deadline else STATUS_EXPLORATORY

    def as_dict(self) -> dict[str, object]:
        return {
            "rule": (
                f"{self.requested} premières réponses exploitables par ordre de "
                f"soumission (`{SUBMITTED_AT}` croissant), enregistrées avant la date "
                "butoir du 31 mars 2027"
            ),
            "requested": self.requested,
            "size": self.size,
            "available": self.available,
            "partial": self.partial,
            "atDeadline": self.at_deadline,
            "status": self.status,
            "firstSubmittedAt": self.first_submitted_at,
            "lastSubmittedAt": self.last_submitted_at,
        }


def select_cohort(
    frame: pd.DataFrame, cohort_size: int, allow_partial: bool = False, at_deadline: bool = False
) -> Cohort:
    """The first ``cohort_size`` rows by ``submittedAt``, ties kept in file order.

    Fewer rows than the cohort size is an error, except after the deadline,
    where the run stays confirmatory and every test reports its power, or with
    ``allow_partial``, where the run is labelled exploratory: it is not the
    pre-registered test.
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
    if partial and not (allow_partial or at_deadline):
        raise CohortError(
            f"{available} ligne(s) dans l'export, {cohort_size} requises pour la "
            "cohorte confirmatoire ; passer --allow-partial pour une analyse exploratoire"
        )
    kept = order[:cohort_size]
    rows = frame.iloc[kept].reset_index(drop=True)
    first = stamps[kept[0]].isoformat() if kept else ""
    last = stamps[kept[-1]].isoformat() if kept else ""
    return Cohort(rows, cohort_size, available, partial, first, last, partial and at_deadline)


def cohort_report_lines(
    cohort: dict[str, object], sha256: str, extract_file: str, name: str = "Cohorte"
) -> list[str]:
    """The cohort block of the report header."""
    lines = [
        f"- {name}, règle d'arrêt{NBSP}: {cohort['rule']}",
        f"- Extrait de la cohorte{NBSP}: `{extract_file}`",
        f"- SHA-256 de la cohorte{NBSP}: `{sha256}`",
        f"- Cohorte{NBSP}: {cohort['size']} ligne(s) retenue(s) sur {cohort['available']} "
        f"(taille demandée{NBSP}: {cohort['requested']})",
        f"- Première réponse de la cohorte ({SUBMITTED_AT}){NBSP}: {cohort['firstSubmittedAt']}",
        f"- Dernière réponse de la cohorte ({SUBMITTED_AT}){NBSP}: {cohort['lastSubmittedAt']}",
    ]
    if cohort["status"] == STATUS_DEADLINE:
        lines.append(
            f"- **Statut{NBSP}: {STATUS_DEADLINE}.** Cohorte incomplète "
            f"({cohort['size']} < {cohort['requested']}) à la date butoir du 31 mars 2027{NNBSP}; "
            "chaque test est rapporté avec sa puissance à l'effectif atteint."
        )
    elif cohort["partial"]:
        lines.append(
            f"- **Statut{NBSP}: {STATUS_EXPLORATORY}.** Cohorte incomplète "
            f"({cohort['size']} < {cohort['requested']}){NNBSP}; ce rapport n'est pas le "
            "test préenregistré."
        )
    else:
        lines.append(f"- Statut{NBSP}: {STATUS_CONFIRMATORY}")
    return lines


def build_dataset(
    answer_rows: list[dict[str, object]], blank_cnef: bool = True
) -> pd.DataFrame:
    """Recompute every score and covariate needed by the eight tests.

    ``blank_cnef=False`` keeps the adapted CNEF variables: exploratory use only.
    """
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

        wording = str(answers.get("wordingVariant", "") or "")
        record["wordingVariant"] = wording
        record["mcAssessed"] = wording != CNEF_WORDING_VERSION
        if blank_cnef and wording == CNEF_WORDING_VERSION:
            for key in CNEF_NOT_COMPARABLE:
                record[key] = None

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
    which shrinks m. The report records this on the hypothesis itself. A test
    that returns NaN (a constant variable) is non-testable too.
    """
    for result in results:
        if result.p_value is not None and not np.isfinite(result.p_value):
            result.p_value = None
            result.notes.append("variable constante : aucune valeur p")
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


# Announced direction of each effect (PREREGISTRATION 2.2): the sign of the
# reported effect size. H4: orientation is coded traditionaliste = 1, so a
# stricter boundary among conservatives gives a negative tau. H7 is one-sided, on
# a ratio that must fall below 1.
EXPECTED_SIGN = {"H1": 1, "H2": 1, "H3": -1, "H4": -1, "H5": 1, "H6": 1, "H8": -1}
ALPHA = 0.05

SUPPORTED = "soutenue"
REFUTED = "infirmée"
NOT_SIGNIFICANT = "non significatif"
NOT_TESTABLE = "non testable"


TARGET_POWER = 0.80


def attained_power(result: st.TestResult) -> float | None:
    """Power at the attained n for the expected effect of section 4.4, never the observed one."""
    extra = result.extra
    hypothesis = result.hypothesis
    if hypothesis in ("H1", "H6"):
        return st.power_correlation(0.30, result.n)
    if hypothesis == "H8":
        return st.power_correlation(0.25, result.n)
    if hypothesis in ("H2", "H5"):
        return st.power_two_groups(0.50, float(extra.get("nHigh", 0)), float(extra.get("nLow", 0)))
    if hypothesis == "H3":
        return st.power_regression_coefficient(0.15, result.n)
    if hypothesis == "H4":
        sizes = [float(v) for k, v in extra.items() if k.startswith("n_niveau_")]
        return st.power_anova(0.25, sizes)
    if hypothesis == "H7":
        trained, untrained = int(extra.get("nFormel", 0)), int(extra.get("nSansFormation", 0))
        return h7_power(trained, untrained) if min(trained, untrained) >= 3 else None
    return None


def apply_power(results: list[st.TestResult]) -> None:
    """Report every test with its power; below 0.80 it is reported as under-powered (section 4.4)."""
    for result in results:
        result.power = attained_power(result)
        if result.power is not None and result.power < TARGET_POWER:
            result.notes.append(
                f"sous-puissante : puissance de {_fmt(result.power, 2)} à l'effectif atteint, "
                "pour l'effet attendu (section 4.4)"
            )


def decision(result: st.TestResult) -> str:
    """The decision rule of PREREGISTRATION 6.1, on the adjusted p-value."""
    if result.p_value is None or result.p_holm is None:
        return NOT_TESTABLE
    if result.p_holm >= ALPHA:
        return NOT_SIGNIFICANT
    if result.hypothesis == "H7":
        expected = result.effect is not None and result.effect < 1
    else:
        expected = result.effect is not None and result.effect * EXPECTED_SIGN[result.hypothesis] > 0
    return SUPPORTED if expected else REFUTED


def sensitivity_comparison(
    full: list[st.TestResult], reduced: list[st.TestResult], excluded: int
) -> dict[str, object]:
    """Both estimates side by side, and the substantial-gap rule of 6.6."""
    rows: list[dict[str, object]] = []
    for with_all, without in zip(full, reduced):
        low, high = with_all.effect_ci
        outside = (
            without.effect is not None and low is not None and high is not None
            and not low <= without.effect <= high
        )
        changed = decision(with_all) != decision(without)
        rows.append({
            "hypothesis": with_all.hypothesis,
            "effectName": with_all.effect_name,
            "effect": with_all.effect,
            "ci": with_all.effect_ci,
            "decision": decision(with_all),
            "nWithout": without.n,
            "effectWithout": without.effect,
            "ciWithout": without.effect_ci,
            "decisionWithout": decision(without),
            "substantial": changed or outside,
        })
    return {"excluded": excluded, "rows": rows}


# Composite(s) of each test and the variable it is read against.
TEST_COMPOSITES = {
    "H1": (("religiosity", "sacredBoundaryCore"), ("sacredBoundaryCore", "religiosity")),
    "H2": (("aiOpennessCore", "charismaticGroup"),),
    "H3": (("aiOpennessCore", "ageCode"),),
    "H4": (("sacredBoundaryCore", "theoCode"),),
    "H5": (("sacredBoundaryCore", "statutGroup"),),
    "H6": (("aiOpennessCore", "communityCode"),),
    "H7": (("ethicalConcern", "trainingGroup"),),
    "H8": (("ethicalConcern", "aiFrequencyScore"),),
}
GROUP_CODES = {
    CHARISMATIC: 1.0, NON_CHARISMATIC: 0.0, "clergy": 1.0, "laity": 0.0, "formal": 1.0, "none": 0.0,
}
MIN_OMEGA = 0.60
# H8 reads frequency of use against a composite holding a perceived-usefulness
# item: its item-level table is always published, as description.
ALWAYS_ITEMISED = frozenset({"H8"})


def _item_correlations(
    frame: pd.DataFrame, items: list[str], other: str
) -> list[dict[str, object]]:
    series = frame[other].map(lambda value: GROUP_CODES.get(value, value))
    rows: list[dict[str, object]] = []
    for item in items:
        pair = pd.DataFrame(
            {"item": frame[f"item__{item}"], "other": series}
        ).dropna().astype(float)
        rho = None
        if pair.shape[0] >= 3 and pair["item"].nunique() > 1 and pair["other"].nunique() > 1:
            rho = float(st.spearman_rho(pair["item"].to_numpy(), pair["other"].to_numpy()))
        rows.append({"item": item, "n": int(pair.shape[0]), "rho": rho})
    return rows


def apply_fidelity_rule(
    results: list[st.TestResult],
    frames: dict[str, pd.DataFrame],
    reliabilities: dict[str, dict[str, dict[str, object]]],
) -> list[dict[str, object]]:
    """Mark the tests resting on omega < 0.60 and add their item-level rho (6.1)."""
    tables: list[dict[str, object]] = []
    for result in results:
        cohort = "common" if result.hypothesis in COMMON_TESTS else "frozen"
        for composite, other in TEST_COMPOSITES[result.hypothesis]:
            entry = reliabilities[cohort][composite]
            omega = entry["omegaOrdinalApprox"]
            low = isinstance(omega, float) and omega < MIN_OMEGA
            if low:
                result.notes.append(
                    f"fidélité insuffisante : omega approx. de {composite} = {_fmt(omega)}"
                )
            if low or result.hypothesis in ALWAYS_ITEMISED:
                tables.append({
                    "hypothesis": result.hypothesis,
                    "composite": composite,
                    "other": other,
                    "omega": omega,
                    "items": _item_correlations(frames[cohort], list(entry["items"]), other),
                })
    return tables


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


def results_table(results: list[st.TestResult], with_power: bool = False) -> str:
    power_head = " Puissance (effet attendu) |" if with_power else ""
    lines = [
        f"| Hypothèse | Test | Famille | n | Statistique | p | p Holm | Taille d’effet | IC 95{NNBSP}% | Décision |{power_head}",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |" + (" --- |" if with_power else ""),
    ]
    for r in results:
        power_cell = f" {_fmt(r.power, 2)} |" if with_power else ""
        lines.append(
            f"| {r.hypothesis} | {r.test} ({r.alternative}) | {r.family} | {r.n} | "
            f"{_fmt(r.statistic)} | {_fmt_p(r.p_value)} | {_fmt_p(r.p_holm)} | "
            f"{r.effect_name}{NBSP}= {_fmt(r.effect)} | {_fmt_ci(r.effect_ci)} | {decision(r)} |{power_cell}"
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
    if payload["status"] == STATUS_EXPLORATORY:
        title = "# Analyse exploratoire (cohorte incomplète), IA et foi"
    elif payload["status"] == STATUS_DEADLINE:
        title = "# Analyse confirmatoire à la date butoir (cohorte incomplète), IA et foi"
    parts.append(title)
    parts.append("")
    parts.append(f"- Exécutée le{NBSP}: {payload['generatedAt']}")
    parts.append(f"- Fichier analysé{NBSP}: `{payload['inputFile']}`")
    parts.append(f"- SHA-256 de l’export{NBSP}: `{payload['inputSha256']}`")
    parts.extend(
        cohort_report_lines(
            cohort, str(payload["cohortSha256"]), str(payload["cohortFile"]),
            "Cohorte de l’instrument gelé (H1, H3, H4, H5, H7)",
        )
    )
    common = payload["cohortCommon"]
    assert isinstance(common, dict)
    parts.append(
        f"- Cohorte de toutes les portes (H2, H6, H8){NBSP}: {common['size']} ligne(s) "
        f"sur {common['available']}, du {common['firstSubmittedAt']} au {common['lastSubmittedAt']}"
    )
    excluded = payload["excluded"]
    assert isinstance(excluded, dict)
    parts.append(
        f"- Lignes écartées avant la cohorte{NBSP}: sans consentement {excluded['sansConsentement']}, "
        f"répondants écartés {excluded['ecartees']}, hors v2 {excluded['horsV2']}, "
        f"après la date butoir {excluded['apresDateButoir']}"
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
    parts.append(
        "Les intervalles de confiance à 95 % ne sont pas ajustés : la décision se "
        "lit sur le p ajusté, et un intervalle peut exclure zéro sans que "
        "l’hypothèse soit soutenue."
    )
    parts.append("")
    parts.append("## 1. Résultats des tests préenregistrés")
    parts.append("")
    parts.append(
        "La puissance est calculée à l’effectif atteint pour l’effet attendu de la "
        "section 4.4 (jamais pour l’effet observé), avec les formules de cette "
        "section et, pour H7, la simulation de `analysis/power_h7.py`. Sous 0,80, "
        "l’hypothèse est rapportée comme sous-puissante."
    )
    parts.append("")
    parts.append(results_table(results, with_power=True))
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

    fidelity = main["fidelity"]
    assert isinstance(fidelity, list)
    if fidelity:
        parts.append(
            "Corrélations de Spearman de chaque item avec l’autre variable, sans "
            "test : obligatoires si l’omega est sous 0,60 (section 6.1), publiées "
            "dans tous les cas pour H8, descriptives."
        )
        parts.append("")
        for table in fidelity:
            parts.append(
                f"**{table['hypothesis']}**, {table['composite']} × {table['other']} "
                f"(omega approx.{NBSP}= {_fmt(table['omega'])})"
            )
            parts.append("")
            parts.append("| Item | n | rho |")
            parts.append("| --- | --- | --- |")
            for row in table["items"]:
                parts.append(f"| {row['item']} | {row['n']} | {_fmt(row['rho'])} |")
            parts.append("")

    parts.append("## 4. Analyses de sensibilité")
    parts.append("")
    comparison = payload["desirabilityComparison"]
    assert isinstance(comparison, dict)
    parts.append("### Avec et sans les répondants dont le drapeau de désirabilité sociale est levé")
    parts.append("")
    parts.append(f"Réponses retirées{NBSP}: {comparison['excluded']}.")
    parts.append("")
    parts.append(
        f"| Hypothèse | Taille d’effet | Avec tous | IC 95{NNBSP}% | Décision | n sans | Sans | "
        f"IC 95{NNBSP}% | Décision | Écart substantiel |"
    )
    parts.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for row in comparison["rows"]:
        parts.append(
            f"| {row['hypothesis']} | {row['effectName']} | {_fmt(row['effect'])} | "
            f"{_fmt_ci(row['ci'])} | {row['decision']} | {row['nWithout']} | "
            f"{_fmt(row['effectWithout'])} | {_fmt_ci(row['ciWithout'])} | "
            f"{row['decisionWithout']} | {'oui' if row['substantial'] else 'non'} |"
        )
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
    parts.append(
        "- H2 lit des libellés différents selon la porte (exemples d’Églises "
        "reformulés sur `/cnef`) : son estimation par canal d’entrée est à lire avec elle."
    )
    parts.append(
        "- H8 met la fréquence d’usage en regard d’un composite qui contient un "
        "item d’utilité perçue : le tableau par item de la section 3 le montre."
    )
    parts.append("")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------


def analyse(
    frozen: pd.DataFrame,
    permutations: int,
    common: pd.DataFrame | None = None,
    with_power: bool = False,
) -> dict[str, object]:
    """The eight tests: each one reads its cohort, then Holm over the eight."""
    common = frozen if common is None else common
    from_frozen = run_hypotheses(frozen, permutations)
    from_common = from_frozen if common is frozen else run_hypotheses(common, permutations)
    results = [
        (from_common if r.hypothesis in COMMON_TESTS else from_frozen)[index]
        for index, r in enumerate(from_frozen)
    ]
    apply_holm(results)
    if with_power:
        apply_power(results)
    reliabilities = {"frozen": reliability(frozen), "common": reliability(common)}
    fidelity = apply_fidelity_rule(
        results, {"frozen": frozen, "common": common}, reliabilities
    )
    return {
        "_objects": results,
        "tests": [{**r.as_dict(), "decision": decision(r)} for r in results],
        "description": describe(common if common.shape[0] >= frozen.shape[0] else frozen),
        "reliability": reliabilities["frozen"],
        "reliabilityCommon": reliabilities["common"],
        "fidelity": fidelity,
    }


def run(
    input_path: Path,
    out_dir: Path,
    permutations: int,
    cohort_size: int = COHORT_SIZE,
    allow_partial: bool = False,
    now: datetime | None = None,
) -> dict[str, object]:
    export = read_export(input_path)
    check_export(export)
    usable, excluded = exploitable_rows(export)
    usable = usable.assign(_row=range(usable.shape[0]))
    # A response recorded after the deadline never enters a confirmatory cohort.
    on_time = pd.Series(
        [_parse_submitted_at(str(v), i) < DEADLINE for i, v in enumerate(usable[SUBMITTED_AT], start=2)],
        index=usable.index,
        dtype=bool,
    )
    excluded["apresDateButoir"] = int((~on_time).sum())
    usable = usable.loc[on_time]
    at_deadline = (now or datetime.now(timezone.utc)) >= DEADLINE
    is_cnef = usable["wordingVariant"] == CNEF_WORDING_VERSION
    # A CNEF surge must not use up the places of the tests it cannot enter.
    cohort = select_cohort(usable.loc[~is_cnef], cohort_size, allow_partial, at_deadline)
    common = select_cohort(usable, cohort_size, allow_partial, at_deadline)

    out_dir.mkdir(parents=True, exist_ok=True)
    cohort_path = out_dir / "cohort_extract.csv"
    extract = pd.concat([cohort.rows, common.rows]).drop_duplicates("_row").sort_values("_row")
    extract = extract.assign(
        inFrozenCohort=extract["_row"].isin(cohort.rows["_row"]),
        inCommonCohort=extract["_row"].isin(common.rows["_row"]),
    ).drop(columns="_row")
    extract.to_csv(cohort_path, index=False, lineterminator="\n")

    answer_rows = parse_rows(extract)
    frozen_frame = build_dataset(parse_rows(cohort.rows.drop(columns="_row")))
    common_frame = build_dataset(parse_rows(common.rows.drop(columns="_row")))
    main = analyse(frozen_frame, permutations, common_frame, with_power=True)

    def assessed(frame: pd.DataFrame) -> pd.DataFrame:
        return frame.loc[~frame["mcFlag"].astype(bool) & frame["mcAssessed"].astype(bool)]

    sensitivity: dict[str, object] = {}
    without_flag = analyse(assessed(frozen_frame), permutations, assessed(common_frame))
    desirability = sensitivity_comparison(
        main["_objects"],  # type: ignore[arg-type]
        without_flag["_objects"],  # type: ignore[arg-type]
        int(frozen_frame["mcFlag"].astype(bool).sum()),
    )

    # The eight tests are re-run separately inside each entry channel holding
    # at least 20 exploitable responses; no stratified statistic is computed.
    union = build_dataset(answer_rows)
    for variant, subset in union.groupby("entryVariant"):
        if subset.shape[0] < 20:
            continue
        block = analyse(subset, permutations)
        block["n"] = int(subset.shape[0])
        sensitivity[f"Canal d’entrée : {variant}"] = block

    # Exploratory, outside the plan: the CNEF rows with their adapted variables.
    cnef_rows = common.rows.loc[common.rows["wordingVariant"] == CNEF_WORDING_VERSION]
    if cnef_rows.shape[0] >= 20:
        adapted = build_dataset(parse_rows(cnef_rows.drop(columns="_row")), blank_cnef=False)
        block = analyse(adapted, permutations)
        block["n"] = int(adapted.shape[0])
        sensitivity[
            "Exploratoire, hors plan : porte CNEF, variables adaptées (autre instrument)"
        ] = block

    payload: dict[str, object] = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "inputFile": str(input_path),
        "inputSha256": sha256_of(input_path),
        "cohortFile": str(cohort_path),
        "cohortSha256": sha256_of(cohort_path),
        "cohort": cohort.as_dict(),
        "cohortCommon": common.as_dict(),
        "status": (
            STATUS_EXPLORATORY if STATUS_EXPLORATORY in (cohort.status, common.status)
            else STATUS_DEADLINE if STATUS_DEADLINE in (cohort.status, common.status)
            else STATUS_CONFIRMATORY
        ),
        "excluded": excluded,
        "seed": st.SEED,
        "permutations": permutations,
        "bootstrapDraws": st.BOOTSTRAP_DRAWS,
        "rowsRead": int(export.shape[0]),
        "rowsAnalysed": len(answer_rows),
        "rowsNotV2": excluded["horsV2"],
        "main": main,
        "sensitivity": sensitivity,
        "desirabilityComparison": desirability,
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
    parser.add_argument("--input", type=Path, help="dedicated CSV export (/api/results/export?format=csv)")
    parser.add_argument("--out", type=Path, default=Path(__file__).resolve().parent / "out")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="generate a synthetic dataset and run the full pipeline on it",
    )
    parser.add_argument("--dry-run-n", type=int, default=400, help="synthetic sample size")
    parser.add_argument(
        "--cohort-size",
        type=int,
        default=COHORT_SIZE,
        help=(
            "confirmatory cohorts: the first N exploitable rows by submittedAt "
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
        generate(args.dry_run_n, cnef_share=0.35).to_csv(input_path, index=False)
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

    print(f"Lignes lues : {payload['rowsRead']} ; instrument gelé : {cohort['size']} ; toutes portes : {payload['cohortCommon']['size']} ; écartées : {payload['excluded']}")
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
