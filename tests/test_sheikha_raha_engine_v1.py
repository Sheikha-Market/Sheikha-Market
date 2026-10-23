import copy
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools/verification/sheikha-raha-engine-v1.py"
SPEC = importlib.util.spec_from_file_location("raha_review", SCRIPT)
raha = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(raha)


def record(identifier="fixture", value="0.1", kind="measurement", unit="kg", **changes):
    data = {"id": identifier, "kind": kind, "value": value, "unit": unit,
            "sourceSha256": "a" * 64, "sourceClass": "SYNTHETIC"}
    data.update(changes)
    return data


def batch(*records):
    return json.dumps({"schemaVersion": 1, "records": records}).encode()


class RahaReviewTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.ecosystem = self.root / "ecosystem"
        self.db = self.ecosystem / raha.safe.DATABASE
        self.db.parent.mkdir(parents=True)
        self.db.write_bytes(b"Synthetic current bytes; no live SQLite is opened.")
        self.manifest = self.ecosystem / raha.MANIFEST
        self.manifest.write_text(json.dumps({"raha_kernel_scope": {"status": "CLAIM_ONLY"},
                                            "status": "CLAIM_ONLY", "database_digest": "b" * 64}))
        self.engine = self.ecosystem / raha.ENGINE
        self.engine.write_text('raise RuntimeError("MUST_NOT_EXECUTE")\nclaim = {"status": "CLAIM_ONLY"}\n')
        self.ledger = self.ecosystem / raha.safe.LEDGER
        self.ledger.parent.mkdir(parents=True)
        self.ledger.write_text(json.dumps({"verified_physical_digests": {
            raha.MANIFEST_KEY: raha.safe.sha256(self.manifest.read_bytes()), raha.DATABASE_KEY: "b" * 64}}))
        self.input = self.root / "batch.json"
        self.input.write_bytes(batch(record()))

    def test_decimal_arithmetic_and_units_and_provenance_remain_separate(self):
        result = raha.process_batch(batch(record("a", "0.1"), record("b", "0.2"),
            record("c", "5", unit="m"), record("d", "2", sourceClass="USER_DECLARED"),
            record("e", "10.25", kind="transaction", unit="SAR"),
            record("f", "2", kind="transaction", unit="USD")))
        totals = {(a["kind"], a["unit"], a["sourceClass"]): a["total"] for a in result["aggregates"]}
        self.assertEqual(totals[("measurement", "kg", "SYNTHETIC")], "0.3")
        self.assertEqual(totals[("measurement", "kg", "USER_DECLARED")], "2")
        self.assertEqual(len(totals), 5)
        self.assertFalse(result["sourceDigestsAuthenticated"])
        self.assertFalse(result["settlementAuthorized"])
        self.assertEqual(result["shariaReview"], "HUMAN_REVIEW_REQUIRED")

    def test_duplicate_is_counted_once(self):
        result = raha.process_batch(batch(record(), record()))
        self.assertEqual(result["counts"], {"input": 2, "validated": 1, "duplicates": 1, "quarantined": 0})
        self.assertEqual(result["aggregates"][0]["total"], "0.1")

    def test_conflict_quarantines_all_records_with_that_id(self):
        result = raha.process_batch(batch(record(), record(value="0.2"), record()))
        self.assertEqual(result["counts"]["quarantined"], 3)
        self.assertEqual(result["aggregates"], [])
        self.assertTrue(all(r["reason"] == "CONFLICTING_RECORD_ID" for r in result["records"]))

    def test_invalid_record_cannot_leave_same_id_valid_record_in_totals(self):
        result = raha.process_batch(batch(record(), record(value="not-a-number")))
        self.assertEqual(result["counts"]["quarantined"], 2)
        self.assertEqual(result["aggregates"], [])

    def test_decimal_and_unit_limits(self):
        for change in ({"value": 1}, {"value": True}, {"value": "NaN"}, {"value": "Infinity"},
                       {"value": "1e5"}, {"value": "1.0000001"}, {"value": "1000000000000"},
                       {"value": "1\n"}, {"value": "01"}, {"value": " 1"}, {"unit": "g"},
                       {"unit": ["kg"]}, {"kind": {}}, {"value": "0.2", "unit": "count"}):
            with self.subTest(change=change):
                self.assertEqual(raha.process_batch(batch(record(**change)))["counts"]["quarantined"], 1)

    def test_negative_measurement_is_not_a_negative_transaction(self):
        result = raha.process_batch(batch(record("m", "-2"), record("t", "-2", "transaction", "SAR")))
        self.assertEqual(result["counts"]["validated"], 1)
        self.assertEqual(result["records"][1]["reason"], "NEGATIVE_TRANSACTION_UNSUPPORTED")
        self.assertEqual(raha.decimal_text(raha.Decimal("-0.000")), "0")

    def test_rejects_claimed_approval_and_invalid_source_and_id(self):
        for change in ({"approved": True}, {"sourceClass": "VERIFIED"}, {"sourceClass": {}},
                       {"sourceSha256": "FILE_NOT_FOUND"}, {"id": "../secret"}, {"id": "a\n"}):
            with self.subTest(change=change):
                self.assertEqual(raha.process_batch(batch(record(**change)))["counts"]["quarantined"], 1)

    def test_invalid_record_shapes_are_quarantined(self):
        result = raha.process_batch(batch(None, [], "PRIVATE_SENTINEL", 5, {}))
        self.assertEqual(result["counts"]["quarantined"], 5)
        self.assertNotIn("PRIVATE_SENTINEL", json.dumps(result))

    def test_batch_contract_and_limits(self):
        bad = [b"[]", b"{", b'{"schemaVersion":1,"records":[]}',
               b'{"schemaVersion":true,"records":[{}]}',
               b'{"schemaVersion":1,"records":[{}],"activate":true}',
               b'{"schemaVersion":1,"schemaVersion":1,"records":[{}]}',
               b'{"schemaVersion":1,"records":[{"value":NaN}]}',
               batch(*([record()] * 1001)), b" " * (raha.MAX_BATCH_BYTES + 1)]
        for data in bad:
            with self.subTest(size=len(data)):
                with self.assertRaises(ValueError):
                    raha.process_batch(data)

    def test_large_valid_batch_uses_exact_sum(self):
        result = raha.process_batch(batch(*(record(str(i), "999999999999.999999") for i in range(1000))))
        self.assertEqual(result["aggregates"][0]["total"], "999999999999999.999")

    def test_processing_is_deterministic_and_raw_records_not_returned(self):
        data = batch(record())
        first = raha.process_batch(data)
        self.assertEqual(first, raha.process_batch(data))
        self.assertEqual(set(first["records"][0]), {"position", "recordSha256", "disposition", "reason"})

    def test_audit_parses_engine_without_executing_it_or_opening_master(self):
        with patch.object(sqlite3, "connect", side_effect=AssertionError("No live SQLite")):
            result = raha.legacy_audit(self.ecosystem)
        self.assertTrue(result["localEvidenceConsistent"])
        self.assertEqual(result["sourceSyntax"], "PARSED_NOT_EXECUTED")
        self.assertEqual(result["matchingLiteralClaimCount"], 1)
        self.assertFalse(result["engineExecuted"])
        self.assertFalse(result["runtimeClaimsVerified"])

    def test_historical_database_hash_does_not_claim_current_snapshot(self):
        result = raha.legacy_audit(self.ecosystem)
        self.assertTrue(result["historicalDatabaseBindingMatchesV2"])
        self.assertFalse(result["currentDatabaseMatchesHistoricalBinding"])
        self.assertFalse(result["historicalDatabaseSnapshotAvailable"])
        self.assertTrue(result["localEvidenceConsistent"])

    def test_manifest_drift_blocks_without_repinning(self):
        self.manifest.write_bytes(self.manifest.read_bytes() + b"\n")
        before = self.ledger.read_bytes()
        result = raha.legacy_audit(self.ecosystem)
        self.assertIn("V43_75_EVIDENCE_BINDING_MISMATCH", result["issues"])
        self.assertEqual(before, self.ledger.read_bytes())

    def test_missing_file_and_invalid_json_and_syntax_block(self):
        for path, data in ((self.manifest, b'{"bad":'), (self.engine, b"def broken("),
                           (self.ledger, b'{"verified_physical_digests":[]}')):
            original = path.read_bytes()
            path.write_bytes(data)
            self.assertFalse(raha.legacy_audit(self.ecosystem)["localEvidenceConsistent"])
            path.write_bytes(original)
        self.manifest.unlink()
        self.assertFalse(raha.legacy_audit(self.ecosystem)["localEvidenceConsistent"])

    def test_malformed_historical_digest_is_not_equal_when_both_missing(self):
        manifest = json.loads(self.manifest.read_text())
        del manifest["database_digest"]
        self.manifest.write_text(json.dumps(manifest))
        self.assertIn("MANIFEST_DATABASE_DIGEST_INVALID", raha.legacy_audit(self.ecosystem)["issues"])

    def test_symlink_and_sidecar_fail_closed(self):
        sidecar = Path(str(self.db) + "-wal")
        sidecar.write_bytes(b"fixture")
        self.assertIn("LIVE_SQLITE_SIDECAR_PRESENT", raha.legacy_audit(self.ecosystem)["issues"])
        sidecar.unlink()
        target = self.root / "target"
        self.manifest.rename(target)
        self.manifest.symlink_to(target)
        self.assertIn("SYMLINK_INPUT_OR_OUTPUT", raha.legacy_audit(self.ecosystem)["issues"])

    def test_legacy_and_batch_sources_unchanged(self):
        before = {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        report = raha.build_report(self.ecosystem, self.input)
        self.assertTrue(report["legacy"]["sourceBytesUnchanged"])
        self.assertEqual(before, {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()})

    def test_mutation_between_reads_blocks(self):
        original = raha.safe.read_file
        for changed in (self.input, self.manifest):
            count = 0

            def read(path):
                nonlocal count
                data = original(path)
                if Path(path) == changed:
                    count += 1
                    if count == 2:
                        return data + b"\n"
                return data

            with patch.object(raha.safe, "read_file", side_effect=read):
                report = raha.build_report(self.ecosystem, self.input)
            self.assertEqual(report["status"], "LOCAL_REVIEW_BLOCKED_PRODUCTION_HOLD")

    def test_invalid_batch_diagnostic_does_not_echo_content(self):
        self.input.write_bytes(b'PRIVATE_SENTINEL')
        report = raha.build_report(self.ecosystem, self.input)
        self.assertEqual(report["status"], "LOCAL_REVIEW_BLOCKED_PRODUCTION_HOLD")
        self.assertNotIn("PRIVATE_SENTINEL", json.dumps(report))
        self.assertIsNone(report["batch"])

    def test_valid_result_never_promotes_production(self):
        report = raha.build_report(self.ecosystem, self.input)
        self.assertEqual(report["status"], "LOCAL_REVIEW_COMPLETE_PRODUCTION_HOLD")
        self.assertTrue(report["boundaries"]["productionHold"])
        self.assertFalse(report["boundaries"]["productionReady"])
        self.assertFalse(report["boundaries"]["closureAccepted"])
        self.assertEqual(report["boundaries"]["shariaCertification"], "NOT_PERFORMED")

    def test_quarantine_produces_blocked_review(self):
        self.input.write_bytes(batch(record(value="bad")))
        self.assertEqual(raha.build_report(self.ecosystem, self.input)["status"],
                         "LOCAL_REVIEW_BLOCKED_PRODUCTION_HOLD")

    def test_private_sqlite_bundle_hashes_and_reconciliation(self):
        private = self.root / "private"
        private.mkdir(mode=0o700)
        output = private / "run"
        report = raha.build_report(self.ecosystem, self.input)
        raha.save_bundle(report, output, private)
        completion = json.loads((output / "COMPLETE.json").read_text())
        self.assertTrue(completion["productionHold"])
        for name, digest in completion["files"].items():
            self.assertEqual(raha.safe.sha256((output / name).read_bytes()), digest)
        with sqlite3.connect((output / "review.sqlite3").as_uri() + "?mode=ro", uri=True) as conn:
            self.assertEqual(conn.execute("PRAGMA integrity_check").fetchall(), [("ok",)])
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM record_reviews").fetchone()[0], 1)
            self.assertEqual(conn.execute("SELECT value FROM metadata WHERE key='productionHold'").fetchone()[0], "true")
        self.assertEqual(output.stat().st_mode & 0o777, 0o700)
        self.assertTrue(all(p.stat().st_mode & 0o777 == 0o600 for p in output.iterdir()))
        with self.assertRaises(FileExistsError):
            raha.save_bundle(report, output, private)

    def test_wrong_output_root_permissions_and_boundary_override_rejected(self):
        private = self.root / "private"
        private.mkdir(mode=0o755)
        report = raha.build_report(self.ecosystem)
        with self.assertRaises(raha.safe.AuditError):
            raha.save_bundle(report, private / "run", private)
        private.chmod(0o700)
        with self.assertRaises(raha.safe.AuditError):
            raha.save_bundle(report, self.root / "outside", private)
        modified = copy.deepcopy(report)
        modified["boundaries"]["productionHold"] = False
        with self.assertRaises(raha.safe.AuditError):
            raha.save_bundle(modified, private / "run", private)
        self.assertFalse((private / "run").exists())

    def test_output_failure_cannot_leave_completion_marker(self):
        private = self.root / "private"
        private.mkdir(mode=0o700)
        output = private / "run"
        report = raha.build_report(self.ecosystem, self.input)
        with patch.object(sqlite3, "connect", side_effect=sqlite3.OperationalError("fixture")):
            with self.assertRaises(sqlite3.Error):
                raha.save_bundle(report, output, private)
        self.assertFalse((output / "COMPLETE.json").exists())

    def test_cli_exit_status_and_sanitized_summary(self):
        command = [sys.executable, "-I", "-B", str(SCRIPT), "--ecosystem", str(self.ecosystem), "--batch", str(self.input)]
        result = subprocess.run(command, capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["batchCounts"]["validated"], 1)
        self.assertNotIn('"aggregates"', result.stdout)
        self.input.write_bytes(batch(record(value="PRIVATE_SENTINEL")))
        result = subprocess.run(command, capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 2)
        self.assertNotIn("PRIVATE_SENTINEL", result.stdout)


if __name__ == "__main__":
    unittest.main()
