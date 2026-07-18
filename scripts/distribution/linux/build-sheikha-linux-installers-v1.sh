#!/usr/bin/env bash
set -Eeuo pipefail

export LC_ALL=C.UTF-8
export LANG=C.UTF-8

ROOT="$(git rev-parse --show-toplevel)"
TARGET="${1:-}"
OUTPUT_DIR="${2:-$ROOT/dist/native-build/linux/$TARGET}"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$OUTPUT_DIR/build-$STAMP.log"
RESULT_FILE="$OUTPUT_DIR/build-result-$STAMP.json"

case "$TARGET" in
  x64|arm32|arm64|snap) ;;
  *)
    echo "Usage: $0 <x64|arm32|arm64|snap> [output-dir]" >&2
    exit 20
    ;;
esac

[[ "$(uname -s)" == "Linux" ]] || {
  echo "NATIVE_PLATFORM_MISMATCH=true" >&2
  exit 21
}

mkdir -p "$OUTPUT_DIR"

node - "$ROOT/package.json" "$TARGET" > "$OUTPUT_DIR/selected-script.txt" <<'NODE'
const fs = require('node:fs');

const packageJsonPath = process.argv[2];
const target = process.argv[3];
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const scripts = packageJson.scripts || {};

const candidates = target === 'snap'
  ? [
      'sheikha:dist:snap',
      'dist:snap',
      'build:snap',
      'package:snap'
    ]
  : [
      `sheikha:dist:linux:${target}`,
      `dist:linux:${target}`,
      `build:linux:${target}`,
      `package:linux:${target}`,
      'sheikha:dist:linux',
      'dist:linux',
      'build:linux',
      'package:linux'
    ];

const selected = candidates.find((name) =>
  Object.prototype.hasOwnProperty.call(scripts, name)
);

if (!selected) {
  process.stderr.write(
    `No configured package script for Linux target ${target}\n`
  );
  process.exit(42);
}

process.stdout.write(`${selected}\n`);
NODE

SELECTED_SCRIPT="$(tr -d '\r\n' < "$OUTPUT_DIR/selected-script.txt")"
SOURCE_COMMIT="$(git -C "$ROOT" rev-parse HEAD)"

{
  echo "SYSTEM_ID=SHEIKHA_LINUX_NATIVE_INSTALLER_BUILD_RUNNER_V1"
  echo "TARGET=$TARGET"
  echo "SOURCE_COMMIT=$SOURCE_COMMIT"
  echo "SELECTED_SCRIPT=$SELECTED_SCRIPT"
  echo "OUTPUT_DIR=$OUTPUT_DIR"
  echo "PACKAGE_INSTALLATION_PERFORMED=false"
  echo "BUILD_STARTED_AT=$(date -Is)"
} | tee "$LOG_FILE"

set +e
(
  cd "$ROOT"
  SHEIKHA_TARGET_PLATFORM="linux" \
  SHEIKHA_TARGET_ARCH="$TARGET" \
  SHEIKHA_OUTPUT_DIR="$OUTPUT_DIR" \
  npm run "$SELECTED_SCRIPT"
) 2>&1 | tee -a "$LOG_FILE"
BUILD_RC="${PIPESTATUS[0]}"
set -e

node - \
  "$RESULT_FILE" \
  "$TARGET" \
  "$SOURCE_COMMIT" \
  "$SELECTED_SCRIPT" \
  "$OUTPUT_DIR" \
  "$LOG_FILE" \
  "$BUILD_RC" <<'NODE'
const fs = require('node:fs');

const [
  output,
  target,
  sourceCommit,
  selectedScript,
  outputDir,
  logFile,
  buildRc
] = process.argv.slice(2);

const result = {
  system: 'SHEIKHA_LINUX_NATIVE_INSTALLER_BUILD_RESULT_V1',
  target,
  sourceCommit,
  selectedScript,
  outputDir,
  logFile,
  buildExitCode: Number(buildRc),
  buildCompleted: Number(buildRc) === 0,
  artifactEvidenceCollected: false,
  installTestExecuted: false,
  smokeTestExecuted: false,
  uninstallTestExecuted: false,
  productionPromotionAuthorized: false
};

fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
NODE

echo "BUILD_EXIT_CODE=$BUILD_RC"
echo "BUILD_RESULT=$RESULT_FILE"
echo "ARTIFACT_EVIDENCE_COLLECTION_REQUIRED=true"

exit "$BUILD_RC"
