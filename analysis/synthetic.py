"""Synthetic export generator, so the pipeline runs end to end without data.

The numbers it produces are fiction. They exist only to exercise every branch of
``confirmatory.py`` — routing, missing codes, multi-select and matrix items,
both entry variants, the social-desirability flag, the ``submittedAt`` cohort
cut — before a single real response has been collected. Rows come out shuffled
so that the cohort selection has to sort them. Effects are planted in the pre-registered
directions so that a successful dry run also shows what a supported hypothesis
looks like in the report.
"""

from __future__ import annotations

import json
import math
from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd

from scoring_maps import (
    COUNT_ITEM_SPECS,
    ITEM_SCORE_MAPS,
    MATRIX_TASK_WEIGHTS,
    SCALE_ITEM_REVERSED,
)

DEFAULT_N = 260
COLLECTION_START = datetime(2026, 9, 7, 8, 0, tzinfo=timezone.utc)


def _ascending_options(item_id: str) -> list[str]:
    """Item option values ordered from the lowest to the highest score."""
    mapping = ITEM_SCORE_MAPS[item_id]
    return [value for value, _ in sorted(mapping.items(), key=lambda kv: kv[1])]


def _logistic(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def _ordinal(rng: np.random.Generator, latent: float, options: list[str], noise: float = 0.6) -> str:
    u = _logistic(latent + rng.normal(0, noise))
    index = min(len(options) - 1, max(0, int(u * len(options))))
    return options[index]


def _scale_value(rng: np.random.Generator, latent: float, reversed_item: bool) -> int:
    u = _logistic(latent + rng.normal(0, 0.6))
    score = min(5, max(1, int(u * 5) + 1))
    return 6 - score if reversed_item else score


def _count_value(
    rng: np.random.Generator, latent: float, item_id: str, pool: list[str]
) -> list[str]:
    spec = COUNT_ITEM_SPECS[item_id]
    step = float(spec["step"])  # type: ignore[arg-type]
    target = _logistic(latent + rng.normal(0, 0.6)) * 4.0
    count = min(len(pool), max(0, round(target / step)))
    if count == 0:
        exclusive = spec["exclusive"]
        assert isinstance(exclusive, tuple)
        return [exclusive[0]] if exclusive else []
    return list(rng.choice(pool, size=count, replace=False))


def _matrix_value(rng: np.random.Generator, latent: float) -> dict[str, int]:
    tasks = MATRIX_TASK_WEIGHTS["min_pred_nature"].keys()
    base = _logistic(latent) * 3.0
    return {task: int(min(3, max(0, round(base + rng.normal(0, 0.8))))) for task in tasks}


def generate(n: int = DEFAULT_N, seed: int = 20260907) -> pd.DataFrame:
    """One synthetic export, one row per response."""
    rng = np.random.default_rng(seed)
    rows: list[dict[str, object]] = []
    submitted_at = COLLECTION_START

    for _ in range(n):
        submitted_at = submitted_at + timedelta(minutes=float(rng.exponential(90.0)) + 1.0)
        variant = "cnef" if rng.random() < 0.4 else "general"
        age_code = int(rng.integers(1, 5))
        age = {1: "18-35", 2: "36-50", 3: "51-65", 4: "66+"}[age_code]

        clergy = rng.random() < 0.35
        statut = (
            str(rng.choice(["clerge", "religieux", "responsable_non_ordonne"]))
            if clergy
            else str(rng.choice(["laic_engagé", "laic_pratiquant", "curieux"]))
        )

        evangelical = variant == "cnef" or rng.random() < 0.3
        charismatic = evangelical and rng.random() < 0.45

        # Latent traits, with the pre-registered structure planted in.
        religiosity = rng.normal(0.4 if clergy else 0.0, 1.0)
        # H1: religiosity raises the sacred boundary.
        boundary = 0.7 * religiosity + rng.normal(0.3 if clergy else 0.0, 0.8)
        # H2 charismatic openness, H3 age gradient.
        openness = (
            -0.35 * religiosity
            + (0.55 if charismatic else 0.0)
            - 0.30 * (age_code - 2.5)
            + rng.normal(0, 0.8)
        )
        # H8: heavier AI use goes with weaker ethical concern.
        ethical = -0.45 * openness + rng.normal(0, 0.7)
        trained = rng.random() < (0.55 if clergy else 0.2)
        # H7: formal training compresses the dispersion of ethical concern.
        ethical = ethical * (0.6 if trained else 1.2)

        # H4: theological orientation ordered against the sacred boundary.
        orientation_latent = -0.5 * boundary
        orientation = _ordinal(
            rng, orientation_latent, ["traditionaliste", "modere", "progressiste"], noise=1.1
        )
        if rng.random() < 0.12:
            orientation = "ne_sait_pas"

        # H6: the community's official stance tracks the respondent's openness.
        if rng.random() < 0.45:
            position = "non"
        else:
            position = _ordinal(
                rng,
                0.5 * openness,
                ["oui_defavorable", "oui_prudent", "oui_favorable"],
                noise=1.1,
            )

        row: dict[str, object] = {
            "submittedAt": submitted_at.isoformat(timespec="seconds").replace("+00:00", "Z"),
            "instrumentVersion": "2.0.0",
            "entryVariant": variant,
            "profil_age": age,
            "profil_statut": statut,
            "profil_confession": "protestant" if evangelical else "catholique",
            "profil_formation_theologique": (
                str(rng.choice(["diplome_theologie", "formation_pastorale"]))
                if trained
                else str(rng.choice(["aucune", "cours_ponctuels"]))
            ),
            "theo_orientation": orientation,
            "communaute_position_officielle": position,
        }
        if evangelical:
            row["profil_confession_protestante"] = "evangelique"
            row["profil_confession_evangelique"] = (
                "charismatique" if charismatic else "non_charismatique"
            )

        for item in ("crs_intellect", "crs_ideology", "crs_public_practice",
                     "crs_private_practice", "crs_experience"):
            row[item] = _ordinal(rng, religiosity, _ascending_options(item))

        row["ctrl_ia_frequence"] = _ordinal(rng, openness, _ascending_options("ctrl_ia_frequence"))
        row["digital_attitude_generale"] = _ordinal(
            rng, openness, _ascending_options("digital_attitude_generale")
        )
        row["ctrl_ia_confort"] = _scale_value(rng, openness, SCALE_ITEM_REVERSED["ctrl_ia_confort"])
        if row["ctrl_ia_frequence"] != "jamais":
            row["ctrl_ia_contextes"] = json.dumps(
                _count_value(
                    rng,
                    openness,
                    "ctrl_ia_contextes",
                    ["general", "spirituel", "professionnel", "creatif", "etudes"],
                )
            )

        row["theo_inspiration"] = _ordinal(rng, boundary, _ascending_options("theo_inspiration"))
        row["theo_mediation_humaine"] = _ordinal(
            rng, boundary, _ascending_options("theo_mediation_humaine")
        )
        row["theo_liturgie_ia"] = _scale_value(
            rng, boundary, SCALE_ITEM_REVERSED["theo_liturgie_ia"]
        )
        row["theo_activites_sacrees"] = json.dumps(
            _count_value(
                rng,
                boundary,
                "theo_activites_sacrees",
                ["sacrements", "priere", "predication", "accompagnement", "benediction"],
            )
        )

        row["theo_utilite_percue"] = _ordinal(rng, ethical, _ascending_options("theo_utilite_percue"))
        row["psych_aias_opacity"] = _ordinal(rng, ethical, _ascending_options("psych_aias_opacity"))
        row["psych_imago_dei"] = _ordinal(rng, ethical, _ascending_options("psych_imago_dei"))

        perception = rng.normal(0, 1)
        for item in ("psych_godspeed_nature", "psych_godspeed_conscience",
                     "psych_anxiete_remplacement"):
            row[item] = _ordinal(rng, perception, _ascending_options(item))

        community = 0.4 * openness + rng.normal(0, 0.9)
        row["communaute_perception_pairs"] = _ordinal(
            rng, community, _ascending_options("communaute_perception_pairs")
        )
        row["communaute_discussions"] = _ordinal(
            rng, community, _ascending_options("communaute_discussions")
        )

        future = 0.6 * openness + rng.normal(0, 0.8)
        row["futur_intention_usage"] = _ordinal(
            rng, future, _ascending_options("futur_intention_usage")
        )
        row["futur_formation_souhait"] = _ordinal(
            rng, future, _ascending_options("futur_formation_souhait")
        )
        row["futur_domaines_interet"] = json.dumps(
            _count_value(
                rng,
                future,
                "futur_domaines_interet",
                ["predication", "administration", "catechese", "musique", "traduction", "pastorale"],
            )
        )

        if statut in ("clerge", "religieux", "responsable_non_ordonne"):
            row["min_pred_usage"] = _ordinal(rng, openness, _ascending_options("min_pred_usage"))
            row["min_care_email"] = _ordinal(rng, boundary, _ascending_options("min_care_email"))
            if row["min_pred_usage"] != "jamais":
                row["min_pred_nature"] = json.dumps(_matrix_value(rng, openness))
                row["min_pred_sentiment"] = _scale_value(
                    rng, boundary, SCALE_ITEM_REVERSED["min_pred_sentiment"]
                )
                row["min_admin_burden"] = _scale_value(
                    rng, openness, SCALE_ITEM_REVERSED["min_admin_burden"]
                )
        else:
            row["laic_substitution_priere"] = _ordinal(
                rng, boundary, _ascending_options("laic_substitution_priere")
            )
            row["laic_conseil_spirituel"] = _ordinal(
                rng, boundary, _ascending_options("laic_conseil_spirituel")
            )

        desirable = rng.random() < 0.15
        for item, keyed in (
            ("ctrl_mc_1", "false"),
            ("ctrl_mc_2", "true"),
            ("ctrl_mc_3", "false"),
            ("ctrl_mc_4", "true"),
            ("ctrl_mc_5", "false"),
        ):
            if desirable:
                row[item] = keyed
            else:
                row[item] = str(rng.choice(["true", "false"]))

        # A share of unanswered items, so the missing-data paths are exercised.
        for key in list(row.keys()):
            if key in ("submittedAt", "instrumentVersion", "entryVariant", "profil_statut"):
                continue
            if rng.random() < 0.03:
                row[key] = "sans_reponse"

        rows.append(row)

    frame = pd.DataFrame(rows)
    return frame.iloc[rng.permutation(len(frame))].reset_index(drop=True)
