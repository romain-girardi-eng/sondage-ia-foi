"""Re-implementation of the instrument's scoring, for the confirmatory analysis.

Mirrors ``src/lib/scoring/dimensions.ts`` exactly: the same items, the same
weights, the same routing predicates, the same "missing is never imputed" rule
and the same two-decimal rounding. A dimension whose answered items fall below
its floor is ``None``, never zero.
"""

from __future__ import annotations

import json
import math
from typing import Any, Mapping

from scoring_maps import (
    COUNT_ITEM_SPECS,
    DIMENSION_ITEM_SPECS,
    DIMENSION_KEYS,
    EXCLUSIVE_OPTION_PREFIX,
    ITEM_SCORE_MAPS,
    MATRIX_MAX_LEVEL,
    MATRIX_TASK_WEIGHTS,
    MC_FLAG_THRESHOLD,
    MC_KEYED_RESPONSES,
    MC_MIN_ITEMS,
    MIN_ITEMS,
    MIN_ITEMS_BY_DIMENSION,
    MISSING_VALUES,
    SCALE_ITEM_REVERSED,
    SCALE_MAX,
    SCALE_MIN,
    ItemSpec,
)

Answers = Mapping[str, Any]


def js_round2(value: float) -> float:
    """JavaScript ``Math.round(x * 100) / 100`` (half away from zero)."""
    scaled = value * 100
    rounded = math.floor(scaled + 0.5) if scaled >= 0 else math.ceil(scaled - 0.5)
    return rounded / 100


def parse_cell(raw: Any) -> Any:
    """Turn one CSV cell into the answer value the TypeScript scorer expects.

    A CSV has no types, so multi-select and matrix answers travel as JSON
    (``["a","b"]`` / ``{"plan":2}``); a pipe-separated list is also accepted for
    multi-selects, because that is what spreadsheet exports produce. Anything
    else stays a string, except a bare number which becomes a float (the 1-5
    sliders).
    """
    if raw is None:
        return ""
    if isinstance(raw, (list, dict, int, float)):
        if isinstance(raw, float) and math.isnan(raw):
            return ""
        return raw
    text = str(raw).strip()
    if text == "":
        return ""
    if text[0] in "[{":
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return text
    if "|" in text:
        return [part for part in (p.strip() for p in text.split("|")) if part]
    try:
        return float(text)
    except ValueError:
        return text


def is_missing(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return value in MISSING_VALUES
    if isinstance(value, bool):
        return False
    if isinstance(value, (int, float)):
        return not math.isfinite(float(value))
    if isinstance(value, (list, tuple)):
        return len(value) == 0
    if isinstance(value, dict):
        return len(value) == 0
    return False


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def score_item(item_id: str, answers: Answers) -> float | None:
    """1-5 score for one item, or None when the answer carries no position."""
    raw = answers.get(item_id)
    if is_missing(raw):
        return None

    option_map = ITEM_SCORE_MAPS.get(item_id)
    if option_map is not None:
        if not isinstance(raw, str):
            return None
        score = option_map.get(raw)
        return float(score) if score is not None else None

    if item_id in SCALE_ITEM_REVERSED:
        if isinstance(raw, bool) or not isinstance(raw, (int, float)):
            return None
        bounded = _clamp(float(raw), SCALE_MIN, SCALE_MAX)
        return SCALE_MIN + SCALE_MAX - bounded if SCALE_ITEM_REVERSED[item_id] else bounded

    count_spec = COUNT_ITEM_SPECS.get(item_id)
    if count_spec is not None:
        if not isinstance(raw, (list, tuple)):
            return None
        exclusive = count_spec["exclusive"]
        assert isinstance(exclusive, tuple)
        for value in raw:
            if value in exclusive or (
                isinstance(value, str) and value.startswith(EXCLUSIVE_OPTION_PREFIX)
            ):
                return float(count_spec["floor"])  # type: ignore[arg-type]
        step = float(count_spec["step"])  # type: ignore[arg-type]
        return _clamp(1 + len(raw) * step, 1.0, 5.0)

    task_weights = MATRIX_TASK_WEIGHTS.get(item_id)
    if task_weights is not None:
        if not isinstance(raw, dict):
            return None
        weighted = 0.0
        max_weighted = 0.0
        for task, weight in task_weights.items():
            level = raw.get(task)
            if isinstance(level, bool) or not isinstance(level, (int, float)):
                continue
            if not math.isfinite(float(level)):
                continue
            weighted += _clamp(float(level), 0, MATRIX_MAX_LEVEL) * weight
            max_weighted += MATRIX_MAX_LEVEL * weight
        if max_weighted == 0:
            return None
        return 1 + (weighted / max_weighted) * 4

    return None


def _is_applicable(spec: ItemSpec, answers: Answers) -> bool:
    # An answered item was evidently shown, whatever the routing predicate says.
    if not is_missing(answers.get(spec.item_id)):
        return True
    return spec.applicable(answers) if spec.applicable is not None else True


def aggregate(specs, answers: Answers, min_items: int) -> dict[str, Any]:
    weighted_sum = 0.0
    total_weight = 0.0
    n_items = 0
    max_items = 0

    for spec in specs:
        if not _is_applicable(spec, answers):
            continue
        max_items += 1
        score = score_item(spec.item_id, answers)
        if score is None:
            continue
        n_items += 1
        weighted_sum += score * spec.weight
        total_weight += spec.weight

    value = (
        js_round2(weighted_sum / total_weight)
        if n_items >= min_items and total_weight > 0
        else None
    )
    return {
        "value": value,
        "confidence": (n_items / max_items) if max_items > 0 else 0.0,
        "nItems": n_items,
        "maxItems": max_items,
    }


def calculate_dimension(key: str, answers: Answers) -> dict[str, Any]:
    return aggregate(DIMENSION_ITEM_SPECS[key], answers, MIN_ITEMS_BY_DIMENSION[key])


def calculate_all_dimensions(answers: Answers) -> dict[str, dict[str, Any]]:
    return {key: calculate_dimension(key, answers) for key in DIMENSION_KEYS}


def compute_core_subscores(answers: Answers) -> dict[str, dict[str, Any]]:
    def core(dimension: str) -> dict[str, Any]:
        specs = [s for s in DIMENSION_ITEM_SPECS[dimension] if s.core]
        return aggregate(specs, answers, MIN_ITEMS)

    return {
        "sacredBoundaryCore": core("sacredBoundary"),
        "aiOpennessCore": core("aiOpenness"),
    }


def social_desirability(answers: Answers) -> dict[str, Any]:
    """Marlowe-Crowne ad hoc five: a covariate flag, never a correction."""
    endorsed = 0
    n_items = 0
    for item_id, keyed in MC_KEYED_RESPONSES.items():
        answer = answers.get(item_id)
        if not isinstance(answer, str):
            continue
        if answer in ("", "sans_reponse", "ne_sait_pas"):
            continue
        n_items += 1
        if answer == keyed:
            endorsed += 1

    if n_items < MC_MIN_ITEMS:
        return {"score": None, "nItems": n_items, "flag": False}

    score = endorsed / n_items
    return {"score": score, "nItems": n_items, "flag": score >= MC_FLAG_THRESHOLD}
