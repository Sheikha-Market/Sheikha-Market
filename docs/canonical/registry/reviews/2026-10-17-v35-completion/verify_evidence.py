#!/usr/bin/env python3
"""Read eleven fixed evidence files; never import or execute their contents."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sys

SCHEMA = 'SHEIKHA_V35_EVIDENCE_RECONCILIATION_V1'
RESULT_SCHEMA = 'SHEIKHA_V35_READ_ONLY_VERIFICATION_V1'
VERSION_NAMES = {
    'V35.5': 'realistic_scifi',
    'V35.6': 'universal_legal',
    'V35.7': 'entity_regulation',
    'V35.8': 'cosmic_quality',
}
CLAIMS = ['V35-E%02d' % n for n in range(1, 10)]
MASTER_NAME = 'run_sheikha_v35_9_ultimate_master.sh'
MAX_FILE_BYTES = 256 * 1024 * 1024


class EvidenceError(Exception):
    pass


def absolute_path(value):
    if not isinstance(value, (str, Path)):
        raise EvidenceError('INVALID_PATH_TYPE')
    p = Path(value)
    if not p.is_absolute() or '..' in p.parts:
        raise EvidenceError('ABSOLUTE_PATH_WITHOUT_PARENT_TRAVERSAL_REQUIRED')
    if '\x00' in str(p):
        raise EvidenceError('NUL_PATH_NOT_ALLOWED')
    try:
        os.fsencode(str(p))
    except UnicodeError:
        raise EvidenceError('UNENCODABLE_PATH')
    return p


def parent_fd(path):
    """Open every directory with no-follow semantics; pin parents with dir_fd."""
    path = absolute_path(path)
    if not hasattr(os, 'O_NOFOLLOW') or not hasattr(os, 'O_DIRECTORY'):
        raise EvidenceError('NOFOLLOW_DIRECTORY_SUPPORT_REQUIRED')
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
    fd = os.open('/', flags)
    try:
        for part in path.parts[1:-1]:
            nxt = os.open(part, flags, dir_fd=fd)
            os.close(fd)
            fd = nxt
        return fd, path.name
    except BaseException:
        os.close(fd)
        raise


def identity(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_size,
            info.st_mtime_ns, info.st_ctime_ns)


def read_file(path, capture=False, limit=MAX_FILE_BYTES):
    directory, name = parent_fd(path)
    fd = None
    try:
        before = os.stat(name, dir_fd=directory, follow_symlinks=False)
        if not stat.S_ISREG(before.st_mode):
            raise EvidenceError('REGULAR_FILE_REQUIRED')
        if before.st_size > limit:
            raise EvidenceError('FILE_SIZE_LIMIT_EXCEEDED')
        fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK,
                     dir_fd=directory)
        if identity(os.fstat(fd)) != identity(before):
            raise EvidenceError('FILE_CHANGED_BEFORE_READ')
        h = hashlib.sha256()
        chunks = []
        size = 0
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > limit:
                raise EvidenceError('FILE_SIZE_LIMIT_EXCEEDED')
            h.update(chunk)
            if capture:
                chunks.append(chunk)
        after = os.stat(name, dir_fd=directory, follow_symlinks=False)
        if (identity(before) != identity(os.fstat(fd)) or
                identity(before) != identity(after) or size != before.st_size):
            raise EvidenceError('FILE_CHANGED_DURING_READ')
        return h.hexdigest(), identity(after), b''.join(chunks)
    finally:
        if fd is not None:
            os.close(fd)
        os.close(directory)


def check_identity(path, expected):
    directory, name = parent_fd(path)
    try:
        actual = os.stat(name, dir_fd=directory, follow_symlinks=False)
        if not stat.S_ISREG(actual.st_mode) or identity(actual) != expected:
            raise EvidenceError('FILE_CHANGED_AFTER_READ')
    finally:
        os.close(directory)


def check_database_sidecars(path):
    directory, name = parent_fd(path)
    try:
        for suffix in ('-wal', '-shm', '-journal'):
            try:
                os.stat(name + suffix, dir_fd=directory, follow_symlinks=False)
            except FileNotFoundError:
                continue
            raise EvidenceError('SQLITE_SIDECAR_PRESENT:' + suffix)
    finally:
        os.close(directory)


def no_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise EvidenceError('DUPLICATE_JSON_KEY')
        result[key] = value
    return result


def reject_constant(_value):
    raise EvidenceError('NONFINITE_JSON_NUMBER')


def require_digest(value):
    if not isinstance(value, str) or not re.fullmatch('[0-9a-f]{64}', value):
        raise EvidenceError('INVALID_SHA256')
    return value


def targets_from_record(record, ecosystem_root=None, master_script=None):
    if record.get('schema') != SCHEMA:
        raise EvidenceError('UNSUPPORTED_BASELINE_SCHEMA')
    local = record['local_observations']
    original = absolute_path(local['ecosystem_root'])
    if original.name != 'sheikha_os_ecosystem':
        raise EvidenceError('UNEXPECTED_ECOSYSTEM_ROOT_NAME')
    actual = absolute_path(ecosystem_root) if ecosystem_root else original
    original_master = original.parent / MASTER_NAME
    actual_master = absolute_path(master_script) if master_script else original_master
    if actual_master.name != MASTER_NAME:
        raise EvidenceError('UNEXPECTED_MASTER_SCRIPT_NAME')
    versions = local['versions']
    if not isinstance(versions, list) or len(versions) != 4:
        raise EvidenceError('EXACTLY_FOUR_VERSIONS_REQUIRED')
    by_version = {row['version']: row for row in versions}
    if set(by_version) != set(VERSION_NAMES) or len(by_version) != len(versions):
        raise EvidenceError('DUPLICATE_OR_UNEXPECTED_VERSION')
    if {row['id'] for row in record['findings']} != set(CLAIMS) or len(record['findings']) != 9:
        raise EvidenceError('EXPECTED_NINE_OPEN_CLAIM_REFERENCES')
    targets = []

    def add(relative, supplied_path, sha, label):
        if absolute_path(supplied_path) != original / relative:
            raise EvidenceError('BASELINE_PATH_OUTSIDE_FIXED_ALLOWLIST')
        targets.append({'id': label, 'path': actual / relative,
                        'expected_sha256': require_digest(sha)})

    for version, name in VERSION_NAMES.items():
        row = by_version[version]
        stem = 'sheikha_v35_' + version[-1] + '_' + name
        prefix = Path('01_foundry_baremetal_kernel')
        add(prefix / (stem + '_manifest.json'), row['manifest_path'],
            row['actual_manifest_sha256'], version + '-manifest')
        if len(row['engine_paths']) != 1 or len(row['engine_sha256']) != 1:
            raise EvidenceError('EXACTLY_ONE_ENGINE_PER_VERSION_REQUIRED')
        add(prefix / (stem + '_engine.py'), row['engine_paths'][0],
            row['engine_sha256'][0], version + '-engine')
    database = local['database']
    add(Path('01_foundry_baremetal_kernel/sheikha_sql_db/sheikha_sovereign_master.sqlite3'),
        database['path'], database['actual_sha256'], 'sqlite-main-file')
    registry = local['v2_evidence']
    add(Path('04_evidence_integration_hub/sheikha_evidence_v2_specification.json'),
        registry['path'], registry['sha256'], 'v2-evidence-registry')
    master = record['v35_9_static_review']
    if absolute_path(master['path']) != original_master:
        raise EvidenceError('BASELINE_MASTER_PATH_OUTSIDE_FIXED_ALLOWLIST')
    targets.append({'id': 'V35.9-script', 'path': actual_master,
                    'expected_sha256': require_digest(master['sha256'])})
    if len(targets) != 11 or len({str(t['path']) for t in targets}) != 11:
        raise EvidenceError('EXACTLY_ELEVEN_DISTINCT_FILES_REQUIRED')
    return targets


def verify(baseline, ecosystem_root=None, master_script=None):
    result = {'schema': RESULT_SCHEMA, 'status': 'INVALID_BASELINE', 'files': [],
              'failures': [], 'required_file_count': 11,
              'targetCodeExecuted': False, 'databaseConnectionOpened': False,
              'networkUsed': False, 'filesWritten': False,
              'claimClosurePerformed': False,
              'claims': [{'id': item, 'status': 'OPEN_NOT_EVALUATED'} for item in CLAIMS],
              'limits': ['Baseline authenticity is not established by its own hash.',
                         'Metadata stability observed; no atomic multi-file snapshot is claimed.',
                         'No database integrity or legal, quality, service, or cryptographic capability evaluation.']}
    try:
        baseline = absolute_path(baseline)
        sha, baseline_identity, raw = read_file(baseline, capture=True, limit=2 * 1024 * 1024)
        result['baseline_sha256'] = sha
        record = json.loads(raw.decode('utf-8'), object_pairs_hook=no_duplicate_keys,
                            parse_constant=reject_constant)
        targets = targets_from_record(record, ecosystem_root, master_script)
    except (EvidenceError, OSError, ValueError, TypeError, KeyError, IndexError, AttributeError, RecursionError) as exc:
        result['failures'].append({'scope': 'baseline', 'reason': str(exc) if isinstance(exc, EvidenceError) else type(exc).__name__})
        return result, 2

    database = next(t['path'] for t in targets if t['id'] == 'sqlite-main-file')
    identities = []
    try:
        check_database_sidecars(database)
    except (EvidenceError, OSError) as exc:
        result['status'] = 'EVIDENCE_UNSAFE_OR_MISMATCH'
        result['failures'].append({'scope': 'database', 'reason': str(exc) if isinstance(exc, EvidenceError) else type(exc).__name__})
        return result, 1
    for target in targets:
        item = {'id': target['id'], 'path': str(target['path']),
                'expected_sha256': target['expected_sha256']}
        try:
            actual_sha, observed_identity, _ = read_file(target['path'])
            item['actual_sha256'] = actual_sha
            item['status'] = 'MATCH' if actual_sha == target['expected_sha256'] else 'MISMATCH'
            identities.append((target['path'], observed_identity))
            if item['status'] != 'MATCH':
                result['failures'].append({'scope': target['id'], 'reason': 'SHA256_MISMATCH'})
        except (EvidenceError, OSError) as exc:
            item['status'] = 'UNSAFE_OR_UNREADABLE'
            result['failures'].append({'scope': target['id'], 'reason': str(exc) if isinstance(exc, EvidenceError) else type(exc).__name__})
        result['files'].append(item)
    try:
        for path, observed_identity in identities:
            check_identity(path, observed_identity)
        check_identity(baseline, baseline_identity)
        check_database_sidecars(database)
    except (EvidenceError, OSError) as exc:
        result['failures'].append({'scope': 'final-stability-check', 'reason': str(exc) if isinstance(exc, EvidenceError) else type(exc).__name__})
    result['examined_file_count'] = len(result['files'])
    result['matching_file_count'] = sum(item['status'] == 'MATCH' for item in result['files'])
    success = not result['failures'] and result['matching_file_count'] == 11
    result['status'] = 'BASELINE_HASHES_MATCH' if success else 'EVIDENCE_UNSAFE_OR_MISMATCH'
    return result, 0 if success else 1


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    default = Path(__file__).absolute().parent.parent / '2026-10-17-v35-evidence/evidence-reconciliation.json'
    parser.add_argument('--baseline', type=Path, default=default)
    parser.add_argument('--ecosystem-root', type=Path)
    parser.add_argument('--master-script', type=Path)
    args = parser.parse_args(argv)
    result, code = verify(args.baseline, args.ecosystem_root, args.master_script)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return code


if __name__ == '__main__':
    sys.exit(main())
