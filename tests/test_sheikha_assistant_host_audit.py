import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("host_audit", Path(__file__).resolve().parents[1] / "tools/environment/sheikha-assistant-host-audit.py")
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)
TOOLS = ["sheikha_federation_status", "sheikha_environment_governance_status"]


def config():
    return {
        "projects": {str(audit.ROOT): {"trust_level": "trusted"}, "/": {"trust_level": "untrusted"}},
        "mcp_servers": {"sheikha-readonly": {
            "command": "node", "args": [str(audit.ADAPTER)], "cwd": str(audit.ROOT),
            "enabled": True, "default_tools_approval_mode": "prompt", "enabled_tools": TOOLS[:],
            "startup_timeout_sec": 10, "tool_timeout_sec": 15,
        }},
    }


def write_config(file, extra=""):
    text = '[projects.' + json.dumps(str(audit.ROOT)) + ']\ntrust_level = "trusted"\n' + extra
    file.write_text(text)
    file.chmod(0o600)
    return text


class HostAuditTests(unittest.TestCase):
    def test_scoped_project_with_no_parent_trust_passes(self):
        result = audit.inspect_document(config(), TOOLS, True)
        self.assertTrue(all(result["checks"].values()))
        self.assertFalse(result["otherConnectorPermissionsVerified"])

    def test_parent_trust_is_not_hidden_by_exact_project_entry(self):
        for parent in ("/", "/home/sheikha", "/home/sheikha/", str(audit.ROOT.parent)):
            with self.subTest(parent=parent):
                doc = config()
                doc["projects"][parent] = {"trust_level": "trusted"}
                self.assertFalse(audit.inspect_document(doc, TOOLS, True)["checks"]["noBroadAncestorTrust"])

    def test_bridge_rejects_extra_authority_fields_commands_and_tool_drift(self):
        base = config()["mcp_servers"]["sheikha-readonly"]
        changes = [{"env": {"TOKEN": "SECRET_SENTINEL"}}, {"url": "https://example.invalid"},
                   {"tools": {"execute": {"approval_mode": "approve"}}}, {"command": "bash"},
                   {"default_tools_approval_mode": "approve"}, {"enabled_tools": TOOLS + ["exec_shell"]},
                   {"enabled_tools": TOOLS + [TOOLS[0]]}, {"enabled_tools": [False]},
                   {"enabled": False}, {"tool_timeout_sec": True}, {"tool_timeout_sec": 999},
                   {"cwd": "/tmp"}, {"args": ["other.js"]}]
        for change in changes:
            self.assertFalse(audit.bridge_aligned({**base, **change}, TOOLS))

    def test_duplicate_bridge_alias_is_detected(self):
        doc = config()
        doc["mcp_servers"]["alternate"] = {"command": "node", "args": [str(audit.ADAPTER)]}
        self.assertFalse(audit.inspect_document(doc, TOOLS, True)["checks"]["noDuplicateBridge"])

    def test_sensitive_environment_values_are_counted_not_emitted(self):
        doc = config()
        doc["mcp_servers"]["provider"] = {"env": {"API_KEY": "SECRET_SENTINEL", "TOKEN_REF": "${TOKEN}", "REGION": "local"}}
        result = audit.inspect_document(doc, TOOLS, True)
        self.assertEqual(result["inlineSensitiveEnvironmentValues"], 2)
        self.assertEqual(result["secretStorageReview"]["unverifiedPlaceholderValues"], 1)
        self.assertEqual(result["secretStorageReview"]["status"], "REVIEW_REQUIRED")
        self.assertNotIn("SECRET_SENTINEL", json.dumps(result))
        self.assertNotIn("API_KEY", json.dumps(result))

    def test_auto_approval_override_is_rejected(self):
        doc = config()
        doc["mcp_servers"]["hostinger"] = {"default_tools_approval_mode": "prompt", "tools": {"execute": {"approval_mode": "approve"}}}
        self.assertFalse(audit.inspect_document(doc, TOOLS, True)["checks"]["selectedProviderApprovalsExplicit"])

    def test_every_selected_provider_requires_an_explicit_prompt_default(self):
        for mode in (None, "auto", "writes", "approve", "SECRET_SENTINEL", True):
            doc = config()
            doc["mcp_servers"]["hostinger-billing"] = {"default_tools_approval_mode": mode}
            result = audit.inspect_document(doc, TOOLS, True)
            self.assertFalse(result["checks"]["selectedProviderApprovalsExplicit"])
            self.assertEqual(result["providerApprovalReview"]["serversWithoutPromptDefault"], 1)
            self.assertNotIn("SECRET_SENTINEL", json.dumps(result))

    def test_sensitive_binding_cannot_bypass_provider_checks_by_renaming(self):
        doc = config()
        doc["mcp_servers"]["renamed"] = {"env": {"HOSTINGER_API_TOKEN": "SECRET_SENTINEL"}}
        result = audit.inspect_document(doc, TOOLS, True)
        self.assertFalse(result["checks"]["selectedProviderApprovalsExplicit"])
        self.assertEqual(result["providerApprovalReview"]["selectedServerCount"], 1)
        self.assertNotIn("SECRET_SENTINEL", json.dumps(result))

    def test_google_workspace_requires_prompt_and_rejects_write_overrides(self):
        for server in ({}, {"default_tools_approval_mode": "prompt", "tools": {
                "send_mail": {"approval_mode": "writes"}}}):
            doc = config()
            doc["mcp_servers"]["google_workspace"] = server
            result = audit.inspect_document(doc, TOOLS, True)
            self.assertFalse(result["checks"]["selectedProviderApprovalsExplicit"])
            self.assertEqual(result["providerApprovalReview"]["selectedFamilies"]["googleWorkspace"], 1)
        doc["mcp_servers"]["google_workspace"] = {"default_tools_approval_mode": "prompt"}
        self.assertTrue(audit.inspect_document(doc, TOOLS, True)["checks"]["selectedProviderApprovalsExplicit"])

    def test_google_launcher_alias_cannot_evade_approval_review(self):
        doc = config()
        doc["mcp_servers"]["alias"] = {"args": [str(Path.home() / ".gws-mcp/launcher.js")]}
        self.assertFalse(audit.inspect_document(doc, TOOLS, True)["checks"]["selectedProviderApprovalsExplicit"])

    def test_extension_inventory_counts_without_emitting_config_identifiers(self):
        doc = config()
        doc["apps"] = {"_default": {"default_tools_approval_mode": "prompt"},
                       "SECRET_APP_NAME": {"tools": {"SECRET_TOOL_NAME": {"approval_mode": "approve"}}}}
        doc["plugins"] = {"SECRET_PLUGIN_NAME": {"mcp_servers": {"SECRET_SERVER_NAME": {
            "default_tools_approval_mode": "auto", "tools": {"other": {"approval_mode": "prompt"}}}}}}
        result = audit.inspect_document(doc, TOOLS, True)
        inventory = result["extensionPolicyInventory"]
        self.assertEqual(inventory["configuredAppCount"], 1)
        self.assertEqual(inventory["configuredPluginCount"], 1)
        self.assertEqual(inventory["explicitNonPromptPolicyCount"], 2)
        self.assertFalse(inventory["effectivePermissionsVerified"])
        self.assertNotIn("SECRET_", json.dumps(result))

    def test_installed_plugins_do_not_imply_effective_policy_verification(self):
        doc = config()
        doc["plugins"] = {"installed": {"enabled": True}}
        inventory = audit.inspect_document(doc, TOOLS, True)["extensionPolicyInventory"]
        self.assertEqual(inventory["status"], "REVIEW_REQUIRED")
        self.assertEqual(inventory["pluginServerOverrideCount"], 0)
        self.assertFalse(inventory["managedPolicyRead"])
        self.assertFalse(inventory["manifestsExecuted"])

    def test_malformed_extension_inventory_fails_without_echoing_values(self):
        for change in ({"apps": []}, {"plugins": {"bad": "SECRET_SENTINEL"}},
                       {"apps": {"one": {"tools": []}}},
                       {"plugins": {"one": {"mcp_servers": {"two": {"tools": []}}}}}):
            with self.assertRaisesRegex(ValueError, "^CONFIG_STRUCTURE$"):
                audit.inspect_document({**config(), **change}, TOOLS, True)

    def test_inherited_prompt_and_disabled_overrides_are_not_auto_approvals(self):
        doc = config()
        doc["mcp_servers"]["hostinger"] = {
            "default_tools_approval_mode": "prompt", "tools": {
                "read": {}, "execute": {"enabled": False, "approval_mode": "approve"},
                "change": {"approval_mode": "prompt"},
            },
        }
        result = audit.inspect_document(doc, TOOLS, True)
        self.assertTrue(result["checks"]["selectedProviderApprovalsExplicit"])
        self.assertEqual(result["providerApprovalReview"]["enabledServerCount"], 1)
        self.assertFalse(result["providerApprovalReview"]["loadedIntoSessionVerified"])

    def test_disabled_provider_is_counted_but_not_claimed_enabled(self):
        doc = config()
        doc["mcp_servers"]["hostinger"] = {"enabled": False, "default_tools_approval_mode": "approve"}
        result = audit.inspect_document(doc, TOOLS, True)
        self.assertTrue(result["checks"]["selectedProviderApprovalsExplicit"])
        self.assertEqual(result["providerApprovalReview"]["enabledServerCount"], 0)
        self.assertEqual(result["providerApprovalReview"]["disabledServerCount"], 1)

    def test_provider_structural_errors_fail_closed(self):
        for change in ({"enabled": "false"}, {"env": "SECRET_SENTINEL"}, {"env": {"TOKEN": 1}},
                       {"tools": []}, {"tools": {"execute": "SECRET_SENTINEL"}},
                       {"tools": {"execute": {"enabled": "false"}}}):
            doc = config()
            doc["mcp_servers"]["hostinger"] = {"default_tools_approval_mode": "prompt", **change}
            with self.assertRaisesRegex(ValueError, "^CONFIG_STRUCTURE$"):
                audit.inspect_document(doc, TOOLS, True)

    def test_unreviewed_connectors_and_empty_secret_inventory_do_not_imply_certification(self):
        doc = config()
        doc["mcp_servers"]["unreviewed-provider"] = {"default_tools_approval_mode": "approve"}
        result = audit.inspect_document(doc, TOOLS, True)
        self.assertFalse(result["otherConnectorPermissionsVerified"])
        self.assertEqual(result["providerApprovalReview"]["selectedServerCount"], 0)
        self.assertEqual(result["secretStorageReview"]["status"], "NOT_VERIFIED")
        self.assertFalse(result["secretStorageReview"]["externalSecretStoreVerified"])

    def test_writable_parent_is_blocked_without_automatic_permission_changes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            file = root / "config.toml"
            write_config(file)
            root.chmod(0o775)
            result = audit.audit_config(file, TOOLS)
            self.assertEqual(result["status"], "BLOCKED")
            self.assertFalse(result["checks"]["immediateParentNotSharedWritable"])
            self.assertEqual(root.stat().st_mode & 0o777, 0o775)
            root.chmod(0o700)
            self.assertEqual(audit.audit_config(file, TOOLS)["status"], "PASS")

    def test_backup_permissions_are_checked_without_reading_or_emitting_contents(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "config.toml"
            write_config(file)
            backup = Path(directory) / "config.toml.SECRET_SENTINEL.bak"
            backup.write_text("invalid TOML and SECRET_CONTENT")
            backup.chmod(0o664)
            original = audit.read_config
            with patch.object(audit, "read_config", wraps=original) as read:
                result = audit.audit_config(file, TOOLS)
                read.assert_called_once_with(file)
            self.assertEqual(result["status"], "BLOCKED")
            self.assertEqual(result["storageMetadata"]["unsafeConfigBackupCandidates"], 1)
            self.assertFalse(result["storageMetadata"]["backupContentsRead"])
            self.assertNotIn("SECRET_SENTINEL", json.dumps(result))
            self.assertNotIn("SECRET_CONTENT", json.dumps(result))
            self.assertEqual(backup.stat().st_mode & 0o777, 0o664)
            backup.chmod(0o600)
            self.assertEqual(audit.audit_config(file, TOOLS)["status"], "PASS")

    def test_backup_symlinks_and_special_files_are_rejected_without_following(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            file = root / "config.toml"
            write_config(file)
            (root / "config.toml.link").symlink_to(root / "missing")
            os.mkfifo(root / "config.toml.fifo", 0o600)
            (root / "config.toml.directory").mkdir()
            result = audit.audit_config(file, TOOLS)
            self.assertEqual(result["status"], "BLOCKED")
            self.assertEqual(result["storageMetadata"]["unsafeConfigBackupCandidates"], 3)

    def test_parent_symlink_is_not_accepted_as_a_storage_boundary(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            actual = root / "actual"
            actual.mkdir()
            link = root / "linked"
            link.symlink_to(actual, target_is_directory=True)
            write_config(actual / "config.toml")
            self.assertEqual(audit.audit_config(link / "config.toml", TOOLS)["status"], "BLOCKED")

    def test_bounded_directory_scan_does_not_report_incomplete_checks_as_passed(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "config.toml"
            write_config(file)
            with patch.object(audit, "MAX_DIRECTORY_ENTRIES", 0):
                result = audit.audit_config(file, TOOLS)
            self.assertEqual(result["status"], "BLOCKED")
            self.assertFalse(result["checks"]["configBackupMetadataScanComplete"])

    def test_other_owner_fails_file_parent_and_backup_checks(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "config.toml"
            write_config(file)
            write_config(Path(directory) / "config.toml.bak")
            with patch.object(audit.os, "getuid", return_value=os.getuid() + 100):
                result = audit.audit_config(file, TOOLS)
            self.assertEqual(result["status"], "BLOCKED")
            for key in ("ownerOnlyFileAccess", "immediateParentOwnedByCurrentUser", "configBackupsOwnerOnly"):
                self.assertFalse(result["checks"][key])

    def test_cli_blocks_unsafe_provider_and_never_echoes_credentials(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            codex = home / ".codex"
            codex.mkdir()
            file = codex / "config.toml"
            extra = ('[mcp_servers.hostinger]\ndefault_tools_approval_mode = "approve"\n'
                     '[mcp_servers.hostinger.env]\nHOSTINGER_API_TOKEN = "SECRET_SENTINEL"\n')
            write_config(file, extra)
            run = subprocess.run([sys.executable, "-B", str(SPEC.origin)],
                                 env={"HOME": str(home), "CODEX_HOME": str(codex), "PATH": os.defpath},
                                 capture_output=True, text=True, timeout=5)
            self.assertEqual(run.returncode, 2)
            self.assertNotIn("SECRET_SENTINEL", run.stdout + run.stderr)
            report = json.loads(run.stdout)
            self.assertFalse(report["configs"][0]["checks"]["selectedProviderApprovalsExplicit"])
            self.assertFalse(report["credentialsExported"])
            self.assertFalse(report["configurationChanged"])

    def test_alternate_config_does_not_get_a_new_connector_implicitly(self):
        doc = config()
        doc["mcp_servers"] = {}
        self.assertTrue(audit.inspect_document(doc, TOOLS, False)["checks"]["bridgeAligned"])
        self.assertFalse(audit.inspect_document(doc, TOOLS, True)["checks"]["bridgeAligned"])

    def test_bounded_read_rejects_large_files_symlinks_and_fifos(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / "private.toml"
            target.write_text("x" * (audit.MAX_BYTES + 1))
            link = root / "link.toml"
            link.symlink_to(target)
            fifo = root / "pipe.toml"
            os.mkfifo(fifo)
            for file in (target, link, fifo):
                result = audit.audit_config(file, TOOLS, True)
                self.assertEqual(result["status"], "BLOCKED")
                self.assertEqual(result["error"], "CONFIG_UNAVAILABLE_OR_INVALID")

    def test_invalid_toml_and_missing_parser_do_not_leak_contents(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "config.toml"
            file.write_text('secret = "SECRET_SENTINEL\n')
            self.assertNotIn("SECRET_SENTINEL", json.dumps(audit.audit_config(file, TOOLS, True)))
            with patch.object(audit, "tomllib", None):
                self.assertEqual(audit.audit_config(file, TOOLS, True)["error"], "TOML_PARSER_UNAVAILABLE")

    def test_concurrent_in_place_config_update_cannot_pass_a_stale_read(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "config.toml"
            write_config(file)
            original = audit.tomllib.loads

            def changed(text):
                result = original(text)
                file.write_text('secret = "SECRET_SENTINEL"\n')
                return result

            with patch.object(audit.tomllib, "loads", side_effect=changed):
                result = audit.audit_config(file, TOOLS)
            self.assertEqual(result["status"], "BLOCKED")
            self.assertNotIn("SECRET_SENTINEL", json.dumps(result))

    def test_concurrent_atomic_replacement_cannot_pass_a_stale_read(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "config.toml"
            text = write_config(file)
            replacement = Path(directory) / "replacement.toml"
            replacement.write_text(text)
            replacement.chmod(0o600)
            original = audit.tomllib.loads

            def replaced(raw):
                result = original(raw)
                replacement.replace(file)
                return result

            with patch.object(audit.tomllib, "loads", side_effect=replaced):
                self.assertEqual(audit.audit_config(file, TOOLS)["status"], "BLOCKED")

    def test_permissions_checked_without_mutating_config(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "config.toml"
            text = '[projects.' + json.dumps(str(audit.ROOT)) + ']\ntrust_level = "trusted"\n'
            file.write_text(text)
            file.chmod(0o644)
            self.assertFalse(audit.audit_config(file, TOOLS)["checks"]["ownerOnlyFileAccess"])
            file.chmod(0o600)
            self.assertEqual(audit.audit_config(file, TOOLS)["status"], "PASS")
            self.assertEqual(file.read_text(), text)

    def test_missing_active_config_blocks_and_optional_alternate_is_explicit(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "missing.toml"
            self.assertEqual(audit.audit_config(file, TOOLS, True)["status"], "BLOCKED")
            self.assertEqual(audit.audit_config(file, TOOLS, False)["status"], "NOT_PRESENT")


if __name__ == "__main__":
    unittest.main()
