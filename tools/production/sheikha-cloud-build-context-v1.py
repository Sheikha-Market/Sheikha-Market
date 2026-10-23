#!/usr/bin/env python3
"""Inspect bounded build inputs; explicitly stage a new context without uploading."""
from __future__ import annotations

import argparse
import collections
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import tempfile


PROJECT = Path(__file__).resolve().parents[2]
POLICY_PATH = PROJECT / "config/cloud/sheikha-cloud-build-context-v1.json"
DEFAULT_STAGING_ROOT = Path("/home/sheikha/sheikha-package-staging")
MAX_POLICY_BYTES = 64 * 1024
HARD_MAX_FILES = 20000
HARD_MAX_TOTAL = 200 * 1024 * 1024
HARD_MAX_TEXT = 2 * 1024 * 1024
HARD_MAX_STATIC = 8 * 1024 * 1024
CORE_EXCLUDED_COMPONENTS = {"node_modules", ".git", ".venv", ".venv-llm", "venv", ".codex", ".agents", ".cursor", ".ssh", ".aws", ".azure", ".kube", ".config", "private", "intellectual-property", "backups", "logs", "weights", "models", "training", "checkpoints", "exports", "uploads", "sessions"}
CORE_EXCLUDED_SUFFIXES = {".db", ".sqlite", ".sqlite3", ".zip", ".tar", ".gz", ".tgz", ".7z", ".pt", ".pth", ".bin", ".safetensors", ".gguf", ".ggml", ".img", ".iso", ".qcow2", ".pem", ".key", ".p12", ".pfx", ".jks"}
TOKEN_RULES = (
    ("PRIVATE_KEY_CONTENT", re.compile(rb"-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----")),
    ("AWS_ACCESS_KEY", re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b")),
    ("GOOGLE_API_KEY", re.compile(rb"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("GITHUB_TOKEN", re.compile(rb"\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b")),
    ("PROVIDER_SECRET", re.compile(rb"\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}|\bsk_live_[A-Za-z0-9]{16,}")),
    ("SLACK_TOKEN", re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{12,}\b")),
    ("SERVICE_ACCOUNT_CONTENT", re.compile(rb'"type"\s*:\s*"service_account"')),
)
CREDENTIAL = re.compile(r'''(?i)(?<![\w:-])["']?(?:[a-z0-9]{1,40}[_-]){0,5}(?:password|passwd|api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|private[_-]?key|secret[_-]?key|auth[_-]?token|jwt[_-]?secret|session[_-]?secret)["']?\s*[:=]\s*["']([^"'\r\n]{4,})["']''')
IMPORT = re.compile(r'''\brequire\s*\(\s*["'](\.[^"'\r\n]+)["']\s*\)|\b(?:import|export)\s+[^;\r\n]*?\bfrom\s*["'](\.[^"'\r\n]+)["']|\bimport\s*["'](\.[^"'\r\n]+)["']''')
NODE_RESOLVE = """const fs=require('node:fs');const {createRequire}=require('node:module');const rows=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(JSON.stringify(rows.map(([source,specifier])=>{try{return {source,specifier,resolved:createRequire(source).resolve(specifier)}}catch{return {source,specifier,unresolved:true}}})));"""


def bounded_read(path: Path, limit: int, root: Path | None = None):
    if root is not None:
        try:
            if path.resolve() != path or not path.is_relative_to(root):
                raise ValueError("PATH_OR_ANCESTOR_LINK_REFUSED")
        except OSError:
            raise ValueError("PATH_RESOLUTION_FAILED") from None
    fd = os.open(path, os.O_RDONLY | os.O_NONBLOCK | os.O_NOFOLLOW)
    try:
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode) or before.st_nlink != 1:
            raise ValueError("NON_REGULAR_OR_HARDLINK_REFUSED")
        if before.st_size > limit:
            raise ValueError("FILE_SIZE_LIMIT")
        with os.fdopen(fd, "rb", closefd=False) as handle:
            data = handle.read(limit + 1)
        after = os.fstat(fd)
        observed = path.lstat()
        signature = lambda item: (item.st_dev, item.st_ino, item.st_size, item.st_mtime_ns, item.st_mode)
        if len(data) > limit or signature(before) != signature(after) or signature(after) != signature(observed):
            raise ValueError("FILE_CHANGED_DURING_READ")
        return data, before
    finally:
        os.close(fd)


def load_policy(path: Path):
    data, _ = bounded_read(path, MAX_POLICY_BYTES)
    policy = json.loads(data)
    if policy.get("schema") != "SHEIKHA_CLOUD_BUILD_CONTEXT_V1":
        raise ValueError("POLICY_SCHEMA_INVALID")
    for name, maximum in (("max_total_bytes", HARD_MAX_TOTAL), ("max_text_file_bytes", HARD_MAX_TEXT), ("max_static_asset_bytes", HARD_MAX_STATIC), ("max_files", HARD_MAX_FILES), ("max_findings", 100)):
        if type(policy.get(name)) is not int or not 0 < policy[name] <= maximum:
            raise ValueError("POLICY_LIMIT_INVALID")
    for name in ("entrypoints", "root_files", "code_roots", "asset_roots", "required_asset_roots", "data_files", "required_data_files", "code_suffixes", "text_asset_suffixes", "reviewed_static_asset_suffixes", "large_static_asset_paths", "excluded_components", "excluded_suffixes"):
        if not isinstance(policy.get(name), list) or len(policy[name]) > 256 or any(not isinstance(value, str) or not value or len(value) > 512 for value in policy[name]):
            raise ValueError("POLICY_LIST_INVALID")
    for name in ("entrypoints", "root_files", "code_roots", "asset_roots", "required_asset_roots", "data_files", "required_data_files", "large_static_asset_paths"):
        if any(PurePosixPath(value).is_absolute() or ".." in PurePosixPath(value).parts or "\\" in value for value in policy[name]):
            raise ValueError("POLICY_PATH_INVALID")
    for name in ("code_roots", "asset_roots", "required_asset_roots"):
        if any(len(PurePosixPath(value).parts) != 1 or value in CORE_EXCLUDED_COMPONENTS for value in policy[name]):
            raise ValueError("POLICY_ROOT_INVALID")
    return policy, hashlib.sha256(data).hexdigest()


def excluded(relative: str, policy):
    parts = PurePosixPath(relative.lower()).parts
    leaf = parts[-1] if parts else ""
    if any(part in CORE_EXCLUDED_COMPONENTS or part in policy["excluded_components"] for part in parts):
        return "EXCLUDED_PRIVATE_OR_GENERATED_DIRECTORY"
    if leaf.startswith(".env") or leaf in {".npmrc", ".netrc", ".mcp.json", "auth.json"}:
        return "EXCLUDED_AUTH_CONFIGURATION"
    if any(word in leaf for word in ("credentials", "secrets")):
        return "EXCLUDED_CREDENTIAL_NAMED_FILE"
    if any(leaf.endswith(suffix) for suffix in CORE_EXCLUDED_SUFFIXES | set(policy["excluded_suffixes"])) or re.search(r"\.(?:db|sqlite|sqlite3)-(?:wal|shm|journal)$", leaf):
        return "EXCLUDED_BINARY_PRIVATE_OR_GENERATED_FILE"
    if ".backup" in leaf or leaf.endswith((".bak", ".tmp", ".swp")):
        return "EXCLUDED_BACKUP_OR_TEMPORARY_FILE"
    return None


def allowed(relative: str, policy, required=False):
    path = PurePosixPath(relative)
    if relative in policy["root_files"] or relative in policy["data_files"] or relative in policy["required_data_files"]:
        return True
    if len(path.parts) < 2:
        return required and path.suffix.lower() in policy["code_suffixes"]
    if path.parts[0] in policy["code_roots"]:
        return path.suffix.lower() in policy["code_suffixes"] or (required and path.suffix.lower() == ".json")
    if path.parts[0] in policy["asset_roots"]:
        return path.suffix.lower() in policy["code_suffixes"] + policy["text_asset_suffixes"] + policy["reviewed_static_asset_suffixes"]
    if required and path.parts[0] in policy["required_asset_roots"]:
        return path.suffix.lower() == ".json"
    return False


def placeholder(value: str):
    return value.lower() in {"replace_me", "changeme", "change_me", "example", "placeholder", "redacted", "your_api_key", "your_password", "your_token", "null", "none", "undefined"} or re.fullmatch(r"\$\{[A-Za-z_][A-Za-z0-9_]*\}|<[A-Z_][A-Z0-9_]*>", value) is not None or value.lower().startswith(("example_", "placeholder_", "replace_with_"))


def secret_rules(data: bytes):
    rules = [name for name, expression in TOKEN_RULES if expression.search(data)]
    # Exact public naming prefixes are not complete credentials. Never allow a
    # startswith exemption: a real token with either prefix must still block.
    if any(not placeholder(match.group(1)) and match.group(1) not in {"shk_", "nafath_"} for match in CREDENTIAL.finditer(data.decode("utf-8", errors="replace"))):
        rules.append("HARDCODED_CREDENTIAL_REVIEW_REQUIRED")
    return rules


def inspect(root: Path, policy, policy_digest: str):
    root = root.absolute()
    if root.resolve() != root or not root.is_dir():
        raise ValueError("SOURCE_ROOT_REFUSED")
    findings, warnings, inventory = [], [], {}
    counts = collections.Counter()
    total = 0
    visited = 0
    source_imports = {}
    entrypoint_sources = {}

    def record(path, rule, blocking=True, dependency=None):
        counts[rule] += 1
        target = findings if blocking else warnings
        if len(target) < policy["max_findings"]:
            item = {"path": path, "rule": rule}
            if dependency is not None:
                item["dependency"] = dependency[:512]
            target.append(item)

    def add(relative, required=False):
        nonlocal total
        if relative in inventory:
            return
        path = root / relative
        reason = excluded(relative, policy)
        if reason or not allowed(relative, policy, required):
            record(relative, "REQUIRED_IMPORT_EXCLUDED")
            return
        binary = path.suffix.lower() in policy["reviewed_static_asset_suffixes"]
        limit = policy["max_static_asset_bytes"] if binary and relative in policy["large_static_asset_paths"] else policy["max_text_file_bytes"]
        try:
            # Refuse over-budget inputs before opening their contents.
            size = path.lstat().st_size
            if len(inventory) >= policy["max_files"] or total + size > policy["max_total_bytes"]:
                record(relative, "TOTAL_CONTEXT_BUDGET_EXCEEDED")
                return
            data, info = bounded_read(path, limit, root)
        except (OSError, ValueError) as error:
            record(relative, str(error) if isinstance(error, ValueError) else "SOURCE_READ_REFUSED")
            return
        if len(inventory) >= policy["max_files"] or total + len(data) > policy["max_total_bytes"]:
            record(relative, "TOTAL_CONTEXT_BUDGET_EXCEEDED")
            return
        for rule in secret_rules(data):
            record(relative, rule)
        if relative in {'.dockerignore', '.gcloudignore'} and re.search(
                rb'\[STRIPPED(?: [0-9]+ bytes)?\]|(?m:^[ \t]*[0-9]+ lines hidden[ \t]*$)', data):
            record(relative, 'MALFORMED_IGNORE_RULES')
        total += len(data)
        inventory[relative] = {"path": relative, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "source_mode": f"{stat.S_IMODE(info.st_mode):04o}", "mtime_ns": info.st_mtime_ns, "source_device": info.st_dev, "source_inode": info.st_ino}
        if relative in policy['entrypoints']:
            entrypoint_sources[relative] = data
        if path.suffix.lower() in policy["code_suffixes"]:
            source_imports[relative] = []
            for match in IMPORT.finditer(data.decode("utf-8", errors="replace")):
                specifier = next(group for group in match.groups() if group is not None)
                source_imports[relative].append([str(path), specifier])

    # Only named application roots are walked. Excluded subtrees are never read.
    roots = sorted(set(policy["code_roots"] + policy["asset_roots"]))
    candidates = set(policy["root_files"] + policy["data_files"] + policy["required_data_files"])
    for name in roots:
        top = root / name
        if top.is_symlink():
            record(name, "ALLOWLIST_ROOT_SYMLINK_REFUSED")
            continue
        if not top.exists():
            continue
        for directory, dirs, files in os.walk(top, followlinks=False):
            base = Path(directory)
            kept = []
            for name in sorted(dirs):
                path = base / name
                relative = path.relative_to(root).as_posix()
                if excluded(relative, policy):
                    counts["EXCLUDED_DIRECTORY"] += 1
                    continue
                if path.is_symlink():
                    record(relative, "SYMLINK_DIRECTORY_SKIPPED", False)
                    continue
                kept.append(name)
            dirs[:] = kept
            for name in sorted(files):
                visited += 1
                if visited > policy["max_files"] * 5:
                    record(".", "INVENTORY_VISIT_LIMIT")
                    dirs[:] = []
                    break
                path = base / name
                relative = path.relative_to(root).as_posix()
                if excluded(relative, policy) or not allowed(relative, policy):
                    counts["EXCLUDED_FILE"] += 1
                    continue
                if path.is_symlink():
                    record(relative, "SYMLINK_FILE_SKIPPED", False)
                    continue
                candidates.add(relative)
            if visited > policy["max_files"] * 5:
                break
    # Record local root links such as the broken developer-only ./node link.
    for path in root.iterdir():
        if path.is_symlink() and path.name not in roots and path.name not in candidates:
            record(path.name, "LOCAL_ROOT_SYMLINK_EXCLUDED", False)
    for relative in sorted(candidates):
        path = root / relative
        if not path.exists() and relative in policy["required_data_files"]:
            record(relative, "REQUIRED_ASSET_MISSING")
            continue
        if not path.exists() and relative not in policy["entrypoints"] and relative not in {"package.json", "package-lock.json", "Dockerfile"}:
            continue
        add(relative)
    for relative in policy["entrypoints"]:
        if relative not in inventory:
            record(relative, "REQUIRED_ENTRYPOINT_MISSING")

    graph_rows = []
    resolved_count = 0
    frontier = set(policy["entrypoints"])
    processed = set()
    executable = shutil.which("node")
    environment = {key: value for key, value in os.environ.items() if key not in {"NODE_OPTIONS", "NODE_PATH"}}
    syntax_checked = 0
    # Parse the inventoried bytes without executing code or reopening a moving file.
    for relative, data in entrypoint_sources.items():
        suffix = Path(relative).suffix.lower()
        if suffix not in {'.js', '.cjs', '.mjs'}:
            record(relative, 'ENTRYPOINT_SYNTAX_TYPE_UNSUPPORTED')
            continue
        if executable is None:
            record(relative, 'NODE_SYNTAX_CHECK_UNAVAILABLE')
            continue
        mode = 'module' if suffix == '.mjs' else 'commonjs'
        try:
            child = subprocess.run(
                [executable, '--input-type=' + mode, '--check'], input=data,
                cwd=root, env={'PATH': os.environ.get('PATH', '/usr/bin:/bin'), 'LANG': 'C.UTF-8'},
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=20, check=False,
            )
            if child.returncode:
                record(relative, 'ENTRYPOINT_SYNTAX_INVALID')
            else:
                syntax_checked += 1
        except (OSError, subprocess.TimeoutExpired):
            record(relative, 'ENTRYPOINT_SYNTAX_CHECK_FAILED')
    while frontier:
        current = sorted(frontier - processed)
        processed.update(current)
        frontier = set()
        batch = [edge for relative in current for edge in source_imports.get(relative, [])]
        graph_rows.extend(batch)
        if len(graph_rows) > 20000:
            record(".", "STATIC_GRAPH_EDGE_LIMIT")
            break
        if not batch:
            continue
        if executable is None:
            record(".", "NODE_RESOLVER_UNAVAILABLE")
            break
        try:
            child = subprocess.run([executable, "--input-type=commonjs", "-e", NODE_RESOLVE], input=json.dumps(batch).encode(), cwd=root, env=environment, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20, check=False)
            if child.returncode or len(child.stdout) > 16 * 1024 * 1024:
                raise ValueError("NODE_RESOLUTION_FAILED")
            resolutions = json.loads(child.stdout)
            if len(resolutions) != len(batch):
                raise ValueError("NODE_RESOLUTION_FAILED")
        except (OSError, ValueError, subprocess.TimeoutExpired):
            record(".", "NODE_RESOLUTION_FAILED")
            break
        resolved_count += len(resolutions)
        for item in resolutions:
            source = Path(item["source"]).relative_to(root).as_posix()
            if item.get("unresolved"):
                record(source, "STATIC_LOCAL_IMPORT_UNRESOLVED", dependency=item["specifier"])
                continue
            resolved = Path(item["resolved"])
            if not resolved.is_relative_to(root):
                record(source, "STATIC_LOCAL_IMPORT_OUTSIDE_ROOT")
                continue
            relative = resolved.relative_to(root).as_posix()
            if "node_modules" in PurePosixPath(relative).parts:
                continue
            requested = Path(os.path.abspath((root / source).parent / item["specifier"]))
            if not requested.is_relative_to(root):
                record(source, "STATIC_LOCAL_IMPORT_OUTSIDE_ROOT")
                continue
            link = False
            for candidate in [requested] + [Path(str(requested) + suffix) for suffix in (".js", ".cjs", ".mjs", ".json")]:
                current = root
                for part in candidate.relative_to(root).parts:
                    current = current / part
                    if current.is_symlink():
                        link = True
                        break
            if link:
                record(source, "STATIC_IMPORT_SYMLINK_REFUSED", dependency=item["specifier"])
                continue
            if requested.is_dir() and (requested / "package.json").exists():
                package_metadata = (requested / "package.json").relative_to(root).as_posix()
                add(package_metadata, required=True)
                if package_metadata not in inventory:
                    record(package_metadata, "STATIC_LOCAL_IMPORT_NOT_IN_CONTEXT")
            if relative not in inventory:
                add(relative, required=True)
            if relative not in inventory:
                record(relative, "STATIC_LOCAL_IMPORT_NOT_IN_CONTEXT")
            elif relative not in processed:
                frontier.add(relative)
    ordered = [inventory[name] for name in sorted(inventory)]
    digest = hashlib.sha256(json.dumps(ordered, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    groups = collections.defaultdict(lambda: {"bytes": 0, "files": 0})
    for item in ordered:
        bucket = groups[item["path"].split("/")[0]]
        bucket["bytes"] += item["bytes"]
        bucket["files"] += 1
    report = {
        "schema": "SHEIKHA_CLOUD_BUILD_CONTEXT_REPORT_V1",
        "status": "BLOCKED" if sum(counts[rule] for rule in counts if rule not in {"EXCLUDED_FILE", "EXCLUDED_DIRECTORY", "SYMLINK_DIRECTORY_SKIPPED", "SYMLINK_FILE_SKIPPED", "LOCAL_ROOT_SYMLINK_EXCLUDED"}) else "PASS",
        "scope": "LOCAL_BUILD_INPUTS_ONLY_NO_UPLOAD_NO_MODULE_EXECUTION",
        "source_root": str(root), "file_count": len(ordered), "total_bytes": total,
        "max_total_bytes": policy["max_total_bytes"], "policy_sha256": policy_digest,
        "inventory_sha256": digest, "findings": findings, "warnings": warnings,
        "rule_counts": dict(sorted(counts.items())),
        "largest_files": sorted(({"path": item["path"], "bytes": item["bytes"]} for item in ordered), key=lambda item: item["bytes"], reverse=True)[:20],
        "top_level": [{"path": key, **value} for key, value in sorted(groups.items(), key=lambda pair: pair[1]["bytes"], reverse=True)[:20]],
        "static_graph": {"literal_local_imports": len(graph_rows), "resolved_results": resolved_count, "reachable_sources": len(processed), "limitations": "Entrypoint-reachable literal imports only; dynamic imports, fs assets and optional feature behavior require separate smoke tests."},
        "entrypoint_syntax": {"checked": syntax_checked, "execution": False,
                              "scope": "Inventoried entrypoint bytes only; not all modules or target Node-version compatibility."},
        "staged": False,
    }
    manifest_estimate = len(json.dumps({"report": report, "source_snapshot": ordered}, ensure_ascii=False, indent=2).encode()) + 256
    report["estimated_manifest_bytes"] = manifest_estimate
    report["estimated_staged_bytes"] = total + manifest_estimate
    if report["estimated_staged_bytes"] > policy["max_total_bytes"]:
        record("SHEIKHA-CLOUD-CONTEXT-MANIFEST.json", "MANIFEST_CONTEXT_BUDGET_EXCEEDED")
        report["status"] = "BLOCKED"
        report["rule_counts"] = dict(sorted(counts.items()))
    return report, ordered


def stage(root: Path, policy, report, inventory, staging_root: Path):
    if report["status"] != "PASS":
        raise ValueError("BLOCKED_CONTEXT_NOT_STAGED")
    staging_root = staging_root.absolute()
    if staging_root.resolve() != staging_root or not staging_root.is_dir() or staging_root == root or staging_root.is_relative_to(root):
        raise ValueError("STAGING_ROOT_REFUSED")
    manifest_data = (json.dumps({"report": report, "source_snapshot": inventory}, ensure_ascii=False, indent=2) + "\n").encode()
    if report["total_bytes"] + len(manifest_data) > policy["max_total_bytes"]:
        raise ValueError("MANIFEST_CONTEXT_BUDGET_EXCEEDED")
    destination = Path(tempfile.mkdtemp(prefix="SHEIKHA_CLOUD_CONTEXT_V1_", dir=staging_root))
    try:
        for item in inventory:
            source = root / item["path"]
            limit = policy["max_static_asset_bytes"] if source.suffix.lower() in policy["reviewed_static_asset_suffixes"] and item["path"] in policy["large_static_asset_paths"] else policy["max_text_file_bytes"]
            data, info = bounded_read(source, limit, root)
            if hashlib.sha256(data).hexdigest() != item["sha256"] or stat.S_IMODE(info.st_mode) != int(item["source_mode"], 8) or info.st_ino != item["source_inode"] or info.st_dev != item["source_device"] or info.st_mtime_ns != item["mtime_ns"]:
                raise ValueError("SOURCE_SNAPSHOT_CHANGED")
            target = destination / item["path"]
            target.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
            fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
            with os.fdopen(fd, "wb") as handle:
                handle.write(data)
        fd = os.open(destination / "SHEIKHA-CLOUD-CONTEXT-MANIFEST.json", os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, "wb") as handle:
            handle.write(manifest_data)
    except (OSError, ValueError):
        # Preserve an incomplete context for inspection; never upload or delete it.
        raise ValueError("STAGING_INCOMPLETE_PRESERVED:" + str(destination)) from None
    return destination


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=PROJECT)
    parser.add_argument("--policy", type=Path, default=POLICY_PATH)
    parser.add_argument("--stage", action="store_true", help="Create a new isolated directory only after PASS; never upload")
    parser.add_argument("--staging-root", type=Path, default=DEFAULT_STAGING_ROOT)
    args = parser.parse_args(argv)
    try:
        root = args.root.absolute()
        policy, policy_digest = load_policy(args.policy)
        report, inventory = inspect(root, policy, policy_digest)
        if args.stage:
            destination = stage(root, policy, report, inventory, args.staging_root)
            report["staged"] = True
            report["staging_directory"] = str(destination)
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0 if report["status"] == "PASS" else 1
    except (OSError, ValueError, KeyError, TypeError) as error:
        rule = str(error) if isinstance(error, ValueError) else "PREFLIGHT_FAILED"
        if not re.fullmatch(r"[A-Z_]+(?::/[^\r\n]+)?", rule):
            rule = "PREFLIGHT_FAILED"
        print(json.dumps({"status": "BLOCKED", "rule": rule, "staged": False}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
