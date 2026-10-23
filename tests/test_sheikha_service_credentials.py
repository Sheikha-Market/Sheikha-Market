import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

TOOLS = Path(__file__).resolve().parents[1] / "tools/environment"


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, TOOLS / filename)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


credentials = load("sheikha_service_credentials", "sheikha_service_credentials.py")
headless = load("headless_check", "sheikha-headless-credential-check.py")
desktop = load("secret_store_check", "sheikha-secret-store-check.py")


class FakeConnection:
    def __init__(self, replies):
        self.replies, self.requests, self.closed = iter(replies), [], False

    def send_and_get_reply(self, request, **kwargs):
        self.requests.append((request, kwargs))
        reply = next(self.replies)
        if isinstance(reply, Exception):
            raise reply
        return reply

    def close(self):
        self.closed = True


class DesktopMetadataTests(unittest.TestCase):
    def probe(self, replies):
        connection = FakeConnection(replies)
        result = desktop.probe(lambda: connection, {"DBUS_SESSION_BUS_ADDRESS": "unix:path=/not-used"})
        return result, connection

    def test_readiness_calls_only_owner_and_locked_metadata(self):
        from jeepney.low_level import HeaderFields
        result, connection = self.probe([(True,), (("b", False),)])
        self.assertEqual(result["status"], "READY_FOR_MIGRATION_REVIEW")
        self.assertEqual([r.header.fields[HeaderFields.member] for r, _ in connection.requests], ["NameHasOwner", "Get"])
        self.assertEqual(connection.requests[1][0].body, ("org.freedesktop.Secret.Collection", "Locked"))
        self.assertTrue(all(k == {"timeout": 2, "unwrap": True} for _, k in connection.requests))
        self.assertTrue(connection.closed)
        for key in ("secretsRead", "itemsEnumerated", "itemsCreated", "unlockRequested",
                    "providerLaunched", "headlessSupportVerified", "migrationPerformed"):
            self.assertFalse(result[key])

    def test_stopped_service_is_not_started(self):
        result, connection = self.probe([(False,)])
        self.assertEqual(result["error"], "SECRET_SERVICE_NOT_RUNNING")
        self.assertEqual(len(connection.requests), 1)
        self.assertTrue(connection.closed)

    def test_locked_collection_is_not_unlocked(self):
        result, connection = self.probe([(True,), (("b", True),)])
        self.assertEqual(result["error"], "DEFAULT_COLLECTION_LOCKED")
        self.assertEqual(len(connection.requests), 2)
        self.assertFalse(result["unlockRequested"])

    def test_missing_or_remote_bus_never_connects(self):
        for address in ("", "tcp:host=example.invalid", "autolaunch:", "unix:path=/one;tcp:host=two"):
            with self.subTest(address=address):
                result = desktop.probe(lambda: self.fail("must not connect"),
                                       {"DBUS_SESSION_BUS_ADDRESS": address})
                self.assertEqual(result["status"], "BLOCKED")
                if address:
                    self.assertNotIn(address, json.dumps(result))

    def test_invalid_reply_and_backend_errors_are_redacted(self):
        for replies in ([(1,)], [(True,), (("s", "SECRET_SENTINEL"),)],
                        [RuntimeError("SECRET_SENTINEL")], [(True,), RuntimeError("SECRET_SENTINEL")]):
            result, connection = self.probe(replies)
            self.assertEqual(result["status"], "BLOCKED")
            self.assertNotIn("SECRET_SENTINEL", json.dumps(result))
            self.assertTrue(connection.closed)

    def test_timeouts_close_connection(self):
        result, connection = self.probe([TimeoutError("SECRET_SENTINEL")])
        self.assertEqual(result["error"], "SECRET_STORE_CHECK_TIMED_OUT")
        self.assertTrue(connection.closed)

    def test_unavailable_local_library_does_not_install_anything(self):
        with patch.dict(sys.modules, {"jeepney": None}):
            result = desktop.probe(environ={"DBUS_SESSION_BUS_ADDRESS": "unix:path=/not-used"})
        self.assertEqual(result["error"], "LOCAL_DBUS_LIBRARY_UNAVAILABLE")

    def test_cli_rejects_arguments_without_echoing_them(self):
        result = subprocess.run([sys.executable, "-B", str(TOOLS / "sheikha-secret-store-check.py"),
                                 "SECRET_SENTINEL"], capture_output=True, text=True, timeout=5)
        self.assertEqual(result.returncode, 2)
        self.assertNotIn("SECRET_SENTINEL", result.stdout + result.stderr)


class ServiceCredentialTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.file = self.root / "sheikha_probe"
        self.file.write_bytes(headless.SYNTHETIC)
        self.file.chmod(0o600)

    def read(self):
        return credentials.read_credential("sheikha_probe", str(self.root))

    def test_reads_private_credential_without_desktop_or_secret_environment(self):
        with patch.dict(os.environ, {"CREDENTIALS_DIRECTORY": str(self.root)}, clear=True):
            self.assertEqual(credentials.read_credential("sheikha_probe"), headless.SYNTHETIC)

    def test_missing_directory_does_not_fall_back_to_inline_token(self):
        with patch.dict(os.environ, {"HOSTINGER_API_TOKEN": "SECRET_SENTINEL"}, clear=True):
            with self.assertRaisesRegex(credentials.CredentialUnavailable, "^CREDENTIAL_DIRECTORY_REQUIRED$"):
                credentials.read_credential("hostinger_api_token")

    def test_unknown_ids_and_path_traversal_are_rejected(self):
        for name in ("../hostinger_api_token", "/etc/passwd", "auth.json", None, [], True):
            with self.assertRaisesRegex(credentials.CredentialUnavailable, "^CREDENTIAL_NOT_ADMITTED$"):
                credentials.read_credential(name, str(self.root))

    def test_shared_parent_and_shared_file_are_rejected(self):
        self.root.chmod(0o750)
        with self.assertRaises(credentials.CredentialUnavailable):
            self.read()
        self.root.chmod(0o700)
        for mode in (0o640, 0o644, 0o660):
            self.file.chmod(mode)
            with self.assertRaises(credentials.CredentialUnavailable):
                self.read()

    def test_symlinks_fifo_and_hardlinks_are_rejected(self):
        self.file.unlink()
        target = self.root / "target"
        target.write_bytes(b"SECRET_SENTINEL")
        target.chmod(0o600)
        self.file.symlink_to(target)
        with self.assertRaises(credentials.CredentialUnavailable):
            self.read()
        self.file.unlink()
        os.mkfifo(self.file, 0o600)
        with self.assertRaises(credentials.CredentialUnavailable):
            self.read()
        self.file.unlink()
        os.link(target, self.file)
        with self.assertRaises(credentials.CredentialUnavailable):
            self.read()

    def test_symlinked_directory_and_relative_directory_are_rejected(self):
        link = self.root / "link"
        link.symlink_to(self.root, target_is_directory=True)
        for directory in (str(link), ".", ""):
            with self.assertRaises(credentials.CredentialUnavailable):
                credentials.read_credential("sheikha_probe", directory)

    def test_empty_oversized_and_missing_files_are_rejected(self):
        for content in (b"", b"x" * (credentials.MAX_BYTES + 1)):
            self.file.write_bytes(content)
            with self.assertRaises(credentials.CredentialUnavailable):
                self.read()
        self.file.unlink()
        with self.assertRaisesRegex(credentials.CredentialUnavailable, "^CREDENTIAL_UNAVAILABLE$"):
            self.read()

    def test_changed_credential_cannot_be_returned(self):
        original = credentials.os.read

        def changed(fd, size):
            value = original(fd, size)
            self.file.write_bytes(b"CHANGED")
            return value

        with patch.object(credentials.os, "read", side_effect=changed):
            with self.assertRaisesRegex(credentials.CredentialUnavailable, "^CREDENTIAL_CHANGED_OR_OVERSIZED$"):
                self.read()

    def test_self_test_reads_only_synthetic_id_and_does_not_claim_real_deployment(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(
                headless, "read_credential", return_value=headless.SYNTHETIC) as read:
            report = headless.self_test()
            read.assert_called_once_with("sheikha_probe")
        self.assertEqual(report["status"], "PASS")
        for key in ("productionCredentialsRead", "externalCalls", "durableServiceInstalled", "rebootTested"):
            self.assertFalse(report[key])

    def test_desktop_dependency_or_wrong_credential_fails_without_leaking(self):
        with patch.dict(os.environ, {"DISPLAY": ":1"}, clear=True), patch.object(
                headless, "read_credential", return_value=b"SECRET_SENTINEL"):
            report = headless.self_test()
        self.assertEqual(report["status"], "BLOCKED")
        self.assertNotIn("SECRET_SENTINEL", json.dumps(report))

    def test_real_child_self_test_runs_with_no_desktop_environment(self):
        run = subprocess.run([sys.executable, "-B", str(TOOLS / "sheikha-headless-credential-check.py"), "--self-test"],
                             env={"CREDENTIALS_DIRECTORY": str(self.root)}, capture_output=True, text=True, timeout=5)
        self.assertEqual(run.returncode, 0, run.stderr)
        self.assertEqual(json.loads(run.stdout)["status"], "PASS")
        self.assertNotIn(headless.SYNTHETIC.decode(), run.stdout + run.stderr)

    def test_systemd_runner_uses_only_a_synthetic_private_file_and_fixed_command(self):
        def run(command, **kwargs):
            self.assertEqual(command[0], "/usr/bin/systemd-run")
            self.assertIn("--property=RestrictAddressFamilies=AF_UNIX", command)
            credential = next(arg for arg in command if arg.startswith("--property=LoadCredential="))
            source = Path(credential.split(":", 1)[1])
            self.assertEqual(source.read_bytes(), headless.SYNTHETIC)
            self.assertEqual(source.stat().st_mode & 0o777, 0o600)
            self.assertEqual(command[-1], "--self-test")
            self.assertTrue(kwargs["capture_output"])
            return subprocess.CompletedProcess(command, 0, json.dumps({
                "status": "PASS", "scope": "SYNTHETIC_SERVICE_CREDENTIAL_HANDOFF"}), "")

        with patch.object(headless.subprocess, "run", side_effect=run):
            self.assertTrue(headless.systemd_test()["transientSystemdServiceTested"])

    def test_systemd_failure_does_not_echo_service_output(self):
        with patch.object(headless.subprocess, "run", return_value=subprocess.CompletedProcess(
                [], 1, "SECRET_SENTINEL", "SECRET_SENTINEL")):
            report = headless.systemd_test()
        self.assertEqual(report["status"], "BLOCKED")
        self.assertNotIn("SECRET_SENTINEL", json.dumps(report))

    def test_timeout_stops_only_the_generated_probe_unit(self):
        seen = []

        def run(command, **kwargs):
            seen.append(command)
            if command[0] == "/usr/bin/systemd-run":
                raise subprocess.TimeoutExpired(command, 15, stderr="SECRET_SENTINEL")
            return subprocess.CompletedProcess(command, 0, "", "")

        with patch.object(headless.subprocess, "run", side_effect=run):
            report = headless.systemd_test()
        unit = next(arg.removeprefix("--unit=") for arg in seen[0] if arg.startswith("--unit="))
        self.assertEqual(seen[1], ["/usr/bin/systemctl", "--user", "stop", unit])
        self.assertNotIn("SECRET_SENTINEL", json.dumps(report))

    def test_scheduled_audit_is_read_only_and_has_no_provider_or_credentials(self):
        import configparser
        service = configparser.ConfigParser(interpolation=None)
        service.read(TOOLS / "systemd/sheikha-assistant-governance-audit.service")
        command = service["Service"]["ExecStart"]
        self.assertEqual(command.split()[1:], ["tools/environment/sheikha-assistant-governance-check.cjs", "--hosts"])
        self.assertNotIn("LoadCredential", service["Service"])
        self.assertEqual(service["Service"]["RestrictAddressFamilies"], "AF_UNIX")
        self.assertEqual(service["Service"]["NoNewPrivileges"], "yes")
        self.assertEqual(service["Service"]["TimeoutStartSec"], "20")
        timer = configparser.ConfigParser(interpolation=None)
        timer.read(TOOLS / "systemd/sheikha-assistant-governance-audit.timer")
        self.assertEqual(timer["Timer"]["OnUnitActiveSec"], "15min")
        self.assertEqual(timer["Timer"]["Unit"], "sheikha-assistant-governance-audit.service")


if __name__ == "__main__":
    unittest.main()
