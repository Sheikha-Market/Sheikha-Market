#!/usr/bin/env bash
set -Eeuo pipefail

export LC_ALL=C.UTF-8
export LANG=C.UTF-8

ROOT="$(git rev-parse --show-toplevel)"
PRODUCT="${1:-}"
ARCH="${2:-}"
OUTPUT_DIR="${3:-$ROOT/dist/native-build/macos/$PRODUCT-$ARCH}"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$OUTPUT_DIR/build-$STAMP.log"
RESULT_FILE="$OUTPUT_DIR/build-result-$STAMP.json"

case "$PRODUCT" in
  dmg|cli) ;;
  *)
    echo "Usage: $0 <dmg|cli> <x64|arm64|universal> [output-dir]" >&2
    exit 20
    ;;
esac

case "$ARCH" in
  x64|arm64|universal) ;;
  *)
    echo "Usage: $0 <dmg|cli> <x64|arm64|universal> [output-dir]" >&2
    exit 20
    ;;
esac

if [[ "$PRODUCT" == "cli" && "$ARCH" == "universal" ]]; then
  echo "UNSUPPORTED_TARGET_COMBINATION=true" >&2
  exit 22
fi

[[ "$(uname -s)" == "Darwin" ]] || {
  echo "NATIVE_PLATFORM_MISMATCH=true" >&2
  exit 21
}

mkdir -p "$OUTPUT_DIR"

node - "$ROOT/package.json" "$PRODUCT" "$ARCH" > "$OUTPUT_DIR/selected-script.txt" <<'NODE'
const fs = require('node:fs');

const packageJsonPath = process.argv[2];
const product = process.argv[3];
const arch = process.argv[4];
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const scripts = packageJson.scripts || {};

const candidates = [
  `sheikha:dist:macos:${product}:${arch}`,
  `dist:macos:${product}:${arch}`,
  `build:macos:${product}:${arch}`,
  `package:macos:${product}:${arch}`,
  `sheikha:dist:macos:${arch}`,
  `dist:macos:${arch}`,
  `build:macos:${arch}`,
  `package:macos:${arch}`,
  'sheikha:dist:macos',
  'dist:macos',
  'build:macos',
  'package:macos'
];

const selected = candidates.find((name) =>
  Object.prototype.hasOwnProperty.call(scripts, name)
);

if (!selected) {
  process.stderr.write(
    `No configured package script for macOS ${product} ${arch}\n`
  );
  process.exit(42);
}

process.stdout.write(`${selected}\n`);
NODE

SELECTED_SCRIPT="$(tr -d '\r\n' < "$OUTPUT_DIR/selected-script.txt")"
SOURCE_COMMIT="$(git -C "$ROOT" rev-parse HEAD)"

{
  echo "SYSTEM_ID=SHEIKHA_MACOS_NATIVE_INSTALLER_BUILD_RUNNER_V1"
  echo "PRODUCT=$PRODUCT"
  echo "ARCHITECTURE=$ARCH"
  echo "SOURCE_COMMIT=$SOURCE_COMMIT"
  echo "SELECTED_SCRIPT=$SELECTED_SCRIPT"
  echo "OUTPUT_DIR=$OUTPUT_DIR"
  echo "PACKAGE_INSTALLATION_PERFORMED=false"
  echo "BUILD_STARTED_AT=$(date -Is)"
} | tee "$LOG_FILE"

set +e
(
  cd "$ROOT"
  SHEIKHA_TARGET_PLATFORM="macos" \
  SHEIKHA_TARGET_ARCH="$ARCH" \
  SHEIKHA_TARGET_PRODUCT="$PRODUCT" \
  SHEIKHA_OUTPUT_DIR="$OUTPUT_DIR" \
  npm run "$SELECTED_SCRIPT"
) 2>&1 | tee -a "$LOG_FILE"
BUILD_RC="${PIPESTATUS[0]}"
set -e

node - \
  "$RESULT_FILE" \
  "$PRODUCT" \
  "$ARCH" \
  "$SOURCE_COMMIT" \
  "$SELECTED_SCRIPT" \
  "$OUTPUT_DIR" \
  "$LOG_FILE" \
  "$BUILD_RC" <<'NODE'
const fs = require('node:fs');

const [
  output,
  product,
  architecture,
  sourceCommit,
  selectedScript,
  outputDir,
  logFile,
  buildRc
] = process.argv.slice(2);

const result = {
  system: 'SHEIKHA_MACOS_NATIVE_INSTALLER_BUILD_RESULT_V1',
  product,
  architecture,
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
  signingStatusRecorded: false,
  notarizationStatusRecorded: false,
  productionPromotionAuthorized: false
};

fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
NODE

echo "BUILD_EXIT_CODE=$BUILD_RC"
echo "BUILD_RESULT=$RESULT_FILE"
echo "ARTIFACT_EVIDENCE_COLLECTION_REQUIRED=true"

exit "$BUILD_RC"
