import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "v36_audit", ROOT / "tools/verification/sheikha-v36-integration-audit-v1.py")
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class IntegrationAuditTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.ecosystem = self.root / "ecosystem"
        self.db = self.ecosystem / audit.safe.DATABASE
        self.db.parent.mkdir(parents=True)
        self.db.write_bytes(b"Synthetic bytes: hash binding only, not a SQLite integrity fixture.")
        self.ledger = self.ecosystem / audit.safe.LEDGER
        self.ledger.parent.mkdir(parents=True)
        digests = {}
        for version, name, section in audit.VERSIONS:
            prefix = "sheikha_v" + version + "_" + name
            dbhash = audit.safe.sha256(self.db.read_bytes()) if version == "36_9" else "a" * 64
            field = "sheikha_sql_db_master_digest" if version == "36_9" else "sheikha_sql_db_updated_hash"
            manifest = {section: {field: dbhash, "connection": "CONNECTED"}, "status": "COMPLETE"}
            raw = json.dumps(manifest).encode()
            (self.ecosystem / audit.safe.KERNEL / (prefix + "_manifest.json")).write_bytes(raw)
            engine = "run_sheikha_v36_9_ultimate_master.py" if version == "36_9" else prefix + "_engine.py"
            (self.ecosystem / audit.safe.KERNEL / engine).write_text(
                'import os\nraise RuntimeError("MUST_NOT_EXECUTE")\n'
                'manifest = {"status": "COMPLETE", "connection": "CONNECTED"}\n'
                'sovereign_levels = [("a",), ("b",)]\n')
            digests[prefix + "_manifest_hash"] = audit.safe.sha256(raw)
            suffix = "master" if version == "36_9" else name
            digests["sheikha_sql_db_v" + version + "_" + suffix + "_hash"] = dbhash
        self.ledger.write_text(json.dumps({"verified_physical_digests": digests}))
        self.config = self.root / "mcp.json"
        self.config.write_text(json.dumps({"mcpServers": {
            "fixture": {"command": "do-not-launch", "env": {"TOKEN": "SECRET_SENTINEL"}},
            "remote": {"url": "https://example.invalid/?key=SECRET_SENTINEL"}}}))

    def run_audit(self):
        return audit.audit(self.ecosystem, [self.config])

    def test_consistent_files_cannot_promote_closure(self):
        report = self.run_audit()
        self.assertTrue(report["localEvidenceConsistent"])
        self.assertEqual(len(report["versions"]), 7)
        self.assertFalse(report["closureAccepted"])
        self.assertFalse(report["productionReady"])
        self.assertEqual(audit.safe.exit_code(report, True), 3)
        self.assertEqual(audit.safe.exit_code(report, False), 0)

    def test_engines_are_not_executed(self):
        report = self.run_audit()
        self.assertFalse(report["effects"]["engineExecution"])
        self.assertEqual(report["versions"][-1]["sourceFacts"]["literalCatalogLengths"],
                         {"sovereign_levels": 2})

    def test_historical_db_not_compared_as_current(self):
        report = self.run_audit()
        self.assertNotIn("currentDatabaseMatches", report["versions"][0]["checks"])
        self.assertTrue(report["versions"][-1]["checks"]["currentDatabaseMatches"])

    def test_changed_current_database_blocks(self):
        self.db.write_bytes(b"Changed input")
        report = self.run_audit()
        self.assertIn("BINDING_MISMATCH_36_9", report["issues"])
        self.assertEqual(audit.safe.exit_code(report, True), 2)

    def test_newer_ledger_binding_does_not_rewrite_requested_baseline(self):
        self.db.write_bytes(b"Newer version")
        ledger = json.loads(self.ledger.read_text())
        ledger["verified_physical_digests"]["sheikha_sql_db_v37_1_cosmic_data_hash"] = audit.safe.sha256(self.db.read_bytes())
        self.ledger.write_text(json.dumps(ledger))
        before = self.ledger.read_bytes()
        report = self.run_audit()
        self.assertEqual(report["currentDatabaseLedgerMatches"], ["sheikha_sql_db_v37_1_cosmic_data_hash"])
        self.assertEqual(report["expectedCurrentDatabaseVersion"], "36_9")
        self.assertFalse(report["closureAccepted"])
        self.assertEqual(before, self.ledger.read_bytes())

    def test_manifest_changed_without_repin_blocks(self):
        file = self.ecosystem / audit.safe.KERNEL / "sheikha_v36_4_plugins_workspace_manifest.json"
        file.write_bytes(file.read_bytes() + b"\n")
        self.assertIn("BINDING_MISMATCH_36_4", self.run_audit()["issues"])

    def test_missing_inputs_fail_closed(self):
        self.ledger.unlink()
        self.assertFalse(self.run_audit()["localEvidenceConsistent"])

    def test_duplicate_ledger_keys_rejected(self):
        self.ledger.write_text('{"verified_physical_digests":{},"verified_physical_digests":{}}')
        self.assertIn("DUPLICATE_JSON_KEY", self.run_audit()["issues"])

    def test_symlink_input_rejected(self):
        target = self.root / "actual.json"
        self.config.rename(target)
        self.config.symlink_to(target)
        self.assertIn("SYMLINK_INPUT_OR_OUTPUT", self.run_audit()["issues"])

    def test_sidecar_blocks_without_touching_live_sqlite(self):
        Path(str(self.db) + "-wal").write_bytes(b"present")
        report = self.run_audit()
        self.assertIn("LIVE_SQLITE_SIDECAR_PRESENT", report["issues"])
        self.assertFalse(report["effects"]["liveDatabaseOpened"])

    def test_registrations_do_not_leak_secrets_or_trigger_execution(self):
        report = self.run_audit()
        self.assertNotIn("SECRET_SENTINEL", json.dumps(report))
        self.assertEqual(report["automaticActions"], [])
        self.assertTrue(all(not entry["launchedByAudit"] for entry in report["registrations"][0]["servers"]))
        self.assertTrue(all(not effect for effect in report["effects"].values()))

    def test_invalid_mcp_shape_blocks(self):
        self.config.write_text('{"mcpServers":[]}')
        self.assertIn("MCP_SERVERS_MAP_REQUIRED", self.run_audit()["issues"])

    def test_literal_matching_is_not_runtime_verification(self):
        facts = self.run_audit()["versions"][-1]["sourceFacts"]
        self.assertEqual({x["field"] for x in facts["matchingLiteralDeclarations"]}, {"status", "connection"})
        self.assertFalse(facts["runtimeBehaviorVerified"])

    def test_inputs_unchanged(self):
        before = {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        self.assertTrue(self.run_audit()["sourceBytesUnchanged"])
        self.assertEqual(before, {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()})

    def test_mutation_detected_on_second_read(self):
        real_read = audit.safe.read_file
        count = 0

        def changed(path):
            nonlocal count
            data = real_read(path)
            if Path(path) == self.config:
                count += 1
                if count == 2:
                    return data + b"\n"
            return data

        with patch.object(audit.safe, "read_file", side_effect=changed):
            report = self.run_audit()
        self.assertIn("INPUT_SNAPSHOT_NOT_CONFIRMED", report["issues"])

    def test_private_report_no_overwrite(self):
        private = self.root / "private"
        private.mkdir(mode=0o700)
        destination = private / "run1"
        audit.safe.save_report(self.run_audit(), destination, private)
        self.assertEqual(os.stat(destination).st_mode & 0o777, 0o700)
        self.assertEqual(os.stat(destination / "observations.json").st_mode & 0o777, 0o600)
        with self.assertRaises(FileExistsError):
            audit.safe.save_report(self.run_audit(), destination, private)


if __name__ == "__main__":
    unittest.main()
