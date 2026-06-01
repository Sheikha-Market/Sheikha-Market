#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Apply optimum rules from JSON data to an input payload."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_RULES_PATH = REPO_ROOT / "resources" / "optimum-rules.json"


def _to_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _is_match(rule: dict[str, Any], payload: dict[str, Any]) -> bool:
    value = _to_float(payload.get(rule.get("field")))
    if value is None:
        return False

    operator = rule.get("operator")
    if operator == "between":
        minimum = _to_float(rule.get("min"))
        maximum = _to_float(rule.get("max"))
        if minimum is None or maximum is None:
            return False
        return minimum <= value <= maximum
    if operator == "gte":
        threshold = _to_float(rule.get("value"))
        return threshold is not None and value >= threshold
    if operator == "lte":
        threshold = _to_float(rule.get("value"))
        return threshold is not None and value <= threshold
    if operator == "eq":
        threshold = _to_float(rule.get("value"))
        return threshold is not None and value == threshold
    return False


def evaluate_rules(rules_path: Path, payload: dict[str, Any]) -> dict[str, Any]:
    rules_data = json.loads(rules_path.read_text(encoding="utf-8"))
    rules = [rule for rule in rules_data.get("rules", []) if rule.get("enabled")]

    total_weight = sum(max(0, int(rule.get("weight", 0))) for rule in rules)
    score = 0
    matched_rules: list[str] = []

    for rule in rules:
        weight = max(0, int(rule.get("weight", 0)))
        if weight and _is_match(rule, payload):
            score += weight
            matched_rules.append(str(rule.get("id", "unknown")))

    normalized_score = (score / total_weight * 100) if total_weight else 0.0
    return {
        "rulesVersion": rules_data.get("version"),
        "totalRules": len(rules),
        "matchedRules": matched_rules,
        "rawScore": score,
        "maxScore": total_weight,
        "normalizedScore": round(normalized_score, 2),
        "isOptimum": normalized_score >= 80,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate optimum rules from JSON data")
    parser.add_argument(
        "--rules",
        default=str(DEFAULT_RULES_PATH),
        help="Path to rules JSON file",
    )
    parser.add_argument(
        "--payload",
        required=True,
        help='JSON payload as string, e.g. "{\"stockDays\":30}"',
    )

    args = parser.parse_args()
    payload = json.loads(args.payload)
    result = evaluate_rules(Path(args.rules), payload)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
