#!/usr/bin/env python3

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from collections import Counter
import base64
import hashlib
import json
import math
import os
import re
import sys


PRIVATE_REFERENCE = re.compile(
    r"private[-_ ]?key|"
    r"-----BEGIN\s+"
    r"(?:(?:RSA|EC|DSA|OPENSSH|ENCRYPTED)\s+)?"
    r"PRIVATE\s+KEY-----",
    re.IGNORECASE,
)

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
    \s*(?P<operator>[:=])\s*
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


# SHEIKHA_V6_SEMANTIC_SECRET_VALUE_POLICY
#
# أسماء المتغيرات وتعريفات الأنواع ليست مواد سرية.
# أمثلة غير سرية:
#   this.clientSecret = clientSecretOrAuthorizationCode
#   api_key: string
#
# القيم الحرفية، PEM الفعلي، Tokens المعروفة، والقيم
# عالية العشوائية غير المرجعية تبقى محظورة.

IDENTIFIER_REFERENCE = re.compile(
    r"^[A-Za-z_$][A-Za-z0-9_$]*"
    r"(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$"
)

TYPE_REFERENCE = re.compile(
    r"""(?x)
    ^[A-Za-z_$][A-Za-z0-9_$.]*
    (?:
        <[^;\r\n]+>
    )?
    (?:
        \[\]
    )?
    $
    """
)


def is_identifier_reference(value: str) -> bool:
    return bool(
        IDENTIFIER_REFERENCE.fullmatch(
            value.strip()
        )
    )


def is_type_reference(value: str) -> bool:
    return bool(
        TYPE_REFERENCE.fullmatch(
            value.strip()
        )
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


def entropy(value: str) -> float:
    if not value:
        return 0.0

    counts = Counter(value)
    length = len(value)

    return -sum(
        (count / length) * math.log2(count / length)
        for count in counts.values()
    )


def is_placeholder(value: str) -> bool:
    normalized = value.strip().lower()

    if not normalized:
        return True

    indicators = (
        "...",
        "<",
        ">",
        "example",
        "placeholder",
        "sample",
        "dummy",
        "replace",
        "your ",
        "your_",
        "private key>",
    )

    return any(
        indicator in normalized
        for indicator in indicators
    )


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def actual_pem_payload(
    body: str,
) -> tuple[bool, int]:
    compact = re.sub(r"\s+", "", body)

    if len(compact) < 128:
        return False, 0

    if not re.fullmatch(
        r"[A-Za-z0-9+/]+={0,2}",
        compact,
    ):
        return False, 0

    try:
        padded = compact + (
            "=" * ((4 - len(compact) % 4) % 4)
        )

        decoded = base64.b64decode(
            padded,
            validate=True,
        )
    except Exception:
        return False, 0

    return len(decoded) >= 64, len(decoded)


def scan_actual_secrets(
    text: str,
    relative: str,
) -> list[dict[str, object]]:
    findings: list[dict[str, object]] = []

    for match in PEM_PAIR.finditer(text):
        actual, decoded_bytes = actual_pem_payload(
            match.group("body")
        )

        if actual:
            findings.append({
                "path": relative,
                "pattern":
                    "ACTUAL_PRIVATE_KEY_PEM_PAYLOAD",
                "line": line_number(
                    text,
                    match.start(),
                ),
                "decodedBytes": decoded_bytes,
            })

    for marker in PEM_BEGIN.finditer(text):
        window = text[
            marker.end():
            marker.end() + 8192
        ]

        candidate = LONG_BASE64.search(window)

        if not candidate:
            continue

        try:
            value = candidate.group(1)

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
            findings.append({
                "path": relative,
                "pattern":
                    "PRIVATE_KEY_LIKE_BASE64_AFTER_BEGIN",
                "line": line_number(
                    text,
                    marker.start(),
                ),
                "decodedBytes": len(decoded),
            })

    for name, pattern in TOKEN_PATTERNS.items():
        for match in pattern.finditer(text):
            findings.append({
                "path": relative,
                "pattern": name,
                "line": line_number(
                    text,
                    match.start(),
                ),
            })

    for match in SENSITIVE_ASSIGNMENT.finditer(text):
        quoted_value = match.group("quoted")
        bare_value = match.group("bare")
        operator = match.group("operator")

        value = (
            quoted_value
            if quoted_value is not None
            else bare_value or ""
        )

        if is_placeholder(value):
            continue

        # أسماء المعاملات والمتغيرات ليست أسرارًا حرفية.
        if (
            bare_value is not None
            and is_identifier_reference(value)
        ):
            continue

        # تعريفات TypeScript مثل api_key: string
        # تصف نوع الحقل ولا تتضمن قيمة.
        if (
            operator == ":"
            and bare_value is not None
            and is_type_reference(value)
        ):
            continue

        value_entropy = entropy(value)

        if (
            len(value) >= 24
            and value_entropy >= 3.5
        ):
            findings.append({
                "path": relative,
                "pattern":
                    "HIGH_ENTROPY_SENSITIVE_LITERAL",
                "line": line_number(
                    text,
                    match.start(),
                ),
                "valueLength": len(value),
                "entropy": round(
                    value_entropy,
                    3,
                ),
                "operator": operator,
                "quotedLiteral":
                    quoted_value is not None,
            })

    return findings


def main() -> int:
    if len(sys.argv) != 5:
        print(
            "Usage: secret-gate.py "
            "<candidate-root> <report> <audit> <approval>",
            file=sys.stderr,
        )
        return 2

    target = Path(sys.argv[1]).resolve()
    report_path = Path(sys.argv[2]).resolve()
    audit_path = Path(sys.argv[3]).resolve()
    approval_path = Path(sys.argv[4]).resolve()

    if not target.is_dir():
        print(
            f"Candidate root missing: {target}",
            file=sys.stderr,
        )
        return 3

    audit = json.loads(
        audit_path.read_text(encoding="utf-8")
    )

    approval = json.loads(
        approval_path.read_text(encoding="utf-8")
    )

    contract_checks = [
        audit.get("status") ==
            "REFERENCE_ONLY_HASH_PINNED",
        audit.get("allHashesMatched") is True,
        audit.get("referenceOnlyCount") == 6,
        audit.get("blockedCount") == 0,
        audit.get(
            "actualSecretMaterialDetected"
        ) is False,
        approval.get("status") ==
            "LIMITED_APPROVAL_ACTIVE",
        approval.get("approved") is True,
        approval.get("defaultAuthorization") ==
            "DENY",
        approval.get("approvalScope") ==
            "EXACT_SIX_FILES_AND_HASHES_ONLY",
        approval.get(
            "automaticRevocationOnHashChange"
        ) is True,
        approval.get(
            "pathOnlyExceptionAllowed"
        ) is False,
        approval.get(
            "additionalFilesAllowed"
        ) is False,
        approval.get(
            "actualSecretMaterialAllowed"
        ) is False,
        approval.get(
            "genericSecretScannerDisabled"
        ) is False,
        approval.get("networkAllowed") is False,
        approval.get("sudoAllowed") is False,
        approval.get("githubAllowed") is False,
        approval.get(
            "externalPublishingAllowed"
        ) is False,
        approval.get(
            "additionalPermissionsGranted"
        ) is False,
        isinstance(
            approval.get("entries"),
            list,
        ),
        len(approval.get("entries", [])) == 6,
    ]

    if not all(contract_checks):
        print(
            "ERROR: عقد الاستثناء المحدود غير صالح.",
            file=sys.stderr,
        )
        return 4

    approved = {
        entry["path"]: entry["sha256"]
        for entry in approval["entries"]
    }

    findings: list[dict[str, object]] = []
    allowed_references: list[dict[str, str]] = []

    reference_observations: list[dict[str, object]] = []

    seen_approved: set[str] = set()

    for current_root, directories, files in os.walk(
        target,
        topdown=True,
        followlinks=False,
    ):
        directories[:] = [
            directory
            for directory in directories
            if directory != ".git"
        ]

        for filename in files:
            path = Path(current_root) / filename

            if path.is_symlink() or not path.is_file():
                continue

            if path.stat().st_size > 16 * 1024 * 1024:
                continue

            raw = path.read_bytes()

            if b"\x00" in raw[:8192]:
                continue

            text = raw.decode(
                "utf-8",
                errors="replace",
            )

            relative = path.relative_to(
                target
            ).as_posix()

            findings.extend(
                scan_actual_secrets(
                    text,
                    relative,
                )
            )

            if not PRIVATE_REFERENCE.search(text):
                continue

            actual_hash = sha256_file(path)
            expected_hash = approved.get(relative)

            if expected_hash is not None:
                if actual_hash == expected_hash:
                    seen_approved.add(relative)

                    allowed_references.append({
                        "path": relative,
                        "sha256": actual_hash,
                        "classification":
                            "REFERENCE_ONLY_HASH_PINNED",
                    })
                else:
                    findings.append({
                        "path": relative,
                        "pattern":
                            "APPROVED_PATH_HASH_MISMATCH",
                        "actualSha256": actual_hash,
                        "expectedSha256": expected_hash,
                    })

                continue

            # لا موافقة ولا استثناء لهذا الملف.
            # سجّل فقط وجود مرجع نصي بعد فحصه
            # ضد PEM وTokens والقيم السرية الفعلية.
            reference_observations.append({
                "path": relative,
                "sha256": actual_hash,
                "classification":
                    "REFERENCE_TEXT_ONLY_NO_EXCEPTION",
                "permissionGranted": False,
                "actualSecretMaterialAllowed": False,
            })

    for relative, expected_hash in approved.items():
        if relative in seen_approved:
            continue

        findings.append({
            "path": relative,
            "pattern":
                "APPROVED_REFERENCE_MISSING_OR_UNVERIFIED",
            "expectedSha256": expected_hash,
        })

    allowed_references.sort(
        key=lambda item: item["path"]
    )

    reference_observations.sort(
        key=lambda item: str(item["path"])
    )

    passed = (
        len(findings) == 0
        and len(allowed_references) == 6
    )

    report = {
        "schemaVersion": "6.0.0",
        "system":
            "SHEIKHA_V6_HASH_PINNED_SECRET_GATE",
        "status": (
            "SECRET_GATE_VERIFIED"
            if passed
            else "SECRET_GATE_BLOCKED"
        ),
        "passed": passed,
        "defaultAuthorization": "DENY",
        "genericSecretScannerActive": True,
        "exactHashPinnedExceptionOnly": True,
        "actualSecretMaterialAllowed": False,
        "approvedReferenceCount":
            len(allowed_references),

        "referenceObservationCount":
            len(reference_observations),

        "findingCount": len(findings),

        "allowedReferences":
            allowed_references,

        "referenceObservations":
            reference_observations,

        "findings": findings,
        "networkUsed": False,
        "sudoUsed": False,
        "githubUsed": False,
        "additionalPermissionsGranted": False,
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
                "passed": report["passed"],
                "approvedReferenceCount":
                    report["approvedReferenceCount"],

                "referenceObservationCount":
                    report["referenceObservationCount"],

                "findingCount":
                    report["findingCount"],
                "genericSecretScannerActive":
                    report[
                        "genericSecretScannerActive"
                    ],
                "exactHashPinnedExceptionOnly":
                    report[
                        "exactHashPinnedExceptionOnly"
                    ],
            },
            ensure_ascii=False,
            indent=2,
        )
    )

    return 0 if passed else 28


if __name__ == "__main__":
    raise SystemExit(main())
