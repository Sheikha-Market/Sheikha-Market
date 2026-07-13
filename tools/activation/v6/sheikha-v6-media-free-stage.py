#!/usr/bin/env python3

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import os
import sys


MEDIA_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp",
    ".avif", ".bmp", ".tif", ".tiff", ".svg",
    ".ico", ".mp4", ".mov", ".mkv", ".avi",
    ".webm", ".mp3", ".wav", ".ogg", ".m4a",
    ".flac",
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


def detect_signature(path: Path) -> str | None:
    if path.is_symlink() or not path.is_file():
        return None

    try:
        data = path.read_bytes()[:8192]
    except OSError:
        return None

    stripped = data.lstrip()
    lowered = stripped.lower()

    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "PNG"

    if data.startswith(b"\xff\xd8\xff"):
        return "JPEG"

    if data.startswith((b"GIF87a", b"GIF89a")):
        return "GIF"

    if (
        data.startswith(b"RIFF")
        and len(data) >= 12
        and data[8:12] == b"WEBP"
    ):
        return "WEBP"

    if (
        data.startswith(b"RIFF")
        and len(data) >= 12
        and data[8:12] == b"WAVE"
    ):
        return "WAV"

    if data.startswith(b"OggS"):
        return "OGG"

    if data.startswith(b"fLaC"):
        return "FLAC"

    if data.startswith(b"BM"):
        return "BMP"

    if data.startswith((b"II*\x00", b"MM\x00*")):
        return "TIFF"

    if data.startswith(b"\x00\x00\x01\x00"):
        return "ICO"

    if (
        len(data) >= 12
        and data[4:8] == b"ftyp"
    ):
        return "MP4_OR_MOV"

    if lowered.startswith(b"<svg"):
        return "SVG"

    if (
        lowered.startswith(b"<?xml")
        and b"<svg" in lowered[:4096]
    ):
        return "SVG_XML"

    return None


def is_media(path: Path) -> tuple[bool, str | None]:
    extension_match = (
        path.suffix.lower() in MEDIA_EXTENSIONS
    )

    signature = detect_signature(path)

    return extension_match or signature is not None, signature


def scan(target: Path) -> list[dict[str, object]]:
    found: list[dict[str, object]] = []

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
            detected, signature = is_media(path)

            if not detected:
                continue

            found.append({
                "path": path.relative_to(target).as_posix(),
                "absolutePath": str(path),
                "extension": path.suffix.lower(),
                "signature": signature,
                "bytes": path.lstat().st_size,
                "symlink": path.is_symlink(),
            })

    found.sort(key=lambda row: str(row["path"]))

    return found


def main() -> int:
    if len(sys.argv) != 4:
        print(
            "Usage: media-free-stage.py "
            "<candidate-root> <exclusion-report> <policy-report>",
            file=sys.stderr,
        )
        return 2

    target = Path(sys.argv[1]).resolve()
    exclusion_report = Path(sys.argv[2]).resolve()
    policy_report = Path(sys.argv[3]).resolve()

    target_text = target.as_posix()

    allowed_target = (
        target_text.startswith(
            "/tmp/sheikha-v6-build-"
        )
        and "/package-root/" in target_text
    )

    if not allowed_target:
        print(
            "رفض حذف أي ملف خارج مجلد V6 المؤقت.",
            file=sys.stderr,
        )
        print(f"TARGET={target}", file=sys.stderr)
        return 3

    if not target.is_dir():
        print(
            f"Candidate root does not exist: {target}",
            file=sys.stderr,
        )
        return 4

    detected_before = scan(target)
    excluded: list[dict[str, object]] = []

    for item in detected_before:
        path = Path(str(item["absolutePath"]))

        record = {
            key: value
            for key, value in item.items()
            if key != "absolutePath"
        }

        if path.is_symlink():
            link_target = os.readlink(path)

            record["linkTarget"] = link_target
            record["sha256"] = hashlib.sha256(
                link_target.encode("utf-8")
            ).hexdigest()

            path.unlink()
        elif path.is_file():
            record["sha256"] = sha256_file(path)
            path.unlink()
        else:
            continue

        excluded.append(record)

    # إزالة المجلدات الفارغة داخل staging فقط.
    for current_root, directories, _ in os.walk(
        target,
        topdown=False,
        followlinks=False,
    ):
        for directory in directories:
            path = Path(current_root) / directory

            if path == target or path.is_symlink():
                continue

            try:
                path.rmdir()
            except OSError:
                pass

    remaining = scan(target)
    passed = len(remaining) == 0

    generated_at = datetime.now(
        timezone.utc
    ).isoformat()

    exclusion = {
        "schemaVersion": "6.0.0",
        "system":
            "SHEIKHA_V6_MEDIA_FREE_SERVER_RUNTIME_PROFILE",
        "status": (
            "MEDIA_FREE_CANDIDATE_VERIFIED"
            if passed
            else "MEDIA_EXCLUSION_FAILED"
        ),
        "profile":
            "NO_VISUAL_AUDIO_MEDIA_SERVER_RUNTIME",
        "target": str(target),
        "sourceRepositoryModified": False,
        "candidateTemporaryStagingOnly": True,
        "automaticApprovalUsed": False,
        "humanMediaApprovalClaimed": False,
        "livingBeingImagesIncluded": False,
        "prohibitedMediaIncluded": False,
        "detectedBeforeCount": len(detected_before),
        "excludedCount": len(excluded),
        "excludedBytes": sum(
            int(item["bytes"])
            for item in excluded
        ),
        "remainingMediaCount": len(remaining),
        "excluded": excluded,
        "remaining": remaining,
        "principle": "لا ضرر ولا ضرار",
        "generatedAt": generated_at,
    }

    policy = {
        "schemaVersion": "6.0.0",
        "system":
            "SHEIKHA_V6_VISUAL_MEDIA_GOVERNANCE_GATE",
        "status": (
            "PASSED_MEDIA_FREE_STAGING"
            if passed
            else "BLOCKED_MEDIA_REMAINS"
        ),
        "policy": {
            "defaultAuthorization": "DENY",
            "livingBeingImagesAllowed": False,
            "prohibitedVisualContentAllowed": False,
            "prohibitedAudioContentAllowed": False,
            "automaticApprovalAllowed": False,
            "allUnreviewedMediaExcluded": True,
            "sourceRepositoryModificationAllowed": False,
            "candidateStagingOnly": True,
            "principle": "لا ضرر ولا ضرار",
        },
        "target": str(target),
        "detectedMediaCount": len(remaining),
        "approvedMediaCount": 0,
        "unapprovedMediaCount": len(remaining),
        "mediaIncludedCount": len(remaining),
        "excludedMediaCount": len(excluded),
        "remaining": remaining,
        "generatedAt": generated_at,
    }

    exclusion_report.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    policy_report.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    exclusion_report.write_text(
        json.dumps(
            exclusion,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    policy_report.write_text(
        json.dumps(
            policy,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "exclusionStatus":
                    exclusion["status"],
                "policyStatus":
                    policy["status"],
                "detectedBeforeCount":
                    len(detected_before),
                "excludedCount":
                    len(excluded),
                "excludedBytes":
                    exclusion["excludedBytes"],
                "remainingMediaCount":
                    len(remaining),
                "sourceRepositoryModified":
                    False,
                "candidateTemporaryStagingOnly":
                    True,
                "automaticApprovalUsed":
                    False,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

    return 0 if passed else 5


if __name__ == "__main__":
    raise SystemExit(main())
