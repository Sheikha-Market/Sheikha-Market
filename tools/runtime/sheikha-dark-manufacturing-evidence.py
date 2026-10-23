#!/usr/bin/env python3
"""Record private design evidence; never execute engines or write source databases."""

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import uuid


ROOT = Path(__file__).resolve().parents[2]
FOUNDRY = Path('/home/sheikha/sheikha_os_ecosystem/01_foundry_baremetal_kernel')
MANIFEST = FOUNDRY / 'sheikha_v43_89_dark_manufacturing_manifest.json'
DATABASE = FOUNDRY / 'sheikha_sql_db/sheikha_sovereign_master.sqlite3'
DECLARED_MANIFEST = '2fdc865274c6e99159570fa804f0061499a28a874109c9c94a9f8d46d070a69d'
DECLARED_DATABASE = 'ba4f58a7d47e62ade1d9ab64425d6f6f9c482c77d87e2bcfb2341dd738b7413e'
DEFAULT_OUTPUT = ROOT / 'private/operations/dark-manufacturing-v43.89'
MAX_FILE_BYTES = 256 * 1024 * 1024


def metadata(info):
    return {'bytes': info.st_size, 'mtimeNs': info.st_mtime_ns,
            'ctimeNs': info.st_ctime_ns, 'inode': info.st_ino, 'device': info.st_dev}


def stable_hash(path, declared_digest, max_bytes=MAX_FILE_BYTES):
    """Hash a bounded regular file and discard results if its identity changes."""
    source = Path(path)
    result = {'path': str(source), 'declaredSha256': declared_digest,
              'status': 'NOT_MEASURED', 'comparison': 'NOT_COMPARABLE',
              'rawFileHashOnly': True, 'physicalVerification': False,
              'transactionalSnapshot': False}
    if not re.fullmatch(r'[0-9a-f]{64}', declared_digest):
        raise ValueError('DECLARED_DIGEST_MUST_BE_FULL_SHA256')
    fd = None
    try:
        before_path = source.lstat()
        if stat.S_ISLNK(before_path.st_mode):
            result['status'] = 'SYMLINK_DENIED'
            return result
        if not stat.S_ISREG(before_path.st_mode):
            result['status'] = 'NOT_REGULAR_FILE'
            return result
        fd = os.open(source, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode) or metadata(before) != metadata(before_path):
            result['status'] = 'FILE_CHANGED'
            return result
        result['metadata'] = metadata(before)
        if before.st_size > max_bytes:
            result['status'] = 'SIZE_LIMIT_EXCEEDED'
            return result
        digest = hashlib.sha256()
        total = 0
        while True:
            chunk = os.read(fd, min(65536, max_bytes - total + 1))
            if not chunk:
                break
            total += len(chunk)
            if total > max_bytes:
                result['status'] = 'SIZE_LIMIT_EXCEEDED'
                return result
            digest.update(chunk)
        after = os.fstat(fd)
        after_path = source.lstat()
        if (metadata(before) != metadata(after) or metadata(before) != metadata(after_path)
                or stat.S_ISLNK(after_path.st_mode) or total != before.st_size):
            result['status'] = 'FILE_CHANGED'
            return result
        actual = digest.hexdigest()
        result.update(status='STABLE_RAW_FILE_HASH', measuredSha256=actual,
                      comparison='MATCH' if actual == declared_digest else 'MISMATCH')
    except FileNotFoundError:
        result['status'] = 'FILE_CHANGED' if fd is not None else 'MISSING'
    except (OSError, ValueError):
        result['status'] = 'READ_ERROR'
    finally:
        if fd is not None:
            os.close(fd)
    return result


def build_record(manifest=MANIFEST, database=DATABASE, manifest_digest=DECLARED_MANIFEST,
                 database_digest=DECLARED_DATABASE, max_bytes=MAX_FILE_BYTES):
    return {
        'schema': 'SHEIKHA_DARK_MANUFACTURING_EVIDENCE_V1',
        'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
        'status': 'DESIGN_ONLY_PRODUCTION_HOLD',
        'productionHold': True,
        'failClosed': True,
        'userDeclarations': {
            'legalEntity': 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
            'requestedBrand': 'شيخة',
            'ownership': 'USER_DECLARED_NOT_INDEPENDENTLY_VERIFIED',
            'tradeNameRegistration': 'NOT_VERIFIED',
            'projectValues': ['QURAN_AND_SUNNAH', 'NO_RIBA', 'NO_GHARAR', 'NO_HARM'],
            'valuesVerification': 'PROJECT_VALUES_NOT_AUTOMATIC_RELIGIOUS_CERTIFICATION',
            'versionLabel': 'V43.89',
        },
        'hypotheses': {name: 'NOT_VERIFIED_PHYSICAL' for name in
                       ['lightsOutManufacturing', 'roboticsAI', 'zeroWaste',
                        'industrialPipeline', 'digitalTwinSynchronization']},
        'measuredFiles': {
            'manifest': stable_hash(manifest, manifest_digest, max_bytes),
            'masterDatabase': stable_hash(database, database_digest, max_bytes),
        },
        'measurementLimits': {
            'maxBytesPerFile': max_bytes,
            'databaseConsistency': 'RAW_BYTES_ONLY_NOT_SQLITE_TRANSACTION_OR_WAL_SNAPSHOT',
            'digestMeaning': 'CONTENT_IDENTIFIER_NOT_SIGNATURE_SEAL_OR_OWNERSHIP_PROOF',
            'noPhysicalReadinessInference': True,
        },
        'actionsPerformed': {'boundedReadOnlyFileHashes': True,
                             'privateEvidenceRecordWritten': True},
        'actionsNotPerformed': {
            'userEngineExecution': True, 'masterDatabaseWrites': True,
            'v2SpecificationReadsOrWrites': True, 'networkRequests': True,
            'actuatorCommands': True, 'cloudDeployment': True,
            'modelTrainingOrInference': True, 'productionActivation': True,
        },
    }


def write_private_record(record, output_dir=DEFAULT_OUTPUT):
    output = Path(output_dir).absolute()
    for ancestor in [*reversed(output.parents), output]:
        if ancestor.is_symlink():
            raise ValueError('OUTPUT_SYMLINK_DENIED')
    output.mkdir(parents=True, mode=0o700, exist_ok=True)
    info = output.stat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != os.geteuid() or info.st_mode & 0o077:
        raise ValueError('OUTPUT_DIRECTORY_MUST_BE_PRIVATE_AND_OWNED')
    canonical = json.dumps(record, ensure_ascii=False, sort_keys=True,
                           separators=(',', ':')).encode('utf-8')
    record_digest = hashlib.sha256(canonical).hexdigest()
    envelope = {'record': record, 'recordSha256': record_digest,
                'digestScope': 'CANONICAL_RECORD_JSON_CONTENT_IDENTIFIER_ONLY'}
    content = (json.dumps(envelope, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    target = output / f'evidence-{stamp}-{uuid.uuid4().hex[:12]}.json'
    fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'wb') as stream:
        stream.write(content)
        stream.flush()
        os.fsync(stream.fileno())
    return {'evidenceRecorded': True, 'path': str(target), 'recordSha256': record_digest,
            'artifactSha256': hashlib.sha256(content).hexdigest(),
            'status': record['status'], 'productionHold': record['productionHold'],
            'fileComparisons': {key: {'status': value['status'], 'comparison': value['comparison']}
                                for key, value in record['measuredFiles'].items()}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, default=MANIFEST)
    parser.add_argument('--database', type=Path, default=DATABASE)
    parser.add_argument('--manifest-sha256', default=DECLARED_MANIFEST)
    parser.add_argument('--database-sha256', default=DECLARED_DATABASE)
    parser.add_argument('--output-dir', type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    try:
        record = build_record(args.manifest, args.database, args.manifest_sha256,
                              args.database_sha256)
        print(json.dumps(write_private_record(record, args.output_dir), ensure_ascii=False))
    except (OSError, ValueError) as error:
        print(json.dumps({'evidenceRecorded': False, 'productionHold': True,
                          'errorType': type(error).__name__}))
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
