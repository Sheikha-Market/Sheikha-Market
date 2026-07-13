#!/usr/bin/env python3

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from collections import Counter
import base64
import hashlib
import json
import math
import re
import sys


EXPECTED = {
    "node_modules/@azure/msal-node/src/config/Configuration.ts":
        "6a0d99d1677a35922bce0cb97b23fc0787b454f1ef2f1562a6836e80762ea104",

    "node_modules/@azure/msal-node/types/config/Configuration.d.ts":
        "0d9b0b2b9b82e97786f86efc07cf62b74dc46bfcb4d90387cd306cd0aa2516ed",

    "node_modules/dotenv/README-es.md":
        "a7021cf039feb04752c5cde82f07336dec6e17876e88677d7c5de4c2dbbbcff1",

    "node_modules/dotenv/README.md":
        "d445595efbfa0e290e495cbef75379e5cb16d881489d4873ecb0d0bd2e56227a",

    "node_modules/google-gax/build/src/grpc.js":
        "e1a5910fc6f4710eae35fa466b0ff6735fb08162eb66b3214978a7c2d0f42e38",

    "node_modules/gtoken/README.md":
        "aa636a40849a8fe392a6847397181d50ba07804d136c35b7e299b35750685cfc",
}


PEM_PAIR = re.compile(
    r"""-----BEGIN[ \t]+
        (?P<label>
            (?:
                RSA[ \t]+|
                EC[ \t]+|
                DSA[ \t]+|
                OPENSSH[ \t]+|
                ENCRYPTED[ \t]+
            )?
            PRIVATE[ \t]+KEY
        )
        -----[ \t\r\n]*
        (?P<body>.*?)
        [ \t\r\n]*-----END[ \t]+
        (?P=label)
        -----
    """,
    re.IGNORECASE | re.DOTALL | re.VERBOSE,
)

PEM_BEGIN = re.compile(
    r"""-----BEGIN[ \t]+
        (?:
            RSA[ \t]+|
            EC[ \t]+|
            DSA[ \t]+|
            OPENSSH[ \t]+|
            ENCRYPTED[ \t]+
        )?
        PRIVATE[ \t]+KEY
        -----
    """,
    re.IGNORECASE | re.VERBOSE,
)

BASE64_ONLY = re.compile(
    r"^[A-Za-z0-9+/]+={0,2}$"
)

LONG_BASE64 = re.compile(
    r"(?<![A-Za-z0-9+/])"
    r"([A-Za-z0-9+/]{128,}={0,2})"
    r"(?![A-Za-z0-9+/])"
)

SENSITIVE_ASSIGNMENT = re.compile(
    r"""(?ix)
    \b(
        private[_-]?key |
        dotenv_private_key(?:_[a-z0-9_-]+)? |
        client[_-]?secret |
        api[_-]?key |
        access[_-]?token |
        refresh[_-]?token
    )\b
    \s*[:=]\s*
    (?:
        ["'`](?P<quoted>[^"'`\r\n]*)["'`] |
        (?P<bare>[A-Za-z0-9+/=_-]{16,})
    )
    """
)

TOKEN_PATTERNS = {
    "OPENAI_STYLE_TOKEN":
        re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),

    "GITHUB_TOKEN":
        re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"),

    "AWS_ACCESS_KEY":
        re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),

    "JWT_TOKEN":
        re.compile(
            r"\beyJ[A-Za-z0-9_-]{10,}\."
            r"[A-Za-z0-9_-]{10,}\."
            r"[A-Za-z0-9_-]{10,}\b"
        ),
}


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()

    with path.open("rb") as handle:
        while True:
            block = handle.read(1024 * 1024)

            if not block:
                break

            digest.update(block)

    return digest.hexdigest()


def entropy(value: str) -> float:
    if not value:
        return 0.0

    counts = Counter(value)
    length = len(value)

    return -sum(
        (count / length) * math.log2(count / length)
        for count in counts.values()
    )


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def placeholder(value: str) -> bool:
    normalized = value.strip().lower()

    if not normalized:
        return True

    indicators = (
        "...",
        "<",
        ">",
        "your ",
        "your_",
        "example",
        "placeholder",
        "replace",
        "sample",
        "dummy",
        "private key>",
    )

    return any(
        indicator in normalized
        for indicator in indicators
    )


def validate_pem_body(body: str) -> dict[str, object]:
    compact = re.sub(r"\s+", "", body)

    result: dict[str, object] = {
        "compactLength": len(compact),
        "base64AlphabetOnly":
            bool(BASE64_ONLY.fullmatch(compact)),
        "decodedBytes": 0,
        "actualSecretPayload": False,
    }

    if len(compact) < 128:
        return result

    if not BASE64_ONLY.fullmatch(compact):
        return result

    try:
        padded = compact + (
            "=" * ((4 - len(compact) % 4) % 4)
        )

        decoded = base64.b64decode(
            padded,
            validate=True,
        )
    except Exception:
        return result

    result["decodedBytes"] = len(decoded)

    # المفاتيح الخاصة الفعلية تكون عادة أكبر بكثير،
    # وهذا الحد يمنع اعتبار الأمثلة القصيرة أسرارًا.
    result["actualSecretPayload"] = (
        len(decoded) >= 64
    )

    return result


def inspect_file(
    repository: Path,
    relative: str,
    expected_sha: str,
) -> dict[str, object]:
    path = (repository / relative).resolve()
    node_modules = (
        repository / "node_modules"
    ).resolve()

    result: dict[str, object] = {
        "path": relative,
        "expectedSha256": expected_sha,
        "exists": path.exists(),
        "isFile": path.is_file(),
        "isSymlink": path.is_symlink(),
        "hashMatched": False,
        "actualSecretIndicatorCount": 0,
        "actualSecretIndicators": [],
        "referenceMarkerCount": 0,
        "automaticExceptionGranted": False,
    }

    try:
        path.relative_to(node_modules)
    except ValueError:
        result["status"] = "BLOCKED_PATH_ESCAPE"
        result["actualSecretIndicators"] = [{
            "type": "PATH_OUTSIDE_NODE_MODULES"
        }]
        result["actualSecretIndicatorCount"] = 1
        return result

    if not path.is_file():
        result["status"] = "BLOCKED_FILE_MISSING"
        result["actualSecretIndicators"] = [{
            "type": "FILE_MISSING"
        }]
        result["actualSecretIndicatorCount"] = 1
        return result

    if path.is_symlink():
        result["status"] = "BLOCKED_SYMLINK"
        result["actualSecretIndicators"] = [{
            "type": "UNEXPECTED_SYMLINK",
            "resolved": str(path.resolve()),
        }]
        result["actualSecretIndicatorCount"] = 1
        return result

    actual_sha = sha256_file(path)

    result["bytes"] = path.stat().st_size
    result["actualSha256"] = actual_sha
    result["hashMatched"] = (
        actual_sha == expected_sha
    )

    if actual_sha != expected_sha:
        result["status"] = "BLOCKED_HASH_MISMATCH"
        result["actualSecretIndicators"] = [{
            "type": "HASH_MISMATCH"
        }]
        result["actualSecretIndicatorCount"] = 1
        return result

    text = path.read_text(
        encoding="utf-8",
        errors="replace",
    )

    indicators: list[dict[str, object]] = []
    pem_blocks: list[dict[str, object]] = []

    for match in PEM_PAIR.finditer(text):
        assessment = validate_pem_body(
            match.group("body")
        )

        item = {
            "line": line_number(
                text,
                match.start(),
            ),
            "label": match.group("label"),
            **assessment,
        }

        pem_blocks.append(item)

        if assessment["actualSecretPayload"]:
            indicators.append({
                "type": "ACTUAL_PRIVATE_KEY_PEM_PAYLOAD",
                "line": item["line"],
                "decodedBytes":
                    item["decodedBytes"],
            })

    begin_markers = list(
        PEM_BEGIN.finditer(text)
    )

    # التقاط حمولة Base64 طويلة بعد BEGIN حتى لو كان END مفقودًا.
    for marker in begin_markers:
        window = text[
            marker.end():
            marker.end() + 8192
        ]

        candidate = LONG_BASE64.search(window)

        if candidate:
            value = candidate.group(1)

            try:
                decoded = base64.b64decode(
                    value + (
                        "=" *
                        ((4 - len(value) % 4) % 4)
                    ),
                    validate=True,
                )
            except Exception:
                decoded = b""

            if len(decoded) >= 64:
                indicators.append({
                    "type":
                        "PRIVATE_KEY_LIKE_BASE64_AFTER_BEGIN",
                    "line": line_number(
                        text,
                        marker.start(),
                    ),
                    "decodedBytes": len(decoded),
                })

    assignments: list[dict[str, object]] = []

    for match in SENSITIVE_ASSIGNMENT.finditer(text):
        variable = match.group(1)
        value = (
            match.group("quoted")
            if match.group("quoted") is not None
            else match.group("bare") or ""
        )

        item = {
            "line": line_number(
                text,
                match.start(),
            ),
            "variable": variable,
            "valueLength": len(value),
            "entropy": round(
                entropy(value),
                3,
            ),
            "placeholder": placeholder(value),
        }

        assignments.append(item)

        suspicious = (
            not item["placeholder"]
            and len(value) >= 24
            and item["entropy"] >= 3.5
        )

        if suspicious:
            indicators.append({
                "type":
                    "HIGH_ENTROPY_SENSITIVE_ASSIGNMENT",
                "line": item["line"],
                "variable": variable,
                "valueLength": len(value),
                "entropy": item["entropy"],
            })

    token_matches: list[dict[str, object]] = []

    for name, pattern in TOKEN_PATTERNS.items():
        matches = list(pattern.finditer(text))

        if not matches:
            continue

        token_matches.append({
            "type": name,
            "count": len(matches),
            "lines": [
                line_number(text, match.start())
                for match in matches
            ],
        })

        indicators.append({
            "type": name,
            "count": len(matches),
        })

    result.update({
        "status": (
            "REFERENCE_ONLY_HASH_PINNED"
            if not indicators
            else "BLOCKED_ACTUAL_SECRET_MATERIAL"
        ),
        "referenceMarkerCount":
            len(begin_markers),
        "pemPairCount": len(pem_blocks),
        "pemBlocks": pem_blocks,
        "sensitiveAssignmentCount":
            len(assignments),
        "sensitiveAssignments": assignments,
        "tokenMatches": token_matches,
        "actualSecretIndicatorCount":
            len(indicators),
        "actualSecretIndicators":
            indicators,
    })

    return result


def main() -> int:
    if len(sys.argv) != 3:
        print(
            "Usage: structural-audit.py "
            "<repository-root> <report-path>",
            file=sys.stderr,
        )
        return 2

    repository = Path(sys.argv[1]).resolve()
    report_path = Path(sys.argv[2]).resolve()

    if not (repository / ".git").exists():
        print(
            "Repository validation failed.",
            file=sys.stderr,
        )
        return 3

    files = [
        inspect_file(
            repository,
            relative,
            expected_sha,
        )
        for relative, expected_sha in EXPECTED.items()
    ]

    blocked = [
        item
        for item in files
        if item["status"] !=
        "REFERENCE_ONLY_HASH_PINNED"
    ]

    passed = len(blocked) == 0

    report = {
        "schemaVersion": "6.0.0",
        "system":
            "SHEIKHA_V6_STRUCTURAL_SECRET_AUDIT",
        "status": (
            "REFERENCE_ONLY_HASH_PINNED"
            if passed
            else "BLOCKED_STRUCTURAL_SECRET_AUDIT"
        ),
        "scope": "EXACT_SIX_FILES_ONLY",
        "defaultAuthorization": "DENY",
        "hashPinRequired": True,
        "allHashesMatched": all(
            item.get("hashMatched") is True
            for item in files
        ),
        "targetCount": len(files),
        "referenceOnlyCount":
            len(files) - len(blocked),
        "blockedCount": len(blocked),
        "actualSecretMaterialDetected":
            any(
                item.get(
                    "actualSecretIndicatorCount",
                    0,
                ) > 0
                for item in files
            ),
        "secretExceptionGranted": False,
        "buildPermissionGranted": False,
        "networkUsed": False,
        "sudoUsed": False,
        "filesModified": False,
        "files": files,
        "policy": {
            "actualPrivateKeyAllowed": False,
            "tokenAllowed": False,
            "highEntropySecretAllowed": False,
            "hashMismatchAllowed": False,
            "newFileAllowed": False,
            "pathOnlyExceptionAllowed": False,
            "automaticExceptionAllowed": False,
            "explicitLimitedApprovalRequired":
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
                "allHashesMatched":
                    report["allHashesMatched"],
                "targetCount":
                    report["targetCount"],
                "referenceOnlyCount":
                    report["referenceOnlyCount"],
                "blockedCount":
                    report["blockedCount"],
                "actualSecretMaterialDetected":
                    report[
                        "actualSecretMaterialDetected"
                    ],
                "secretExceptionGranted": False,
                "buildPermissionGranted": False,
                "networkUsed": False,
                "filesModified": False,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

    return 0 if passed else 4


if __name__ == "__main__":
    raise SystemExit(main())
