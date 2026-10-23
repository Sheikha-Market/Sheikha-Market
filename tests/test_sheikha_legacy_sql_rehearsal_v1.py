import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "tools/verification/sheikha-legacy-sql-rehearsal-v1.py"
SPEC = importlib.util.spec_from_file_location("legacy_rehearsal", SCRIPT)
tool = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(tool)


class LegacyRehearsalTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.source = self.root / "legacy.sqlite3"
        self.target = self.root / "candidate.sqlite3"
        self.schema = tool.SCHEMA.read_bytes()
        conn = sqlite3.connect(self.source)
        for table, columns in tool.CATALOGS.items():
            conn.execute("CREATE TABLE " + tool.identifier(table) + " (" + ",".join(
                tool.identifier(c) + " TEXT" + (" PRIMARY KEY" if i == 0 else "")
                for i, c in enumerate(columns)) + ")")
            for number in range(2):
                row = ["private-" + c + "-" + str(number) for c in columns]
                if table == "entities_bylaws_articles_catalog":
                    row[columns.index("shariah_verdict")] = "FULLY_SHARIAH_COMPLIANT"
                conn.execute("INSERT INTO " + tool.identifier(table) + " VALUES (" +
                             ",".join("?" for _ in columns) + ")", row)
        conn.execute('CREATE TABLE "unmapped""table" (value BLOB, number REAL, missing TEXT)')
        conn.execute('INSERT INTO "unmapped""table" VALUES (?, ?, ?)', (b"\x00\xff", 1.25, None))
        conn.commit()
        conn.close()

    def tearDown(self):
        self.temp.cleanup()

    def mutate(self, sql, values=()):
        with sqlite3.connect(self.source) as conn:
            conn.execute(sql, values)

    def import_data(self, **kwargs):
        return tool.import_catalogs(self.source, self.target, self.schema, **kwargs)

    def test_schema_is_exact_reviewed_r2(self):
        self.assertEqual(tool.digest(self.schema), tool.SCHEMA_SHA256)

    def test_snapshot_preserves_all_tables_and_source_bytes(self):
        before = self.source.read_bytes()
        result = tool.snapshot(self.source, self.target, tool.digest(before))
        self.assertEqual(result, tool.inventory(self.source))
        self.assertEqual(before, self.source.read_bytes())
        self.assertEqual(len(result["tables"]), 4)
        self.assertEqual(self.target.stat().st_mode & 0o777, 0o600)
        self.assertFalse(tool.SAFETY.has_sidecars(self.source))

    def test_snapshot_rejects_wrong_binding_without_output(self):
        with self.assertRaisesRegex(tool.Error, "HASH_MISMATCH"):
            tool.snapshot(self.source, self.target, "0" * 64)
        self.assertFalse(self.target.exists())

    def test_snapshot_never_reopens_source_fd_while_sqlite_connection_holds_locks(self):
        original_connect = tool.connect
        original_hash = tool.fingerprint
        opened = []

        class Tracked:
            def __init__(inner, conn):
                inner.conn = conn
                opened.append(True)

            def __getattr__(inner, name):
                return getattr(inner.conn, name)

            def close(inner):
                inner.conn.close()
                opened.pop()

        def connecting(path, writable=False):
            conn = original_connect(path, writable)
            return Tracked(conn) if path == self.source else conn

        def hashing(path):
            if path == self.source:
                self.assertFalse(opened, "Closing an extra source FD can release POSIX locks")
            return original_hash(path)

        expected = original_hash(self.source)
        with patch.object(tool, "connect", side_effect=connecting), patch.object(tool, "fingerprint", side_effect=hashing):
            tool.snapshot(self.source, self.target, expected)

    def test_source_change_before_read_transaction_rejected(self):
        original_connect = tool.connect
        expected = tool.fingerprint(self.source)

        def connecting(path, writable=False):
            if path == self.source:
                self.mutate("UPDATE entities_bylaws_articles_catalog SET article_text='changed'")
            return original_connect(path, writable)

        with patch.object(tool, "connect", side_effect=connecting):
            with self.assertRaisesRegex(tool.Error, "SOURCE_CHANGED"):
                tool.snapshot(self.source, self.target, expected)
        self.assertFalse(self.target.exists())

    def test_sidecars_are_not_ignored(self):
        for suffix in ("-wal", "-shm", "-journal"):
            with self.subTest(suffix=suffix):
                sidecar = Path(str(self.source) + suffix)
                sidecar.touch()
                with self.assertRaisesRegex(tool.Error, "SIDECAR"):
                    tool.snapshot(self.source, self.target, tool.fingerprint(self.source))
                self.assertFalse(self.target.exists())
                sidecar.unlink()

    def test_wal_database_requires_separate_capture_procedure(self):
        with sqlite3.connect(self.source) as conn:
            conn.execute("PRAGMA journal_mode=WAL")
        with self.assertRaisesRegex(tool.Error, "ROLLBACK_JOURNAL"):
            tool.snapshot(self.source, self.target, tool.fingerprint(self.source))

    def test_source_symlink_rejected(self):
        alias = self.root / "alias"
        alias.symlink_to(self.source)
        with self.assertRaisesRegex(tool.Error, "SYMLINK"):
            tool.snapshot(alias, self.target, tool.fingerprint(self.source))

    def test_existing_target_never_overwritten(self):
        self.target.write_bytes(b"keep")
        with self.assertRaises(FileExistsError):
            self.import_data()
        self.assertEqual(self.target.read_bytes(), b"keep")

    def test_readonly_connection_rejects_update(self):
        conn = tool.connect(self.source)
        try:
            with self.assertRaises(sqlite3.OperationalError):
                conn.execute("DELETE FROM entities_bylaws_articles_catalog")
        finally:
            conn.close()

    def test_import_preserves_catalog_cells_and_text_after_reopening(self):
        before = self.source.read_bytes()
        result = self.import_data()
        self.assertTrue(result["allOriginalCatalogCellsPreserved"])
        self.assertEqual(result["normalizedProvisions"], 2)
        self.assertEqual(before, self.source.read_bytes())
        self.assertEqual(tool.reconcile(self.source, self.target), result)
        self.assertFalse(result["historyRecovered"])
        self.assertFalse(result["productionReady"])

    def test_claims_cannot_grant_registration_or_adoption(self):
        self.import_data()
        with sqlite3.connect(self.target) as conn:
            self.assertEqual(conn.execute("SELECT DISTINCT legal_status FROM entity_records").fetchall(),
                             [("USER_DECLARED_UNVERIFIED",)])
            self.assertEqual(conn.execute("SELECT DISTINCT shariah_review,legal_review FROM review_notes").fetchall(),
                             [("PENDING", "PENDING")])
            self.assertEqual(conn.execute("SELECT accepted_at,effective_at FROM document_versions").fetchall(),
                             [(None, None), (None, None)])
            self.assertEqual(conn.execute("SELECT count(*) FROM entity_identifiers").fetchone()[0], 0)

    def test_missing_and_extra_columns_rejected(self):
        self.mutate("ALTER TABLE entities_bylaws_articles_catalog ADD COLUMN surprise TEXT")
        with self.assertRaisesRegex(tool.Error, "SCHEMA_DRIFT"):
            self.import_data()
        self.assertFalse(self.target.exists())

    def test_nontext_cell_requires_explicit_mapping(self):
        self.mutate("UPDATE entities_bylaws_articles_catalog SET article_text=NULL")
        with self.assertRaisesRegex(tool.Error, "NON_TEXT"):
            self.import_data()

    def test_integer_timestamps_preserve_type_and_value(self):
        for table in tool.CATALOGS:
            self.mutate("ALTER TABLE " + table + " RENAME COLUMN timestamp TO old_timestamp")
            self.mutate("ALTER TABLE " + table + " DROP COLUMN old_timestamp")
            self.mutate("ALTER TABLE " + table + " ADD COLUMN timestamp INTEGER")
            self.mutate("UPDATE " + table + " SET timestamp=?", (1792215000,))
        self.import_data()
        with sqlite3.connect(self.target) as conn:
            for (payload,) in conn.execute("SELECT payload_json FROM catalog_claims"):
                value = json.loads(payload)["timestamp"]
                self.assertIs(type(value), int)
                self.assertEqual(value, 1792215000)

    def test_floating_timestamp_requires_mapping(self):
        self.mutate("ALTER TABLE entities_bylaws_articles_catalog RENAME COLUMN timestamp TO old_timestamp")
        self.mutate("ALTER TABLE entities_bylaws_articles_catalog DROP COLUMN old_timestamp")
        self.mutate("ALTER TABLE entities_bylaws_articles_catalog ADD COLUMN timestamp REAL")
        self.mutate("UPDATE entities_bylaws_articles_catalog SET timestamp=1.5")
        with self.assertRaisesRegex(tool.Error, "NON_TEXT"):
            self.import_data()

    def test_empty_key_is_not_replaced_with_invented_identity(self):
        self.mutate("UPDATE entities_bylaws_articles_catalog SET entity_id=' ' WHERE rowid=1")
        with self.assertRaisesRegex(tool.Error, "LEGACY_KEY"):
            self.import_data()

    def test_empty_article_reference_rolls_back_all_rows(self):
        self.mutate("UPDATE entities_bylaws_articles_catalog SET bylaw_article_code=' '")
        with self.assertRaisesRegex(tool.Error, "ARTICLE_REFERENCE"):
            self.import_data()
        self.assertTrue(all(t["rows"] == 0 for t in tool.inventory(self.target)["tables"].values()))

    def test_schema_tampering_rejected_before_execution(self):
        with self.assertRaisesRegex(tool.Error, "SCHEMA_HASH"):
            tool.import_catalogs(self.source, self.target, self.schema + b"SELECT 1;")
        self.assertFalse(self.target.exists())

    def test_injected_failure_has_no_committed_partial_rows(self):
        with self.assertRaisesRegex(tool.Error, "INJECTED_IMPORT_FAILURE"):
            self.import_data(fail_after=2)
        self.assertTrue(all(t["rows"] == 0 for t in tool.inventory(self.target)["tables"].values()))

    def test_imported_records_are_append_only_even_without_recursive_triggers(self):
        self.import_data()
        with sqlite3.connect(self.target) as conn:
            conn.execute("PRAGMA recursive_triggers=OFF")
            for sql in ("UPDATE provisions SET source_text='bad'", "DELETE FROM provisions",
                        "INSERT OR REPLACE INTO provisions SELECT * FROM provisions",
                        "INSERT OR REPLACE INTO document_versions SELECT * FROM document_versions"):
                with self.subTest(sql=sql), self.assertRaises(sqlite3.IntegrityError):
                    conn.execute(sql)
        tool.reconcile(self.source, self.target)

    def test_two_articles_and_versions_for_one_entity_are_supported(self):
        self.import_data()
        conn = tool.connect(self.target, writable=True)
        try:
            version, document, _, sid, _, _, _ = conn.execute("SELECT * FROM document_versions LIMIT 1").fetchone()
            tool.insert(conn, "provisions", provision_id="second", version_id=version,
                        article_reference="second", source_text="text", text_role="SOURCE_CLAIM",
                        source_id=sid, source_lines="synthetic")
            tool.insert(conn, "document_versions", version_id="new-version", document_id=document,
                        version_label="synthetic-2", source_id=sid, accepted_at=None,
                        effective_at=None, status="DRAFT_NOT_ADOPTED")
            conn.commit()
            self.assertEqual(conn.execute("SELECT count(*) FROM provisions WHERE version_id=?", (version,)).fetchone()[0], 2)
            self.assertEqual(conn.execute("SELECT count(*) FROM document_versions WHERE document_id=?", (document,)).fetchone()[0], 2)
        finally:
            conn.close()

    def test_inventory_exposes_counts_not_values(self):
        result = json.dumps(tool.inventory(self.source))
        self.assertNotIn("private-", result)
        self.assertNotIn("FULLY_SHARIAH_COMPLIANT", result)

    def test_worker_rejects_unprotected_live_source(self):
        with self.assertRaises(tool.Error):
            tool.worker(self.root, tool.fingerprint(self.source), "not-a-network-id")

    def test_output_scope_and_existing_directory(self):
        with patch.object(tool, "ROOT", self.root):
            private = self.root / "reports/private"
            private.mkdir(parents=True, mode=0o700)
            with self.assertRaises(tool.Error):
                tool.prepare_output(self.root / "public")
            destination = private / "run"
            tool.prepare_output(destination)
            self.assertEqual(destination.stat().st_mode & 0o777, 0o700)
            with self.assertRaises(FileExistsError):
                tool.prepare_output(destination)

    def test_snapshot_input_must_be_private_captured_file(self):
        with self.assertRaisesRegex(tool.Error, "PRIVATE_CAPTURED"):
            tool.validate_snapshot_input(self.source)
        with patch.object(tool, "ROOT", self.root):
            parent = self.root / "reports/private/capture"
            parent.mkdir(parents=True, mode=0o700)
            path = parent / "SOURCE_SNAPSHOT.sqlite3"
            tool.write_new(path, self.source.read_bytes())
            self.assertEqual(tool.validate_snapshot_input(path), path)
            path.chmod(0o644)
            with self.assertRaisesRegex(tool.Error, "PRIVATE_CAPTURED"):
                tool.validate_snapshot_input(path)


if __name__ == "__main__":
    unittest.main(verbosity=2)
