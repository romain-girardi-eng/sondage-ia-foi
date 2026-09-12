#!/usr/bin/env python3
"""Monte-Carlo power of the H7 dispersion test, at the effect the plan expects.

H7 predicts a lower dispersion of ``ethicalConcern`` in the formally trained
group. The plan defines the expected effect once: a ratio of 0.70 between the
standard deviations of the latent trait (trained over untrained), which the
three discretised items turn into a ratio of about 0.70 between the mean
absolute deviations from the median of the composite. Every parameter of the
simulation is written below so the numbers in the pre-registration can be
recomputed byte for byte.

    python3 analysis/power_h7.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

import stats as st  # noqa: E402

SEED = st.SEED  # 20260907, the seed of the whole analysis
REPLICATIONS = 2000
ALPHA = 0.05

# Latent trait: normal, mean 0, SD 1 in the untrained group.
LATENT_SD_UNTRAINED = 1.0
LATENT_SD_TRAINED = 0.70

# Each of the three items is the latent trait plus its own noise, then cut at
# four thresholds into the five points of the scale. The thresholds are
# symmetric and one SD apart, the middle category being one SD wide.
N_ITEMS = 3
ITEM_NOISE_SD = 0.30
THRESHOLDS = np.array([-1.5, -0.5, 0.5, 1.5])

# Sample sizes as (trained, untrained). The plan expects the trained group to
# be a quarter of the sample, an assumption not grounded in data.
DESIGNS: list[tuple[int, int]] = [
    (62, 62),
    (100, 100),
    (50, 150),
    (150, 50),
]
BALANCED_SCAN = (62, 70, 80, 90, 100)


def composite(rng: np.random.Generator, n: int, latent_sd: float) -> np.ndarray:
    """Mean of three 5-point items discretised from a shared latent trait."""
    latent = rng.normal(0.0, latent_sd, size=n)
    items = [
        1 + np.searchsorted(THRESHOLDS, latent + rng.normal(0.0, ITEM_NOISE_SD, size=n))
        for _ in range(N_ITEMS)
    ]
    return np.mean(np.column_stack(items), axis=1)


def latent_only(rng: np.random.Generator, n: int, latent_sd: float) -> np.ndarray:
    """The latent trait itself, without items: the normal, undiscretised case."""
    return rng.normal(0.0, latent_sd, size=n)


def expected_mad_ratio(draws: int = 200_000) -> float:
    rng = np.random.default_rng(SEED)
    trained = composite(rng, draws, LATENT_SD_TRAINED)
    untrained = composite(rng, draws, LATENT_SD_UNTRAINED)
    return st.mad_ratio(trained, untrained)


def power(n_trained: int, n_untrained: int, generator=composite) -> float:
    rng = np.random.default_rng(SEED)
    rejections = 0
    for _ in range(REPLICATIONS):
        trained = generator(rng, n_trained, LATENT_SD_TRAINED)
        untrained = generator(rng, n_untrained, LATENT_SD_UNTRAINED)
        _, p_value = st.brown_forsythe_one_sided(trained, untrained)
        if p_value < ALPHA:
            rejections += 1
    return rejections / REPLICATIONS


def main() -> int:
    print("Puissance de H7 (Welch unilatéral sur les écarts absolus à la médiane)")
    print(
        f"graine {SEED}, {REPLICATIONS} réplications par point, alpha {ALPHA}, "
        f"rapport d'écarts types latents {LATENT_SD_TRAINED / LATENT_SD_UNTRAINED:.2f}, "
        f"{N_ITEMS} items, bruit d'item {ITEM_NOISE_SD}, seuils {THRESHOLDS.tolist()}"
    )
    print(f"rapport attendu des écarts absolus moyens sur le composite : {expected_mad_ratio():.3f}")
    print()
    print("| formés | non formés | puissance |")
    print("| --- | --- | --- |")
    for n_trained, n_untrained in DESIGNS:
        print(f"| {n_trained} | {n_untrained} | {power(n_trained, n_untrained):.2f} |")
    print()
    print("Groupes équilibrés, composite discrétisé :")
    for n in BALANCED_SCAN:
        print(f"  {n} par groupe : {power(n, n):.2f}")
    print()
    print(
        "Variable latente normale, sans discrétisation, 62 par groupe : "
        f"{power(62, 62, generator=latent_only):.2f}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
