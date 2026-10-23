#!/usr/bin/env python3
"""Inspect V35 files without importing engines or opening the live SQLite DB."""

import argparse
import ast
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import stat
import tempfile
import time


ROOT = Path(__file__).resolve().parents[2]
KERNEL = Path("01_foundry_baremetal_kernel")
DATABASE = KERNEL / "sheikha_sql_db/sheikha_sovereign_master.sqlite3"
LEDGER = Path("04_evidence_integration_hub/sheikha_evidence_v2_specification.json")
VERSIONS = (
    ("35_5", "realistic_scifi", "realistic_scifi_scope"),
    ("35_6", "universal_legal", "universal_legal_scope"),
    ("35_7", "entity_regulation", "entity_regulation_scope"),
    ("35_8", "cosmic_quality", "cosmic_quality_scope"),
)
TABLES = (
    "universal_legal_v35_6_registry", "multi_country_legal_articles_catalog",
    "entity_regulation_v35_7_registry", "entities_bylaws_articles_catalog",
    "cosmic_quality_v35_8_registry", "cosmic_serialized_assets_catalog",
)
MAX_FILE_BYTES = 64 * 1024 * 1024
OPEN_REQUIREMENTS = (
    "LEGAL_TEXT_VERSION_JURISDICTION_AND_REVIEW",
    "MULTIPLE_BYLAW_ARTICLES_AND_VERSION_HISTORY",
    "MEASURED_ASSET_QUALITY_AND_PROVENANCE",
    "INDEPENDENT_SERVICE_AND_SANDBOX_CHECKS",
    "MATCHING_RELEASE_NATIVE_RUNTIME_AND_PUBLICATION_EVIDENCE",
)


class AuditError(ValueError):
    pass


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def no_symlinks(path):
    path = Path(os.path.abspath(path))
    for item in (path, *path.parents):
        if item.is_symlink():
            raise AuditError("SYMLINK_INPUT_OR_OUTPUT")
    return path


def fingerprint(info):
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns)


def read_file(path):
    path = no_symlinks(path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    with os.fdopen(fd, "rb") as stream:
        before = os.fstat(stream.fileno())
        if not stat.S_ISREG(before.st_mode):
            raise AuditError("NOT_A_REGULAR_FILE")
        if before.st_size > MAX_FILE_BYTES:
            raise AuditError("FILE_SIZE_LIMIT")
        data = stream.read(MAX_FILE_BYTES + 1)
        after = os.fstat(stream.fileno())
    if len(data) > MAX_FILE_BYTES:
        raise AuditError("FILE_SIZE_LIMIT")
    if fingerprint(before) != fingerprint(after) or fingerprint(after) != fingerprint(path.lstat()):
        raise AuditError("SOURCE_CHANGED_DURING_READ")
    return data


def json_object(data):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise AuditError("DUPLICATE_JSON_KEY")
            result[key] = value
        return result

    result = json.loads(data, object_pairs_hook=pairs)
    if not isinstance(result, dict):
        raise AuditError("JSON_OBJECT_REQUIRED")
    return result


def has_sidecars(path):
    return any(os.path.lexists(str(path) + suffix) for suffix in ("-wal", "-shm", "-journal"))


def inspect_database(data):
    # Inspect only a private, disposable copy: a live read can create WAL sidecars.
    with tempfile.TemporaryDirectory(prefix="sheikha-v35-audit-") as folder:
        snapshot = Path(folder) / "snapshot.sqlite3"
        fd = os.open(snapshot, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
        conn = sqlite3.connect(snapshot.as_uri() + "?mode=ro&immutable=1", uri=True)
        try:
            conn.execute("PRAGMA trusted_schema=OFF")
            conn.execute("PRAGMA query_only=ON")
            deadline = time.monotonic() + 3
            conn.set_progress_handler(lambda: int(time.monotonic() > deadline), 1000)
            if conn.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
                raise AuditError("SQLITE_INTEGRITY_FAILED")
            counts = {}
            columns = {}
            for table in TABLES:
                row = conn.execute(
                    "SELECT type, sql FROM sqlite_master WHERE name=?", (table,)
                ).fetchone()
                if not row or row[0] != "table" or "VIRTUAL" in (row[1] or "").upper():
                    raise AuditError("REQUIRED_REGULAR_TABLE_MISSING")
                counts[table] = conn.execute('SELECT COUNT(*) FROM "' + table + '"').fetchone()[0]
                columns[table] = [
                    {"name": r[1], "primaryKeyPosition": r[5]}
                    for r in conn.execute('PRAGMA table_info("' + table + '")')
                ]
            return {"integrity": "ok", "counts": counts, "columns": columns}
        finally:
            conn.close()


def audit(ecosystem, current_database_version="35_8"):
    if current_database_version not in ("35_8", "36_0"):
        raise AuditError("UNSUPPORTED_DATABASE_BINDING_VERSION")
    ecosystem = no_symlinks(ecosystem)
    report = {
        "schema": "SHEIKHA_V35_EVIDENCE_AUDIT_V1",
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "scope": "LOCAL_V35_FILE_CONSISTENCY_ONLY",
        "sourceRoot": str(ecosystem),
        "currentDatabaseBindingVersion": current_database_version,
        "toolSha256": sha256(read_file(Path(__file__))),
        "sources": [], "versions": [], "issues": [],
        "sourceBytesUnchanged": None,
        "productionReady": False, "closureAccepted": False,
        "unverifiedRequirements": list(OPEN_REQUIREMENTS),
        "effects": {"enginesExecuted": False, "liveDatabaseOpened": False,
                    "networkUsed": False, "serviceChanged": False,
                    "gitChanged": False, "legalVerdictsIssued": False},
        "limitations": [
            "Hashes establish byte equality, not authenticity or capability.",
            "Two reads and sidecar checks are not a transactional snapshot of live writers.",
            "Historical DB hashes are not compared as if they describe the current DB.",
            "No production admission is implemented by this inspection tool.",
        ],
    }
    captured = {}

    def capture(relative):
        data = read_file(ecosystem / relative)
        captured[relative] = sha256(data)
        report["sources"].append({"path": str(relative), "sha256": sha256(data), "bytes": len(data)})
        return data

    try:
        if has_sidecars(ecosystem / DATABASE):
            raise AuditError("LIVE_SQLITE_SIDECAR_PRESENT")
        ledger = json_object(capture(LEDGER)).get("verified_physical_digests")
        if not isinstance(ledger, dict):
            raise AuditError("V2_DIGEST_MAP_MISSING")
        db_data = capture(DATABASE)
        db_hash = sha256(db_data)
        report["database"] = inspect_database(db_data)
        for version, name, scope in VERSIONS:
            prefix = "sheikha_v" + version + "_" + name
            manifest_data = capture(KERNEL / (prefix + "_manifest.json"))
            manifest = json_object(manifest_data)
            engine_data = capture(KERNEL / (prefix + "_engine.py"))
            ast.parse(engine_data, filename=prefix + "_engine.py")
            actual = sha256(manifest_data)
            manifest_hash_matches = ledger.get(prefix + "_manifest_hash") == actual
            section = manifest.get(scope)
            if not isinstance(section, dict):
                raise AuditError("MANIFEST_SCOPE_MISSING")
            recorded_db = section.get("sheikha_sql_db_updated_hash")
            db_key = "sheikha_sql_db_v" + version + "_" + name + "_hash"
            valid_digest = (isinstance(recorded_db, str) and len(recorded_db) == 64
                            and all(c in "0123456789abcdef" for c in recorded_db))
            db_binding_matches = valid_digest and ledger.get(db_key) == recorded_db
            item = {
                "version": "V" + version.replace("_", "."),
                "manifestMatchesV2": manifest_hash_matches,
                "manifestDatabaseHashMatchesV2": db_binding_matches,
                "syntax": "PARSED_NOT_EXECUTED",
                "statusClaim": manifest.get("status"),
            }
            if not manifest_hash_matches or not db_binding_matches:
                report["issues"].append("V" + version + "_V2_BINDING_MISMATCH")
            if version == current_database_version:
                item["currentDatabaseMatches"] = recorded_db == db_hash
                if recorded_db != db_hash:
                    report["issues"].append("CURRENT_DATABASE_BINDING_MISMATCH")
            report["versions"].append(item)
        if current_database_version == "36_0":
            prefix = "sheikha_v36_0_hostinger_connection"
            data = capture(KERNEL / (prefix + "_manifest.json"))
            manifest = json_object(data)
            scope = manifest.get("hostinger_connection_scope")
            if not isinstance(scope, dict):
                raise AuditError("CURRENT_MANIFEST_SCOPE_MISSING")
            checks = {
                "version": "V36.0",
                "manifestMatchesV2": ledger.get(prefix + "_manifest_hash") == sha256(data),
                "manifestDatabaseHashMatchesV2": (
                    scope.get("sheikha_sql_db_updated_hash") == db_hash
                    and ledger.get("sheikha_sql_db_v36_0_hostinger_connection_hash") == db_hash
                ),
                "scope": "DATABASE_HASH_BINDING_ONLY_NOT_HOSTING_VERIFICATION",
            }
            report["currentDatabaseBinding"] = checks
            if not checks["manifestMatchesV2"] or not checks["manifestDatabaseHashMatchesV2"]:
                report["issues"].append("CURRENT_DATABASE_BINDING_MISMATCH")
    except (AuditError, OSError, ValueError, SyntaxError, sqlite3.Error) as exc:
        # Diagnostics contain error types/codes, never source rows or JSON content.
        report["issues"].append(str(exc) if isinstance(exc, AuditError) else type(exc).__name__)
    finally:
        unchanged = bool(captured)
        for relative, expected in captured.items():
            try:
                unchanged = (sha256(read_file(ecosystem / relative)) == expected) and unchanged
            except (AuditError, OSError):
                unchanged = False
        if has_sidecars(ecosystem / DATABASE):
            unchanged = False
            report["issues"].append("SQLITE_SIDECAR_PRESENT_AFTER_REVIEW")
        report["sourceBytesUnchanged"] = unchanged
        if not unchanged:
            report["issues"].append("INPUT_SNAPSHOT_NOT_CONFIRMED")

    report["localEvidenceConsistent"] = not report["issues"]
    report["status"] = ("LOCAL_SNAPSHOT_CONSISTENT_CLOSURE_UNPROVEN"
                        if report["localEvidenceConsistent"] else "LOCAL_EVIDENCE_REVIEW_BLOCKED")
    return report


def save_report(report, destination, private_root=None):
    private_root = no_symlinks(private_root or ROOT / "reports/private")
    destination = no_symlinks(destination)
    if destination.parent != private_root:
        raise AuditError("OUTPUT_MUST_BE_NEW_DIRECT_CHILD_OF_PRIVATE_REPORTS")
    # Do not overwrite past evidence or change permissions on unrelated directories.
    if not private_root.is_dir() or private_root.stat().st_mode & 0o077:
        raise AuditError("PRIVATE_REPORT_ROOT_REQUIRED_0700")
    destination.mkdir(mode=0o700, exist_ok=False)
    payload = (json.dumps(report, ensure_ascii=True, indent=2) + "\n").encode()
    for name, data in (
        ("observations.json", payload),
        ("SHA256SUMS", (sha256(payload) + "  observations.json\n").encode()),
    ):
        fd = os.open(destination / name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
    return destination


def exit_code(report, require_closure=False):
    if not report["localEvidenceConsistent"]:
        return 2
    if require_closure and not report["closureAccepted"]:
        return 3
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ecosystem", type=Path, default=Path.home() / "sheikha_os_ecosystem")
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--current-database-version", choices=("35_8", "36_0"), default="35_8",
                        help="Explicit manifest version expected to bind the current SQLite bytes.")
    parser.add_argument("--require-closure", action="store_true",
                        help="Exit 3 when local checks pass but production closure is unproven.")
    args = parser.parse_args()
    try:
        result = audit(args.ecosystem, args.current_database_version)
        if args.output_dir:
            save_report(result, args.output_dir)
        print(json.dumps(result, ensure_ascii=True, indent=2))
        return exit_code(result, args.require_closure)
    except (AuditError, OSError) as exc:
        print(json.dumps({"status": "AUDIT_ERROR", "error": type(exc).__name__,
                          "closureAccepted": False, "productionReady": False}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
