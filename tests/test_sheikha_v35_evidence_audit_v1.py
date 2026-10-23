import hashlib
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "tools/verification/sheikha-v35-evidence-audit-v1.py"
SPEC = importlib.util.spec_from_file_location("v35_audit", SCRIPT)
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class V35AuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / "ecosystem"
        (self.root / audit.DATABASE).parent.mkdir(parents=True)
        (self.root / audit.LEDGER).parent.mkdir(parents=True)
        self.db = self.root / audit.DATABASE
        conn = sqlite3.connect(self.db)
        for table in audit.TABLES:
            conn.execute('CREATE TABLE "' + table + '" (id TEXT PRIMARY KEY)')
            conn.execute('INSERT INTO "' + table + '" VALUES (?)', ("private-row-value",))
        conn.commit()
        conn.close()
        digest = audit.sha256(self.db.read_bytes())
        ledger = {}
        for version, name, scope in audit.VERSIONS:
            prefix = "sheikha_v" + version + "_" + name
            recorded = digest if version == "35_8" else "a" * 64
            payload = {
                scope: {"sheikha_sql_db_updated_hash": recorded},
                "status": "FULLY_SEALED",
                "productionReady": True,
                "closureAccepted": True,
                "private_owner": "must-not-leak",
            }
            path = self.root / audit.KERNEL / (prefix + "_manifest.json")
            path.write_text(json.dumps(payload))
            ledger[prefix + "_manifest_hash"] = audit.sha256(path.read_bytes())
            ledger["sheikha_sql_db_v" + version + "_" + name + "_hash"] = recorded
            (path.with_name(prefix + "_engine.py")).write_text(
                'raise RuntimeError("engine must never be executed")\n'
            )
        self.ledger = self.root / audit.LEDGER
        self.ledger.write_text(json.dumps({"verified_physical_digests": ledger}))

    def tearDown(self):
        self.temp.cleanup()

    def test_checks_bytes_without_execution_or_reading_private_rows(self):
        before = {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        result = audit.audit(self.root)
        self.assertTrue(result["localEvidenceConsistent"], result["issues"])
        self.assertTrue(result["sourceBytesUnchanged"])
        self.assertEqual(result["database"]["counts"][audit.TABLES[0]], 1)
        self.assertFalse(result["closureAccepted"])
        self.assertFalse(result["productionReady"])
        self.assertNotIn("private-row-value", json.dumps(result))
        self.assertNotIn("must-not-leak", json.dumps(result))
        self.assertEqual(before, {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()})

    def test_historical_hash_is_not_treated_as_current_database(self):
        result = audit.audit(self.root)
        self.assertTrue(result["localEvidenceConsistent"])
        self.assertNotIn("currentDatabaseMatches", result["versions"][0])
        self.assertTrue(result["versions"][-1]["currentDatabaseMatches"])

    def test_manifest_drift_blocks(self):
        path = self.root / audit.KERNEL / "sheikha_v35_5_realistic_scifi_manifest.json"
        path.write_text(path.read_text() + "\n")
        self.assertIn("V35_5_V2_BINDING_MISMATCH", audit.audit(self.root)["issues"])

    def test_valid_database_change_blocks_binding(self):
        conn = sqlite3.connect(self.db)
        conn.execute('INSERT INTO "' + audit.TABLES[0] + '" VALUES (?)', ("new",))
        conn.commit()
        conn.close()
        self.assertIn("CURRENT_DATABASE_BINDING_MISMATCH", audit.audit(self.root)["issues"])

    def test_missing_ledger_does_not_create_it(self):
        self.ledger.unlink()
        result = audit.audit(self.root)
        self.assertFalse(result["localEvidenceConsistent"])
        self.assertFalse(self.ledger.exists())

    def test_rejects_duplicate_json_keys(self):
        self.ledger.write_text('{"verified_physical_digests": {}, "verified_physical_digests": {}}')
        self.assertIn("DUPLICATE_JSON_KEY", audit.audit(self.root)["issues"])

    def test_sidecars_prevent_snapshot_inspection(self):
        for suffix in ("-wal", "-shm", "-journal"):
            with self.subTest(suffix=suffix):
                path = Path(str(self.db) + suffix)
                path.touch()
                with patch.object(audit, "inspect_database") as inspect:
                    result = audit.audit(self.root)
                    inspect.assert_not_called()
                self.assertIn("LIVE_SQLITE_SIDECAR_PRESENT", result["issues"])
                path.unlink()

    def test_changed_input_during_review_is_detected(self):
        original = audit.inspect_database
        def changing(data):
            result = original(data)
            self.ledger.write_text(self.ledger.read_text() + "\n")
            return result
        with patch.object(audit, "inspect_database", side_effect=changing):
            result = audit.audit(self.root)
        self.assertFalse(result["sourceBytesUnchanged"])
        self.assertFalse(result["localEvidenceConsistent"])

    def test_invalid_python_is_not_imported_or_accepted(self):
        path = self.root / audit.KERNEL / "sheikha_v35_5_realistic_scifi_engine.py"
        path.write_text("def broken(:\n")
        self.assertIn("SyntaxError", audit.audit(self.root)["issues"])

    def test_symlink_and_non_regular_input_rejected(self):
        path = self.root / "link"
        path.symlink_to(self.ledger)
        with self.assertRaisesRegex(audit.AuditError, "SYMLINK"):
            audit.read_file(path)
        pipe = self.root / "pipe"
        os.mkfifo(pipe)
        with self.assertRaisesRegex(audit.AuditError, "REGULAR"):
            audit.read_file(pipe)

    def test_corrupt_database_and_missing_tables_fail(self):
        with self.assertRaises(sqlite3.DatabaseError):
            audit.inspect_database(b"not a database")
        conn = sqlite3.connect(self.db)
        conn.execute('DROP TABLE "' + audit.TABLES[0] + '"')
        conn.commit()
        conn.close()
        self.assertIn("REQUIRED_REGULAR_TABLE_MISSING", audit.audit(self.root)["issues"])

    def test_output_is_private_new_and_constrained(self):
        private = Path(self.temp.name) / "private"
        private.mkdir(mode=0o700)
        dest = private / "audit"
        result = audit.audit(self.root)
        audit.save_report(result, dest, private)
        self.assertEqual(dest.stat().st_mode & 0o777, 0o700)
        for path in dest.iterdir():
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        checksum, name = (dest / "SHA256SUMS").read_text().strip().split("  ")
        self.assertEqual(checksum, hashlib.sha256((dest / name).read_bytes()).hexdigest())
        with self.assertRaises(FileExistsError):
            audit.save_report(result, dest, private)
        with self.assertRaises(audit.AuditError):
            audit.save_report(result, private.parent / "public", private)
        link = private / "alias"
        link.symlink_to(dest, target_is_directory=True)
        with self.assertRaises(audit.AuditError):
            audit.save_report(result, link, private)

    def test_closure_exit_code_cannot_be_promoted_by_manifest_flags(self):
        result = audit.audit(self.root)
        self.assertEqual(audit.exit_code(result), 0)
        self.assertEqual(audit.exit_code(result, require_closure=True), 3)
        self.ledger.unlink()
        self.assertEqual(audit.exit_code(audit.audit(self.root), require_closure=True), 2)

    def test_newer_database_binding_requires_explicit_selection_and_matches(self):
        conn = sqlite3.connect(self.db)
        conn.execute('INSERT INTO "' + audit.TABLES[0] + '" VALUES (?)', ("later-version",))
        conn.commit()
        conn.close()
        digest = audit.sha256(self.db.read_bytes())
        prefix = "sheikha_v36_0_hostinger_connection"
        manifest = self.root / audit.KERNEL / (prefix + "_manifest.json")
        manifest.write_text(json.dumps({"hostinger_connection_scope": {"sheikha_sql_db_updated_hash": digest}}))
        ledger = json.loads(self.ledger.read_text())
        ledger["verified_physical_digests"][prefix + "_manifest_hash"] = audit.sha256(manifest.read_bytes())
        ledger["verified_physical_digests"]["sheikha_sql_db_v36_0_hostinger_connection_hash"] = digest
        self.ledger.write_text(json.dumps(ledger))
        self.assertFalse(audit.audit(self.root)["localEvidenceConsistent"])
        selected = audit.audit(self.root, "36_0")
        self.assertTrue(selected["localEvidenceConsistent"], selected["issues"])
        self.assertFalse(selected["closureAccepted"])
        manifest.write_text(manifest.read_text() + "\n")
        self.assertFalse(audit.audit(self.root, "36_0")["localEvidenceConsistent"])

    def test_missing_newer_manifest_cannot_fall_back_or_claim_closure(self):
        result = audit.audit(self.root, "36_0")
        self.assertFalse(result["localEvidenceConsistent"])
        self.assertFalse(result["closureAccepted"])


if __name__ == "__main__":
    unittest.main()
