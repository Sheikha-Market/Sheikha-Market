"""Build-context tests use only disposable source trees and local Node resolution."""
from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import subprocess
import tempfile
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("cloud_context_under_test", ROOT / "tools/production/sheikha-cloud-build-context-v1.py")
context = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(context)


class CloudContextTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.root = self.base / "project"
        self.root.mkdir()
        self.staging = self.base / "staging"
        self.staging.mkdir()
        self.policy, self.policy_digest = context.load_policy(context.POLICY_PATH)
        self.policy['required_data_files'] = []
        # Fixtures model a minimal server; multi-entrypoint closure is tested below.
        self.policy['entrypoints'] = ['server.js']
        for relative, data in {
            "server.js": b"module.exports = {};\n",
            "package.json": b'{"name":"fixture","version":"1.0.0"}\n',
            "package-lock.json": b'{"name":"fixture","lockfileVersion":3}\n',
            "Dockerfile": b"FROM node:20-alpine\nCOPY . /app\n",
        }.items():
            self.write(relative, data)

    def write(self, relative, data):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return path

    def inspect(self):
        return context.inspect(self.root, self.policy, self.policy_digest)

    def test_read_only_default_reports_real_sizes_without_mutation(self):
        self.write("runtime/protocols/live.cjs", b"module.exports = 1;\n")
        before = {path.relative_to(self.root).as_posix(): (path.read_bytes(), stat.S_IMODE(path.stat().st_mode)) for path in self.root.rglob("*") if path.is_file()}
        report, inventory = self.inspect()
        self.assertEqual("PASS", report["status"])
        self.assertEqual(sum(len(data) for data, _ in before.values()), report["total_bytes"])
        self.assertIn("runtime/protocols/live.cjs", {item["path"] for item in inventory})
        after = {path.relative_to(self.root).as_posix(): (path.read_bytes(), stat.S_IMODE(path.stat().st_mode)) for path in self.root.rglob("*") if path.is_file()}
        self.assertEqual(before, after)
        self.assertEqual([], list(self.staging.iterdir()))

    def test_invalid_entrypoint_syntax_blocks_staging_without_source_disclosure(self):
        self.write('server.js', b"console.log('private-syntax-marker'););\n")
        report, inventory = self.inspect()
        self.assertEqual('BLOCKED', report['status'])
        self.assertIn({'path': 'server.js', 'rule': 'ENTRYPOINT_SYNTAX_INVALID'}, report['findings'])
        self.assertEqual(0, report['entrypoint_syntax']['checked'])
        self.assertNotIn('private-syntax-marker', json.dumps(report))
        with self.assertRaisesRegex(ValueError, 'BLOCKED_CONTEXT_NOT_STAGED'):
            context.stage(self.root, self.policy, report, inventory, self.staging)
        self.assertEqual([], list(self.staging.iterdir()))

    def test_syntax_check_never_executes_entrypoint_and_covers_secondary_module(self):
        marker = self.base / 'must-not-exist'
        self.write('server.js', ('require("node:fs").writeFileSync(' + json.dumps(str(marker)) + ', "executed");\n').encode())
        self.policy['entrypoints'].append('tools/check.mjs')
        self.write('tools/check.mjs', b'export const result = 1;\n')
        report, _inventory = self.inspect()
        self.assertEqual('PASS', report['status'])
        self.assertEqual(2, report['entrypoint_syntax']['checked'])
        self.assertFalse(marker.exists())
        self.write('tools/check.mjs', b'export const result = ;\n')
        report, _inventory = self.inspect()
        self.assertIn({'path': 'tools/check.mjs', 'rule': 'ENTRYPOINT_SYNTAX_INVALID'}, report['findings'])
        self.assertFalse(marker.exists())

    def test_syntax_check_fails_closed_without_node_or_on_timeout(self):
        with mock.patch.object(context.shutil, 'which', return_value=None):
            report, _inventory = self.inspect()
        self.assertEqual('BLOCKED', report['status'])
        self.assertIn('NODE_SYNTAX_CHECK_UNAVAILABLE', report['rule_counts'])
        with mock.patch.object(context.subprocess, 'run', side_effect=subprocess.TimeoutExpired('node', 20)):
            report, _inventory = self.inspect()
        self.assertEqual('BLOCKED', report['status'])
        self.assertIn('ENTRYPOINT_SYNTAX_CHECK_FAILED', report['rule_counts'])

    def test_private_data_models_and_broken_root_node_are_excluded(self):
        for relative in ("runtime/logs/history.json", "runtime/weights/model.gguf", "config/.env.production", "config/credentials.json", "public/private/notes.txt", "data/users.sqlite3"):
            self.write(relative, b"private inert fixture\n")
        (self.root / "node").symlink_to(self.base / "absent-node")
        report, inventory = self.inspect()
        self.assertEqual("PASS", report["status"])
        self.assertEqual(set(self.policy["root_files"]) - {".dockerignore", ".gcloudignore"}, {item["path"] for item in inventory})
        self.assertIn({"path": "node", "rule": "LOCAL_ROOT_SYMLINK_EXCLUDED"}, report["warnings"])

    def test_cloud_and_container_ignore_rules_retain_runtime_and_private_exclusions(self):
        for name in ('.gcloudignore', '.dockerignore'):
            rules = (ROOT / name).read_text()
            self.assertNotIn('[STRIPPED', rules)
            self.assertNotIn('**/distribution/**', rules)
            for required in ('!runtime/**/*.cjs', '!tools/**/*.js', '**/private/**', '**/.env*'):
                self.assertIn(required, rules)

    def test_truncated_pasted_ignore_rules_block_staging_without_echoing_content(self):
        for name in ('.gcloudignore', '.dockerignore'):
            for marker in ('[STRIPPED 86 bytes]', '[STRIPPED]', '76 lines hidden'):
                with self.subTest(name=name, marker=marker):
                    self.write(name, ('.git\n' + marker + '\n').encode())
                    report, inventory = self.inspect()
                    self.assertEqual('BLOCKED', report['status'])
                    self.assertIn('MALFORMED_IGNORE_RULES', report['rule_counts'])
                    self.assertNotIn(marker, json.dumps(report))
                    with self.assertRaisesRegex(ValueError, 'BLOCKED_CONTEXT_NOT_STAGED'):
                        context.stage(self.root, self.policy, report, inventory, self.staging)
            self.write(name, b'.git\n')
        self.assertEqual([], list(self.staging.iterdir()))

    def test_secondary_cli_entrypoint_retains_its_transitive_json_catalog(self):
        cli = 'tools/runtime/plan.cjs'
        self.policy['entrypoints'].append(cli)
        report, _ = self.inspect()
        self.assertEqual('BLOCKED', report['status'])
        self.assertIn('REQUIRED_ENTRYPOINT_MISSING', report['rule_counts'])
        self.write(cli, b"require('../../core/research/example.cjs');\n")
        self.write('core/research/example.cjs', b"require('./catalog.json');\n")
        report, _ = self.inspect()
        self.assertEqual('BLOCKED', report['status'])
        self.write('core/research/catalog.json', b'{"synthetic":true}\n')
        report, inventory = self.inspect()
        self.assertEqual('PASS', report['status'], report['findings'])
        destination = context.stage(self.root, self.policy, report, inventory, self.staging)
        self.assertTrue((destination / 'core/research/catalog.json').is_file())

    @unittest.skipUnless(context.shutil.which('gcloud'), 'Google Cloud SDK is unavailable')
    def test_real_gcloud_upload_list_keeps_staged_dependencies_only(self):
        self.write('.gcloudignore', (ROOT / '.gcloudignore').read_bytes())
        self.write('.dockerignore', (ROOT / '.dockerignore').read_bytes())
        for relative in ('core/distribution/installer.js', 'runtime/distribution/v2/status.js',
                         'tools/distribution/plan.js', 'tools/sheikha-language-platform/platform.js'):
            self.write(relative, b'module.exports = {};\n')
        report, inventory = self.inspect()
        destination = context.stage(self.root, self.policy, report, inventory, self.staging)
        for relative in ('public/private/notes.txt', 'config/.env', 'public/intellectual-property/design.json'):
            path = destination / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text('inert excluded test fixture')
        environment = dict(os.environ, CLOUDSDK_CONFIG=str(self.base / 'sdk-config'),
                           CLOUDSDK_CORE_DISABLE_USAGE_REPORTING='true')
        result = subprocess.run(['gcloud', 'meta', 'list-files-for-upload', '--verbosity=error'],
                                cwd=destination, env=environment, capture_output=True, text=True, timeout=45)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual({item['path'] for item in inventory} | {'SHEIKHA-CLOUD-CONTEXT-MANIFEST.json'},
                         set(result.stdout.splitlines()))

    def test_database_operational_code_is_retained_without_database_contents(self):
        self.write("lib/database/connection.js", b"module.exports = {};\n")
        self.write("routes/database/status.js", b"module.exports = {};\n")
        self.write("runtime/database/users.sqlite3", b"inert database fixture\n")
        report, inventory = self.inspect()
        paths = {item["path"] for item in inventory}
        self.assertEqual("PASS", report["status"])
        self.assertIn("lib/database/connection.js", paths)
        self.assertIn("routes/database/status.js", paths)
        self.assertNotIn("runtime/database/users.sqlite3", paths)

    def test_core_private_file_exclusions_cannot_be_relaxed_by_policy(self):
        self.write("runtime/payload.gguf", b"inert excluded fixture\n")
        self.write("public/intellectual-property/design.json", b'{"private":true}\n')
        self.policy["excluded_components"] = []
        self.policy["excluded_suffixes"] = []
        self.policy["code_suffixes"].append(".gguf")
        report, inventory = self.inspect()
        self.assertEqual("PASS", report["status"])
        self.assertNotIn("runtime/payload.gguf", {item["path"] for item in inventory})
        self.assertNotIn("public/intellectual-property/design.json", {item["path"] for item in inventory})

    def test_only_exact_public_prefixes_are_not_reported_as_credentials(self):
        self.assertEqual([], context.secret_rules(b"const apiKey = 'shk_' + generated;"))
        self.assertEqual([], context.secret_rules(b"password: 'nafath_' + generated"))
        for value in ("shk_fixture_not_a_real_key", "nafath_fixture_password", "fixture-password"):
            self.assertIn("HARDCODED_CREDENTIAL_REVIEW_REQUIRED", context.secret_rules(f"password: '{value}'".encode()))

    def test_explicit_dynamic_assets_are_required_and_secret_scanned(self):
        relative = 'runtime/feature/registry.json'
        self.policy['required_data_files'] = [relative]
        report, _ = self.inspect()
        self.assertEqual('BLOCKED', report['status'])
        self.assertIn('REQUIRED_ASSET_MISSING', report['rule_counts'])
        self.write(relative, b'{"fixture":true}\n')
        report, inventory = self.inspect()
        self.assertEqual('PASS', report['status'])
        self.assertIn(relative, {item['path'] for item in inventory})
        self.write(relative, b'{"password":"fixture-do-not-deploy"}\n')
        report, _ = self.inspect()
        self.assertEqual('BLOCKED', report['status'])
        self.assertIn('HARDCODED_CREDENTIAL_REVIEW_REQUIRED', report['rule_counts'])

    @unittest.skipUnless(context.shutil.which("node"), "Local Node resolver is unavailable")
    def test_platform_route_retains_tools_and_transitive_runtime_dependencies(self):
        self.write("server.js", b"require('./routes/sheikha-platform/sheikha-platform-routes');\n")
        self.write("routes/sheikha-platform/sheikha-platform-routes.js", b"require('../../tools/sheikha-language-platform/sheikha-language-platform-v1');\n")
        self.write("tools/sheikha-language-platform/sheikha-language-platform-v1.js", b"require('../../runtime/language/kernel.cjs');\n")
        self.write("runtime/language/kernel.cjs", b"module.exports = {};\n")
        report, inventory = self.inspect()
        self.assertEqual("PASS", report["status"], report["findings"])
        destination = context.stage(self.root, self.policy, report, inventory, self.staging)
        self.assertTrue((destination / "tools/sheikha-language-platform/sheikha-language-platform-v1.js").is_file())
        self.assertTrue((destination / "runtime/language/kernel.cjs").is_file())

    @unittest.skipUnless(context.shutil.which("node"), "Local Node resolver is unavailable")
    def test_required_protocol_kernel_composite_and_json_are_staged_without_execution(self):
        marker = self.base / "must-not-exist"
        self.write("server.js", b"require('./runtime/protocols/protocol'); require('./composite/main');\n")
        self.write("runtime/protocols/protocol.js", b"require('../kernel/kernel');\n")
        self.write("runtime/kernel/kernel.js", b"require('./definition.json');\n")
        self.write("runtime/kernel/definition.json", b'{"enabled":false}\n')
        self.write("composite/main.js", ("require('node:fs').writeFileSync(" + json.dumps(str(marker)) + ", 'unsafe');\n").encode())
        report, inventory = self.inspect()
        self.assertEqual("PASS", report["status"], report["findings"])
        destination = context.stage(self.root, self.policy, report, inventory, self.staging)
        self.assertFalse(marker.exists())
        for relative in ("runtime/protocols/protocol.js", "runtime/kernel/kernel.js", "runtime/kernel/definition.json", "composite/main.js"):
            self.assertEqual((self.root / relative).read_bytes(), (destination / relative).read_bytes())
        manifest = json.loads((destination / "SHEIKHA-CLOUD-CONTEXT-MANIFEST.json").read_text())
        self.assertEqual(len(inventory), len(manifest["source_snapshot"]))

    def test_secret_findings_never_echo_the_value_and_prevent_staging(self):
        synthetic = "gh" + "p_" + "A" * 36
        self.write("lib/config.js", synthetic.encode())
        report, inventory = self.inspect()
        self.assertEqual("BLOCKED", report["status"])
        self.assertNotIn(synthetic, json.dumps(report))
        self.assertTrue(any(item["rule"] == "GITHUB_TOKEN" for item in report["findings"]))
        with self.assertRaisesRegex(ValueError, "BLOCKED_CONTEXT_NOT_STAGED"):
            context.stage(self.root, self.policy, report, inventory, self.staging)
        self.assertEqual([], list(self.staging.iterdir()))

    def test_oversized_text_and_total_budget_fail_closed(self):
        self.policy["max_text_file_bytes"] = 64
        self.write("lib/large.js", b"x" * 65)
        report, _ = self.inspect()
        self.assertEqual("BLOCKED", report["status"])
        self.assertTrue(any(item["rule"] == "FILE_SIZE_LIMIT" for item in report["findings"]))
        self.policy["max_total_bytes"] = 1
        report, _ = self.inspect()
        self.assertEqual("BLOCKED", report["status"])
        self.assertEqual(0, report["total_bytes"])

    @unittest.skipUnless(context.shutil.which("node"), "Local Node resolver is unavailable")
    def test_missing_required_import_blocks_context(self):
        self.write("server.js", b"require('./runtime/absent');\n")
        report, _ = self.inspect()
        self.assertEqual("BLOCKED", report["status"])
        self.assertTrue(any(item["rule"] == "STATIC_LOCAL_IMPORT_UNRESOLVED" for item in report["findings"]))

    @unittest.skipUnless(context.shutil.which("node"), "Local Node resolver is unavailable")
    def test_required_in_tree_symlink_is_refused_instead_of_losing_import_alias(self):
        self.write("server.js", b"require('./lib/alias');\n")
        target = self.write("lib/target.js", b"module.exports = {};\n")
        (self.root / "lib/alias.js").symlink_to(target)
        report, _ = self.inspect()
        self.assertEqual("BLOCKED", report["status"])
        self.assertIn("STATIC_IMPORT_SYMLINK_REFUSED", {item["rule"] for item in report["findings"]})

    def test_source_changes_after_snapshot_are_not_silently_copied(self):
        report, inventory = self.inspect()
        self.write("server.js", b"module.exports = {changed:true};\n")
        with self.assertRaisesRegex(ValueError, "STAGING_INCOMPLETE_PRESERVED"):
            context.stage(self.root, self.policy, report, inventory, self.staging)
        self.assertEqual(1, len(list(self.staging.iterdir())))
        self.assertFalse(any(path.name == "SHEIKHA-CLOUD-CONTEXT-MANIFEST.json" for path in self.staging.rglob("*")))

    def test_hardlink_and_symlink_application_roots_are_refused(self):
        outside = self.base / "outside.txt"
        outside.write_bytes(b"module.exports = {};\n")
        outside.chmod(0o644)
        os.link(outside, self.root / "server.js.hardlink")
        os.unlink(self.root / "server.js")
        os.link(outside, self.root / "server.js")
        (self.root / "runtime").symlink_to(self.base, target_is_directory=True)
        report, _ = self.inspect()
        self.assertEqual("BLOCKED", report["status"])
        self.assertIn("NON_REGULAR_OR_HARDLINK_REFUSED", {item["rule"] for item in report["findings"]})
        self.assertIn("ALLOWLIST_ROOT_SYMLINK_REFUSED", {item["rule"] for item in report["findings"]})
        self.assertEqual(0o644, stat.S_IMODE(outside.stat().st_mode))


if __name__ == "__main__":
    unittest.main()
