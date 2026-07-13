#!/usr/bin/env python3

from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import math
import re
import sys


SENSITIVE_ASSIGNMENT = re.compile(
    r"""(?ix)
    \b(
        private[_-]?key |
        dotenv_private_key(?:_[a-z0-9_-]+)? |
        client[_-]?secret |
        api[_-]?key |
        access[_-]?token |
        refresh[_-]?token |
        password |
        secret
    )\b
    \s*[:=]\s*
    (?:
        ["'`](?P<quoted>[^"'`\r\n]*)["'`] |
        (?P<bare>[A-Za-z0-9+/=_-]{8,})
    )
    """
)

KNOWN_TOKEN_PATTERNS = {
    "OPENAI_STYLE_TOKEN":
        re.compile(r"^sk-[A-Za-z0-9_-]{20,}$"),

    "GITHUB_TOKEN":
        re.compile(r"^gh[pousr]_[A-Za-z0-9]{20,}$"),

    "AWS_ACCESS_KEY":
        re.compile(r"^(?:AKIA|ASIA)[A-Z0-9]{16}$"),

    "JWT_TOKEN":
        re.compile(
            r"^eyJ[A-Za-z0-9_-]{10,}\."
            r"[A-Za-z0-9_-]{10,}\."
            r"[A-Za-z0-9_-]{10,}$"
        ),

    "PRIVATE_KEY_PEM":
        re.compile(
            r"-----BEGIN\s+"
            r"(?:(?:RSA|EC|DSA|OPENSSH|ENCRYPTED)\s+)?"
            r"PRIVATE\s+KEY-----",
            re.IGNORECASE,
        ),
}

PLACEHOLDER_MARKERS = (
    "...",
    "<",
    ">",
    "example",
    "sample",
    "placeholder",
    "dummy",
    "replace",
    "your ",
    "your_",
    "test",
    "fake",
    "private key>",
    "token>",
    "secret>",
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()

    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)

            if not chunk:
                break

            digest.update(chunk)

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


def contains_placeholder(value: str) -> bool:
    normalized = value.strip().lower()

    if not normalized:
        return True

    return any(
        marker in normalized
        for marker in PLACEHOLDER_MARKERS
    )


def classify_location(relative: str) -> str:
    normalized = relative.lower()
    parts = set(Path(normalized).parts)

    if (
        "readme" in Path(normalized).name
        or Path(normalized).suffix in {".md", ".mdx", ".rst"}
        or parts.intersection({
            "docs",
            "doc",
            "documentation",
            "examples",
            "example",
            "samples",
            "sample",
        })
    ):
        return "DOCUMENTATION_OR_EXAMPLE"

    if parts.intersection({
        "test",
        "tests",
        "__tests__",
        "fixtures",
        "fixture",
    }):
        return "TEST_OR_FIXTURE"

    if parts.intersection({
        "src",
        "lib",
        "build",
        "runtime",
        "dist",
    }):
        return "RUNTIME_OR_LIBRARY_CODE"

    return "OTHER"


def redact_line(line: str) -> str:
    match = SENSITIVE_ASSIGNMENT.search(line)

    if match:
        prefix = line[:match.start()]
        variable = match.group(1)

        return (
            f"{prefix}{variable}="
            "<REDACTED_SENSITIVE_VALUE>"
        ).rstrip()

    output = line

    for pattern in KNOWN_TOKEN_PATTERNS.values():
        output = pattern.sub(
            "<REDACTED_SECRET_PATTERN>",
            output,
        )

    if len(output) > 240:
        output = output[:240] + "…"

    return output.rstrip()


def inspect_finding(
    root: Path,
    finding: dict[str, object],
) -> dict[str, object]:
    relative = str(finding.get("path", ""))
    requested_line = int(finding.get("line", 0) or 0)

    result: dict[str, object] = {
        "path": relative,
        "reportedLine": requested_line,
        "reportedPattern": finding.get("pattern"),
        "reportedValueLength": finding.get("valueLength"),
        "reportedEntropy": finding.get("entropy"),
        "status": "BLOCKED_UNINSPECTED",
        "manualReviewRequired": True,
        "approvalGranted": False,
        "buildPermissionGranted": False,
    }

    if not relative or Path(relative).is_absolute():
        result["status"] = "BLOCKED_INVALID_PATH"
        return result

    lexical_path = root / relative

    try:
        resolved = lexical_path.resolve(strict=True)
    except OSError as error:
        result["status"] = "BLOCKED_SOURCE_FILE_MISSING"
        result["error"] = str(error)
        return result

    try:
        resolved.relative_to(root)
    except ValueError:
        result["status"] = "BLOCKED_PATH_ESCAPE"
        return result

    if lexical_path.is_symlink():
        result["status"] = "BLOCKED_SYMLINK"
        result["resolvedPath"] = str(resolved)
        return result

    if not resolved.is_file():
        result["status"] = "BLOCKED_NOT_REGULAR_FILE"
        return result

    raw = resolved.read_text(
        encoding="utf-8",
        errors="replace",
    )

    lines = raw.splitlines()

    if requested_line < 1:
        result["status"] = "BLOCKED_INVALID_LINE"
        return result

    candidate_indexes = range(
        max(0, requested_line - 4),
        min(len(lines), requested_line + 3),
    )

    matches: list[tuple[int, re.Match[str]]] = []

    for index in candidate_indexes:
        match = SENSITIVE_ASSIGNMENT.search(
            lines[index]
        )

        if match:
            matches.append((index, match))

    exact = [
        item
        for item in matches
        if item[0] == requested_line - 1
    ]

    selected: tuple[int, re.Match[str]] | None = None

    if len(exact) == 1:
        selected = exact[0]
    elif len(matches) == 1:
        selected = matches[0]

    if selected is None:
        result.update({
            "status":
                "BLOCKED_ASSIGNMENT_NOT_UNIQUELY_LOCATED",
            "nearbyAssignmentCount": len(matches),
            "fileSha256": sha256_file(resolved),
            "bytes": resolved.stat().st_size,
        })
        return result

    line_index, match = selected

    value = (
        match.group("quoted")
        if match.group("quoted") is not None
        else match.group("bare") or ""
    )

    known_patterns = [
        name
        for name, pattern
        in KNOWN_TOKEN_PATTERNS.items()
        if pattern.search(value)
    ]

    value_entropy = round(
        entropy(value),
        3,
    )

    placeholder = contains_placeholder(value)
    location = classify_location(relative)

    stripped = lines[line_index].lstrip()

    comment_or_documentation = (
        location in {
            "DOCUMENTATION_OR_EXAMPLE",
            "TEST_OR_FIXTURE",
        }
        or stripped.startswith((
            "#",
            "//",
            "*",
            "<!--",
        ))
    )

    reported_length = finding.get("valueLength")
    reported_entropy = finding.get("entropy")

    length_matches = (
        reported_length is None
        or int(reported_length) == len(value)
    )

    entropy_matches = (
        reported_entropy is None
        or abs(
            float(reported_entropy)
            - value_entropy
        ) <= 0.01
    )

    if known_patterns:
        disposition = "BLOCKED_KNOWN_SECRET_PATTERN"
    elif (
        placeholder
        and comment_or_documentation
    ):
        disposition = (
            "PLACEHOLDER_DOCUMENTATION_CANDIDATE"
        )
    elif placeholder:
        disposition = "PLACEHOLDER_CODE_REVIEW_REQUIRED"
    elif comment_or_documentation:
        disposition = (
            "DOCUMENTATION_VALUE_REVIEW_REQUIRED"
        )
    else:
        disposition = (
            "POTENTIAL_SECRET_MANUAL_REVIEW_REQUIRED"
        )

    context_start = max(0, line_index - 2)
    context_end = min(len(lines), line_index + 3)

    context = [
        {
            "line": index + 1,
            "text": redact_line(lines[index]),
        }
        for index in range(
            context_start,
            context_end,
        )
    ]

    result.update({
        "status": disposition,
        "resolvedLine": line_index + 1,
        "variable": match.group(1),
        "valueLength": len(value),
        "valueEntropy": value_entropy,
        "reportedLengthMatches": length_matches,
        "reportedEntropyMatches": entropy_matches,
        "placeholderIndicator": placeholder,
        "locationCategory": location,
        "commentOrDocumentationContext":
            comment_or_documentation,
        "knownSecretPatterns": known_patterns,
        "fileSha256": sha256_file(resolved),
        "bytes": resolved.stat().st_size,
        "redactedContext": context,
        "actualValueStored": False,
        "actualValuePrinted": False,
    })

    return result


def main() -> int:
    if len(sys.argv) != 4:
        print(
            "Usage: review.py "
            "<repository-root> <source-report> <output-report>",
            file=sys.stderr,
        )
        return 2

    root = Path(sys.argv[1]).resolve()
    source_path = Path(sys.argv[2]).resolve()
    output_path = Path(sys.argv[3]).resolve()

    if not (root / ".git").exists():
        print(
            "Repository root validation failed.",
            file=sys.stderr,
        )
        return 3

    source = json.loads(
        source_path.read_text(encoding="utf-8")
    )

    findings = source.get("findings", [])

    if not isinstance(findings, list):
        print(
            "Secret report findings are invalid.",
            file=sys.stderr,
        )
        return 4

    pattern_counts = Counter(
        str(item.get("pattern", "MISSING_PATTERN"))
        for item in findings
    )

    permitted_patterns = {
        "UNAPPROVED_PRIVATE_KEY_REFERENCE",
        "HIGH_ENTROPY_SENSITIVE_ASSIGNMENT",
    }

    unexpected_patterns = sorted(
        pattern
        for pattern in pattern_counts
        if pattern not in permitted_patterns
    )

    high_entropy = [
        item
        for item in findings
        if item.get("pattern") ==
        "HIGH_ENTROPY_SENSITIVE_ASSIGNMENT"
    ]

    preconditions = {
        "sourceSystemValid":
            source.get("system") ==
            "SHEIKHA_V6_HASH_PINNED_SECRET_GATE",

        "sourceStatusBlocked":
            source.get("status") ==
            "SECRET_GATE_BLOCKED",

        "sourcePassedFalse":
            source.get("passed") is False,

        "genericSecretScannerActive":
            source.get(
                "genericSecretScannerActive"
            ) is True,

        "findingCountMatches":
            source.get("findingCount") ==
            len(findings),

        "highEntropyFindingCountIsNine":
            len(high_entropy) == 9,

        "unexpectedPatternCountIsZero":
            len(unexpected_patterns) == 0,
    }

    if not all(preconditions.values()):
        report = {
            "schemaVersion": "6.0.0",
            "system":
                "SHEIKHA_V6_HIGH_ENTROPY_SECRET_REVIEW",
            "status": "BLOCKED_INVALID_SOURCE_REPORT",
            "preconditions": preconditions,
            "countsByPattern":
                dict(sorted(pattern_counts.items())),
            "unexpectedPatterns":
                unexpected_patterns,
            "approvalGranted": False,
            "buildPermissionGranted": False,
            "generatedAt": datetime.now(
                timezone.utc
            ).isoformat(),
        }

        output_path.write_text(
            json.dumps(
                report,
                ensure_ascii=False,
                indent=2,
            ) + "\n",
            encoding="utf-8",
        )

        print(
            json.dumps(
                report,
                ensure_ascii=False,
                indent=2,
            )
        )

        return 5

    reviews = [
        inspect_finding(root, finding)
        for finding in high_entropy
    ]

    blocked_statuses = {
        "BLOCKED_INVALID_PATH",
        "BLOCKED_SOURCE_FILE_MISSING",
        "BLOCKED_PATH_ESCAPE",
        "BLOCKED_SYMLINK",
        "BLOCKED_NOT_REGULAR_FILE",
        "BLOCKED_INVALID_LINE",
        "BLOCKED_ASSIGNMENT_NOT_UNIQUELY_LOCATED",
        "BLOCKED_KNOWN_SECRET_PATTERN",
    }

    hard_blocked = [
        item
        for item in reviews
        if item["status"] in blocked_statuses
    ]

    potential_secrets = [
        item
        for item in reviews
        if item["status"] ==
        "POTENTIAL_SECRET_MANUAL_REVIEW_REQUIRED"
    ]

    status = (
        "BLOCKED_HIGH_ENTROPY_REVIEW"
        if hard_blocked
        else "MANUAL_REVIEW_REQUIRED"
    )

    report = {
        "schemaVersion": "6.0.0",
        "system":
            "SHEIKHA_V6_HIGH_ENTROPY_SECRET_REVIEW",
        "status": status,
        "scope":
            "EXACT_NINE_HIGH_ENTROPY_FINDINGS_ONLY",
        "defaultAuthorization": "DENY",
        "sourceReport": str(source_path),
        "sourceFindingCount": len(findings),
        "countsByPattern":
            dict(sorted(pattern_counts.items())),
        "reviewedFindingCount": len(reviews),
        "hardBlockedCount": len(hard_blocked),
        "potentialSecretCount":
            len(potential_secrets),
        "allValuesRedacted": True,
        "actualValuesStored": False,
        "actualValuesPrinted": False,
        "automaticExceptionGranted": False,
        "secretExceptionGranted": False,
        "buildPermissionGranted": False,
        "networkUsed": False,
        "sudoUsed": False,
        "filesModified": False,
        "reviews": reviews,
        "policy": {
            "knownSecretPatternAllowed": False,
            "highEntropyValueAutoApproved": False,
            "pathOnlyExceptionAllowed": False,
            "manualReviewRequired": True,
            "defaultAuthorization": "DENY",
            "principle": "لا ضرر ولا ضرار",
            "referenceFramework":
                "الكتاب والسنة وسنة الرسول محمد "
                "صلى الله عليه وسلم وسنة الخلفاء "
                "الراشدين المهديين",
        },
        "generatedAt": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path.write_text(
        json.dumps(
            report,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    summary = {
        "system": report["system"],
        "status": report["status"],
        "reviewedFindingCount":
            report["reviewedFindingCount"],
        "hardBlockedCount":
            report["hardBlockedCount"],
        "potentialSecretCount":
            report["potentialSecretCount"],
        "automaticExceptionGranted": False,
        "secretExceptionGranted": False,
        "buildPermissionGranted": False,
        "networkUsed": False,
        "filesModified": False,
        "reviews": [
            {
                "path": item["path"],
                "reportedLine":
                    item["reportedLine"],
                "resolvedLine":
                    item.get("resolvedLine"),
                "status": item["status"],
                "variable":
                    item.get("variable"),
                "valueLength":
                    item.get("valueLength"),
                "valueEntropy":
                    item.get("valueEntropy"),
                "placeholderIndicator":
                    item.get(
                        "placeholderIndicator"
                    ),
                "locationCategory":
                    item.get("locationCategory"),
                "commentOrDocumentationContext":
                    item.get(
                        "commentOrDocumentationContext"
                    ),
                "knownSecretPatterns":
                    item.get(
                        "knownSecretPatterns",
                        [],
                    ),
                "fileSha256":
                    item.get("fileSha256"),
                "redactedContext":
                    item.get("redactedContext", []),
            }
            for item in reviews
        ],
    }

    print(
        json.dumps(
            summary,
            ensure_ascii=False,
            indent=2,
        )
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
