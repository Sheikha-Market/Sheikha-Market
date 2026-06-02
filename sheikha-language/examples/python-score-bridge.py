#!/usr/bin/env python3
import json
import sys


def main() -> int:
    payload = json.loads(sys.argv[1] if len(sys.argv) > 1 else "{}")
    metrics = payload.get("input", {}).get("metrics", {})
    human = float(metrics.get("human", 0))
    plant = float(metrics.get("plant", 0))
    hybrid = float(metrics.get("hybrid", 0))
    score = round((human * 0.35) + (plant * 0.35) + (hybrid * 0.30), 2)
    result = {
        "ok": True,
        "status": "scored",
        "trace_id": payload.get("trace_id"),
        "output": {
            "service": payload.get("input", {}).get("service", "unknown"),
            "score": score,
        },
    }
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
