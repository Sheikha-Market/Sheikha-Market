#!/usr/bin/env python3
"""Synthetic credential handoff only. No provider calls or production secrets."""
import hmac
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import uuid

from sheikha_service_credentials import read_credential

SYNTHETIC = b"SHEIKHA_SYNTHETIC_CREDENTIAL_V1"
DESKTOP_ENV = ("DBUS_SESSION_BUS_ADDRESS", "DISPLAY", "WAYLAND_DISPLAY",
               "SSH_AUTH_SOCK", "GPG_TTY", "GNOME_KEYRING_CONTROL")
ROOT = Path(__file__).resolve().parents[2]


def self_test():
    report = {
        "status": "BLOCKED", "scope": "SYNTHETIC_SERVICE_CREDENTIAL_HANDOFF",
        "checks": {"desktopEnvironmentAbsent": all(not os.environ.get(name) for name in DESKTOP_ENV)},
        "productionCredentialsRead": False, "externalCalls": False,
        "durableServiceInstalled": False, "desktopLogoutTested": False, "rebootTested": False,
    }
    try:
        report["checks"]["syntheticCredentialMatches"] = hmac.compare_digest(
            read_credential("sheikha_probe"), SYNTHETIC)
        if all(report["checks"].values()):
            report["status"] = "PASS"
    except Exception:
        report["error"] = "SYNTHETIC_CREDENTIAL_UNAVAILABLE"
    return report


def systemd_test():
    unit = "sheikha-headless-probe-" + uuid.uuid4().hex + ".service"
    with tempfile.TemporaryDirectory(prefix="sheikha-credential-probe-") as directory:
        source = Path(directory) / "synthetic"
        fd = os.open(source, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "wb") as stream:
            stream.write(SYNTHETIC)
        command = [
            "/usr/bin/systemd-run", "--user", "--wait", "--collect", "--pipe", "--quiet", "--unit=" + unit,
            "--property=Type=oneshot", "--property=LoadCredential=sheikha_probe:" + str(source),
            "--property=UnsetEnvironment=" + " ".join(DESKTOP_ENV),
            "--property=NoNewPrivileges=yes", "--property=RestrictAddressFamilies=AF_UNIX",
            "--property=UMask=0077", "--property=TimeoutStartSec=8",
            "--", "/usr/bin/python3", "-B", str(Path(__file__).resolve()), "--self-test",
        ]
        try:
            child = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=15)
            if child.returncode != 0:
                return {"status": "BLOCKED", "error": "SYSTEMD_CREDENTIAL_PROBE_FAILED",
                        "productionCredentialsRead": False, "durableServiceInstalled": False}
            report = json.loads(child.stdout)
            if report.get("status") != "PASS" or report.get("scope") != "SYNTHETIC_SERVICE_CREDENTIAL_HANDOFF":
                raise ValueError("PROBE_RESPONSE")
            return {**report, "transientSystemdServiceTested": True}
        except subprocess.TimeoutExpired:
            try:
                subprocess.run(["/usr/bin/systemctl", "--user", "stop", unit],
                               capture_output=True, timeout=5)
            except Exception:
                pass
            return {"status": "BLOCKED", "error": "SYSTEMD_CREDENTIAL_PROBE_TIMED_OUT",
                    "productionCredentialsRead": False, "durableServiceInstalled": False}
        except Exception:
            return {"status": "BLOCKED", "error": "SYSTEMD_CREDENTIAL_PROBE_UNAVAILABLE",
                    "productionCredentialsRead": False, "durableServiceInstalled": False}


def main():
    if sys.argv[1:] == ["--self-test"]:
        report = self_test()
    elif sys.argv[1:] == ["--systemd"]:
        report = systemd_test()
    else:
        report = {"status": "BLOCKED", "error": "ARGUMENTS_NOT_SUPPORTED"}
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "PASS" else 2


if __name__ == "__main__":
    sys.exit(main())
