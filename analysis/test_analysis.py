"""Tests for the confirmatory analysis.

Three things are checked: that the Python transcription of the scoring tables
still matches the TypeScript instrument, that a handful of hand-computed
fixtures come out exactly right, and that each statistical procedure behaves on
a case whose answer is known in advance.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))

import stats as st
from confirmatory import build_dataset, run_hypotheses
from scoring import (
    calculate_dimension,
    compute_core_subscores,
    js_round2,
    parse_cell,
    score_item,
    social_desirability,
)
from scoring_maps import DIMENSION_ITEM_SPECS, ITEM_SCORE_MAPS
from synthetic import generate

REPO = Path(__file__).resolve().parents[1]
SCORE_MAPS_TS = REPO / "src" / "lib" / "scoring" / "score-maps.ts"
DIMENSIONS_TS = REPO / "src" / "lib" / "scoring" / "dimensions.ts"


# ---------------------------------------------------------------------------
# Drift against the TypeScript source
# ---------------------------------------------------------------------------


def _strip_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return re.sub(r"//[^\n]*", "", text)


def _braced_block(text: str, open_index: int) -> str:
    depth = 0
    for i in range(open_index, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return text[open_index + 1 : i]
    raise AssertionError("unbalanced braces in the TypeScript source")


def _top_level_entries(body: str) -> dict[str, str]:
    """Map every ``name: { ... }`` entry of one object literal to its block."""
    entries: dict[str, str] = {}
    for match in re.finditer(r"(?m)^\s{2}([A-Za-z_][\w]*):\s*\{", body):
        name = match.group(1)
        entries[name] = _braced_block(body, match.end() - 1)
    return entries


def test_item_score_maps_match_the_typescript_source():
    text = _strip_comments(SCORE_MAPS_TS.read_text(encoding="utf-8"))
    start = text.index("export const ITEM_SCORE_MAPS")
    body = _braced_block(text, text.index("{", start))

    parsed: dict[str, dict[str, float]] = {}
    for item_id, block in _top_level_entries(body).items():
        pairs = re.findall(r"'?([\w-]+)'?\s*:\s*([0-9.]+)", block)
        parsed[item_id] = {key: float(value) for key, value in pairs}

    assert parsed, "no item score map could be parsed from the TypeScript source"
    assert set(parsed) == set(ITEM_SCORE_MAPS), "an item was added or removed in TypeScript"
    for item_id, mapping in parsed.items():
        assert mapping == {k: float(v) for k, v in ITEM_SCORE_MAPS[item_id].items()}, item_id


def test_dimension_items_match_the_typescript_source():
    text = _strip_comments(DIMENSIONS_TS.read_text(encoding="utf-8"))
    start = text.index("export const DIMENSION_ITEM_SPECS")
    body = _braced_block(text, text.index("{", start))

    for dimension, block in _top_level_entries(body).items():
        ids = re.findall(r"id:\s*'([\w]+)'", block)
        weights = [
            float(m) if m else 1.0
            for m in re.findall(r"id:\s*'[\w]+',\s*weight:\s*([0-9.]+)", block)
        ]
        cores = re.findall(r"\{[^{}]*id:\s*'([\w]+)'[^{}]*core:\s*true[^{}]*\}", block)

        specs = DIMENSION_ITEM_SPECS[dimension]
        assert [s.item_id for s in specs] == ids, dimension
        assert [s.weight for s in specs] == weights, dimension
        assert [s.item_id for s in specs if s.core] == cores, dimension


# ---------------------------------------------------------------------------
# Hand-computed scoring fixtures
# ---------------------------------------------------------------------------


def test_ordinal_and_missing_items():
    assert score_item("crs_intellect", {"crs_intellect": "souvent"}) == 4
    assert score_item("crs_private_practice", {"crs_private_practice": "quotidien"}) == 5
    assert score_item("crs_intellect", {"crs_intellect": "sans_reponse"}) is None
    assert score_item("crs_intellect", {}) is None
    # v1 leftovers that have no Huber anchor stay unscored.
    assert score_item("crs_private_practice", {"crs_private_practice": "occasionnellement"}) is None
    # "No official position" carries no valence on the continuum.
    assert score_item("communaute_position_officielle", {"communaute_position_officielle": "non"}) is None


def test_scale_items_reverse_and_clamp():
    assert score_item("ctrl_ia_confort", {"ctrl_ia_confort": 4}) == 4
    # theo_liturgie_ia is reverse-coded: a high slider is a weak boundary.
    assert score_item("theo_liturgie_ia", {"theo_liturgie_ia": 4}) == 2
    assert score_item("theo_liturgie_ia", {"theo_liturgie_ia": 7}) == 1
    assert score_item("ctrl_ia_confort", {"ctrl_ia_confort": "4"}) is None


def test_count_items():
    # 1 + 2 x 0.8
    assert score_item("ctrl_ia_contextes", {"ctrl_ia_contextes": ["general", "etudes"]}) == pytest.approx(2.6)
    # An exclusive "none of these" answer floors the item.
    assert score_item("theo_activites_sacrees", {"theo_activites_sacrees": ["aucune"]}) == 1
    # 1 + 8 x 0.6 = 5.8, capped at 5.
    assert score_item("futur_domaines_interet", {"futur_domaines_interet": list("abcdefgh")}) == 5


def test_matrix_item():
    # weighted 1x1 + 2x2 + 0 + 0 + 3x3 = 14 over a maximum of 3 x 8 = 24.
    answers = {"min_pred_nature": {"plan": 1, "exegese": 2, "illustration": 0, "images": 0, "redaction": 3}}
    assert score_item("min_pred_nature", answers) == pytest.approx(1 + 14 / 24 * 4)
    assert score_item("min_pred_nature", {"min_pred_nature": {"plan": "x"}}) is None


def test_religiosity_needs_four_items():
    full = {
        "crs_intellect": "jamais",          # 1
        "crs_ideology": "peu",              # 2
        "crs_public_practice": "mensuel",   # 3
        "crs_private_practice": "hebdomadaire",  # 4
        "crs_experience": "tres_souvent",   # 5
    }
    assert calculate_dimension("religiosity", full)["value"] == 3.0

    three_items = {k: v for k, v in list(full.items())[:3]}
    assert calculate_dimension("religiosity", three_items)["value"] is None


def test_ai_openness_weights_and_core_subscore():
    answers = {
        "profil_statut": "clerge",
        "ctrl_ia_frequence": "regulier",          # 4
        "ctrl_ia_confort": 3,                     # 3
        "digital_attitude_generale": "positif",   # 4
        "ctrl_ia_contextes": ["general"],         # 1 + 0.8 = 1.8
        "min_pred_usage": "regulier",             # 4
        "min_pred_nature": {"plan": 1, "exegese": 2, "illustration": 0, "images": 0, "redaction": 3},
        "min_admin_burden": 2,                    # 2, weight 0.5
    }
    matrix_score = 1 + 14 / 24 * 4
    expected = (4 + 3 + 4 + 1.8 + 4 + matrix_score + 2 * 0.5) / 6.5
    assert calculate_dimension("aiOpenness", answers)["value"] == js_round2(expected)

    # The core sub-score keeps only the three items everyone is asked.
    assert compute_core_subscores(answers)["aiOpennessCore"]["value"] == js_round2((4 + 3 + 4) / 3)


def test_social_desirability_flag():
    keyed = {"ctrl_mc_1": "false", "ctrl_mc_2": "true", "ctrl_mc_3": "false",
             "ctrl_mc_4": "true", "ctrl_mc_5": "false"}
    flagged = social_desirability(keyed)
    assert flagged["flag"] is True and flagged["score"] == 1.0

    # Three answered items is below the interpretability floor.
    partial = {"ctrl_mc_1": "false", "ctrl_mc_2": "true", "ctrl_mc_3": "false"}
    assert social_desirability(partial) == {"score": None, "nItems": 3, "flag": False}


def test_parse_cell_accepts_json_and_pipes():
    assert parse_cell('["a", "b"]') == ["a", "b"]
    assert parse_cell("a|b") == ["a", "b"]
    assert parse_cell('{"plan": 2}') == {"plan": 2}
    assert parse_cell("3") == 3.0
    assert parse_cell("") == ""


# ---------------------------------------------------------------------------
# Statistics
# ---------------------------------------------------------------------------


def test_holm_matches_the_textbook_family():
    adjusted = st.holm([0.01, 0.04, 0.03])
    # Sorted: 0.01 x 3 = 0.03, 0.03 x 2 = 0.06, 0.04 x 1 = 0.04 -> monotone 0.06.
    assert adjusted == pytest.approx([0.03, 0.06, 0.06])
    assert st.holm([]) == []
    assert st.holm([0.9, 0.9]) == pytest.approx([1.0, 1.0])


def test_cliffs_delta_endpoints():
    assert st.cliffs_delta([4, 5, 6], [1, 2, 3]) == 1.0
    assert st.cliffs_delta([1, 2, 3], [1, 2, 3]) == pytest.approx(0.0)


def test_spearman_is_one_on_a_monotone_pair():
    rho, p_value, _ = st.spearman_test([1, 2, 3, 4, 5], [10, 20, 30, 40, 50])
    assert rho == pytest.approx(1.0)
    assert p_value < 0.05


def test_jonckheere_detects_an_ordered_trend():
    values = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]
    codes = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]
    _, p_value, n = st.jonckheere_terpstra(values, codes, permutations=2000)
    assert n == 12
    assert p_value < 0.01

    flat_codes = [1, 2, 3] * 4
    _, p_flat, _ = st.jonckheere_terpstra(values, flat_codes, permutations=2000)
    assert p_flat > 0.05


def test_brown_forsythe_is_one_sided_on_dispersion():
    tight = [3.0, 3.1, 2.9, 3.0, 3.05, 2.95] * 3
    wide = [1.0, 5.0, 2.0, 4.0, 1.5, 4.5] * 3
    _, p_value = st.brown_forsythe_one_sided(tight, wide)
    assert p_value < 0.01
    # Swapped groups: the one-sided test must not fire.
    _, p_reverse = st.brown_forsythe_one_sided(wide, tight)
    assert p_reverse > 0.5
    assert st.mad_ratio(tight, wide) < 1


def test_ols_recovers_a_known_plane():
    rng = np.random.default_rng(1)
    x1 = rng.normal(size=200)
    x2 = rng.normal(size=200)
    y = 1.0 + 2.0 * x1 - 0.5 * x2 + rng.normal(scale=0.1, size=200)
    fit = st.ols(y, {"x1": x1, "x2": x2})
    assert fit.coefficient("x1")[0] == pytest.approx(2.0, abs=0.05)
    assert fit.coefficient("x2")[0] == pytest.approx(-0.5, abs=0.05)
    assert fit.coefficient("x1")[1] < 1e-6


def test_bootstrap_ci_brackets_the_point_estimate():
    rng = np.random.default_rng(2)
    values = rng.normal(loc=3.0, size=200)
    low, high = st.bootstrap_ci(lambda idx: float(values[idx].mean()), values.size, draws=300)
    assert low is not None and high is not None
    assert low < 3.0 < high
    assert st.bootstrap_ci(lambda idx: 1.0, 2) == (None, None)


def test_reliability_coefficients_on_a_known_matrix():
    rng = np.random.default_rng(3)
    trait = rng.normal(size=200)
    items = np.column_stack([trait + rng.normal(scale=0.3, size=200) for _ in range(4)])
    alpha = st.cronbach_alpha(items)
    omega = st.ordinal_omega(items)
    assert alpha is not None and omega is not None
    assert 0.85 < alpha < 1.0
    assert 0.85 < omega < 1.0
    # Pure noise has no common factor worth the name.
    noise = rng.normal(size=(200, 4))
    assert st.cronbach_alpha(noise) < 0.3


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------


def test_pipeline_runs_on_a_synthetic_sample():
    # Same path as a CSV read: multi-select and matrix cells arrive as JSON text.
    rows = [
        {key: parse_cell(value) for key, value in row.items()}
        for row in generate(n=80, seed=1).to_dict(orient="records")
    ]
    frame = build_dataset(rows)
    assert frame.shape[0] == 80
    assert frame["religiosity"].notna().sum() > 50

    results = run_hypotheses(frame, permutations=200)
    assert [r.hypothesis for r in results] == ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8"]
    assert {r.family for r in results} == {"primaire", "secondaire"}
    for result in results:
        if result.p_value is not None:
            assert 0.0 <= result.p_value <= 1.0


def test_sidedness_matches_the_pre_registration():
    # Every confirmatory statistic is two-sided except H7, whose omnibus
    # dispersion test has no sign and is coded one-sided (PREREGISTRATION 6.1).
    rows = [
        {key: parse_cell(value) for key, value in row.items()}
        for row in generate(n=80, seed=1).to_dict(orient="records")
    ]
    results = run_hypotheses(build_dataset(rows), permutations=50)
    sides = {r.hypothesis: r.alternative for r in results}
    assert sides["H7"] == "unilatéral"
    assert all(side == "bilatéral" for h, side in sides.items() if h != "H7")


def test_non_testable_hypothesis_leaves_its_family_before_holm():
    from confirmatory import apply_holm

    testable = st.TestResult("H2", "", "t", "secondaire", "bilatéral", 40, 1.0, 0.04, "d", 0.1)
    untestable = st.TestResult("H7", "", "t", "secondaire", "unilatéral", 4, None, None, "r", None)
    apply_holm([testable, untestable])
    # m = 1: the p-value is not multiplied, and the exclusion is written down.
    assert testable.p_holm == pytest.approx(0.04)
    assert untestable.p_holm is None
    assert any("retirée de la famille" in note and "m = 1" in note for note in untestable.notes)
