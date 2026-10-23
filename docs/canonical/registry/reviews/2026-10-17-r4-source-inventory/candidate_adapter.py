"""Bounded laboratory conversion of explicit snapshot bytes; never a live DB API.

Only entities_bylaws_articles_catalog is read. The temporary source is private,
opened read-only/immutable, and removed before the in-memory target is created.
No historical source engine or R3 runner is imported or executed.
"""

import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import tempfile


SCHEMA_SHA256 = '967528d6d227e5a74879aaaba6514feff4119c78f4c3b02c67242fc315f88934'
SOURCE_TABLE = 'entities_bylaws_articles_catalog'
COLUMNS = ('entity_id', 'cr_or_gov_number', 'entity_name', 'entity_type',
           'bylaw_article_code', 'article_text', 'quran_sunnah_taseel',
           'shariah_verdict', 'sha256_seal', 'timestamp')
TARGET_TABLES = ('metadata', 'sources', 'observed_artifacts', 'catalog_claims',
                 'findings', 'entity_records', 'entity_identifiers', 'documents',
                 'document_versions', 'provisions', 'review_notes', 'legal_references')
MAX_SNAPSHOT_BYTES = 32 * 1024 * 1024
MAX_TEXT_BYTES = 1024 * 1024
MAX_ROWS = 10000
I64_MIN, I64_MAX = -(1 << 63), (1 << 63) - 1
ID_KINDS = ('claim', 'entity', 'document', 'version', 'provision', 'review')


class AdapterError(ValueError):
    """Conversion was refused; no usable target is returned."""


class CandidateResult:
    def __init__(self, connection, summary):
        self.connection = connection
        self.summary = summary

    def close(self):
        self.connection.close()

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        self.close()


def _require(condition, reason):
    if not condition:
        raise AdapterError(reason)


def _json(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'),
                      sort_keys=True, allow_nan=False)


def _record_id(snapshot_sha256, source_pk, kind):
    # Unambiguous, typed JSON framing; no delimiter-based concatenation.
    framed = _json(['SHEIKHA_R4_LAB_ID_V1', snapshot_sha256, source_pk, kind])
    return kind + '_' + hashlib.sha256(framed.encode('utf-8')).hexdigest()


def _source_rows(snapshot_bytes):
    """No path argument: this function can only open its own private byte copy."""
    with tempfile.TemporaryDirectory(prefix='sheikha-r4-source-') as temporary:
        os.chmod(temporary, 0o700)
        path = Path(temporary) / 'snapshot.sqlite3'
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'wb') as stream:
            stream.write(snapshot_bytes)
        os.chmod(path, 0o400)
        db = sqlite3.connect(path.as_uri() + '?mode=ro&immutable=1', uri=True,
                             isolation_level=None)
        try:
            db.execute('PRAGMA query_only=ON')
            db.execute('PRAGMA trusted_schema=OFF')
            definition = db.execute(
                'SELECT type,sql FROM sqlite_schema WHERE name=?',
                (SOURCE_TABLE,)).fetchall()
            _require(len(definition) == 1 and definition[0][0] == 'table' and
                     not re.search(r'\bVIRTUAL\b', definition[0][1] or '', re.I),
                     'SOURCE_TABLE_NOT_ORDINARY')
            columns = db.execute('PRAGMA table_xinfo("' + SOURCE_TABLE + '")').fetchall()
            expected = [(i, name, 'INTEGER' if name == 'timestamp' else 'TEXT',
                         0 if i == 0 else 1, None, 1 if i == 0 else 0, 0)
                        for i, name in enumerate(COLUMNS)]
            _require(columns == expected, 'SOURCE_SCHEMA_MISMATCH')
            _require(not db.execute('PRAGMA foreign_key_list("' + SOURCE_TABLE + '")').fetchall(),
                     'SOURCE_SCHEMA_MISMATCH')
            _require(not db.execute(
                "SELECT 1 FROM sqlite_schema WHERE type='trigger' AND tbl_name=?",
                (SOURCE_TABLE,)).fetchall(), 'SOURCE_TRIGGERS_NOT_SUPPORTED')
            indexes = db.execute('PRAGMA index_list("' + SOURCE_TABLE + '")').fetchall()
            _require(len(indexes) == 1 and indexes[0][2:] == (1, 'pk', 0),
                     'SOURCE_SCHEMA_MISMATCH')
            index_name = indexes[0][1].replace('"', '""')
            indexed = db.execute('PRAGMA index_xinfo("' + index_name + '")').fetchall()
            _require([(r[2], r[3], r[4]) for r in indexed if r[5]] ==
                     [('entity_id', 0, 'BINARY')], 'SOURCE_SCHEMA_MISMATCH')
            # Reject additional constraints absent from the declared source schema.
            _require(not re.search(r'\b(CHECK|COLLATE|GENERATED|STRICT|WITHOUT)\b',
                                   definition[0][1], re.I), 'SOURCE_SCHEMA_MISMATCH')
            query = 'SELECT ' + ','.join('"' + c + '"' for c in COLUMNS)
            rows = db.execute(query + ' FROM "' + SOURCE_TABLE + '"').fetchmany(MAX_ROWS + 1)
            _require(len(rows) <= MAX_ROWS, 'SOURCE_ROW_LIMIT')
            return rows
        finally:
            db.close()


def _plan(rows, snapshot_sha256):
    plans, source_keys = [], set()
    identifiers = {kind: set() for kind in ID_KINDS}
    for row in rows:
        for value in row[:-1]:
            _require(type(value) is str, 'SOURCE_TEXT_TYPE_REQUIRED')
            _require(len(value.encode('utf-8')) <= MAX_TEXT_BYTES, 'SOURCE_TEXT_LIMIT')
        for index in (0, 4):
            _require(bool(row[index].strip()), 'SOURCE_KEY_EMPTY')
        _require(type(row[-1]) is int and I64_MIN <= row[-1] <= I64_MAX,
                 'SOURCE_TIMESTAMP_INT64_REQUIRED')
        _require(row[0] not in source_keys, 'DUPLICATE_SOURCE_KEY')
        source_keys.add(row[0])
        ids = {}
        for kind in ID_KINDS:
            identifier = _record_id(snapshot_sha256, row[0], kind)
            _require(type(identifier) is str and identifier.strip(), 'INVALID_DERIVED_ID')
            _require(identifier not in identifiers[kind], 'DERIVED_ID_COLLISION')
            identifiers[kind].add(identifier)
            ids[kind] = identifier
        plans.append({'row': row, 'payload': dict(zip(COLUMNS, row)), 'ids': ids})
    return sorted(plans, key=lambda item: item['row'][0])


def _create_target(schema_bytes):
    db = sqlite3.connect(':memory:', isolation_level=None)
    try:
        db.execute('PRAGMA foreign_keys=ON')
        db.execute('PRAGMA trusted_schema=OFF')
        db.executescript(schema_bytes.decode('utf-8'))
        tables = {r[0] for r in db.execute("SELECT name FROM sqlite_schema WHERE type='table'")}
        _require(tables == set(TARGET_TABLES), 'TARGET_TABLE_SET_MISMATCH')
        _require(db.execute("SELECT count(*) FROM sqlite_schema WHERE type='trigger'").fetchone()[0]
                 == 40, 'TARGET_TRIGGER_COUNT_MISMATCH')
        _require(db.execute('PRAGMA foreign_keys').fetchone()[0] == 1, 'TARGET_FK_DISABLED')
        return db
    except Exception:
        db.close()
        raise


def convert_snapshot(source_bytes, *, target_schema_bytes, expected_source_sha256):
    """Return a caller-owned in-memory CandidateResult; reject live paths entirely.

    Both pins are mandatory. All source cells and derived-key collisions are
    validated before opening the target. Temporary source files are removed on
    success and failure. No historical/adoption dates are inferred.
    """
    _require(type(source_bytes) is bytes, 'EXPLICIT_SOURCE_BYTES_REQUIRED')
    _require(type(target_schema_bytes) is bytes, 'EXPLICIT_SCHEMA_BYTES_REQUIRED')
    _require(type(expected_source_sha256) is str and
             re.fullmatch('[0-9a-f]{64}', expected_source_sha256), 'INVALID_SOURCE_PIN')
    _require(16 <= len(source_bytes) <= MAX_SNAPSHOT_BYTES, 'SOURCE_SIZE_LIMIT')
    _require(source_bytes.startswith(b'SQLite format 3\x00'), 'SOURCE_NOT_SQLITE')
    source_sha256 = hashlib.sha256(source_bytes).hexdigest()
    _require(source_sha256 == expected_source_sha256, 'SOURCE_HASH_MISMATCH')
    _require(hashlib.sha256(target_schema_bytes).hexdigest() == SCHEMA_SHA256,
             'TARGET_SCHEMA_HASH_MISMATCH')
    try:
        plans = _plan(_source_rows(source_bytes), source_sha256)
    except (sqlite3.Error, UnicodeError, OSError) as exc:
        raise AdapterError('SOURCE_REJECTED:' + type(exc).__name__) from exc
    # This is the first target creation/write; preflight above has completed.
    db = _create_target(target_schema_bytes)
    source_id = 'snapshot_' + source_sha256
    version_label = 'OBSERVED_SNAPSHOT:' + source_sha256
    summary = {'scope': 'LAB_CANDIDATE_ONLY', 'source_table': SOURCE_TABLE,
               'source_sha256': source_sha256, 'target_schema_sha256': SCHEMA_SHA256,
               'source_row_count': len(plans), 'version_label': version_label,
               'source_path_api': False, 'target_persisted': False,
               'registration_verified': False, 'legal_or_shariah_approval': False,
               'historical_versions_reconstructed': False, 'production_authorized': False}
    try:
        db.execute('BEGIN IMMEDIATE')
        db.execute('INSERT INTO metadata(key,value_json) VALUES(?,?)',
                   ('r4_lab_conversion', _json(summary)))
        db.execute('INSERT INTO sources(source_id,kind,title,locator,sha256,access_scope) '
                   'VALUES(?,?,?,?,?,?)',
                   (source_id, 'EXPLICIT_SQLITE_SNAPSHOT_BYTES', SOURCE_TABLE + ' snapshot',
                    'sha256:' + source_sha256, source_sha256, 'LAB_CONVERSION_ONLY'))
        for plan in plans:
            row, ids = plan['row'], plan['ids']
            locator = _json({'table': SOURCE_TABLE, 'primary_key': row[0],
                             'snapshot_sha256': source_sha256})
            db.execute('INSERT INTO catalog_claims VALUES(?,?,?,?,?,?,?,?)',
                       (ids['claim'], 'V35.7', SOURCE_TABLE, row[0], _json(plan['payload']),
                        source_id, locator, 'SOURCE_CLAIM_ONLY'))
            db.execute('INSERT INTO entity_records VALUES(?,?,?,?,?)',
                       (ids['entity'], row[2], row[3], 'USER_DECLARED_UNVERIFIED', source_id))
            db.execute('INSERT INTO documents VALUES(?,?,?,?)',
                       (ids['document'], ids['entity'], 'Observed bylaw sample: ' + row[2],
                        'SOURCE_BYLAW_SAMPLE'))
            db.execute('INSERT INTO document_versions VALUES(?,?,?,?,?,?,?)',
                       (ids['version'], ids['document'], version_label, source_id,
                        None, None, 'SOURCE_SAMPLE_NOT_ADOPTED'))
            db.execute('INSERT INTO provisions VALUES(?,?,?,?,?,?,?)',
                       (ids['provision'], ids['version'], row[4], row[5], 'SOURCE_CLAIM',
                        source_id, locator))
            assertion = _json({'quran_sunnah_taseel': row[6], 'shariah_verdict': row[7]})
            db.execute('INSERT INTO review_notes VALUES(?,?,?,?,?,?)',
                       (ids['review'], ids['provision'], assertion,
                        'Unassessed source assertions; no registration, adoption, or history verified.',
                        'PENDING', 'PENDING'))
        expected_counts = {table: 0 for table in TARGET_TABLES}
        expected_counts.update(metadata=1, sources=1)
        expected_counts.update({table: len(plans) for table in
                                ('catalog_claims', 'entity_records', 'documents',
                                 'document_versions', 'provisions', 'review_notes')})
        counts = {table: db.execute('SELECT count(*) FROM "' + table + '"').fetchone()[0]
                  for table in TARGET_TABLES}
        _require(counts == expected_counts, 'TARGET_ROW_COUNT_MISMATCH')
        payloads = {pk: json.loads(payload) for pk, payload in db.execute(
            'SELECT original_item_id,payload_json FROM catalog_claims')}
        _require(payloads == {plan['row'][0]: plan['payload'] for plan in plans},
                 'TARGET_PAYLOAD_MISMATCH')
        _require(not db.execute('PRAGMA foreign_key_check').fetchall(), 'TARGET_FK_FAILURE')
        _require(db.execute('PRAGMA integrity_check').fetchall() == [('ok',)],
                 'TARGET_INTEGRITY_FAILURE')
        db.execute('COMMIT')
        summary.update(target_row_counts=counts, payloads_preserved=True,
                       foreign_key_check='PASS', target_trigger_count=40)
        return CandidateResult(db, summary)
    except Exception:
        if db.in_transaction:
            db.execute('ROLLBACK')
        db.close()
        raise
