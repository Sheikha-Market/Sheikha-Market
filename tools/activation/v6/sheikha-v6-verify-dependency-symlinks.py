#!/usr/bin/env python3

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
import sys


def main() -> int:
    if len(sys.argv) != 3:
        print(
            "Usage: checker.py <node_modules_root> <report_path>",
            file=sys.stderr,
        )
        return 2

    root = Path(sys.argv[1]).resolve()
    report_path = Path(sys.argv[2]).resolve()

    if not root.is_dir():
        result = {
            "schemaVersion": "6.0.0",
            "system": "SHEIKHA_V6_DEPENDENCY_SYMLINK_GATE",
            "status": "FAILED_NODE_MODULES_ROOT_MISSING",
            "root": str(root),
            "violations": [],
            "violationCount": 0,
            "defaultAuthorization": "DENY",
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
                result,
                ensure_ascii=False,
                indent=2,
            ) + "\n",
            encoding="utf-8",
        )

        print(
            json.dumps(
                result,
                ensure_ascii=False,
                indent=2,
            )
        )

        return 3

    violations: list[dict[str, str]] = []
    checked_symlink_count = 0

    for item in root.rglob("*"):
        if not item.is_symlink():
            continue

        checked_symlink_count += 1

        relative = item.relative_to(root).as_posix()

        try:
            resolved = item.resolve(strict=True)
        except OSError as error:
            violations.append({
                "path": relative,
                "status": "BROKEN_SYMLINK",
                "error": str(error),
            })
            continue

        try:
            resolved.relative_to(root)
        except ValueError:
            violations.append({
                "path": relative,
                "status": "SYMLINK_ESCAPES_DEPENDENCY_ROOT",
                "resolved": str(resolved),
            })

    passed = len(violations) == 0

    result = {
        "schemaVersion": "6.0.0",
        "system": "SHEIKHA_V6_DEPENDENCY_SYMLINK_GATE",
        "status": (
            "DEPENDENCY_SYMLINKS_VERIFIED"
            if passed
            else "BLOCKED_UNSAFE_DEPENDENCY_SYMLINKS"
        ),
        "root": str(root),
        "checkedSymlinkCount": checked_symlink_count,
        "violationCount": len(violations),
        "violations": violations,
        "externalFilesystemAccessAllowed": False,
        "defaultAuthorization": "DENY",
        "networkUsed": False,
        "hostPrivilegesUsed": False,
        "principle": "لا ضرر ولا ضرار",
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
            result,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    print(
        json.dumps(
            result,
            ensure_ascii=False,
            indent=2,
        )
    )

    return 0 if passed else 4


if __name__ == "__main__":
    raise SystemExit(main())
