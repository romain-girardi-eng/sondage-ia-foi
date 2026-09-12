"""Statistical procedures for the eight pre-registered tests.

Only numpy, scipy and pandas: nothing here reaches the network or a database.
Every procedure that draws random numbers takes an explicit seed, and the
default seed (``SEED``) is the one written into the pre-registration, so the
permutation p-values and the bootstrap intervals are reproducible byte for byte.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Sequence

import numpy as np
from scipy import stats

SEED = 20260907
BOOTSTRAP_DRAWS = 2000
PERMUTATIONS = 10000


@dataclass
class TestResult:
    """One confirmatory test: a p-value, an effect size, and its interval."""

    hypothesis: str
    label: str
    test: str
    family: str
    alternative: str
    n: int
    statistic: float | None
    p_value: float | None
    effect_name: str
    effect: float | None
    effect_ci: tuple[float | None, float | None] = (None, None)
    p_holm: float | None = None
    notes: list[str] = field(default_factory=list)
    extra: dict[str, float | int | str | None] = field(default_factory=dict)

    def as_dict(self) -> dict[str, object]:
        return {
            "hypothesis": self.hypothesis,
            "label": self.label,
            "test": self.test,
            "family": self.family,
            "alternative": self.alternative,
            "n": self.n,
            "statistic": self.statistic,
            "pValue": self.p_value,
            "pHolm": self.p_holm,
            "effectName": self.effect_name,
            "effect": self.effect,
            "effectCi95": list(self.effect_ci),
            "notes": self.notes,
            "extra": self.extra,
        }


# --- Multiplicity ------------------------------------------------------------


def holm(p_values: Sequence[float]) -> list[float]:
    """Holm-Bonferroni step-down adjustment, input order preserved."""
    m = len(p_values)
    if m == 0:
        return []
    order = sorted(range(m), key=lambda i: p_values[i])
    adjusted = [0.0] * m
    running = 0.0
    for rank, index in enumerate(order):
        candidate = (m - rank) * p_values[index]
        running = max(running, candidate)
        adjusted[index] = min(1.0, running)
    return adjusted


# --- Effect sizes ------------------------------------------------------------


def cliffs_delta(a: Sequence[float], b: Sequence[float]) -> float:
    """P(a > b) - P(a < b); ties count for neither side."""
    x = np.asarray(a, dtype=float)
    y = np.asarray(b, dtype=float)
    if x.size == 0 or y.size == 0:
        return float("nan")
    signs = np.sign(x[:, None] - y[None, :])
    return float(signs.sum()) / (x.size * y.size)


def spearman_rho(x: Sequence[float], y: Sequence[float]) -> float:
    if len(x) < 3:
        return float("nan")
    rho = stats.spearmanr(x, y).statistic
    return float(rho)


def kendall_tau_b(x: Sequence[float], y: Sequence[float]) -> float:
    if len(x) < 3:
        return float("nan")
    return float(stats.kendalltau(x, y, variant="b").statistic)


def mad_ratio(trained: Sequence[float], untrained: Sequence[float]) -> float:
    """Ratio of mean absolute deviations from the group median (H7 effect).

    Below 1 means the trained group is the less dispersed one, which is the
    pre-registered direction.
    """
    a = np.asarray(trained, dtype=float)
    b = np.asarray(untrained, dtype=float)
    if a.size == 0 or b.size == 0:
        return float("nan")
    dev_a = float(np.mean(np.abs(a - np.median(a))))
    dev_b = float(np.mean(np.abs(b - np.median(b))))
    if dev_b == 0:
        return float("nan")
    return dev_a / dev_b


# --- Tests -------------------------------------------------------------------


def spearman_test(x: Sequence[float], y: Sequence[float]) -> tuple[float, float, float]:
    """Ties-corrected Spearman (average ranks), two-sided.

    ``scipy.stats.spearmanr`` ranks with ties averaged, which is the
    tie-corrected coefficient; its p-value uses the t approximation, adequate
    from a few dozen observations and the one declared in the plan.
    """
    result = stats.spearmanr(x, y)
    return float(result.statistic), float(result.pvalue), float(len(x))


def mann_whitney(
    a: Sequence[float], b: Sequence[float], alternative: str = "two-sided"
) -> tuple[float, float]:
    """Mann-Whitney U with the tie-corrected normal approximation."""
    result = stats.mannwhitneyu(a, b, alternative=alternative, method="asymptotic")
    return float(result.statistic), float(result.pvalue)


def jonckheere_statistic(groups: Sequence[Sequence[float]]) -> float:
    """Jonckheere-Terpstra J: ordered-alternative sum of pairwise precedences."""
    total = 0.0
    for i in range(len(groups)):
        for j in range(i + 1, len(groups)):
            gi = np.asarray(groups[i], dtype=float)
            gj = np.asarray(groups[j], dtype=float)
            if gi.size == 0 or gj.size == 0:
                continue
            comparison = np.sign(gj[:, None] - gi[None, :])
            total += float(np.sum(comparison > 0)) + 0.5 * float(np.sum(comparison == 0))
    return total


def _precedence_matrix(values: np.ndarray) -> np.ndarray:
    """S[p, q] = 1 if v[q] > v[p], 0.5 if equal, 0 otherwise.

    Summing S over the ordered pairs of a grouping gives J directly, so a
    permutation test only has to re-mask this matrix instead of recomputing
    every pairwise comparison.
    """
    difference = values[None, :] - values[:, None]
    return (difference > 0).astype(float) + 0.5 * (difference == 0).astype(float)


def jonckheere_terpstra(
    values: Sequence[float],
    group_codes: Sequence[int],
    permutations: int = PERMUTATIONS,
    seed: int = SEED,
) -> tuple[float, float, int]:
    """Two-sided Jonckheere-Terpstra with a permutation p-value.

    No large-sample approximation and no "fallback" test: the ordered groups are
    small and heavily tied, so the reference distribution is built by permuting
    the group labels ``permutations`` times under a fixed seed. The p-value is
    ``(1 + #{|J* - E[J]| >= |J - E[J]|}) / (1 + permutations)``, which is valid
    (never zero) for any number of draws.
    """
    values_array = np.asarray(values, dtype=float)
    codes = np.asarray(group_codes)
    levels = np.unique(codes)
    if levels.size < 2 or values_array.size < 3:
        return float("nan"), float("nan"), int(values_array.size)

    precedence = _precedence_matrix(values_array)
    # Self-comparisons would add 0.5 each; the ordered mask excludes them anyway
    # because a respondent is never in two different groups.
    np.fill_diagonal(precedence, 0.0)

    def statistic(shuffled_codes: np.ndarray) -> float:
        ordered = shuffled_codes[:, None] < shuffled_codes[None, :]
        return float(np.sum(precedence * ordered))

    observed = statistic(codes)
    sizes = np.array([int(np.sum(codes == level)) for level in levels], dtype=float)
    expected = (values_array.size**2 - float(np.sum(sizes**2))) / 4.0

    rng = np.random.default_rng(seed)
    permuted = codes.copy()
    exceed = 0
    target = abs(observed - expected)
    for _ in range(permutations):
        rng.shuffle(permuted)
        if abs(statistic(permuted) - expected) >= target:
            exceed += 1

    p_value = (1.0 + exceed) / (1.0 + permutations)
    return observed, p_value, int(values_array.size)


def brown_forsythe_one_sided(
    trained: Sequence[float], untrained: Sequence[float]
) -> tuple[float, float]:
    """Brown-Forsythe on two groups, one-sided: trained is less dispersed.

    Brown-Forsythe is Levene's test on absolute deviations from the group
    MEDIAN. With two groups the omnibus F equals t squared, so the directional
    version is a one-sided Welch t-test on those deviations, which is what the
    pre-registration needs: the omnibus F has no sign to compare with a declared
    direction.
    """
    a = np.asarray(trained, dtype=float)
    b = np.asarray(untrained, dtype=float)
    if a.size < 2 or b.size < 2:
        return float("nan"), float("nan")
    dev_a = np.abs(a - np.median(a))
    dev_b = np.abs(b - np.median(b))
    result = stats.ttest_ind(dev_a, dev_b, equal_var=False, alternative="less")
    return float(result.statistic), float(result.pvalue)


@dataclass
class OlsFit:
    names: list[str]
    coefficients: list[float]
    std_errors: list[float]
    t_values: list[float]
    p_values: list[float]
    n: int
    df_residual: int
    r_squared: float

    def coefficient(self, name: str) -> tuple[float, float, float]:
        index = self.names.index(name)
        return (
            self.coefficients[index],
            self.p_values[index],
            self.std_errors[index],
        )


def ols(y: Sequence[float], predictors: dict[str, Sequence[float]]) -> OlsFit:
    """Least squares with an intercept and classic (homoskedastic) t-tests."""
    names = ["intercept", *predictors.keys()]
    y_array = np.asarray(y, dtype=float)
    columns = [np.ones(y_array.size)] + [
        np.asarray(v, dtype=float) for v in predictors.values()
    ]
    design = np.column_stack(columns)
    n, k = design.shape
    df_residual = n - k
    if df_residual <= 0:
        raise ValueError("not enough observations for this regression")

    beta, *_ = np.linalg.lstsq(design, y_array, rcond=None)
    residuals = y_array - design @ beta
    sigma2 = float(residuals @ residuals) / df_residual
    xtx_inv = np.linalg.pinv(design.T @ design)
    std_errors = np.sqrt(np.maximum(np.diag(xtx_inv) * sigma2, 0.0))
    with np.errstate(divide="ignore", invalid="ignore"):
        t_values = np.where(std_errors > 0, beta / std_errors, np.nan)
    p_values = 2 * stats.t.sf(np.abs(t_values), df_residual)

    total = float(np.sum((y_array - y_array.mean()) ** 2))
    r_squared = 1.0 - float(residuals @ residuals) / total if total > 0 else float("nan")

    return OlsFit(
        names=names,
        coefficients=[float(b) for b in beta],
        std_errors=[float(s) for s in std_errors],
        t_values=[float(t) for t in t_values],
        p_values=[float(p) for p in p_values],
        n=n,
        df_residual=df_residual,
        r_squared=r_squared,
    )


# --- Bootstrap ---------------------------------------------------------------


def bootstrap_ci(
    estimator: Callable[[np.ndarray], float],
    n_rows: int,
    draws: int = BOOTSTRAP_DRAWS,
    seed: int = SEED,
    level: float = 0.95,
) -> tuple[float | None, float | None]:
    """Percentile interval, resampling RESPONDENTS (rows), not values.

    ``estimator`` receives an array of row indices, so a two-group or a
    regression effect is recomputed on a coherent resample of people rather than
    on independently resampled columns.
    """
    if n_rows < 3:
        return (None, None)
    rng = np.random.default_rng(seed)
    estimates: list[float] = []
    for _ in range(draws):
        indices = rng.integers(0, n_rows, size=n_rows)
        try:
            value = estimator(indices)
        except (ValueError, ZeroDivisionError, np.linalg.LinAlgError):
            continue
        if value is not None and np.isfinite(value):
            estimates.append(float(value))
    if len(estimates) < 2:
        return (None, None)
    low = float(np.percentile(estimates, 100 * (1 - level) / 2))
    high = float(np.percentile(estimates, 100 * (1 + level) / 2))
    return (low, high)


# --- Reliability -------------------------------------------------------------


def cronbach_alpha(item_matrix: np.ndarray) -> float | None:
    """Standard alpha on listwise-complete rows; None below two items."""
    matrix = np.asarray(item_matrix, dtype=float)
    if matrix.ndim != 2 or matrix.shape[1] < 2 or matrix.shape[0] < 3:
        return None
    item_variances = matrix.var(axis=0, ddof=1)
    total_variance = matrix.sum(axis=1).var(ddof=1)
    if total_variance <= 0:
        return None
    k = matrix.shape[1]
    return float(k / (k - 1) * (1 - item_variances.sum() / total_variance))


def ordinal_omega(item_matrix: np.ndarray) -> float | None:
    """Ordinal omega, approximated from the Spearman correlation matrix.

    The published estimator (Gadermann, Guhn & Zumbo, 2012) fits a one-factor
    model to the POLYCHORIC correlation matrix. No polychoric estimator is
    implemented here, so the Spearman rank-correlation matrix stands in: it is
    the closest rank-based approximation available in scipy, and it is reported
    as an approximation everywhere it appears. Loadings come from the first
    principal component; omega is then
    ``(sum lambda)^2 / ((sum lambda)^2 + sum(1 - lambda^2))``.
    """
    matrix = np.asarray(item_matrix, dtype=float)
    if matrix.ndim != 2 or matrix.shape[1] < 2 or matrix.shape[0] < 3:
        return None
    if np.any(matrix.std(axis=0) == 0):
        return None

    correlation = np.asarray(stats.spearmanr(matrix).statistic, dtype=float)
    if correlation.ndim == 0:  # two items: scipy returns a scalar
        correlation = np.array([[1.0, float(correlation)], [float(correlation), 1.0]])

    eigenvalues, eigenvectors = np.linalg.eigh(correlation)
    top = int(np.argmax(eigenvalues))
    if eigenvalues[top] <= 0:
        return None
    loadings = eigenvectors[:, top] * np.sqrt(eigenvalues[top])
    if float(np.sum(loadings)) < 0:
        loadings = -loadings
    loadings = np.clip(loadings, -0.999, 0.999)

    numerator = float(np.sum(loadings)) ** 2
    uniqueness = float(np.sum(1 - loadings**2))
    if numerator + uniqueness <= 0:
        return None
    return numerator / (numerator + uniqueness)
