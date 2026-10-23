#!/usr/bin/env python3
"""Raha local data review and V43.75 evidence inspection; never a production writer."""

import argparse
import ast
from contextlib import closing
from datetime import datetime, timezone
from decimal import Decimal, localcontext
import importlib.util
import json
import os
from pathlib import Path
import re
import sqlite3


HELPER = Path(__file__).with_name("sheikha-v35-evidence-audit-v1.py")
SPEC = importlib.util.spec_from_file_location("raha_file_safety", HELPER)
safe = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(safe)
ROOT = Path(__file__).resolve().parents[2]
ENGINE = safe.KERNEL / "sheikha_v43_75_raha_kernel_engine.py"
MANIFEST = safe.KERNEL / "sheikha_v43_75_raha_kernel_manifest.json"
MANIFEST_KEY = "sheikha_v43_75_raha_manifest_hash"
DATABASE_KEY = "sheikha_sql_db_v43_75_raha_hash"
MAX_BATCH_BYTES = 1024 * 1024
MAX_RECORDS = 1000
ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{0,63}")
DIGEST = re.compile(r"[0-9a-f]{64}")
NUMBER = re.compile(r"-?(?:0|[1-9][0-9]{0,11})(?:\.[0-9]{1,6})?")
UNITS = {"measurement": {"kg", "m", "l", "kWh", "count"},
         "transaction": {"SAR", "USD", "EUR"}}
FIELDS = {"id", "kind", "value", "unit", "sourceSha256", "sourceClass"}


def packed(value):
    return json.dumps(value, ensure_ascii=True, sort_keys=True, separators=(",", ":"), allow_nan=False)


def boundaries():
    return {"productionHold": True, "productionReady": False, "closureAccepted": False,
            "shariaCertification": "NOT_PERFORMED", "financialExecution": False,
            "bareMetalRuntimeVerified": False, "hardwareActuation": False,
            "modelWeightsLoaded": False, "networkUsed": False}


def legacy_audit(ecosystem):
    report = {"scope": "V43_75_FILE_BINDINGS_ONLY", "sources": [], "issues": [],
              "engineExecuted": False, "liveDatabaseOpened": False,
              "evidenceV2Updated": False, "databaseIntegrity": "NOT_CHECKED",
              "runtimeClaimsVerified": False}
    captured = {}
    db_path = Path(ecosystem) / safe.DATABASE
    try:
        ecosystem = safe.no_symlinks(ecosystem)
        if safe.has_sidecars(db_path):
            raise safe.AuditError("LIVE_SQLITE_SIDECAR_PRESENT")
        for relative in (ENGINE, MANIFEST, safe.LEDGER, safe.DATABASE):
            data = safe.read_file(ecosystem / relative)
            captured[relative] = data
            report["sources"].append({"path": str(relative), "sha256": safe.sha256(data), "bytes": len(data)})
        tree = ast.parse(captured[ENGINE])
        manifest = safe.json_object(captured[MANIFEST])
        ledger = safe.json_object(captured[safe.LEDGER]).get("verified_physical_digests")
        if not isinstance(ledger, dict):
            raise safe.AuditError("V2_DIGEST_MAP_MISSING")
        scope = manifest.get("raha_kernel_scope")
        if not isinstance(scope, dict):
            raise safe.AuditError("RAHA_SCOPE_MISSING")
        recorded = manifest.get("database_digest")
        if not isinstance(recorded, str) or not DIGEST.fullmatch(recorded):
            raise safe.AuditError("MANIFEST_DATABASE_DIGEST_INVALID")
        report["manifestMatchesV2"] = ledger.get(MANIFEST_KEY) == safe.sha256(captured[MANIFEST])
        report["historicalDatabaseBindingMatchesV2"] = ledger.get(DATABASE_KEY) == recorded
        if not report["manifestMatchesV2"] or not report["historicalDatabaseBindingMatchesV2"]:
            report["issues"].append("V43_75_EVIDENCE_BINDING_MISMATCH")
        # A mutable master may have newer versions; a historical mismatch is not proof of tampering.
        report["currentDatabaseMatchesHistoricalBinding"] = safe.sha256(captured[safe.DATABASE]) == recorded
        report["historicalDatabaseSnapshotAvailable"] = False
        declared = dict(scope, status=manifest.get("status"))
        matching = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Dict):
                for key, value in zip(node.keys, node.values):
                    if (isinstance(key, ast.Constant) and isinstance(key.value, str)
                            and isinstance(value, ast.Constant) and isinstance(value.value, str)
                            and declared.get(key.value) == value.value):
                        matching.add(key.value)
        report["sourceSyntax"] = "PARSED_NOT_EXECUTED"
        report["matchingLiteralClaimCount"] = len(matching)
    except (safe.AuditError, OSError, ValueError, SyntaxError, RecursionError) as error:
        report["issues"].append(str(error) if isinstance(error, safe.AuditError) else type(error).__name__)
    unchanged = bool(captured)
    for relative, data in captured.items():
        try:
            unchanged = (safe.sha256(safe.read_file(Path(ecosystem) / relative)) == safe.sha256(data)) and unchanged
        except (safe.AuditError, OSError):
            unchanged = False
    if safe.has_sidecars(db_path):
        unchanged = False
    report["sourceBytesUnchanged"] = unchanged
    if not unchanged:
        report["issues"].append("INPUT_SNAPSHOT_NOT_CONFIRMED")
    report["localEvidenceConsistent"] = not report["issues"]
    return report


def decimal_text(value):
    if value == 0:
        return "0"
    text = format(value, "f")
    return text.rstrip("0").rstrip(".") if "." in text else text


def record_problem(record):
    if not isinstance(record, dict) or set(record) != FIELDS:
        return "RECORD_SCHEMA"
    if not isinstance(record["id"], str) or not ID.fullmatch(record["id"]):
        return "RECORD_ID"
    if not isinstance(record["kind"], str) or record["kind"] not in UNITS:
        return "RECORD_KIND"
    if not isinstance(record["unit"], str) or record["unit"] not in UNITS[record["kind"]]:
        return "RECORD_UNIT"
    if not isinstance(record["sourceSha256"], str) or not DIGEST.fullmatch(record["sourceSha256"]):
        return "SOURCE_DIGEST"
    if record["sourceClass"] not in ("SYNTHETIC", "USER_DECLARED"):
        return "SOURCE_CLASS"
    if not isinstance(record["value"], str) or not NUMBER.fullmatch(record["value"]):
        return "DECIMAL_STRING_REQUIRED"
    value = Decimal(record["value"])
    if record["kind"] == "transaction" and value < 0:
        return "NEGATIVE_TRANSACTION_UNSUPPORTED"
    if record["unit"] == "count" and value != value.to_integral_value():
        return "INTEGER_COUNT_REQUIRED"
    return None


def process_batch(data):
    if not isinstance(data, bytes) or len(data) > MAX_BATCH_BYTES:
        raise safe.AuditError("BATCH_BYTE_LIMIT_OR_TYPE")
    batch = safe.json_object(data)
    packed(batch)  # Reject non-finite JSON extensions before producing any result.
    if (set(batch) != {"schemaVersion", "records"} or type(batch["schemaVersion"]) is not int
            or batch["schemaVersion"] != 1 or not isinstance(batch["records"], list)
            or not 1 <= len(batch["records"]) <= MAX_RECORDS):
        raise safe.AuditError("BATCH_SCHEMA_OR_RECORD_LIMIT")
    records = batch["records"]
    hashes = [safe.sha256(packed(record).encode()) for record in records]
    by_id = {}
    for index, record in enumerate(records):
        if isinstance(record, dict) and isinstance(record.get("id"), str) and ID.fullmatch(record["id"]):
            by_id.setdefault(record["id"], set()).add(hashes[index])
    reviews, totals, seen = [], {}, set()
    counts = {"input": len(records), "validated": 0, "duplicates": 0, "quarantined": 0}
    with localcontext() as ctx:
        ctx.prec = 40
        for index, record in enumerate(records):
            problem = record_problem(record)
            if isinstance(record, dict) and isinstance(record.get("id"), str) and len(by_id.get(record["id"], ())) > 1:
                problem = "CONFLICTING_RECORD_ID"
            if problem:
                disposition = "QUARANTINED"
                counts["quarantined"] += 1
            elif record["id"] in seen:
                disposition, problem = "DUPLICATE_IGNORED", "IDENTICAL_RECORD"
                counts["duplicates"] += 1
            else:
                seen.add(record["id"])
                disposition, problem = "VALIDATED_FOR_REVIEW", "HUMAN_REVIEW_REQUIRED"
                counts["validated"] += 1
                key = (record["kind"], record["unit"], record["sourceClass"])
                totals[key] = totals.get(key, Decimal(0)) + Decimal(record["value"])
            reviews.append({"position": index, "recordSha256": hashes[index],
                            "disposition": disposition, "reason": problem})
    return {"inputSha256": safe.sha256(data), "counts": counts, "records": reviews,
            "aggregates": [{"kind": k[0], "unit": k[1], "sourceClass": k[2], "total": decimal_text(v)}
                           for k, v in sorted(totals.items())],
            "sourceDigestsAuthenticated": False, "settlementAuthorized": False,
            "shariaReview": "HUMAN_REVIEW_REQUIRED"}


def build_report(ecosystem, batch_path=None):
    report = {"schema": "SHEIKHA_RAHA_LOCAL_REVIEW_V1",
              "checkedAt": datetime.now(timezone.utc).isoformat(),
              "boundaries": boundaries(), "issues": [], "batch": None,
              "toolSha256": safe.sha256(safe.read_file(Path(__file__))),
              "helperSha256": safe.sha256(safe.read_file(HELPER)),
              "legacy": legacy_audit(ecosystem)}
    if batch_path is not None:
        try:
            data = safe.read_file(batch_path)
            batch = process_batch(data)
            if safe.sha256(safe.read_file(batch_path)) != safe.sha256(data):
                raise safe.AuditError("BATCH_CHANGED_DURING_REVIEW")
            report["batch"] = batch
        except (safe.AuditError, OSError, ValueError, RecursionError) as error:
            report["issues"].append(str(error) if isinstance(error, safe.AuditError) else type(error).__name__)
    blocked = (report["issues"] or report["legacy"]["issues"]
               or (report["batch"] and report["batch"]["counts"]["quarantined"]))
    report["status"] = "LOCAL_REVIEW_BLOCKED_PRODUCTION_HOLD" if blocked else "LOCAL_REVIEW_COMPLETE_PRODUCTION_HOLD"
    return report


def write_new(path, data):
    safe.no_symlinks(path)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "wb") as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())


def save_bundle(report, destination, private_root=None):
    private_root = safe.no_symlinks(private_root or ROOT / "reports/private")
    destination = safe.no_symlinks(destination)
    if destination.parent != private_root:
        raise safe.AuditError("OUTPUT_MUST_BE_NEW_DIRECT_CHILD_OF_PRIVATE_REPORTS")
    if not private_root.is_dir() or private_root.stat().st_mode & 0o077:
        raise safe.AuditError("PRIVATE_REPORT_ROOT_REQUIRED_0700")
    if report.get("boundaries") != boundaries():
        raise safe.AuditError("REPORT_BOUNDARY_MISMATCH")
    destination.mkdir(mode=0o700, exist_ok=False)
    payload = (json.dumps(report, ensure_ascii=True, indent=2, allow_nan=False) + "\n").encode()
    write_new(destination / "observations.json", payload)
    database = destination / "review.sqlite3"
    write_new(database, b"")
    records = (report.get("batch") or {}).get("records", [])
    with closing(sqlite3.connect(database.as_uri() + "?mode=rw", uri=True)) as conn:
        conn.execute("PRAGMA trusted_schema=OFF")
        conn.execute("PRAGMA synchronous=FULL")
        with conn:
            conn.execute("CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)")
            conn.execute("CREATE TABLE record_reviews (position INTEGER PRIMARY KEY, record_sha256 TEXT NOT NULL, "
                         "disposition TEXT NOT NULL, reason TEXT NOT NULL)")
            conn.executemany("INSERT INTO metadata VALUES (?,?)", [
                ("scope", "LOCAL_REVIEW_NOT_MASTER_DATABASE"),
                ("productionHold", "true"), ("observationsSha256", safe.sha256(payload))])
            conn.executemany("INSERT INTO record_reviews VALUES (?,?,?,?)", [
                (r["position"], r["recordSha256"], r["disposition"], r["reason"]) for r in records])
        if conn.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
            raise safe.AuditError("REVIEW_DATABASE_INTEGRITY_FAILED")
        stored = conn.execute("SELECT * FROM record_reviews ORDER BY position").fetchall()
        if stored != [(r["position"], r["recordSha256"], r["disposition"], r["reason"]) for r in records]:
            raise safe.AuditError("REVIEW_DATABASE_RECONCILIATION_FAILED")
    hashes = {name: safe.sha256(safe.read_file(destination / name))
              for name in ("observations.json", "review.sqlite3")}
    write_new(destination / "SHA256SUMS", "".join(f"{digest}  {name}\n" for name, digest in hashes.items()).encode())
    # Completion is written last; incomplete directories must never count as evidence bundles.
    write_new(destination / "COMPLETE.json", (packed({"scope": "LOCAL_REVIEW_BUNDLE_ONLY",
              "productionHold": True, "files": hashes}) + "\n").encode())
    return destination


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ecosystem", type=Path, default=Path.home() / "sheikha_os_ecosystem")
    parser.add_argument("--batch", type=Path)
    parser.add_argument("--output-dir", type=Path)
    args = parser.parse_args()
    try:
        report = build_report(args.ecosystem, args.batch)
        if args.output_dir:
            save_bundle(report, args.output_dir)
        print(json.dumps({"status": report["status"], "boundaries": report["boundaries"],
                          "legacyIssues": report["legacy"]["issues"], "issues": report["issues"],
                          "sourceBytesUnchanged": report["legacy"]["sourceBytesUnchanged"],
                          "batchCounts": report["batch"]["counts"] if report["batch"] else None,
                          "reportSaved": bool(args.output_dir)}, ensure_ascii=True))
        return 2 if report["status"] == "LOCAL_REVIEW_BLOCKED_PRODUCTION_HOLD" else 0
    except (safe.AuditError, OSError, ValueError, sqlite3.Error, RecursionError) as error:
        print(json.dumps({"status": "LOCAL_REVIEW_ERROR_PRODUCTION_HOLD",
                          "error": str(error) if isinstance(error, safe.AuditError) else type(error).__name__,
                          "boundaries": boundaries()}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
