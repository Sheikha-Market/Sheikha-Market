"""Guard tests use disposable fixture trees, never the live project context."""
import ast
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
GUARD = ROOT / 'tools/runtime/sheikha-prepare-cloud-run-context.sh'


@unittest.skipUnless(shutil.which('node'), 'Node syntax parser is required')
class PrepareContextGuardTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.root = self.base / 'project'
        self.guard = self.root / 'tools/runtime/sheikha-prepare-cloud-run-context.sh'
        self.guard.parent.mkdir(parents=True)
        self.guard.write_bytes(GUARD.read_bytes())
        body = GUARD.read_text().split("<<'PY'\n", 1)[1].rsplit('\nPY', 1)[0]
        assignments = [node for node in ast.parse(body).body
                       if isinstance(node, ast.Assign)
                       and any(isinstance(target, ast.Name) and target.id in
                               {'trees', 'root_files', 'required_modules'}
                               for target in node.targets)]
        namespace = {}
        exec(compile(ast.Module(body=assignments, type_ignores=[]), '<fixture-paths>', 'exec'), namespace)
        self.required = namespace['root_files'] + namespace['required_modules']
        for tree in namespace['trees']:
            (self.root / tree).mkdir(parents=True, exist_ok=True)
        for relative in self.required:
            suffix = Path(relative).suffix
            data = b'{}\n' if suffix == '.json' else b'module.exports = {};\n'
            if relative == 'Dockerfile':
                data = b'FROM node:20-alpine\n'
            self.write(relative, data)
        self.destination = self.base / 'context'

    def write(self, relative, data):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return path

    def run_guard(self, environment=None, extra_args=()):
        return subprocess.run(['bash', str(self.guard), str(self.destination), *extra_args],
                              env=environment, capture_output=True, text=True, timeout=45)

    def test_nested_private_inputs_are_excluded_without_dropping_functional_json(self):
        hidden = ('public/private/notes.json', 'runtime/intellectual-property/design.json',
                  'config/.env.runtime', 'config/.envbackup', 'runtime/secrets/value.json',
                  'runtime/credentials/value.json', 'config/credentials-local.json',
                  'config/service-account-prod.json', 'config/passwords.json',
                  'runtime/private-keys/signing.pem', 'config/client.key',
                  'public/workspace/engineering/natural-integration.html')
        for relative in hidden:
            self.write(relative, b'inert private fixture\n')
        self.write('runtime/public-contract.json', b'{"enabled":false}\n')
        self.write('runtime/secret-manager.js', b'module.exports = {};\n')
        result = self.run_guard()
        self.assertEqual(0, result.returncode, result.stderr)
        for relative in hidden:
            self.assertFalse((self.destination / relative).exists(), relative)
        self.assertTrue((self.destination / 'runtime/public-contract.json').exists())
        self.assertTrue((self.destination / 'runtime/secret-manager.js').exists())

    def test_bad_server_syntax_fails_before_destination_and_does_not_echo_source(self):
        self.write('server.js', b'const PRIVATE_FIXTURE_VALUE = ;\n')
        result = self.run_guard()
        self.assertNotEqual(0, result.returncode)
        self.assertIn('JavaScript syntax check failed: server.js', result.stderr)
        self.assertNotIn('PRIVATE_FIXTURE_VALUE', result.stderr)
        self.assertFalse(self.destination.exists())

    def test_empty_or_invalid_canonical_kernel_fails_before_destination(self):
        relative = 'runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js'
        self.write(relative, b'')
        result = self.run_guard()
        self.assertIn('Required file is empty', result.stderr)
        self.assertFalse(self.destination.exists())
        self.write(relative, b'function (\n')
        result = self.run_guard()
        self.assertIn('JavaScript syntax check failed: ' + relative, result.stderr)
        self.assertFalse(self.destination.exists())

    def test_byte_budget_fails_before_allocation_without_reading_sparse_payload(self):
        payload = self.root / 'runtime/oversized.dat'
        with payload.open('wb') as handle:
            handle.truncate(1024 * 1024 * 1024 + 1)
        result = self.run_guard()
        self.assertNotEqual(0, result.returncode)
        self.assertIn('Context limit exceeded:', result.stderr)
        self.assertIn('bytes; limits 20000 files, 1073741824 bytes', result.stderr)
        self.assertFalse(self.destination.exists())

    def test_file_budget_fails_before_allocation(self):
        # Exercise the same branch with a small fixture-only count limit.
        text = self.guard.read_text().replace('MAX_CONTEXT_FILES = 20000',
                                             'MAX_CONTEXT_FILES = 1')
        self.guard.write_text(text)
        result = self.run_guard()
        self.assertNotEqual(0, result.returncode)
        self.assertIn('Context limit exceeded:', result.stderr)
        self.assertFalse(self.destination.exists())

    def test_parser_does_not_execute_source_or_inherit_node_preload(self):
        source_marker = self.base / 'source-executed'
        preload_marker = self.base / 'preload-executed'
        self.write('server.js', ("require('node:fs').writeFileSync(" + repr(str(source_marker))
                                  + ", 'executed');\n").encode())
        preload = self.base / 'preload.cjs'
        preload.write_text("require('node:fs').writeFileSync(" + repr(str(preload_marker))
                           + ", 'executed');\n")
        environment = dict(os.environ, NODE_OPTIONS='--require=' + str(preload))
        result = self.run_guard(environment)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertFalse(source_marker.exists())
        self.assertFalse(preload_marker.exists())

    def test_actual_docker_syntax_guard_follows_copy_and_preserves_dependency_layer(self):
        lines = (ROOT / 'Dockerfile').read_text().splitlines()
        copy = lines.index('COPY . ./')
        self.assertTrue(lines[copy + 1].startswith('RUN node --check server.js &&'))
        for relative in ('routes/sheikha-infinite-agent/sheikha-infinite-agent-routes.js',
                         'runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js',
                         'runtime/sheikha-natural-integration/v1/sheikha-natural-integration-model.js'):
            self.assertIn('node --check ' + relative, lines[copy + 1])
        self.assertTrue(any(line.startswith('RUN npm config set fetch-retries 5 &&')
                            and 'npm ci --omit=dev' in line for line in lines[:copy]))

    def test_explicit_server_override_stages_only_frozen_bytes_without_execution_or_copyback(self):
        original = b'const broken = ;\n'
        self.write('server.js', original)
        marker = self.base / 'override-must-not-execute'
        override = self.base / 'frozen-server.bytes'
        frozen = ("require('node:fs').writeFileSync(" + repr(str(marker))
                  + ", 'executed');\n").encode()
        override.write_bytes(frozen)
        result = self.run_guard(extra_args=('--server-override', str(override)))
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual(frozen, (self.destination / 'server.js').read_bytes())
        self.assertEqual(original, (self.root / 'server.js').read_bytes())
        self.assertEqual(frozen, override.read_bytes())
        self.assertFalse(marker.exists())
        self.assertIn('"destination": "server.js"', result.stderr)
        self.assertIn('"sourceTreeModified": false', result.stderr)
        self.assertNotIn('override-must-not-execute', result.stderr)

    def test_invalid_or_symlink_server_override_fails_before_destination(self):
        override = self.base / 'frozen-server.js'
        override.write_text('const BAD_OVERRIDE_CONTENT = ;\n')
        result = self.run_guard(extra_args=('--server-override', str(override)))
        self.assertNotEqual(0, result.returncode)
        self.assertIn('JavaScript syntax check failed: server.js', result.stderr)
        self.assertNotIn('BAD_OVERRIDE_CONTENT', result.stderr)
        self.assertFalse(self.destination.exists())
        link = self.base / 'server-link.js'
        link.symlink_to(override)
        result = self.run_guard(extra_args=('--server-override', str(link)))
        self.assertNotEqual(0, result.returncode)
        self.assertIn('missing or unsafe', result.stderr)
        self.assertFalse(self.destination.exists())

    def test_server_override_mutating_during_copy_never_produces_success(self):
        override = self.base / 'frozen-server.js'
        override.write_text('module.exports = {frozen:true};\n')
        # Change only the disposable guard copy to make the race deterministic.
        text = self.guard.read_text().replace(
            '                shutil.copyfileobj(source, target)',
            '                shutil.copyfileobj(source, target)\n'
            "                if relative == Path('server.js'):\n"
            "                    server_override.write_bytes(b'module.exports = {changed:true};\\n')")
        self.guard.write_text(text)
        before = (self.root / 'server.js').read_bytes()
        result = self.run_guard(extra_args=('--server-override', str(override)))
        self.assertNotEqual(0, result.returncode)
        self.assertIn('Source changed during copy: server.js', result.stderr)
        self.assertEqual(before, (self.root / 'server.js').read_bytes())
        self.assertIn('Incomplete context retained for inspection:', result.stderr)

    @unittest.skipUnless(shutil.which('gcloud'), 'Local gcloud upload-list parser unavailable')
    def test_gcloud_local_upload_list_excludes_private_but_keeps_functional_json(self):
        self.write('.gcloudignore', (ROOT / '.gcloudignore').read_bytes())
        hidden = ('.env', '.env.runtime', 'config/.env.production', 'private/report.json',
                  'public/private/design.json', 'runtime/intellectual-property/design.json',
                  'runtime/secrets/value.json', 'config/credentials-prod.json',
                  'config/client.key', 'runtime/sheikha_os_ecosystem/design.json')
        for relative in hidden:
            self.write(relative, b'inert private fixture\n')
        self.write('runtime/public-contract.json', b'{"enabled":false}\n')
        environment = dict(os.environ, CLOUDSDK_CONFIG=str(self.base / 'gcloud-config'),
                           CLOUDSDK_CORE_DISABLE_USAGE_REPORTING='true',
                           GCE_METADATA_DISABLED='true')
        result = subprocess.run(['gcloud', 'meta', 'list-files-for-upload', '--verbosity=error'],
                                cwd=self.root, env=environment, capture_output=True,
                                text=True, timeout=45)
        self.assertEqual(0, result.returncode, result.stderr)
        uploaded = set(result.stdout.splitlines())
        for relative in hidden:
            self.assertNotIn(relative, uploaded)
        self.assertIn('runtime/public-contract.json', uploaded)


if __name__ == '__main__':
    unittest.main()
