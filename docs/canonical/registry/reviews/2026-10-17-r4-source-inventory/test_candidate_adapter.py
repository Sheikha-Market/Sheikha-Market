"""New synthetic-only adapter tests; no historical database or runner imports."""

import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest import mock


ROOT = Path(__file__).absolute().parent
SPEC = importlib.util.spec_from_file_location('r4_candidate_adapter', ROOT / 'candidate_adapter.py')
ADAPTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ADAPTER)
SCHEMA = (ROOT / 'inputs/target-schema-reference.sql').read_bytes()
SOURCE_DDL = '''CREATE TABLE entities_bylaws_articles_catalog (
 entity_id TEXT PRIMARY KEY,
 cr_or_gov_number TEXT NOT NULL,
 entity_name TEXT NOT NULL,
 entity_type TEXT NOT NULL,
 bylaw_article_code TEXT NOT NULL,
 article_text TEXT NOT NULL,
 quran_sunnah_taseel TEXT NOT NULL,
 shariah_verdict TEXT NOT NULL,
 sha256_seal TEXT NOT NULL,
 timestamp INTEGER NOT NULL
)'''
ROWS = [
    ('e1', 'CR:synthetic-1', 'كيان تجريبي أول', 'SOURCE_TYPE_A', 'ART:01',
     'نص أصلي:\nسطر ثانٍ «عقد» \\ "', 'تأصيل منقول كما ورد', 'CLAIM_APPROVED', 'not-a-verified-seal', 123),
    ('e2', 'INTERNAL:2', 'Synthetic entity 二', 'SOURCE_TYPE_B', 'ART:02',
     ' A source\ttext with trailing spaces  ', 'unassessed\nreference',
     'FULLY_SHARIAH_COMPLIANT', '0' * 64, 456),
]


def source_bytes(rows=ROWS, ddl=SOURCE_DDL, extra_sql=None):
    db = sqlite3.connect(':memory:')
    try:
        db.execute(ddl)
        if extra_sql:
            db.executescript(extra_sql)
        for row in rows:
            db.execute('INSERT INTO entities_bylaws_articles_catalog VALUES(?,?,?,?,?,?,?,?,?,?)', row)
        db.commit()
        # Python builds without sqlite3.serialize still support Backup. The
        # synthetic fixture copy exists only inside this private temporary dir.
        with tempfile.TemporaryDirectory(prefix='sheikha-r4-fixture-') as temporary:
            path = Path(temporary) / 'synthetic.sqlite3'
            disk = sqlite3.connect(path)
            try:
                db.backup(disk)
            finally:
                disk.close()
            return path.read_bytes()
    finally:
        db.close()


class CandidateAdapterTests(unittest.TestCase):
    def convert(self, blob, schema=SCHEMA, pin=None):
        return ADAPTER.convert_snapshot(blob, target_schema_bytes=schema,
                                        expected_source_sha256=pin or hashlib.sha256(blob).hexdigest())

    def assert_preflight_rejects(self, blob, reason):
        with mock.patch.object(ADAPTER, '_create_target', side_effect=AssertionError('target opened')) as target:
            with self.assertRaisesRegex(ADAPTER.AdapterError, reason):
                self.convert(blob)
            target.assert_not_called()

    def test_two_entities_preserve_every_source_cell_and_text(self):
        blob = source_bytes()
        with self.convert(blob) as result:
            db = result.connection
            actual = {pk: json.loads(payload) for pk, payload in db.execute(
                'SELECT original_item_id,payload_json FROM catalog_claims')}
            self.assertEqual(actual, {row[0]: dict(zip(ADAPTER.COLUMNS, row)) for row in ROWS})
            self.assertEqual(dict(db.execute('SELECT article_reference,source_text FROM provisions')),
                             {row[4]: row[5] for row in ROWS})
            self.assertEqual(result.summary['source_row_count'], 2)
            self.assertEqual(result.summary['target_row_counts']['entity_records'], 2)
            self.assertEqual(len(list(db.execute("SELECT name FROM sqlite_schema WHERE type='table'"))), 12)
            self.assertEqual(db.execute("SELECT count(*) FROM sqlite_schema WHERE type='trigger'").fetchone()[0], 40)
            self.assertEqual(db.execute('PRAGMA foreign_key_check').fetchall(), [])
            self.assertEqual(db.execute('PRAGMA foreign_keys').fetchone()[0], 1)
            self.assertEqual(db.execute('PRAGMA database_list').fetchone()[2], '')
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute('INSERT INTO documents VALUES(?,?,?,?)', ('orphan', 'missing', 't', 'k'))

    def test_claims_never_become_registration_adoption_or_approval(self):
        with self.convert(source_bytes()) as result:
            db = result.connection
            self.assertEqual(db.execute('SELECT count(*) FROM entity_identifiers').fetchone()[0], 0)
            self.assertEqual(db.execute('SELECT count(*) FROM legal_references').fetchone()[0], 0)
            self.assertEqual(db.execute('SELECT count(*) FROM observed_artifacts').fetchone()[0], 0)
            self.assertEqual({r[0] for r in db.execute('SELECT legal_status FROM entity_records')},
                             {'USER_DECLARED_UNVERIFIED'})
            self.assertEqual({r for r in db.execute('SELECT status,accepted_at,effective_at FROM document_versions')},
                             {('SOURCE_SAMPLE_NOT_ADOPTED', None, None)})
            self.assertEqual({r[0] for r in db.execute('SELECT text_role FROM provisions')}, {'SOURCE_CLAIM'})
            self.assertEqual({r for r in db.execute('SELECT shariah_review,legal_review FROM review_notes')},
                             {('PENDING', 'PENDING')})
            self.assertEqual({r[0] for r in db.execute('SELECT assessment FROM catalog_claims')}, {'SOURCE_CLAIM_ONLY'})
            assertions = [json.loads(r[0]) for r in db.execute('SELECT source_assertion FROM review_notes')]
            self.assertEqual({r['shariah_verdict'] for r in assertions}, {r[7] for r in ROWS})
            self.assertFalse(result.summary['production_authorized'])
            self.assertFalse(result.summary['historical_versions_reconstructed'])
            self.assertTrue(result.summary['version_label'].startswith('OBSERVED_SNAPSHOT:'))
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute("UPDATE review_notes SET legal_review='APPROVED'")

    def test_same_snapshot_has_deterministic_ids_and_one_snapshot_source(self):
        blob = source_bytes()
        with self.convert(blob) as first, self.convert(blob) as second:
            for table in ('sources', 'catalog_claims', 'entity_records', 'documents',
                          'document_versions', 'provisions', 'review_notes'):
                query = 'SELECT * FROM "' + table + '" ORDER BY 1'
                self.assertEqual(first.connection.execute(query).fetchall(),
                                 second.connection.execute(query).fetchall())
            self.assertEqual(first.connection.execute('SELECT count(*) FROM sources').fetchone()[0], 1)
            self.assertEqual(first.connection.execute('SELECT sha256 FROM sources').fetchone()[0],
                             hashlib.sha256(blob).hexdigest())

    def test_null_or_blank_source_keys_rejected_before_target(self):
        for value in (None, '', ' \t\n'):
            with self.subTest(value=value):
                row = list(ROWS[0]); row[0] = value
                self.assert_preflight_rejects(source_bytes([row]), 'SOURCE_TEXT_TYPE_REQUIRED|SOURCE_KEY_EMPTY')
        row = list(ROWS[0]); row[4] = '  '
        self.assert_preflight_rejects(source_bytes([row]), 'SOURCE_KEY_EMPTY')

    def test_duplicate_input_keys_and_derived_id_collisions_rejected_before_target(self):
        with self.assertRaisesRegex(ADAPTER.AdapterError, 'DUPLICATE_SOURCE_KEY'):
            ADAPTER._plan([ROWS[0], ROWS[0]], '0' * 64)
        with mock.patch.object(ADAPTER, '_record_id', return_value='forced-collision'):
            self.assert_preflight_rejects(source_bytes(), 'DERIVED_ID_COLLISION')

    def test_source_schema_must_match(self):
        for ddl in (SOURCE_DDL.replace('entity_type TEXT NOT NULL', 'entity_type BLOB NOT NULL'),
                    SOURCE_DDL.replace('entity_id TEXT PRIMARY KEY', 'entity_id TEXT'),
                    SOURCE_DDL.replace('timestamp INTEGER NOT NULL', 'timestamp REAL NOT NULL'),
                    SOURCE_DDL.replace('entity_id TEXT PRIMARY KEY', 'entity_id TEXT COLLATE NOCASE PRIMARY KEY')):
            with self.subTest(ddl=ddl):
                self.assert_preflight_rejects(source_bytes(ddl=ddl), 'SOURCE_SCHEMA_MISMATCH')

    def test_source_blob_real_and_overflow_values_rejected(self):
        for column, value in ((5, b'binary text'), (9, 1.5), (9, float(1 << 63))):
            with self.subTest(column=column, value=value):
                row = list(ROWS[0]); row[column] = value
                self.assert_preflight_rejects(source_bytes([row]), 'SOURCE_TEXT_TYPE_REQUIRED|SOURCE_TIMESTAMP_INT64_REQUIRED')

    def test_snapshot_and_schema_pins_reject_changes_before_target(self):
        blob = source_bytes()
        with mock.patch.object(ADAPTER, '_create_target') as target:
            with self.assertRaisesRegex(ADAPTER.AdapterError, 'SOURCE_HASH_MISMATCH'):
                self.convert(blob, pin='0' * 64)
            with self.assertRaisesRegex(ADAPTER.AdapterError, 'TARGET_SCHEMA_HASH_MISMATCH'):
                self.convert(blob, schema=SCHEMA + b'\n')
            target.assert_not_called()

    def test_paths_are_not_accepted_and_no_source_file_remains(self):
        with self.assertRaisesRegex(ADAPTER.AdapterError, 'EXPLICIT_SOURCE_BYTES_REQUIRED'):
            ADAPTER.convert_snapshot('/never/open/source.sqlite3', target_schema_bytes=SCHEMA,
                                     expected_source_sha256='0' * 64)
        actual_temp = ADAPTER.tempfile.TemporaryDirectory
        paths = []
        def tracked_temp(*args, **kwargs):
            temporary = actual_temp(*args, **kwargs)
            paths.append(Path(temporary.name))
            return temporary
        with mock.patch.object(ADAPTER.tempfile, 'TemporaryDirectory', side_effect=tracked_temp):
            with self.convert(source_bytes()):
                self.assertTrue(paths)
                self.assertTrue(all(not path.exists() for path in paths))

    def test_unrelated_tables_are_not_converted_and_source_triggers_are_refused(self):
        with self.convert(source_bytes(extra_sql='CREATE TABLE unrelated(x TEXT); INSERT INTO unrelated VALUES("ignored");')) as result:
            self.assertEqual(result.summary['source_row_count'], 2)
            self.assertEqual(result.connection.execute('SELECT count(*) FROM catalog_claims').fetchone()[0], 2)
        trigger = '''CREATE TRIGGER source_trigger BEFORE UPDATE ON entities_bylaws_articles_catalog
                     BEGIN SELECT RAISE(ABORT,'unused'); END;'''
        self.assert_preflight_rejects(source_bytes(extra_sql=trigger), 'SOURCE_TRIGGERS_NOT_SUPPORTED')

    def test_byte_types_pins_and_size_are_checked_before_sqlite(self):
        blob = source_bytes()
        with mock.patch.object(ADAPTER, '_source_rows', side_effect=AssertionError('SQLite read')) as reader:
            for supplied, schema, pin, reason in (
                (bytearray(blob), SCHEMA, hashlib.sha256(blob).hexdigest(), 'EXPLICIT_SOURCE_BYTES_REQUIRED'),
                (blob, SCHEMA, '0' * 64, 'SOURCE_HASH_MISMATCH'),
                (blob, SCHEMA + b'\n', hashlib.sha256(blob).hexdigest(), 'TARGET_SCHEMA_HASH_MISMATCH'),
                (blob, SCHEMA, 'invalid-pin', 'INVALID_SOURCE_PIN'),
            ):
                with self.subTest(reason=reason):
                    with self.assertRaisesRegex(ADAPTER.AdapterError, reason):
                        ADAPTER.convert_snapshot(supplied, target_schema_bytes=schema,
                                                 expected_source_sha256=pin)
            with mock.patch.object(ADAPTER, 'MAX_SNAPSHOT_BYTES', 20):
                with self.assertRaisesRegex(ADAPTER.AdapterError, 'SOURCE_SIZE_LIMIT'):
                    self.convert(blob)
            reader.assert_not_called()
        with mock.patch.object(ADAPTER, 'MAX_ROWS', 1):
            self.assert_preflight_rejects(blob, 'SOURCE_ROW_LIMIT')

    def test_schema_and_row_rejection_clean_private_source_before_target(self):
        row = list(ROWS[0]); row[5] = b'not text'
        invalid = [source_bytes([row]), source_bytes(ddl=SOURCE_DDL.replace(
            'entity_type TEXT NOT NULL', 'entity_type BLOB NOT NULL'))]
        actual_temp = ADAPTER.tempfile.TemporaryDirectory
        paths = []
        def tracked_temp(*args, **kwargs):
            temporary = actual_temp(*args, **kwargs)
            paths.append(Path(temporary.name))
            return temporary
        with mock.patch.object(ADAPTER.tempfile, 'TemporaryDirectory', side_effect=tracked_temp):
            for blob in invalid:
                self.assert_preflight_rejects(blob, 'SOURCE_TEXT_TYPE_REQUIRED|SOURCE_SCHEMA_MISMATCH')
        self.assertEqual(len(paths), 2)
        self.assertTrue(all(not path.exists() for path in paths))

    def test_target_failure_rolls_back_and_closes_memory_connection(self):
        original_create = ADAPTER._create_target
        opened = []
        def denying_target(schema):
            db = original_create(schema)
            opened.append(db)
            db.set_authorizer(lambda action, table, *_rest:
                              sqlite3.SQLITE_DENY if action == sqlite3.SQLITE_INSERT and
                              table == 'review_notes' else sqlite3.SQLITE_OK)
            return db
        with mock.patch.object(ADAPTER, '_create_target', side_effect=denying_target):
            with self.assertRaises(sqlite3.DatabaseError):
                self.convert(source_bytes())
        self.assertEqual(len(opened), 1)
        with self.assertRaises(sqlite3.ProgrammingError):
            opened[0].execute('SELECT 1')


if __name__ == '__main__':
    unittest.main(verbosity=2)
