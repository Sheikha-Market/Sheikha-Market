#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

COMMIT="${1:-HEAD}"
OUTPUT="${2:-$HOME/Sheikha-Releases}"

mkdir -p "$OUTPUT"

FULL_COMMIT="$(git rev-parse "$COMMIT^{commit}")"
SHORT_COMMIT="$(git rev-parse --short=12 "$FULL_COMMIT")"
STAMP="$(date +%Y%m%d-%H%M%S)"

ARCHIVE="$OUTPUT/sheikha-$SHORT_COMMIT-$STAMP.tar.gz"
CHECKSUM="$ARCHIVE.sha256"
MANIFEST="$ARCHIVE.manifest.json"

git archive \
  --format=tar.gz \
  --prefix=sheikha-main-portal/ \
  --output="$ARCHIVE" \
  "$FULL_COMMIT"

SHA256="$(sha256sum "$ARCHIVE" | awk '{print $1}')"

printf '%s  %s\n' \
  "$SHA256" \
  "$(basename "$ARCHIVE")" \
  > "$CHECKSUM"

python3 - \
  "$MANIFEST" \
  "$FULL_COMMIT" \
  "$ARCHIVE" \
  "$SHA256" <<'PY'
from datetime import datetime, timezone
from pathlib import Path
import json
import sys

manifest, commit, archive, sha256 = sys.argv[1:]

record = {
    "schemaVersion": "2.0.0",
    "system":
        "SHEIKHA_PROVIDER_INDEPENDENT_RELEASE_V2",
    "commit": commit,
    "archive": archive,
    "sha256": sha256,
    "externalGitProviderRequired": False,
    "deploymentTransport": "SSH_OR_SFTP",
    "automaticProductionDeployment": False,
    "humanApprovalRequired": True,
    "createdAt":
        datetime.now(timezone.utc).isoformat()
}

Path(manifest).write_text(
    json.dumps(
        record,
        ensure_ascii=False,
        indent=2
    ) + "\n",
    encoding="utf-8"
)
PY

(
  cd "$OUTPUT"
  sha256sum -c "$(basename "$CHECKSUM")"
)

echo "RELEASE_COMMIT=$FULL_COMMIT"
echo "RELEASE_ARCHIVE=$ARCHIVE"
echo "RELEASE_SHA256=$SHA256"
echo "RELEASE_MANIFEST=$MANIFEST"
echo "EXTERNAL_PROVIDER_REQUIRED=false"
echo "SHEIKHA_PROVIDER_INDEPENDENT_RELEASE_V2_VERIFIED"
