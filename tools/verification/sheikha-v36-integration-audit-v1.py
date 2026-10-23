#!/usr/bin/env python3
"""Read V36 integration claims and MCP registrations without activating them."""

import argparse
import ast
from datetime import datetime, timezone
import importlib.util
import json
from pathlib import Path


HELPER = Path(__file__).with_name("sheikha-v35-evidence-audit-v1.py")
SPEC = importlib.util.spec_from_file_location("sheikha_evidence_helpers", HELPER)
safe = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(safe)

VERSIONS = (
    ("36_3", "hostinger_token", "hostinger_api_token_scope"),
    ("36_4", "plugins_workspace", "plugins_and_workspace_scope"),
    ("36_5", "universal_app_pack", "universal_app_pack_scope"),
    ("36_6", "universal_mcp_sdk", "mcp_sdk_platforms_scope"),
    ("36_7", "auto_provisioning", "auto_provisioning_robotics_scope"),
    ("36_8", "governing_mcp", "governing_mcp_parallel_scope"),
    ("36_9", "ultimate_master", "ultimate_master_scope"),
)
REQUIREMENTS = (
    "HOSTINGER_AUTHENTICATED_READ_ONLY_PROBE",
    "REMOTE_MCP_HANDSHAKES_AND_SCOPED_TOOL_POLICIES",
    "NATIVE_BACKEND_RELEASE_IDENTITY_AND_GRAPHICAL_SMOKE",
    "PER_PLATFORM_INSTALLER_AND_EXTENSION_ACCEPTANCE",
    "SSPP_IMPLEMENTATION_AND_PROTOCOL_CONFORMANCE",
    "ROBOTICS_SIMULATION_AND_PHYSICAL_SAFETY_APPROVAL",
)


def source_facts(data, manifest):
    tree = ast.parse(data)
    imports, literals, catalogs = set(), [], {}
    declared = {"status": manifest.get("status")}
    for value in manifest.values():
        if isinstance(value, dict):
            declared.update(value)
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.add(node.module)
        elif isinstance(node, ast.Dict):
            for key, value in zip(node.keys, node.values):
                if (isinstance(key, ast.Constant) and isinstance(key.value, str)
                        and isinstance(value, ast.Constant) and isinstance(value.value, str)
                        and declared.get(key.value) == value.value):
                    literals.append({"field": key.value, "line": value.lineno})
        elif isinstance(node, ast.Assign) and isinstance(node.value, (ast.List, ast.Tuple)):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id in (
                        "tools_catalog", "sovereign_levels", "robotics_catalog"):
                    catalogs[target.id] = len(node.value.elts)
    return {"syntax": "PARSED_NOT_EXECUTED", "imports": sorted(imports),
            "matchingLiteralDeclarations": literals, "literalCatalogLengths": catalogs,
            "runtimeBehaviorVerified": False,
            "limitation": "Static declarations and syntax are not execution evidence."}


def registrations(data):
    document = safe.json_object(data)
    servers = document.get("mcpServers")
    if not isinstance(servers, dict):
        raise safe.AuditError("MCP_SERVERS_MAP_REQUIRED")
    result = []
    for name, config in servers.items():
        if not isinstance(config, dict):
            raise safe.AuditError("MCP_SERVER_OBJECT_REQUIRED")
        # Never emit arguments, headers, environment values or credentials.
        result.append({"name": name, "state": "REGISTERED_NOT_CONNECTION_VERIFIED",
                       "transport": "local" if config.get("command") else "remote",
                       "launchedByAudit": False})
    return result


def audit(ecosystem, mcp_paths=()):
    ecosystem = safe.no_symlinks(ecosystem)
    result = {
        "schema": "SHEIKHA_V36_INTEGRATION_AUDIT_V1",
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "scope": "FILE_BINDINGS_STATIC_CLAIMS_AND_LOCAL_MCP_CONFIG_ONLY",
        "sources": [], "versions": [], "registrations": [], "issues": [],
        "toolSha256": safe.sha256(safe.read_file(Path(__file__))),
        "helperSha256": safe.sha256(safe.read_file(HELPER)),
        "closureAccepted": False, "productionReady": False,
        "automaticActions": [], "missingRuntimeEvidence": list(REQUIREMENTS),
        "effects": {"engineExecution": False, "liveDatabaseOpened": False,
                    "networkRequests": False, "credentialStoreRead": False,
                    "serviceChanges": False, "gitChanges": False,
                    "evidenceRepinned": False, "physicalActuation": False},
        "limitations": [
            "Hash equality is byte consistency, not authenticity, authorization or readiness.",
            "Before/after byte checks are not a transactional SQLite snapshot.",
            "Historical database bindings are compared to V2, not the current database.",
            "This command is an audit, not a production enforcement point or installer.",
        ],
    }
    captured = {}

    def capture(path):
        path = safe.no_symlinks(path)
        data = safe.read_file(path)
        digest = safe.sha256(data)
        captured[path] = digest
        result["sources"].append({"path": str(path), "sha256": digest, "bytes": len(data)})
        return data

    db_path = ecosystem / safe.DATABASE
    try:
        if safe.has_sidecars(db_path):
            raise safe.AuditError("LIVE_SQLITE_SIDECAR_PRESENT")
        ledger = safe.json_object(capture(ecosystem / safe.LEDGER)).get("verified_physical_digests")
        if not isinstance(ledger, dict):
            raise safe.AuditError("V2_DIGEST_MAP_MISSING")
        database_hash = safe.sha256(capture(db_path))
        result["databaseSha256"] = database_hash
        result["currentDatabaseLedgerMatches"] = sorted(
            key for key, value in ledger.items()
            if key.startswith("sheikha_sql_db_") and value == database_hash)
        result["expectedCurrentDatabaseVersion"] = "36_9"
        for version, name, section in VERSIONS:
            prefix = "sheikha_v" + version + "_" + name
            raw = capture(ecosystem / safe.KERNEL / (prefix + "_manifest.json"))
            manifest = safe.json_object(raw)
            scope = manifest.get(section)
            if not isinstance(scope, dict):
                raise safe.AuditError("MANIFEST_SCOPE_MISSING_" + version)
            engine_name = ("run_sheikha_v36_9_ultimate_master.py" if version == "36_9"
                           else prefix + "_engine.py")
            facts = source_facts(capture(ecosystem / safe.KERNEL / engine_name), manifest)
            field = "sheikha_sql_db_master_digest" if version == "36_9" else "sheikha_sql_db_updated_hash"
            suffix = "master" if version == "36_9" else name
            recorded = scope.get(field)
            valid_hash = (isinstance(recorded, str) and len(recorded) == 64
                          and all(c in "0123456789abcdef" for c in recorded))
            checks = {
                "manifestMatchesV2": ledger.get(prefix + "_manifest_hash") == safe.sha256(raw),
                "databaseBindingMatchesV2": bool(valid_hash) and ledger.get(
                    "sheikha_sql_db_v" + version + "_" + suffix + "_hash") == recorded,
            }
            if version == "36_9":
                checks["currentDatabaseMatches"] = recorded == database_hash
            if not all(checks.values()):
                result["issues"].append("BINDING_MISMATCH_" + version)
            result["versions"].append({"version": version, "checks": checks,
                                       "sourceFacts": facts, "runtimeStatus": "UNVERIFIED"})
        for file in mcp_paths:
            result["registrations"].append({"source": str(file), "servers": registrations(capture(file))})
    except (safe.AuditError, OSError, ValueError, SyntaxError) as exc:
        result["issues"].append(str(exc) if isinstance(exc, safe.AuditError) else type(exc).__name__)
    finally:
        unchanged = bool(captured)
        for path, digest in captured.items():
            try:
                unchanged = (safe.sha256(safe.read_file(path)) == digest) and unchanged
            except (safe.AuditError, OSError):
                unchanged = False
        if safe.has_sidecars(db_path):
            unchanged = False
        result["sourceBytesUnchanged"] = unchanged
        if not unchanged:
            result["issues"].append("INPUT_SNAPSHOT_NOT_CONFIRMED")
    result["localEvidenceConsistent"] = not result["issues"]
    result["status"] = ("FILE_BINDINGS_CONSISTENT_RUNTIME_CLOSURE_UNPROVEN"
                        if result["localEvidenceConsistent"] else "LOCAL_EVIDENCE_REVIEW_BLOCKED")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ecosystem", type=Path, default=Path.home() / "sheikha_os_ecosystem")
    parser.add_argument("--mcp-config", type=Path, action="append", default=[])
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--require-closure", action="store_true")
    args = parser.parse_args()
    try:
        report = audit(args.ecosystem, args.mcp_config)
        if args.output_dir:
            safe.save_report(report, args.output_dir)
        print(json.dumps(report, ensure_ascii=True, indent=2))
        return safe.exit_code(report, args.require_closure)
    except (safe.AuditError, OSError) as exc:
        print(json.dumps({"status": "AUDIT_ERROR", "error": type(exc).__name__,
                          "closureAccepted": False, "productionReady": False}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
