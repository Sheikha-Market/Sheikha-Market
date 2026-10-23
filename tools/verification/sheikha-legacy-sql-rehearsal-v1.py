#!/usr/bin/env python3
"""Rehearse a legacy catalog import privately; never migrate the live database."""

import argparse
from contextlib import closing
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import time


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "v35_file_safety", Path(__file__).with_name("sheikha-v35-evidence-audit-v1.py"))
SAFETY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SAFETY)
Error = SAFETY.AuditError
SOURCE = Path.home() / "sheikha_os_ecosystem" / SAFETY.DATABASE
LEDGER = Path.home() / "sheikha_os_ecosystem" / SAFETY.LEDGER
SCHEMA = Path(__file__).with_name("schemas") / "sheikha-legacy-review-r2.sql"
SCHEMA_SHA256 = "967528d6d227e5a74879aaaba6514feff4119c78f4c3b02c67242fc315f88934"
CATALOGS = {
    "entities_bylaws_articles_catalog": (
        "entity_id", "cr_or_gov_number", "entity_name", "entity_type",
        "bylaw_article_code", "article_text", "quran_sunnah_taseel",
        "shariah_verdict", "sha256_seal", "timestamp"),
    "multi_country_legal_articles_catalog": (
        "article_id", "country_or_entity", "code_name", "article_number",
        "quran_sunnah_reference", "shariah_compliance_verdict", "sha256_seal", "timestamp"),
    "cosmic_serialized_assets_catalog": (
        "universal_serial_number", "asset_category", "asset_name", "quality_grade",
        "cryptographic_hash", "shariah_taseel", "timestamp"),
}


def packed(value):
    return json.dumps(value, ensure_ascii=True, sort_keys=True, separators=(",", ":"), allow_nan=False)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def fingerprint(path):
    return digest(SAFETY.read_file(path))


def identifier(value):
    return '"' + value.replace('"', '""') + '"'


def write_new(path, data):
    SAFETY.no_symlinks(path)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "wb") as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())


def connect(path, writable=False):
    SAFETY.no_symlinks(path)
    conn = sqlite3.connect(path.as_uri() + ("?mode=rw" if writable else "?mode=ro"),
                           uri=True, timeout=1)
    conn.execute("PRAGMA trusted_schema=OFF")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA temp_store=MEMORY")
    if not writable:
        conn.execute("PRAGMA query_only=ON")
    deadline = time.monotonic() + 10
    conn.set_progress_handler(lambda: int(time.monotonic() > deadline), 1000)
    return conn


def cell(value):
    if isinstance(value, bytes):
        return ["blob", value.hex()]
    if isinstance(value, float):
        return ["float", value.hex()]
    return [type(value).__name__, value]


def inventory(path):
    result = {"tables": {}, "schemaSha256": None}
    with closing(connect(path)) as conn:
        if conn.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
            raise Error("INTEGRITY_CHECK_FAILED")
        if conn.execute("PRAGMA foreign_key_check").fetchall():
            raise Error("FOREIGN_KEY_CHECK_FAILED")
        schema = conn.execute(
            "SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name").fetchall()
        result["schemaSha256"] = digest(packed(schema).encode())
        for kind, name, _, sql in schema:
            if kind != "table":
                continue
            if "VIRTUAL" in (sql or "").upper():
                raise Error("VIRTUAL_TABLE_UNSUPPORTED")
            columns = conn.execute("PRAGMA table_info(" + identifier(name) + ")").fetchall()
            rows = conn.execute("SELECT * FROM " + identifier(name)).fetchmany(50001)
            if len(rows) > 50000:
                raise Error("ROW_LIMIT")
            encoded = sorted(packed([cell(v) for v in row]) for row in rows)
            result["tables"][name] = {
                "columns": [{"name": c[1], "type": c[2], "notNull": bool(c[3]),
                             "primaryKeyPosition": c[5]} for c in columns],
                "rows": len(rows), "contentSha256": digest(packed(encoded).encode()),
            }
    result["integrity"] = "ok"
    result["foreignKeyViolations"] = 0
    return result


def snapshot(source, target, expected):
    data = SAFETY.read_file(source)
    if digest(data) != expected:
        raise Error("SOURCE_HASH_MISMATCH")
    if data[:16] != b"SQLite format 3\x00" or data[18:20] != b"\x01\x01":
        raise Error("ONLY_ROLLBACK_JOURNAL_DATABASE_SUPPORTED")
    if SAFETY.has_sidecars(source):
        raise Error("SOURCE_SIDECAR_PRESENT")
    source_stat = SAFETY.fingerprint(source.stat())
    with closing(connect(source)) as src:
        # A SQLite read transaction pins the pages; immutable=1 must not be used here.
        src.execute("BEGIN")
        src.execute("SELECT count(*) FROM sqlite_schema").fetchone()
        # Opening/closing another FD for this inode can release SQLite's POSIX locks.
        if SAFETY.fingerprint(source.stat()) != source_stat or SAFETY.has_sidecars(source):
            raise Error("SOURCE_CHANGED_BEFORE_SNAPSHOT")
        write_new(target, b"")
        with closing(connect(target, writable=True)) as dst:
            deadline = time.monotonic() + 5

            def progress(status, remaining, total):
                if time.monotonic() > deadline or status not in (sqlite3.SQLITE_OK, sqlite3.SQLITE_DONE):
                    raise Error("SNAPSHOT_BUSY_OR_TIMEOUT")

            src.backup(dst, pages=64, progress=progress, sleep=0)
        src.rollback()
    if (SAFETY.fingerprint(source.stat()) != source_stat
            or fingerprint(source) != expected or SAFETY.has_sidecars(source)):
        raise Error("SOURCE_CHANGED_DURING_SNAPSHOT")
    return inventory(target)


def catalog_rows(source):
    result = {}
    with closing(connect(source)) as conn:
        for table, expected in CATALOGS.items():
            kind = conn.execute("SELECT type FROM sqlite_schema WHERE name=?", (table,)).fetchone()
            columns = conn.execute("PRAGMA table_info(" + identifier(table) + ")").fetchall()
            if kind != ("table",) or tuple(c[1] for c in columns) != expected:
                raise Error("CATALOG_SCHEMA_DRIFT")
            rows = conn.execute("SELECT * FROM " + identifier(table)).fetchmany(10001)
            if len(rows) > 10000:
                raise Error("CATALOG_ROW_LIMIT")
            result[table] = []
            keys = set()
            for row in rows:
                if any(not isinstance(v, str) for v in row[:-1]) or type(row[-1]) not in (int, str):
                    raise Error("CATALOG_NON_TEXT_CELL_REQUIRES_MAPPING")
                if not row[0].strip() or row[0] in keys:
                    raise Error("MISSING_OR_DUPLICATE_LEGACY_KEY")
                keys.add(row[0])
                result[table].append(dict(zip(expected, row)))
    return result


def insert(conn, table, **values):
    conn.execute("INSERT INTO " + identifier(table) + " (" +
                 ",".join(identifier(k) for k in values) + ") VALUES (" +
                 ",".join("?" for _ in values) + ")", tuple(values.values()))


def import_catalogs(source, target, schema, fail_after=None):
    if digest(schema) != SCHEMA_SHA256:
        raise Error("REVIEW_SCHEMA_HASH_MISMATCH")
    rows = catalog_rows(source)
    source_hash = fingerprint(source)
    sid = "snapshot-" + source_hash
    write_new(target, b"")
    with closing(connect(target, writable=True)) as conn:
        conn.executescript(schema.decode("utf-8"))
        conn.execute("BEGIN")
        try:
            insert(conn, "metadata", key="import_scope", value_json=packed({
                "scope": "LEGACY_COPY_REHEARSAL_ONLY", "sourceSha256": source_hash,
                "productionReady": False, "historyRecovered": False}))
            insert(conn, "sources", source_id=sid, kind="LOCAL_DATABASE_SNAPSHOT",
                   title="Observed legacy catalogs; not adopted legal records",
                   locator="SOURCE_SNAPSHOT.sqlite3", sha256=source_hash, access_scope="PRIVATE")
            count = 0
            for table, items in rows.items():
                for row in items:
                    key = row[CATALOGS[table][0]]
                    rid = digest(packed([table, key]).encode())
                    insert(conn, "catalog_claims", claim_id="claim-" + rid,
                           stage="LEGACY_SNAPSHOT", catalog=table, original_item_id=key,
                           payload_json=packed(row), source_id=sid, source_lines="primary-key:" + key,
                           assessment="SOURCE_CLAIM_ONLY")
                    count += 1
                    if table == "entities_bylaws_articles_catalog":
                        if not row["bylaw_article_code"].strip():
                            raise Error("MISSING_ARTICLE_REFERENCE")
                        eid, doc, ver, provision = [prefix + rid for prefix in
                                                    ("entity-", "document-", "version-", "provision-")]
                        insert(conn, "entity_records", entity_id=eid, source_name=row["entity_name"],
                               claimed_entity_type=row["entity_type"],
                               legal_status="USER_DECLARED_UNVERIFIED", source_id=sid)
                        insert(conn, "documents", document_id=doc, entity_id=eid,
                               title="Legacy bylaw observation (document identity unverified)",
                               document_kind="LEGACY_OBSERVATION_NOT_OFFICIAL_DOCUMENT")
                        insert(conn, "document_versions", version_id=ver, document_id=doc,
                               version_label="observed-snapshot:" + source_hash, source_id=sid,
                               accepted_at=None, effective_at=None, status="SOURCE_SAMPLE_NOT_ADOPTED")
                        insert(conn, "provisions", provision_id=provision, version_id=ver,
                               article_reference=row["bylaw_article_code"], source_text=row["article_text"],
                               text_role="SOURCE_CLAIM", source_id=sid, source_lines="primary-key:" + key)
                        insert(conn, "review_notes", review_id="review-" + rid, provision_id=provision,
                               source_assertion=packed({k: row[k] for k in ("quran_sunnah_taseel", "shariah_verdict")}),
                               analysis_note="Inherited assertions only; registration and adoption unverified.",
                               shariah_review="PENDING", legal_review="PENDING")
                    if count == fail_after:
                        raise Error("INJECTED_IMPORT_FAILURE")
            if conn.execute("PRAGMA foreign_key_check").fetchall():
                raise Error("IMPORT_FOREIGN_KEY_FAILURE")
            conn.commit()
        except Exception:
            conn.rollback()
            raise
    return reconcile(source, target)


def reconcile(source, target):
    expected = catalog_rows(source)
    with closing(connect(target)) as conn:
        for table, rows in expected.items():
            stored = conn.execute("SELECT payload_json FROM catalog_claims WHERE catalog=?", (table,)).fetchall()
            if sorted(packed(r) for r in rows) != sorted(packed(json.loads(r[0])) for r in stored):
                raise Error("RAW_CATALOG_RECONCILIATION_FAILED")
        originals = expected["entities_bylaws_articles_catalog"]
        actual = conn.execute("SELECT article_reference,source_text FROM provisions").fetchall()
        if sorted(actual) != sorted((r["bylaw_article_code"], r["article_text"]) for r in originals):
            raise Error("PROVISION_RECONCILIATION_FAILED")
        if conn.execute("SELECT count(*) FROM document_versions WHERE accepted_at IS NOT NULL "
                        "OR effective_at IS NOT NULL OR status != 'SOURCE_SAMPLE_NOT_ADOPTED'").fetchone()[0]:
            raise Error("UNAUTHORIZED_ADOPTION")
    return {"catalogRowsPreserved": {t: len(r) for t, r in expected.items()},
            "normalizedProvisions": len(originals), "allOriginalCatalogCellsPreserved": True,
            "historyRecovered": False, "productionReady": False}


def worker(output, expected, host_network, snapshot_input=None):
    output = SAFETY.no_symlinks(output)
    if (output.parent != ROOT / "reports/private" or output.stat().st_mode & 0o077
            or list(output.iterdir())):
        raise Error("EMPTY_PRIVATE_WORKER_DIRECTORY_REQUIRED")
    input_path = snapshot_input or SOURCE
    protected = (input_path, SCHEMA) if snapshot_input else (SOURCE, SCHEMA, LEDGER)
    for path in protected:
        SAFETY.no_symlinks(path)
        if not os.statvfs(path).f_flag & os.ST_RDONLY:
            raise Error("READ_ONLY_SOURCE_MOUNT_REQUIRED")
    if os.readlink("/proc/self/ns/net") == host_network:
        raise Error("NETWORK_NAMESPACE_NOT_SEPARATED")
    schema = SAFETY.read_file(SCHEMA)
    if digest(schema) != SCHEMA_SHA256:
        raise Error("REVIEW_SCHEMA_HASH_MISMATCH")
    ledger_before = None if snapshot_input else fingerprint(LEDGER)
    snapshot_path = output / "SOURCE_SNAPSHOT.sqlite3"
    if snapshot_input:
        data = SAFETY.read_file(snapshot_input)
        if digest(data) != expected or SAFETY.has_sidecars(snapshot_input):
            raise Error("SNAPSHOT_INPUT_BINDING_OR_SIDECAR")
        write_new(snapshot_path, data)
        original = inventory(snapshot_path)
    else:
        original = snapshot(SOURCE, snapshot_path, expected)
    write_new(output / "SOURCE_INVENTORY.json", (packed(original) + "\n").encode())
    write_new(output / "REVIEW_SCHEMA_R2.sql", schema)
    candidate = output / "REVIEW_CANDIDATE.sqlite3"
    reconciliation = import_catalogs(snapshot_path, candidate, schema)
    candidate_inventory = inventory(candidate)
    backup = output / "CANDIDATE_BACKUP.sqlite3"
    write_new(backup, b"")
    with closing(connect(candidate)) as src, closing(connect(backup, writable=True)) as dst:
        src.backup(dst)
    if inventory(backup) != candidate_inventory:
        raise Error("BACKUP_RECONCILIATION_FAILED")
    rollback = output / "ROLLBACK_SOURCE_COPY.sqlite3"
    write_new(rollback, SAFETY.read_file(snapshot_path))
    if fingerprint(rollback) != fingerprint(snapshot_path) or inventory(rollback) != original:
        raise Error("ROLLBACK_COPY_RECONCILIATION_FAILED")
    failed = output / "FAILED_IMPORT.sqlite3"
    try:
        import_catalogs(snapshot_path, failed, schema, fail_after=1)
    except Error as exc:
        if str(exc) != "INJECTED_IMPORT_FAILURE":
            raise
    else:
        raise Error("FAILURE_SCENARIO_NOT_EXERCISED")
    if any(t["rows"] for t in inventory(failed)["tables"].values()):
        raise Error("PARTIAL_IMPORT_COMMITTED")
    if (fingerprint(input_path) != expected
            or (not snapshot_input and fingerprint(LEDGER) != ledger_before)):
        raise Error("PROTECTED_INPUT_CHANGED_DURING_REHEARSAL")
    result = {
        "scope": "ACTUAL_LEGACY_SOURCE_COPY_REHEARSAL_NOT_LIVE_MIGRATION",
        "status": "COPY_REHEARSAL_PASSED_PRODUCTION_HOLD",
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "sourceSha256": expected, "sourcePath": str(input_path),
        "snapshotSha256": fingerprint(snapshot_path), "liveSourceOpened": not bool(snapshot_input),
        "sourceBytesUnchanged": True, "ledgerBytesUnchanged": None if snapshot_input else True,
        "ledgerSha256": ledger_before, "schemaSha256": SCHEMA_SHA256,
        "sourceTableCount": len(original["tables"]),
        "sourceRowCount": sum(t["rows"] for t in original["tables"].values()),
        "sourceMountReadOnly": True, "networkNamespaceSeparated": True,
        "snapshotMethod": ("PINNED_EXISTING_PRIVATE_SNAPSHOT" if snapshot_input else
                           "SQLITE_BACKUP_UNDER_READ_TRANSACTION_NO_IMMUTABLE"),
        "reconciliation": reconciliation, "candidateInventory": candidate_inventory,
        "backupContentAndSchemaMatch": True, "rollbackCopyBytesMatchSnapshot": True,
        "injectedFailureCommittedRows": 0,
        "liveCutoverPerformed": False, "productionReady": False, "closureAccepted": False,
        "historicalEnginesExecuted": False, "hostingerChanged": False,
        "limitations": ["Only three catalogs mapped; all other tables retained in source snapshot.",
                        "Snapshot observation labels are not historical document versions.",
                        "Overwritten history cannot be recovered from surviving rows.",
                        "No contractual, legal, religious or operating approval is granted.",
                        "Append-only constraints are not protection against a database administrator."]}
    write_new(output / "RESULT.json", (json.dumps(result, indent=2) + "\n").encode())
    write_new(output / "SHA256SUMS", "".join(
        fingerprint(p) + "  " + p.name + "\n" for p in sorted(output.iterdir()) if p.is_file()).encode())
    return result


def prepare_output(path):
    path = SAFETY.no_symlinks(path)
    private = ROOT / "reports/private"
    if path.parent != private or not private.is_dir() or private.stat().st_mode & 0o077:
        raise Error("NEW_PRIVATE_REPORT_DIRECTORY_REQUIRED")
    path.mkdir(mode=0o700, exist_ok=False)
    return path


def validate_snapshot_input(path):
    path = SAFETY.no_symlinks(path)
    if (path.parent.parent != ROOT / "reports/private" or path.name != "SOURCE_SNAPSHOT.sqlite3"
            or not path.is_file() or path.stat().st_mode & 0o077 or path.parent.stat().st_mode & 0o077):
        raise Error("PRIVATE_CAPTURED_SNAPSHOT_REQUIRED")
    return path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--expected-source-sha256", required=True)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--snapshot-input", type=Path,
                        help="Continue from a pinned private snapshot without reopening the live master.")
    parser.add_argument("--worker-host-network", help=argparse.SUPPRESS)
    args = parser.parse_args()
    try:
        if args.snapshot_input:
            args.snapshot_input = validate_snapshot_input(args.snapshot_input)
        if args.worker_host_network:
            result = worker(args.output_dir, args.expected_source_sha256,
                            args.worker_host_network, args.snapshot_input)
            print(json.dumps({k: result[k] for k in ("status", "sourceTableCount", "sourceRowCount", "reconciliation")}))
            return 0
        if fingerprint(args.snapshot_input or SOURCE) != args.expected_source_sha256:
            raise Error("SOURCE_HASH_MISMATCH")
        output = prepare_output(args.output_dir)
        command = ["/usr/bin/bwrap", "--ro-bind", "/", "/", "--dev", "/dev", "--proc", "/proc",
                   "--unshare-net", "--die-with-parent", "--bind", str(output), str(output),
                   "/usr/bin/python3", "-I", "-B", str(Path(__file__).resolve()),
                   "--expected-source-sha256", args.expected_source_sha256,
                   "--output-dir", str(output), "--worker-host-network", os.readlink("/proc/self/ns/net")]
        if args.snapshot_input:
            command.extend(["--snapshot-input", str(args.snapshot_input)])
        completed = subprocess.run(command, timeout=45, env={"PATH": "/usr/bin:/bin", "HOME": str(Path.home())},
                                   capture_output=True, text=True)
        write_new(output / "runner.stdout.log", completed.stdout.encode())
        write_new(output / "runner.stderr.log", completed.stderr.encode())
        if completed.returncode:
            print(json.dumps({"status": "REHEARSAL_BLOCKED", "exitCode": completed.returncode,
                              "productionReady": False, "outputDirectory": str(output)}))
            return 2
        print(completed.stdout.strip())
        return 0
    except (Error, OSError, ValueError, sqlite3.Error, subprocess.TimeoutExpired) as exc:
        print(json.dumps({"status": "REHEARSAL_BLOCKED", "error": str(exc) if isinstance(exc, Error)
                          else type(exc).__name__, "productionReady": False}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
