import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest import mock


SOURCE = Path(__file__).resolve().parents[1] / 'tools/runtime/sheikha-dark-manufacturing-evidence.py'
SPEC = importlib.util.spec_from_file_location('dark_manufacturing_evidence', SOURCE)
evidence = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(evidence)


class DarkManufacturingEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.file = self.root / 'fixture.bin'
        self.file.write_bytes(b'fixture evidence only')
        self.digest = hashlib.sha256(self.file.read_bytes()).hexdigest()

    def test_missing_file_never_claims_measurement(self):
        result = evidence.stable_hash(self.root / 'absent', self.digest)
        self.assertEqual(result['status'], 'MISSING')
        self.assertEqual(result['comparison'], 'NOT_COMPARABLE')
        self.assertNotIn('measuredSha256', result)

    def test_matching_and_mismatching_hashes_are_only_raw_file_checks(self):
        match = evidence.stable_hash(self.file, self.digest)
        mismatch = evidence.stable_hash(self.file, '0' * 64)
        self.assertEqual(match['comparison'], 'MATCH')
        self.assertEqual(mismatch['comparison'], 'MISMATCH')
        self.assertEqual(mismatch['measuredSha256'], self.digest)
        self.assertFalse(match['physicalVerification'])
        self.assertFalse(match['transactionalSnapshot'])

    def test_changed_file_discards_the_mixed_hash(self):
        original_read = os.read
        changed = False

        def mutate_after_read(fd, size):
            nonlocal changed
            data = original_read(fd, size)
            if data and not changed:
                changed = True
                self.file.write_bytes(b'changed fixture only')
            return data

        with mock.patch.object(evidence.os, 'read', side_effect=mutate_after_read):
            result = evidence.stable_hash(self.file, self.digest)
        self.assertEqual(result['status'], 'FILE_CHANGED')
        self.assertEqual(result['comparison'], 'NOT_COMPARABLE')
        self.assertNotIn('measuredSha256', result)

    def test_size_limits_and_symlinks_are_rejected(self):
        self.assertEqual(evidence.stable_hash(self.file, self.digest, 1)['status'],
                         'SIZE_LIMIT_EXCEEDED')
        link = self.root / 'link'
        link.symlink_to(self.file)
        self.assertEqual(evidence.stable_hash(link, self.digest)['status'], 'SYMLINK_DENIED')
        with self.assertRaises(ValueError):
            evidence.stable_hash(self.file, 'partial-digest')

    def test_matching_files_cannot_release_production_hold(self):
        record = evidence.build_record(self.file, self.file, self.digest, self.digest)
        self.assertEqual(record['status'], 'DESIGN_ONLY_PRODUCTION_HOLD')
        self.assertTrue(record['productionHold'])
        self.assertTrue(record['failClosed'])
        self.assertTrue(all(value == 'NOT_VERIFIED_PHYSICAL'
                            for value in record['hypotheses'].values()))
        self.assertTrue(record['actionsNotPerformed']['masterDatabaseWrites'])
        self.assertTrue(record['actionsNotPerformed']['v2SpecificationReadsOrWrites'])
        self.assertEqual(self.file.read_bytes(), b'fixture evidence only')

    def test_private_unique_records_preserve_existing_files_and_bind_content(self):
        record = evidence.build_record(self.file, self.file, self.digest, self.digest)
        output = self.root / 'private-output'
        first = evidence.write_private_record(record, output)
        before = Path(first['path']).read_bytes()
        second = evidence.write_private_record(record, output)
        self.assertNotEqual(first['path'], second['path'])
        self.assertEqual(Path(first['path']).read_bytes(), before)
        self.assertEqual(stat.S_IMODE(output.stat().st_mode), 0o700)
        self.assertEqual(stat.S_IMODE(Path(first['path']).stat().st_mode), 0o600)
        envelope = json.loads(before)
        canonical = json.dumps(envelope['record'], ensure_ascii=False, sort_keys=True,
                               separators=(',', ':')).encode('utf-8')
        self.assertEqual(hashlib.sha256(canonical).hexdigest(), first['recordSha256'])
        self.assertEqual(hashlib.sha256(before).hexdigest(), first['artifactSha256'])


if __name__ == '__main__':
    unittest.main()
