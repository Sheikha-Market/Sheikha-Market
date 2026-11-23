# -*- coding: utf-8 -*-
# SHEIKHA SOVEREIGN MOE & POLYGLOT PROGRAMMING ARCHITECTURE
# Owner: Salman Ahmed bin Salman Al-Rajhi (CR: 2051263653 | Unified ID: 7049031003)
# Creed: LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH

import json
import math
from pathlib import Path
import sys

SHEIKHA_MOE_MATRIX = {
    "seal": "ATOM_WATER_RASUL_JANNAH_SEALED",
    "bound": "BOUND_BY_QURAN_SUNNAH",
    "languages": {
        "native": "Sheikha DSL (.shk)",
        "compiled": ["Rust", "C++20", "Go"],
        "hardware_embedded": ["C", "ESP-IDF", "ROS2 Python/C++"],
        "data_science": ["Python 3.11", "Julia"]
    },
    "minds": ["GOVERNOR", "WATCH", "TRADER", "ENTREPRENEUR", "CEO", "STRATEGIST", "PILOT", "SOVEREIGN"],
    "weights_summary": {
        "kind": "metadata_ledger",
        "smart_foundations": ["ESP32", "HX711", "MPU6050", "Soil-Moisture"],
        "construction_codes": "SBC 201-1201 + IBC + ISO",
        "materials": "Pearl Metal 15000MT Superalloy"
    }
}


def read_metadata_summary(registry_path=None):
    """Count registry metadata and recorded rewards, without asserting asset value."""
    path = (Path(registry_path) if registry_path is not None else
            Path(__file__).resolve().parents[2] / "blockchain" / "registry.json")
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict):
        records = list(data.values())
    elif isinstance(data, list):
        records = data
    else:
        raise ValueError("Registry must be a flat object or a list of metadata records")
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            raise ValueError(f"Record {index} must be an object")
        reward = record.get("shk_reward")
        if (isinstance(reward, bool) or not isinstance(reward, (int, float))
                or (isinstance(reward, float) and not math.isfinite(reward))
                or reward < 0):
            raise ValueError(f"Record {index} has an invalid shk_reward")
    total = sum(record["shk_reward"] for record in records)
    if isinstance(total, float) and not math.isfinite(total):
        raise ValueError("Recorded reward total is not finite")
    return {"kind": "metadata_ledger", "metadata_records": len(records),
            "recorded_reward_units": total, "reward_unit": "SHK"}


if __name__ == "__main__":
    try:
        summary = read_metadata_summary()
    except (OSError, ValueError) as error:
        print(f"Cannot read metadata ledger: {error}", file=sys.stderr)
        sys.exit(1)
    print("[SHEIKHA-MOE] Architecture definition and metadata ledger summary.")
    print(f"Metadata records: {summary['metadata_records']}")
    print(f"Recorded reward units (SHK): {summary['recorded_reward_units']}")
    print("This summary does not establish trained neural tensors or financial asset backing.")
