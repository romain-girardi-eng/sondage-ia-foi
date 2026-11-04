#!/usr/bin/env python3
"""Descriptive v1 / v2 comparability note (PREREGISTRATION 6.6, second analysis).

For every item marked « conservé* » in docs/INSTRUMENT_V2_CHANGES.md, gives the
distribution of the answers by instrument version. No test, no pooled statistic.
A cell under five responses is shown as « < 5 », as in every public output.

Usage:
    python3 analysis/comparability_v1_v2.py --input export.csv --out analysis/out
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pandas as pd

CHANGES_FILE = Path(__file__).resolve().parent.parent / "docs" / "INSTRUMENT_V2_CHANGES.md"
MIN_CELL = 5


def conserved_star_items(markdown: str) -> list[str]:
    """Item ids of the table rows whose verdict is « conservé* »."""
    items: list[str] = []
    for line in markdown.splitlines():
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if line.startswith("|") and len(cells) >= 2 and cells[-1].startswith("conservé\\*"):
            items += [item for item in re.findall(r"`([a-z_0-9]+)`", cells[0]) if item not in items]
    return items


def version_label(value: str) -> str:
    return "v2" if value.startswith("2.") else "v1"


def distributions(frame: pd.DataFrame, items: list[str]) -> dict[str, dict[str, dict[str, int]]]:
    versions = frame["instrumentVersion"].map(version_label)
    out: dict[str, dict[str, dict[str, int]]] = {}
    for item in items:
        if item not in frame.columns:
            continue
        answered = frame[item] != ""
        table = pd.crosstab(frame.loc[answered, item], versions[answered])
        out[item] = {
            version: {str(k): int(v) for k, v in table[version].items() if v > 0}
            for version in table.columns
        }
    return out


def cell(count: int, total: int) -> str:
    if count < MIN_CELL:
        return "< 5"
    return f"{count} ({100 * count / total:.0f} %)".replace(".", ",")


def report(data: dict[str, dict[str, dict[str, int]]]) -> str:
    lines = [
        "# Note de comparabilité v1 et v2",
        "",
        "Distributions par version des items marqués « conservé* », sans test.",
        "",
    ]
    for item, by_version in data.items():
        versions = sorted(by_version)
        lines += [f"## {item}", "", "| Modalité | " + " | ".join(versions) + " |"]
        lines.append("| --- |" + " --- |" * len(versions))
        totals = {v: sum(by_version[v].values()) for v in versions}
        for value in sorted({key for v in versions for key in by_version[v]}):
            row = [cell(by_version[v].get(value, 0), totals[v]) for v in versions]
            lines.append(f"| {value} | " + " | ".join(row) + " |")
        lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True, help="dedicated CSV export")
    parser.add_argument("--out", type=Path, default=Path(__file__).resolve().parent / "out")
    args = parser.parse_args()

    frame = pd.read_csv(args.input, dtype=str, keep_default_na=False)
    if "instrumentVersion" not in frame.columns:
        parser.error("colonne `instrumentVersion` absente de l'export")
    items = conserved_star_items(CHANGES_FILE.read_text(encoding="utf-8"))
    data = distributions(frame, items)

    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "comparability_v1_v2.md").write_text(report(data), encoding="utf-8")
    (args.out / "comparability_v1_v2.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"{len(data)} item(s) sur {len(items)} : {args.out / 'comparability_v1_v2.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
