#!/usr/bin/env python3

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import os
import sys


MEDIA_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".avif",
    ".bmp",
    ".tif",
    ".tiff",
    ".svg",
    ".ico",
    ".mp4",
    ".mov",
    ".mkv",
    ".avi",
    ".webm",
    ".mp3",
    ".wav",
    ".ogg",
    ".m4a",
    ".flac",
}


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()

    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)

            if not chunk:
                break

            digest.update(chunk)

    return digest.hexdigest()


def media_signature(path: Path) -> str | None:
    if path.is_symlink() or not path.is_file():
        return None

    try:
        with path.open("rb") as handle:
            data = handle.read(8192)
    except OSError:
        return None

    stripped = data.lstrip()

    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "PNG"

    if data.startswith(b"\xff\xd8\xff"):
        return "JPEG"

    if data.startswith((b"GIF87a", b"GIF89a")):
        return "GIF"

    if (
        data.startswith(b"RIFF")
        and data[8:12] == b"WEBP"
    ):
        return "WEBP"

    if (
        data.startswith(b"RIFF")
        and data[8:12] == b"WAVE"
    ):
        return "WAV"

    if data.startswith(b"OggS"):
        return "OGG"

    if data.startswith(b"fLaC"):
        return "FLAC"

    if data.startswith(b"BM"):
        return "BMP"

    if data.startswith(
        (b"II*\x00", b"MM\x00*")
    ):
        return "TIFF"

    if data.startswith(b"\x00\x00\x01\x00"):
        return "ICO"

    if (
        len(data) >= 12
        and data[4:8] == b"ftyp"
    ):
        return "MP4_OR_MOV"

    lowered = stripped[:2048].lower()

    if lowered.startswith(b"<svg"):
        return "SVG"

    if (
        lowered.startswith(b"<?xml")
        and b"<svg" in lowered
    ):
        return "SVG_XML"

    return None


def main() -> int:
    if len(sys.argv) != 3:
        print(
            "Usage: exclude.py <candidate-root> <report-path>",
            file=sys.stderr,
        )
        return 2

    target = Path(sys.argv[1]).resolve()
    report_path = Path(sys.argv[2]).resolve()

    target_text = target.as_posix()

    valid_temporary_target = (
        target_text.startswith(
            "/tmp/sheikha-v6-build-"
        )
        and "/package-root/" in target_text
    )

    if not valid_temporary_target:
        print(
            "رفض حذف وسائط خارج مجلد V6 المؤقت.",
            file=sys.stderr,
        )
        print(
            f"TARGET={target}",
            file=sys.stderr,
        )
        return 3

    if not target.is_dir():
        print(
            f"Candidate root missing: {target}",
            file=sys.stderr,
        )
        return 4

    excluded: list[dict[str, object]] = []

    for current_root, directories, files in os.walk(
        target,
        topdown=True,
        followlinks=False,
    ):
        directories[:] = [
            name
            for name in directories
            if name != ".git"
        ]

        for filename in files:
            path = Path(current_root) / filename

            extension_match = (
                path.suffix.lower()
                in MEDIA_EXTENSIONS
            )

            signature = media_signature(path)

            if not extension_match and signature is None:
                continue

            relative = path.relative_to(
                target
            ).as_posix()

            metadata: dict[str, object] = {
                "path": relative,
                "extension": path.suffix.lower(),
                "bytes": path.lstat().st_size,
                "detectedByExtension":
                    extension_match,
                "detectedSignature":
                    signature,
                "wasSymlink":
                    path.is_symlink(),
            }

            if path.is_symlink():
                link_target = os.readlink(path)

                metadata["linkTarget"] = link_target
                metadata["sha256"] = hashlib.sha256(
                    link_target.encode("utf-8")
                ).hexdigest()

                path.unlink()
            else:
                metadata["sha256"] = sha256_file(
                    path
                )

                path.unlink()

            excluded.append(metadata)

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

    remaining: list[dict[str, str]] = []

    for current_root, _, files in os.walk(
        target,
        followlinks=False,
    ):
        for filename in files:
            path = Path(current_root) / filename

            extension_match = (
                path.suffix.lower()
                in MEDIA_EXTENSIONS
            )

            signature = media_signature(path)

            if extension_match or signature is not None:
                remaining.append({
                    "path": path.relative_to(
                        target
                    ).as_posix(),
                    "signature":
                        signature or "EXTENSION",
                })

    excluded.sort(
        key=lambda item: str(item["path"])
    )

    remaining.sort(
        key=lambda item: item["path"]
    )

    passed = len(remaining) == 0

    report = {
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
        "policy": {
            "defaultAuthorization": "DENY",
            "livingBeingImagesAllowed": False,
            "prohibitedMediaAllowed": False,
            "automaticApprovalUsed": False,
            "humanReviewBypassed": False,
            "allUnreviewedMediaExcluded": True,
            "principle": "لا ضرر ولا ضرار",
        },
        "target": str(target),
        "sourceRepositoryModified": False,
        "candidateTemporaryStagingOnly": True,
        "excludedCount": len(excluded),
        "excludedBytes": sum(
            int(item["bytes"])
            for item in excluded
        ),
        "remainingMediaCount": len(remaining),
        "excluded": excluded,
        "remaining": remaining,
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
            report,
            ensure_ascii=False,
            indent=2,
        )
    )

    return 0 if passed else 5


if __name__ == "__main__":
    raise SystemExit(main())
