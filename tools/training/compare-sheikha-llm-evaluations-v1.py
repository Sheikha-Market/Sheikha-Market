#!/usr/bin/env python3
import json
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BASE_REPORT = ROOT / os.environ.get(
    "SHEIKHA_BASE_EVALUATION",
    "runtime/sheikha-ai-governor/v1/llm-training/qwen2.5-0.5b-base-arabic-evaluation.json",
)
CANDIDATE_REPORT = ROOT / os.environ.get(
    "SHEIKHA_CANDIDATE_EVALUATION",
    "runtime/sheikha-ai-governor/v1/llm-training/qwen2.5-0.5b-lora-cidar-v1-evaluation.json",
)
OUTPUT = ROOT / os.environ.get(
    "SHEIKHA_COMPARISON_REPORT",
    "runtime/sheikha-ai-governor/v1/llm-training/sheikha-cidar-v1-promotion-decision.json",
)


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def summarize(report):
    results = report.get("results", [])
    passed = sum(1 for result in results if result.get("qualityPassed"))
    latencies = [result["latencyMs"] for result in results if "latencyMs" in result]
    return {
        "cases": len(results),
        "qualityPassedCases": passed,
        "qualityPassRate": passed / len(results) if results else 0,
        "nativeInferencePassed": report.get("nativeInferencePassed", False),
        "averageLatencyMs": round(sum(latencies) / len(latencies), 2) if latencies else None,
    }


def main():
    baseline = load(BASE_REPORT)
    candidate = load(CANDIDATE_REPORT)
    baseline_summary = summarize(baseline)
    candidate_summary = summarize(candidate)
    improvement = candidate_summary["qualityPassRate"] - baseline_summary["qualityPassRate"]
    promoted = (
        candidate_summary["nativeInferencePassed"]
        and candidate.get("qualityGatePassed", False)
        and improvement >= 0
    )
    decision = {
        "system": "SHEIKHA_LLM_CANDIDATE_PROMOTION_DECISION_V1",
        "status": "PROMOTION_ACCEPTED" if promoted else "PROMOTION_REJECTED",
        "baseline": baseline_summary,
        "candidate": candidate_summary,
        "qualityPassRateDelta": round(improvement, 6),
        "candidateAdapterSha256": candidate.get("adapterSha256"),
        "productionApproved": promoted,
        "reasons": [] if promoted else [
            "CANDIDATE_QUALITY_GATE_NOT_PASSED",
            "CANDIDATE_DID_NOT_OUTPERFORM_BASELINE" if improvement < 0 else "QUALITY_CERTIFICATION_REQUIRED",
        ],
        "nextAction": (
            "PROMOTE_BEHIND_CANARY"
            if promoted
            else "KEEP_BASELINE_AND_BUILD_CURATED_DOMAIN_CURRICULUM_WITH_HELD_OUT_EVALUATION"
        ),
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(decision, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(decision, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
