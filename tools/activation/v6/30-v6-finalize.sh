#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${SHEIKHA_ROOT:-$HOME/Projects/sheikha/sheikha-main-portal}"
REPORT="runtime/distribution/v6/sheikha-linux-deb-native-lifecycle-v6-report.json"
TAG="sheikha-linux-deb-native-v6"
COMMIT_MESSAGE="Verify Sheikha Linux DEB native lifecycle v6"
BACKUP_ROOT="$HOME/Backups/sheikha"

cd "$ROOT"

node <<'NODE'
const report =
  require('./runtime/distribution/v6/' +
    'sheikha-linux-deb-native-lifecycle-v6-report.json');

const required = [
  report.status === 'DEB_NATIVE_LIFECYCLE_VERIFIED',
  report.baselineInstalled === true,
  report.baselineLaunched === true,
  report.upgradeExecuted === true,
  report.upgradeVerified === true,
  report.removeExecuted === true,
  report.removeVerified === true,
  report.purgeExecuted === true,
  report.purgeVerified === true,
  report.rollbackExecuted === true,
  report.rollbackVerified === true,
  report.healthVerified === true,
  report.cliVerified === true,
  report.cleanShutdownVerified === true,
  report.noRemainingProcesses === true,
  report.noRemainingPorts === true,
  report.externalNetworkUsed === false,
  report.hostPackagesInstalled === false,
  report.nativeVerified === true,
  report.canonicalPromotionAllowed === true
];

if (!required.every(Boolean)) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(80);
}

console.log('SHEIKHA_V6_REPORT_GATE_PASSED');
NODE

node --check \
  distribution/pipeline/sheikha-linux-package-native-verification-v5.js

find runtime/distribution/v6 distribution/manifest \
  -type f -name '*.json' -print0 |
  xargs -0 -n1 node -e '
    const fs = require("node:fs");
    JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  '

npm test -- \
  --runTestsByPath \
  tests/sheikha-universal-delivery-v2.test.js \
  tests/sheikha-linux-package-native-verification-v5.test.js \
  tests/sheikha-linux-deb-native-lifecycle-v6.test.js \
  --runInBand

npm run lint
git diff --check

EXCLUDED=(
  "public/executive-civilization-control-center/identity.health.json"
  "runtime/community/sheikha-community-modeling-report.json"
  "runtime/identity/sheikha-active-identity-v2-report.json"
  "runtime/master-activation/sheikha-master-external-accreditation-verification-v1.json"
  "runtime/production-hardening/sheikha-production-hardening-closure-v1-report.json"
)

git add -- \
  tools/activation/v6 \
  runtime/distribution/v6 \
  distribution/manifest/sheikha-target-status-v6.json \
  package.json \
  tests/sheikha-linux-deb-native-lifecycle-v6.test.js

for file in "${EXCLUDED[@]}"; do
  if git diff --cached --name-only | grep -Fxq "$file"; then
    echo "ERROR: ملف مستبعد دخل staging: $file"
    exit 81
  fi
done

git diff --cached --check
git diff --cached --stat
git status --short

git commit -m "$COMMIT_MESSAGE"
git push local-registry main

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "ERROR: الوسم موجود مسبقًا: $TAG"
  exit 82
fi

git tag -a "$TAG" \
  -m "Sheikha Linux DEB native lifecycle v6"

git push local-registry "$TAG"

mkdir -p "$BACKUP_ROOT"

BUNDLE="$BACKUP_ROOT/sheikha-linux-deb-native-v6.bundle"

if [[ -e "$BUNDLE" ]]; then
  STAMP="$(date +%Y%m%d-%H%M%S)"
  BUNDLE="$BACKUP_ROOT/sheikha-linux-deb-native-v6-$STAMP.bundle"
fi

git bundle create "$BUNDLE" main "$TAG"
git bundle verify "$BUNDLE"

SHA="$(sha256sum "$BUNDLE" | awk '{print $1}')"
BYTES="$(stat -c '%s' "$BUNDLE")"

RESTORE_ROOT="$(
  mktemp -d "$BACKUP_ROOT/v6-restore-test-XXXXXX"
)"

git clone "$BUNDLE" "$RESTORE_ROOT/repository"

git -C "$RESTORE_ROOT/repository" \
  switch -c main --track origin/main

git -C "$RESTORE_ROOT/repository" \
  fsck --full --strict

RESTORED_HEAD="$(
  git -C "$RESTORE_ROOT/repository" rev-parse HEAD
)"

CURRENT_HEAD="$(git rev-parse HEAD)"

if [[ "$RESTORED_HEAD" != "$CURRENT_HEAD" ]]; then
  echo "ERROR: Restore HEAD غير مطابق."
  exit 83
fi

node - "$RESTORE_ROOT/repository" <<'NODE'
const path = require('node:path');
const fs = require('node:fs');

const root = process.argv[2];
const file = path.join(
  root,
  'runtime/distribution/v6/' +
    'sheikha-linux-deb-native-lifecycle-v6-report.json'
);

const report = JSON.parse(fs.readFileSync(file, 'utf8'));

if (
  report.status !== 'DEB_NATIVE_LIFECYCLE_VERIFIED' ||
  report.nativeVerified !== true ||
  report.canonicalPromotionAllowed !== true
) {
  process.exit(84);
}

console.log('SHEIKHA_V6_RESTORE_STATIC_OK');
NODE

echo
echo "SHEIKHA_V6_FINALIZED"
echo "HEAD=$(git rev-parse HEAD)"
echo "LOCAL_REGISTRY=$(git rev-parse local-registry/main)"
echo "TAG=$TAG"
echo "BUNDLE=$BUNDLE"
echo "BUNDLE_BYTES=$BYTES"
echo "BUNDLE_SHA256=$SHA"
echo "RESTORE=$RESTORE_ROOT/repository"
echo
git status --short
