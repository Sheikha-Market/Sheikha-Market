#!/usr/bin/env python3

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import re
import sys


TARGETS = [
    "node_modules/@azure/msal-node/src/config/Configuration.ts",
    "node_modules/@azure/msal-node/types/config/Configuration.d.ts",
    "node_modules/dotenv/README-es.md",
    "node_modules/dotenv/README.md",
    "node_modules/google-gax/build/src/grpc.js",
    "node_modules/gtoken/README.md",
]

PRIVATE_REFERENCE = re.compile(
    r"private[-_ ]?key",
    re.IGNORECASE,
)

PEM_MARKER = re.compile(
    r"-----BEGIN\s+"
    r"(?:RSA\s+|EC\s+|DSA\s+|OPENSSH\s+|ENCRYPTED\s+)?"
    r"PRIVATE\s+KEY-----",
    re.IGNORECASE,
)

PEM_END_MARKER = re.compile(
    r"-----END\s+"
    r"(?:RSA\s+|EC\s+|DSA\s+|OPENSSH\s+|ENCRYPTED\s+)?"
    r"PRIVATE\s+KEY-----",
    re.IGNORECASE,
)

SECRET_ASSIGNMENT = re.compile(
    r"""(?ix)
    \b(
        private[_-]?key |
        client[_-]?secret |
        api[_-]?key |
        access[_-]?token
    )\b
    \s*[:=]\s*
    (?:
        ["'`](?P<quoted>[^"'`]{8,})["'`] |
        (?P<bare>[A-Za-z0-9+/=_-]{24,})
    )
    """
)

TOKEN_PATTERNS = [
    (
        "OPENAI_STYLE_TOKEN",
        re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    ),
    (
        "GITHUB_TOKEN",
        re.compile(
            r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"
        ),
    ),
    (
        "AWS_ACCESS_KEY",
        re.compile(
            r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"
        ),
    ),
    (
        "JWT_TOKEN",
        re.compile(
            r"\beyJ[A-Za-z0-9_-]{10,}\."
            r"[A-Za-z0-9_-]{10,}\."
            r"[A-Za-z0-9_-]{10,}\b"
        ),
    ),
]

LONG_SECRET_LIKE = re.compile(
    r"\b[A-Za-z0-9+/=_-]{48,}\b"
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()

    with path.open("rb") as handle:
        while True:
            block = handle.read(1024 * 1024)

            if not block:
                break

            digest.update(block)

    return digest.hexdigest()


def redact(line: str) -> str:
    output = line

    if PEM_MARKER.search(output):
        return "<REDACTED_PRIVATE_KEY_BEGIN_MARKER>"

    if PEM_END_MARKER.search(output):
        return "<REDACTED_PRIVATE_KEY_END_MARKER>"

    for _, pattern in TOKEN_PATTERNS:
        output = pattern.sub(
            "<REDACTED_TOKEN>",
            output,
        )

    output = SECRET_ASSIGNMENT.sub(
        lambda match: (
            f"{match.group(1)}="
            "<REDACTED_POTENTIAL_VALUE>"
        ),
        output,
    )

    output = LONG_SECRET_LIKE.sub(
        "<REDACTED_LONG_VALUE>",
        output,
    )

    return output.rstrip("\n")


def inspect_file(root: Path, relative: str) -> dict:
    path = (root / relative).resolve()
    node_modules = (root / "node_modules").resolve()

    base = {
        "path": relative,
        "exists": path.exists(),
    }

    try:
        path.relative_to(node_modules)
    except ValueError:
        return {
            **base,
            "status": "BLOCKED_PATH_ESCAPE",
            "blockers": [
                "Resolved path is outside node_modules"
            ],
        }

    if not path.is_file():
        return {
            **base,
            "status": "BLOCKED_FILE_MISSING",
            "blockers": [
                "Expected dependency file is missing"
            ],
        }

    raw = path.read_text(
        encoding="utf-8",
        errors="replace",
    )

    lines = raw.splitlines()

    keyword_lines = [
        index
        for index, line in enumerate(lines)
        if PRIVATE_REFERENCE.search(line)
    ]

    blockers: list[dict[str, object]] = []

    if PEM_MARKER.search(raw):
        blockers.append({
            "type": "PRIVATE_KEY_PEM_BEGIN",
        })

    if PEM_END_MARKER.search(raw):
        blockers.append({
            "type": "PRIVATE_KEY_PEM_END",
        })

    for name, pattern in TOKEN_PATTERNS:
        matches = list(pattern.finditer(raw))

        if matches:
            blockers.append({
                "type": name,
                "count": len(matches),
            })

    assignments = list(
        SECRET_ASSIGNMENT.finditer(raw)
    )

    if assignments:
        blockers.append({
            "type": "SECRET_VALUE_ASSIGNMENT",
            "count": len(assignments),
        })

    contexts: list[dict[str, object]] = []
    seen: set[int] = set()

    for line_index in keyword_lines:
        start = max(0, line_index - 2)
        end = min(len(lines), line_index + 3)

        for index in range(start, end):
            if index in seen:
                continue

            seen.add(index)

            contexts.append({
                "line": index + 1,
                "text": redact(lines[index]),
                "containsReference":
                    bool(
                        PRIVATE_REFERENCE.search(
                            lines[index]
                        )
                    ),
            })

    status = (
        "BLOCKED_ACTUAL_SECRET_INDICATOR"
        if blockers
        else "REFERENCE_ONLY_CANDIDATE"
    )

    return {
        **base,
        "status": status,
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
        "privateKeyReferenceCount":
            len(keyword_lines),
        "blockerCount": len(blockers),
        "blockers": blockers,
        "redactedContext": contexts,
        "automaticApproval": False,
        "humanApprovalRequired": True,
    }


def main() -> int:
    if len(sys.argv) != 3:
        print(
            "Usage: audit.py <repository-root> <report-path>",
            file=sys.stderr,
        )
        return 2

    root = Path(sys.argv[1]).resolve()
    report_path = Path(sys.argv[2]).resolve()

    if not (root / ".git").exists():
        print(
            "Repository root validation failed.",
            file=sys.stderr,
        )
        return 3

    files = [
        inspect_file(root, relative)
        for relative in TARGETS
    ]

    blocked = [
        item
        for item in files
        if item["status"] !=
        "REFERENCE_ONLY_CANDIDATE"
    ]

    status = (
        "REFERENCE_ONLY_REVIEW_READY"
        if not blocked
        else "BLOCKED_SECRET_REVIEW"
    )

    report = {
        "schemaVersion": "6.0.0",
        "system":
            "SHEIKHA_V6_SECRET_REFERENCE_AUDIT",
        "status": status,
        "scope":
            "READ_ONLY_EXACT_SIX_FINDINGS",
        "defaultAuthorization": "DENY",
        "secretExceptionGranted": False,
        "buildPermissionGranted": False,
        "networkUsed": False,
        "sudoUsed": False,
        "filesModified": False,
        "targetCount": len(TARGETS),
        "referenceOnlyCandidateCount":
            len(files) - len(blocked),
        "blockedCount": len(blocked),
        "files": files,
        "policy": {
            "actualPrivateKeyAllowed": False,
            "tokenAllowed": False,
            "secretAssignmentAllowed": False,
            "pathOnlyAllowlistAllowed": False,
            "hashPinRequiredBeforeException":
                True,
            "explicitHumanApprovalRequired":
                True,
            "principle": "لا ضرر ولا ضرار",
        },
        "generatedAt": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    report_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    report_path.write_text(
        json.dumps(
            report,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "system": report["system"],
                "status": report["status"],
                "targetCount":
                    report["targetCount"],
                "referenceOnlyCandidateCount":
                    report[
                        "referenceOnlyCandidateCount"
                    ],
                "blockedCount":
                    report["blockedCount"],
                "secretExceptionGranted":
                    False,
                "buildPermissionGranted":
                    False,
                "networkUsed": False,
                "filesModified": False,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

    return 0 if not blocked else 4


if __name__ == "__main__":
    raise SystemExit(main())
