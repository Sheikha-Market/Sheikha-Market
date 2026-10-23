"""Isolated behavior checks; fixtures contain synthetic bytes under /tmp only."""

import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

MODULE_PATH = Path(__file__).absolute().with_name('verify_evidence.py')
SPEC = importlib.util.spec_from_file_location('review_evidence_verifier', MODULE_PATH)
VERIFIER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VERIFIER)


class EvidenceVerificationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='sheikha-evidence-test-', dir='/tmp')
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.ecosystem = self.base / 'sheikha_os_ecosystem'
        self.kernel = self.ecosystem / '01_foundry_baremetal_kernel'
        self.kernel.mkdir(parents=True)
        self.baseline = self.base / 'baseline.json'
        versions = []

        def fixture(path):
            path.parent.mkdir(parents=True, exist_ok=True)
            content = ('synthetic evidence: ' + path.name).encode()
            path.write_bytes(content)
            return hashlib.sha256(content).hexdigest()

        for version, name in VERIFIER.VERSION_NAMES.items():
            stem = 'sheikha_v35_' + version[-1] + '_' + name
            manifest = self.kernel / (stem + '_manifest.json')
            engine = self.kernel / (stem + '_engine.py')
            versions.append({'version': version, 'manifest_path': str(manifest),
                             'actual_manifest_sha256': fixture(manifest),
                             'engine_paths': [str(engine)],
                             'engine_sha256': [fixture(engine)]})
        self.database = self.kernel / 'sheikha_sql_db/sheikha_sovereign_master.sqlite3'
        registry = self.ecosystem / '04_evidence_integration_hub/sheikha_evidence_v2_specification.json'
        self.master = self.base / VERIFIER.MASTER_NAME
        self.record = {
            'schema': VERIFIER.SCHEMA,
            'local_observations': {
                'ecosystem_root': str(self.ecosystem), 'versions': versions,
                'database': {'path': str(self.database), 'actual_sha256': fixture(self.database)},
                'v2_evidence': {'path': str(registry), 'sha256': fixture(registry)}},
            'v35_9_static_review': {'path': str(self.master), 'sha256': fixture(self.master)},
            'findings': [{'id': key} for key in VERIFIER.CLAIMS]}
        self.save()

    def save(self):
        self.baseline.write_text(json.dumps(self.record))

    def run_check(self):
        return VERIFIER.verify(self.baseline)

    def test_complete_match_keeps_claims_open_and_never_executes_fixture(self):
        before = {p: p.read_bytes() for p in self.base.rglob('*') if p.is_file()}
        result, code = self.run_check()
        self.assertEqual(code, 0)
        self.assertEqual(result['status'], 'BASELINE_HASHES_MATCH')
        self.assertEqual(result['matching_file_count'], 11)
        self.assertEqual(len(result['claims']), 9)
        self.assertFalse(result['claimClosurePerformed'])
        self.assertFalse(result['targetCodeExecuted'])
        self.assertEqual(before, {p: p.read_bytes() for p in self.base.rglob('*') if p.is_file()})

    def test_changed_bytes_fail(self):
        self.master.write_text('different synthetic bytes')
        result, code = self.run_check()
        self.assertEqual(code, 1)
        self.assertIn('SHA256_MISMATCH', [x['reason'] for x in result['failures']])

    def test_missing_file_fails_instead_of_partial_success(self):
        self.master.unlink()
        result, code = self.run_check()
        self.assertEqual(code, 1)
        self.assertNotEqual(result['status'], 'BASELINE_HASHES_MATCH')

    def test_symlink_file_is_rejected_even_when_bytes_match(self):
        target = self.base / 'same-content'
        target.write_bytes(self.master.read_bytes())
        self.master.unlink()
        self.master.symlink_to(target)
        self.assertEqual(self.run_check()[1], 1)

    def test_symlink_parent_is_rejected(self):
        original = self.ecosystem.with_name('real-ecosystem')
        self.ecosystem.rename(original)
        self.ecosystem.symlink_to(original, target_is_directory=True)
        self.assertEqual(self.run_check()[1], 1)

    def test_each_database_sidecar_blocks_even_when_empty(self):
        for suffix in ('-wal', '-shm', '-journal'):
            with self.subTest(suffix=suffix):
                sidecar = Path(str(self.database) + suffix)
                sidecar.touch()
                try:
                    result, code = self.run_check()
                    self.assertEqual(code, 1)
                    self.assertTrue(any('SQLITE_SIDECAR_PRESENT' in x['reason'] for x in result['failures']))
                finally:
                    sidecar.unlink()

    def test_dangling_sidecar_symlink_also_blocks(self):
        Path(str(self.database) + '-wal').symlink_to(self.base / 'absent')
        self.assertEqual(self.run_check()[1], 1)

    def test_path_not_in_fixed_allowlist_is_rejected(self):
        self.record['local_observations']['versions'][0]['engine_paths'] = ['/etc/passwd']
        self.save()
        self.assertEqual(self.run_check()[1], 2)

    def test_duplicate_version_is_rejected(self):
        self.record['local_observations']['versions'][1] = self.record['local_observations']['versions'][0]
        self.save()
        self.assertEqual(self.run_check()[1], 2)

    def test_nul_path_returns_structured_baseline_failure(self):
        self.record['local_observations']['ecosystem_root'] = '/tmp/\x00/sheikha_os_ecosystem'
        self.save()
        result, code = self.run_check()
        self.assertEqual(code, 2)
        self.assertEqual(result['failures'][0]['reason'], 'NUL_PATH_NOT_ALLOWED')
        json.dumps(result)

    def test_unencodable_path_returns_structured_baseline_failure(self):
        self.record['local_observations']['ecosystem_root'] = '/tmp/\ud800/sheikha_os_ecosystem'
        self.save()
        result, code = self.run_check()
        self.assertEqual(code, 2)
        self.assertEqual(result['failures'][0]['reason'], 'UNENCODABLE_PATH')
        json.dumps(result)

    def test_invalid_digest_is_rejected(self):
        self.record['local_observations']['database']['actual_sha256'] = 'FULLY_SEALED'
        self.save()
        self.assertEqual(self.run_check()[1], 2)

    def test_duplicate_json_keys_are_rejected(self):
        raw = self.baseline.read_text()
        self.baseline.write_text('{"schema":"ignored",' + raw[1:])
        self.assertEqual(self.run_check()[1], 2)

    def test_nonfinite_json_is_rejected(self):
        raw = self.baseline.read_text()
        self.baseline.write_text('{"number":NaN,' + raw[1:])
        self.assertEqual(self.run_check()[1], 2)

    def test_change_after_read_fails_final_stability_check(self):
        original = VERIFIER.read_file
        changed = False

        def mutate_after_read(path, *args, **kwargs):
            nonlocal changed
            result = original(path, *args, **kwargs)
            if Path(path) == self.master and not changed:
                self.master.write_text('changed after digest')
                changed = True
            return result

        with mock.patch.object(VERIFIER, 'read_file', side_effect=mutate_after_read):
            result, code = self.run_check()
        self.assertEqual(code, 1)
        self.assertIn('FILE_CHANGED_AFTER_READ', [x['reason'] for x in result['failures']])

    def test_oversized_file_is_rejected_before_read(self):
        with mock.patch.object(VERIFIER, 'read_file', wraps=VERIFIER.read_file) as reader:
            with self.assertRaisesRegex(VERIFIER.EvidenceError, 'FILE_SIZE_LIMIT_EXCEEDED'):
                reader(self.master, limit=1)


if __name__ == '__main__':
    unittest.main()
