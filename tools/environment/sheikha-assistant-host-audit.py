#!/usr/bin/env python3
"""Read-only, bounded TOML inspection. Never emit config contents or credentials."""
import json
import os
from pathlib import Path
import re
import stat
import sys

try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib
    except ImportError:
        try:
            from pip._vendor import tomli as tomllib
        except ImportError:
            tomllib = None

ROOT = Path(__file__).resolve().parents[2]
ADAPTER = ROOT / "mcp-servers/sheikha-mcp-readonly-federation.cjs"
MAX_BYTES = 1024 * 1024
MAX_DIRECTORY_ENTRIES = 4096
SENSITIVE_ENV_NAME = re.compile(r"token|secret|password|api.?key", re.I)


def read_config(file):
    fd = os.open(file, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    with os.fdopen(fd, "rb") as stream:
        info = os.fstat(stream.fileno())
        if not stat.S_ISREG(info.st_mode) or info.st_size > MAX_BYTES:
            raise ValueError("CONFIG_BOUND")
        raw = stream.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise ValueError("CONFIG_BOUND")
        doc = tomllib.loads(raw.decode("utf-8"))
        identity = lambda item: (item.st_dev, item.st_ino, item.st_size, item.st_mtime_ns, item.st_ctime_ns)
        # A competing app may rewrite or replace the config while it is inspected.
        if (identity(info) != identity(os.fstat(stream.fileno()))
                or identity(info) != identity(os.stat(file, follow_symlinks=False))):
            raise ValueError("CONFIG_CHANGED_DURING_READ")
        return doc, info


def bridge_aligned(server, expected_tools):
    if not isinstance(server, dict):
        return False
    allowed = {"command", "args", "cwd", "enabled", "default_tools_approval_mode",
               "startup_timeout_sec", "tool_timeout_sec", "enabled_tools"}
    tools = server.get("enabled_tools")
    return (set(server) <= allowed and server.get("command") == "node"
            and server.get("args") == [str(ADAPTER)] and server.get("cwd") == str(ROOT)
            and server.get("enabled") is True
            and server.get("default_tools_approval_mode") == "prompt"
            and isinstance(tools, list) and all(isinstance(item, str) for item in tools)
            and len(tools) == len(set(tools)) and set(tools) == set(expected_tools)
            and type(server.get("startup_timeout_sec")) is int
            and 0 < server["startup_timeout_sec"] <= 15
            and type(server.get("tool_timeout_sec")) is int
            and 0 < server["tool_timeout_sec"] <= 15)


def inspect_provider_approvals(servers):
    selected = enabled = missing_prompt = unsafe_overrides = 0
    families = {"hostinger": 0, "googleWorkspace": 0}
    for name, server in servers.items():
        env = server.get("env", {})
        if not isinstance(env, dict) or any(not isinstance(value, str) for value in env.values()):
            raise ValueError("CONFIG_STRUCTURE")
        hostinger = name == "hostinger" or name.startswith("hostinger-") or "HOSTINGER_API_TOKEN" in env
        args = server.get("args", [])
        google = name == "google_workspace" or (
            isinstance(args, list) and str(Path.home() / ".gws-mcp/launcher.js") in args)
        if not (hostinger or google):
            continue
        families["hostinger"] += hostinger
        families["googleWorkspace"] += google
        selected += 1
        if type(server.get("enabled", True)) is not bool:
            raise ValueError("CONFIG_STRUCTURE")
        overrides = server.get("tools", {})
        if not isinstance(overrides, dict) or any(not isinstance(value, dict) for value in overrides.values()):
            raise ValueError("CONFIG_STRUCTURE")
        if server.get("enabled", True) is False:
            continue
        enabled += 1
        default = server.get("default_tools_approval_mode")
        missing_prompt += default != "prompt"
        for tool in overrides.values():
            if type(tool.get("enabled", True)) is not bool:
                raise ValueError("CONFIG_STRUCTURE")
            if tool.get("enabled", True):
                unsafe_overrides += tool.get("approval_mode", default) != "prompt"
    return {
        "scope": "HOSTINGER_AND_GOOGLE_WORKSPACE_LOCAL_BINDINGS_ONLY",
        "selectedFamilies": families,
        "selectedServerCount": selected, "enabledServerCount": enabled,
        "disabledServerCount": selected - enabled,
        "serversWithoutPromptDefault": missing_prompt,
        "toolsWithoutPromptApproval": unsafe_overrides,
        "explicitPromptPolicySatisfied": missing_prompt == 0 and unsafe_overrides == 0,
        "loadedIntoSessionVerified": False,
    }


def inspect_extensions(doc):
    apps, plugins = doc.get("apps", {}), doc.get("plugins", {})
    non_prompt = app_tools = plugin_servers = plugin_tools = 0

    def table(value):
        if not isinstance(value, dict) or any(not isinstance(item, dict) for item in value.values()):
            raise ValueError("CONFIG_STRUCTURE")
        return value

    def policy_count(value):
        return int("default_tools_approval_mode" in value and value["default_tools_approval_mode"] != "prompt")

    for app in table(apps).values():
        non_prompt += policy_count(app)
        for tool in table(app.get("tools", {})).values():
            app_tools += 1
            non_prompt += "approval_mode" in tool and tool["approval_mode"] != "prompt"
    for plugin in table(plugins).values():
        for server in table(plugin.get("mcp_servers", {})).values():
            plugin_servers += 1
            non_prompt += policy_count(server)
            for tool in table(server.get("tools", {})).values():
                plugin_tools += 1
                non_prompt += "approval_mode" in tool and tool["approval_mode"] != "prompt"
    return {
        "status": "REVIEW_REQUIRED" if apps or plugins else "NOT_VERIFIED",
        "scope": "LOCAL_APP_AND_PLUGIN_OVERRIDE_INVENTORY_NOT_EFFECTIVE_PERMISSIONS",
        "configuredAppCount": len(apps) - int("_default" in apps),
        "configuredPluginCount": len(plugins),
        "explicitAppPromptDefault": apps.get("_default", {}).get("default_tools_approval_mode") == "prompt",
        "appToolOverrideCount": app_tools,
        "pluginServerOverrideCount": plugin_servers,
        "pluginToolOverrideCount": plugin_tools,
        "explicitNonPromptPolicyCount": non_prompt,
        "effectivePermissionsVerified": False, "managedPolicyRead": False,
        "manifestsExecuted": False,
    }


def inspect_storage(file):
    # Metadata only: backups may contain old credentials and are never opened.
    count = unsafe = 0
    complete = True
    fd = os.open(file.parent, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        parent = os.fstat(fd)
        with os.scandir(fd) as entries:
            for index, entry in enumerate(entries):
                if index >= MAX_DIRECTORY_ENTRIES:
                    complete = False
                    break
                if not entry.name.startswith(file.name + "."):
                    continue
                count += 1
                info = entry.stat(follow_symlinks=False)
                unsafe += not (stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid()
                               and stat.S_IMODE(info.st_mode) == 0o600)
    finally:
        os.close(fd)
    return {
        "checks": {
            "immediateParentOwnedByCurrentUser": parent.st_uid == os.getuid(),
            "immediateParentNotSharedWritable": not bool(stat.S_IMODE(parent.st_mode) & 0o022),
            "configBackupMetadataScanComplete": complete,
            "configBackupsOwnerOnly": unsafe == 0,
        },
        "scope": "IMMEDIATE_PARENT_AND_CONFIG_DOT_SUFFIXES_ONLY",
        "configBackupCandidates": count, "unsafeConfigBackupCandidates": unsafe,
        "backupContentsRead": False, "aclVerified": False, "ancestorDirectoriesVerified": False,
    }


def inspect_document(doc, expected_tools, require_bridge):
    projects, servers = doc.get("projects", {}), doc.get("mcp_servers", {})
    if not isinstance(projects, dict) or not isinstance(servers, dict):
        raise ValueError("CONFIG_STRUCTURE")
    if any(not isinstance(value, dict) for value in projects.values()):
        raise ValueError("CONFIG_STRUCTURE")
    if any(not isinstance(value, dict) for value in servers.values()):
        raise ValueError("CONFIG_STRUCTURE")
    # Compare normalized ancestors, including entries written with a trailing slash.
    parents = set(ROOT.parents)
    broad = sum(1 for name, value in projects.items()
                if Path(name).is_absolute() and Path(os.path.normpath(name)) in parents
                and value.get("trust_level") == "trusted")
    bridge = servers.get("sheikha-readonly")
    aliases = sum(1 for name, server in servers.items() if name != "sheikha-readonly"
                  and ("sheikha-mcp" in str(server.get("args", []))
                       or "sheikha-readonly" in name))
    approval_review = inspect_provider_approvals(servers)
    checks = {
        "noBroadAncestorTrust": broad == 0,
        "exactProjectTrusted": projects.get(str(ROOT), {}).get("trust_level") == "trusted",
        "bridgeAligned": bridge_aligned(bridge, expected_tools) if bridge is not None or require_bridge else True,
        "noDuplicateBridge": aliases == 0,
        "selectedProviderApprovalsExplicit": approval_review["explicitPromptPolicySatisfied"],
    }
    secret_values = 0
    placeholders = 0
    for server in servers.values():
        env = server.get("env", {})
        for key, value in env.items():
            if SENSITIVE_ENV_NAME.search(key) and value:
                secret_values += 1
                placeholders += re.fullmatch(r"\$\{[A-Za-z_][A-Za-z0-9_]*\}", value) is not None
    return {
        "checks": checks, "broadTrustEntries": broad,
        "bridgePresent": bridge is not None,
        "otherConnectorCount": len(servers) - int(bridge is not None),
        "inlineSensitiveEnvironmentValues": secret_values,
        "providerApprovalReview": approval_review,
        "extensionPolicyInventory": inspect_extensions(doc),
        "secretStorageReview": {
            "status": "REVIEW_REQUIRED" if secret_values else "NOT_VERIFIED",
            "scope": "NONEMPTY_ENV_VALUES_WITH_KNOWN_SENSITIVE_NAMES_ONLY",
            "unverifiedPlaceholderValues": placeholders,
            "credentialValidityVerified": False, "externalSecretStoreVerified": False,
            "migrationPerformed": False,
        },
        "otherConnectorPermissionsVerified": False,
    }


def audit_config(file, expected_tools, require_bridge=False):
    result = {"file": str(file), "scope": "LOCAL_TRUST_BRIDGE_SELECTED_APPROVALS_AND_STORAGE_METADATA"}
    if tomllib is None:
        return {**result, "status": "BLOCKED", "error": "TOML_PARSER_UNAVAILABLE"}
    try:
        doc, info = read_config(file)
        result.update(inspect_document(doc, expected_tools, require_bridge))
        result["storageMetadata"] = inspect_storage(file)
        result["checks"].update(result["storageMetadata"]["checks"])
        result["checks"]["ownerOnlyFileAccess"] = (stat.S_IMODE(info.st_mode) == 0o600 and info.st_uid == os.getuid())
        result["status"] = "PASS" if all(result["checks"].values()) else "BLOCKED"
    except FileNotFoundError:
        result.update(status="BLOCKED" if require_bridge else "NOT_PRESENT", error="CONFIG_NOT_PRESENT")
    except Exception:
        # Parser exceptions can include a line containing a credential.
        result.update(status="BLOCKED", error="CONFIG_UNAVAILABLE_OR_INVALID")
    return result


def main():
    if len(sys.argv) != 1:
        print(json.dumps({"status": "BLOCKED", "error": "ARGUMENTS_NOT_SUPPORTED"}))
        return 2
    try:
        expected = json.loads((ROOT / "mcp-servers/config/federation-allowlist.json").read_text())["tools"]
        if not isinstance(expected, dict) or not expected:
            raise ValueError("POLICY_UNAVAILABLE")
        active = Path(os.environ.get("CODEX_HOME", str(Path.home() / ".codex"))) / "config.toml"
        fallback = Path.home() / ".codex/config.toml"
        reports = [audit_config(active, expected, True)]
        if active.absolute() != fallback.absolute():
            reports.append(audit_config(fallback, expected))
        report = {
            "status": "PASS" if all(item["status"] in ("PASS", "NOT_PRESENT") for item in reports) else "BLOCKED",
            "scope": "SELECTED_LOCAL_CONFIG_CHECKS_NOT_ACCOUNT_CERTIFICATION",
            "configs": reports, "globalHostPermissionsVerified": False,
            "loadedIntoCurrentSession": "NOT_VERIFIED", "externalChatgptConnectionVerified": False,
            "credentialsExported": False, "configurationChanged": False,
            "remainingReview": ["OTHER_CONNECTORS_AND_MANAGED_POLICY", "SECRET_STORAGE_LIFECYCLE", "APP_RELOAD_AND_DISCOVERY"],
        }
    except Exception:
        report = {"status": "BLOCKED", "error": "HOST_AUDIT_UNAVAILABLE"}
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "PASS" else 2


if __name__ == "__main__":
    sys.exit(main())
