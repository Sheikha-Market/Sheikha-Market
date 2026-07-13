#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${SHEIKHA_ROOT:-$HOME/Projects/sheikha/sheikha-main-portal}"
TARGET="${1:-}"

ENGINE="$ROOT/tools/activation/v6/sheikha-v6-media-free-stage.py"
EVIDENCE="$ROOT/runtime/distribution/v6/evidence"
EXCLUSION_REPORT="$EVIDENCE/media-exclusion-manifest.json"
POLICY_REPORT="$EVIDENCE/media-policy-report.json"

cd "$ROOT"

if [[ -z "$TARGET" ]]; then
  echo "ERROR: يلزم مسار Candidate staging."
  exit 90
fi

TARGET="$(readlink -f "$TARGET")"

case "$TARGET" in
  /tmp/sheikha-v6-build-*/package-root/*)
    ;;
  *)
    echo "ERROR: يرفض استبعاد الوسائط خارج V6 staging."
    echo "TARGET=$TARGET"
    exit 91
    ;;
esac

if [[ ! -d "$TARGET" ]]; then
  echo "ERROR: Candidate staging غير موجود."
  exit 92
fi

if [[ ! -f "$ENGINE" ]]; then
  echo "ERROR: محرك Media-Free غير موجود."
  exit 93
fi

mkdir -p "$EVIDENCE"

python3 -m py_compile "$ENGINE"

python3 \
  "$ENGINE" \
  "$TARGET" \
  "$EXCLUSION_REPORT" \
  "$POLICY_REPORT"

node - \
  "$EXCLUSION_REPORT" \
  "$POLICY_REPORT" <<'NODE'
const fs = require('node:fs');

const exclusion = JSON.parse(
  fs.readFileSync(process.argv[2], 'utf8')
);

const policy = JSON.parse(
  fs.readFileSync(process.argv[3], 'utf8')
);

const passed = [
  exclusion.status ===
    'MEDIA_FREE_CANDIDATE_VERIFIED',
  exclusion.profile ===
    'NO_VISUAL_AUDIO_MEDIA_SERVER_RUNTIME',
  exclusion.remainingMediaCount === 0,
  exclusion.sourceRepositoryModified === false,
  exclusion.candidateTemporaryStagingOnly === true,
  exclusion.automaticApprovalUsed === false,
  exclusion.livingBeingImagesIncluded === false,
  exclusion.prohibitedMediaIncluded === false,
  policy.status ===
    'PASSED_MEDIA_FREE_STAGING',
  policy.detectedMediaCount === 0,
  policy.mediaIncludedCount === 0,
  policy.policy?.defaultAuthorization === 'DENY',
  policy.policy?.automaticApprovalAllowed === false,
  policy.policy?.livingBeingImagesAllowed === false,
  policy.policy?.prohibitedVisualContentAllowed === false,
  policy.policy?.prohibitedAudioContentAllowed === false
].every(Boolean);

if (!passed) {
  console.error(JSON.stringify({
    exclusion,
    policy
  }, null, 2));

  process.exit(94);
}

console.log(
  'SHEIKHA_V6_MEDIA_FREE_CANDIDATE_VERIFIED'
);

console.log(
  'SHEIKHA_V6_CONTENT_POLICY_PASSED'
);
NODE
