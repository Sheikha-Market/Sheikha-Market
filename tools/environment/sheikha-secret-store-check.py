#!/usr/bin/env python3
"""Inspect desktop Secret Service metadata only; never unlock or read secrets."""
import json
import os
import signal
import sys
from datetime import datetime, timezone

SERVICE = "org.freedesktop.secrets"
COLLECTION = "/org/freedesktop/secrets/aliases/default"


def probe(connection_factory=None, environ=None):
    result = {
        "status": "BLOCKED",
        "scope": "CURRENT_DESKTOP_SESSION_METADATA_ONLY",
        "checks": {"serviceRunning": None, "defaultCollectionUnlocked": None},
        "secretsRead": False, "itemsEnumerated": False, "itemsCreated": False,
        "unlockRequested": False, "providerLaunched": False, "migrationPerformed": False,
        "persistentStorageVerified": False, "headlessSupportVerified": False,
        "profileIsolationVerified": False,
    }
    env = os.environ if environ is None else environ
    address = env.get("DBUS_SESSION_BUS_ADDRESS", "")
    if not isinstance(address, str) or not address:
        return {**result, "error": "DESKTOP_SESSION_BUS_NOT_CONFIGURED"}
    if ";" in address or not address.startswith(("unix:path=", "unix:abstract=")):
        return {**result, "error": "NONLOCAL_OR_UNSUPPORTED_SESSION_BUS"}
    connection = None
    try:
        from jeepney import DBusAddress, new_method_call
        from jeepney.bus_messages import message_bus
        from jeepney.io.blocking import open_dbus_connection

        connection = (connection_factory or open_dbus_connection)()
        owner = connection.send_and_get_reply(message_bus.NameHasOwner(SERVICE), timeout=2, unwrap=True)
        if not isinstance(owner, tuple) or len(owner) != 1 or type(owner[0]) is not bool:
            raise ValueError("METADATA_SHAPE")
        result["checks"]["serviceRunning"] = owner[0]
        if not owner[0]:
            return {**result, "error": "SECRET_SERVICE_NOT_RUNNING"}
        # Only ask for Locked. Do not use helpers that create a default collection.
        request = new_method_call(
            DBusAddress(COLLECTION, bus_name=SERVICE, interface="org.freedesktop.DBus.Properties"),
            "Get", "ss", ("org.freedesktop.Secret.Collection", "Locked"))
        state = connection.send_and_get_reply(request, timeout=2, unwrap=True)
        if (not isinstance(state, tuple) or len(state) != 1 or not isinstance(state[0], tuple)
                or len(state[0]) != 2 or state[0][0] != "b" or type(state[0][1]) is not bool):
            raise ValueError("METADATA_SHAPE")
        result["checks"]["defaultCollectionUnlocked"] = not state[0][1]
        if state[0][1]:
            return {**result, "error": "DEFAULT_COLLECTION_LOCKED"}
        return {**result, "status": "READY_FOR_MIGRATION_REVIEW"}
    except ImportError:
        return {**result, "error": "LOCAL_DBUS_LIBRARY_UNAVAILABLE"}
    except TimeoutError:
        return {**result, "error": "SECRET_STORE_CHECK_TIMED_OUT"}
    except Exception:
        return {**result, "error": "SECRET_STORE_METADATA_UNAVAILABLE"}
    finally:
        if connection is not None:
            try:
                connection.close()
            except Exception:
                pass


def timed_out(_signum, _frame):
    raise TimeoutError("CHECK_DEADLINE")


def main():
    if len(sys.argv) != 1:
        print(json.dumps({"status": "BLOCKED", "error": "ARGUMENTS_NOT_SUPPORTED"}))
        return 2
    previous = signal.signal(signal.SIGALRM, timed_out)
    signal.alarm(5)
    try:
        report = probe()
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, previous)
    report["observedAt"] = datetime.now(timezone.utc).isoformat()
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "READY_FOR_MIGRATION_REVIEW" else 2


if __name__ == "__main__":
    sys.exit(main())
