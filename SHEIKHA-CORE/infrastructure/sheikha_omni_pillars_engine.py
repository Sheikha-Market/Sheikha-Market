# -*- coding: utf-8 -*-
"""Read-only local assessment of twelve declared pillars and optional telemetry.

Only JSON stdout is produced by default. --output exclusively creates a new file.
No network, hardware, training, funding, minting or blockchain operations occur.
"""
import argparse
from datetime import datetime, timedelta, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import stat
import sys

ROOT = Path(__file__).resolve().parents[2]
MAX_INPUT_BYTES = 4 * 1024 * 1024
PILLARS = (
    ("Tawheed_and_Governance", "backbone", "global-neural-governance-init.js"),
    ("SheikhaChain_Ledger", "backbone", "SHEIKHA-CORE/sheikhachain/core/sheikha_chain_engine.py"),
    ("Smart_Foundations_SBC303", "substructure", "SHEIKHA-CORE/families/smart-foundations"),
    ("Human_Body_Twin", "substructure", "SHEIKHA-CORE/families/body-twin"),
    ("Pearl_Metal_Foundry", "substructure", "SHEIKHA-CORE/families/pearl-metal"),
    ("ROS2_Autonomous_Robotics", "substructure", "SHEIKHA-CORE/ros2_ws"),
    ("Sheikha_Polyglot_DSL", "backbone", "SHEIKHA-CORE/families/01_language"),
    ("Universal_Supply_HS_Codes", "backbone", "SHEIKHA-CORE/sheikhachain/supply_chain"),
    ("Global_Multimodal_Logistics", "superstructure", "SHEIKHA-CORE/sheikhachain/logistics"),
    ("Islamic_Triple_Entry_Finance", "backbone", "SHEIKHA-CORE/sheikhachain/finance"),
    ("Digital_Venture_Incubator", "superstructure", "SHEIKHA-CORE/sheikhachain/incubator"),
    ("Supercomputing_8_Minds", "superstructure", "SHEIKHA-CORE/families/weights/sheikha_moe_architecture.py"),
)
UNITS = {"soil_stress": "kPa", "robot_battery": "%", "chain_block_height": "block"}


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def reject_constant(value):
    raise ValueError(f"Non-finite JSON number: {value}")


def read_json(path):
    path = Path(path)
    before = path.lstat()
    if not stat.S_ISREG(before.st_mode) or before.st_size > MAX_INPUT_BYTES:
        raise ValueError("Input must be a regular file of at most 4 MiB")
    with path.open("rb") as stream:
        raw = stream.read(MAX_INPUT_BYTES + 1)
    identity = lambda item: (item.st_dev, item.st_ino, item.st_size, item.st_mtime_ns, item.st_ctime_ns)
    if len(raw) > MAX_INPUT_BYTES or identity(before) != identity(path.lstat()):
        raise ValueError("Input changed while being read")
    data = json.loads(raw, object_pairs_hook=unique_object, parse_constant=reject_constant)
    return data, hashlib.sha256(raw).hexdigest()


def nonnegative(value, label):
    if (isinstance(value, bool) or not isinstance(value, (int, float))
            or (isinstance(value, float) and not math.isfinite(value)) or value < 0):
        raise ValueError(f"{label} must be a finite, nonnegative number")
    return value


def registry_summary(path):
    data, digest = read_json(path)
    if isinstance(data, dict):
        containers = [key for key in ("weights", "records", "ledger", "blocks")
                      if isinstance(data.get(key), (dict, list))
                      and not (isinstance(data[key], dict) and "shk_reward" in data[key])]
        if len(containers) > 1:
            raise ValueError("Ambiguous registry containers")
        if containers:
            key = containers[0]
            if any(isinstance(value, dict) and "shk_reward" in value
                   for name, value in data.items() if name != key):
                raise ValueError("Mixed flat and wrapped records")
            data = data[key]
    if isinstance(data, dict):
        records = list(data.values())
    elif isinstance(data, list):
        records = data
    else:
        raise ValueError("Registry must contain a flat object or list of records")
    total = 0
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            raise ValueError(f"Record {index} must be an object")
        total += nonnegative(record.get("shk_reward"), f"Record {index} reward")
    nonnegative(total, "Reward total")
    return {"scope": "metadata_only", "metadata_records": len(records),
            "recorded_reward_units": total, "unit": "SHK", "registry_sha256": digest,
            "financial_balance_verified": False, "trained_weights_verified": False}


def utc_timestamp(value):
    if not isinstance(value, str):
        raise ValueError("observed_at must be an ISO 8601 timestamp with timezone")
    try:
        timestamp = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError("Invalid observed_at timestamp") from error
    if timestamp.tzinfo is None or timestamp.utcoffset() is None:
        raise ValueError("observed_at must include a timezone")
    return timestamp.astimezone(timezone.utc)


def validate_telemetry(data, now):
    if not isinstance(data, dict) or set(data) != {"source", "observed_at", "measurements"}:
        raise ValueError("Telemetry requires exactly source, observed_at and measurements")
    source = data["source"]
    if not isinstance(source, str) or not source.strip() or len(source) > 256:
        raise ValueError("source must be a nonempty string of at most 256 characters")
    observed = utc_timestamp(data["observed_at"])
    if observed > now + timedelta(minutes=5):
        raise ValueError("Telemetry timestamp is more than five minutes in the future")
    measurements = data["measurements"]
    if not isinstance(measurements, dict) or not measurements or set(measurements) - set(UNITS):
        raise ValueError("Use supported, nonempty measurements")
    for name, item in measurements.items():
        if not isinstance(item, dict) or set(item) != {"value", "unit"}:
            raise ValueError(f"{name} requires exactly value and unit")
        value = nonnegative(item["value"], name)
        if item["unit"] != UNITS[name]:
            raise ValueError(f"{name} unit must be {UNITS[name]}")
        if name == "robot_battery" and value > 100:
            raise ValueError("robot_battery must be between zero and 100 percent")
        if name == "chain_block_height" and not isinstance(value, int):
            raise ValueError("chain_block_height must be an integer")
    return {"source": source, "observed_at": observed.isoformat(),
            "age_seconds": max(0, (now - observed).total_seconds()),
            "measurements": measurements, "verified": False,
            "scope": "provided_values_not_device_or_chain_verification"}


def canonical_hash(report):
    payload = {key: value for key, value in report.items() if key != "integrity"}
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"),
                           ensure_ascii=False, allow_nan=False).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


class SheikhaUniversalIntegrator:
    def assess(self, root=ROOT, registry_path=None, telemetry=None, demo=False, now=None):
        if telemetry is not None and demo:
            raise ValueError("Choose provided telemetry or demo, not both")
        now = now or datetime.now(timezone.utc)
        if now.tzinfo is None or now.utcoffset() is None:
            raise ValueError("Assessment time must include a timezone")
        now = now.astimezone(timezone.utc)
        root = Path(root)
        registry_path = Path(registry_path) if registry_path is not None else root / "SHEIKHA-CORE/blockchain/registry.json"
        registry = registry_summary(registry_path)
        pillars = []
        for name, layer, relative in PILLARS:
            path = root / relative
            pillars.append({"id": name, "layer": layer, "source_path": relative,
                            "source_exists": path.exists(), "source_is_file": path.is_file(),
                            "source_is_directory": path.is_dir(),
                            "evidence_scope": "path_presence_only", "active_verified": False})
        if demo:
            telemetry = {"source": "synthetic_example_not_hardware", "observed_at": now.isoformat(),
                         "measurements": {"soil_stress": {"value": 118.4, "unit": "kPa"},
                                          "robot_battery": {"value": 98.5, "unit": "%"},
                                          "chain_block_height": {"value": 2, "unit": "block"}}}
        sample = validate_telemetry(telemetry, now) if telemetry is not None else None
        if sample is not None:
            sample["simulation"] = demo
        report = {
            "schema": "sheikha-local-pillars-assessment-v1",
            "scope": "local_metadata_path_presence_and_optional_unverified_values",
            "mode": "simulation" if demo else "local_assessment", "observed_at": now.isoformat(),
            "owner": "سلمان أحمد بن سلمان الراجح (CR: 2051263653 | Unified ID: 7049031003)",
            "governance_reference": {"bound": "BOUND_BY_QURAN_SUNNAH", "seal": "ATOM_WATER_RASUL_JANNAH_SEALED",
                                     "creed": "LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH",
                                     "independent_compliance_verified": False},
            "declarations": {"pillars": len(PILLARS), "minds": 8, "foundries": 5, "bots": 58,
                             "capabilities": ["ESP32/HX711/MPU6050", "Thermal Multispectral Vision",
                                              "ROS2 AGVs/Hydraulic Arms/Robotic Vision",
                                              "Pearl Metal 15000MT", "Ministries and Diplomacy"]},
            "verified_active_counts": {"pillars": None, "minds": None, "foundries": None, "bots": None},
            "pillars": pillars,
            "layers": {layer: [name for name, assigned, _ in PILLARS if assigned == layer]
                       for layer in ("substructure", "backbone", "superstructure")},
            "metadata_registry": registry, "telemetry": sample,
            "operations_performed": {"network": False, "hardware": False, "training": False,
                                     "trained_weights": False, "mint": False, "funding": False,
                                     "blockchain": False, "cloud_deploy": False},
        }
        report["integrity"] = {"algorithm": "sha256", "scope": "canonical_report_without_integrity",
                               "sha256": canonical_hash(report)}
        return report


def write_exclusive(path, report):
    payload = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    fd = os.open(Path(path), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as output:
        output.write(payload)
        output.flush()
        os.fsync(output.fileno())


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, epilog=(
        'Telemetry: {"source":"station-A","observed_at":"2026-10-24T12:00:00Z",'
        '"measurements":{"soil_stress":{"value":12,"unit":"kPa"},'
        '"robot_battery":{"value":80,"unit":"%"},'
        '"chain_block_height":{"value":2,"unit":"block"}}}. '
        'Values remain unverified; --demo explicitly labels synthetic examples.'))
    parser.add_argument("--registry", type=Path, help="Read an alternate local metadata registry")
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--telemetry", type=Path, help="Read timestamped and unit-labelled telemetry JSON")
    source.add_argument("--demo", action="store_true", help="Use labelled synthetic telemetry")
    parser.add_argument("--output", type=Path, help="Create a NEW report file; refuse existing targets")
    args = parser.parse_args(argv)
    try:
        telemetry = read_json(args.telemetry)[0] if args.telemetry is not None else None
        report = SheikhaUniversalIntegrator().assess(registry_path=args.registry, telemetry=telemetry, demo=args.demo)
        if args.output is not None:
            write_exclusive(args.output, report)
        print(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False))
        return 0
    except (OSError, ValueError) as error:
        print(f"Assessment failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
