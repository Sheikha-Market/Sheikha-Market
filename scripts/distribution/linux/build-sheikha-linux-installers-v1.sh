#!/usr/bin/env bash
set -Eeuo pipefail

export LC_ALL=C.UTF-8
export LANG=C.UTF-8

ROOT="$(git rev-parse --show-toplevel)"
PRODUCT="${1:-}"
ARCH="${2:-}"
OUTPUT_DIR="${3:-$ROOT/dist/native-build/linux/$PRODUCT-$ARCH}"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$OUTPUT_DIR/build-$STAMP.log"
RESULT_FILE="$OUTPUT_DIR/build-result-$STAMP.json"

case "$PRODUCT" in
  deb|rpm|tar-gz|cli) ;;
  *)
    echo "Usage: $0 <deb|rpm|tar-gz|cli> <x64> [output-dir]" >&2
    exit 20
    ;;
esac

case "$ARCH" in
  x64) ;;
  *)
    echo "Usage: $0 <deb|rpm|tar-gz|cli> <x64> [output-dir]" >&2
    exit 20
    ;;
esac

[[ "$(uname -s)" == "Linux" ]] || {
  echo "NATIVE_PLATFORM_MISMATCH=true" >&2
  exit 21
}

PACKAGE_SCRIPT="sheikha:dist:linux:${PRODUCT}:${ARCH}"

node - "$ROOT/package.json" "$PACKAGE_SCRIPT" <<'NODE'
const fs = require('node:fs');

const packageJsonPath = process.argv[2];
const packageScript = process.argv[3];
const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, 'utf8')
);
const scripts = packageJson.scripts || {};

if (typeof scripts[packageScript] !== 'string') {
  process.stderr.write(
    `Exact package script is not configured: ${packageScript}\n`
  );
  process.exit(42);
}
NODE

mkdir -p "$OUTPUT_DIR"

SOURCE_COMMIT="$(git -C "$ROOT" rev-parse HEAD)"

{
  echo "SYSTEM_ID=SHEIKHA_LINUX_NATIVE_INSTALLER_BUILD_RUNNER_V1"
  echo "PRODUCT=$PRODUCT"
  echo "ARCHITECTURE=$ARCH"
  echo "SOURCE_COMMIT=$SOURCE_COMMIT"
  echo "PACKAGE_SCRIPT=$PACKAGE_SCRIPT"
  echo "OUTPUT_DIR=$OUTPUT_DIR"
  echo "PACKAGE_INSTALLATION_PERFORMED=false"
  echo "BUILD_STARTED_AT=$(date -Is)"
} | tee "$LOG_FILE"

set +e
(
  cd "$ROOT"
  SHEIKHA_TARGET_PLATFORM="linux" \
  SHEIKHA_TARGET_PRODUCT="$PRODUCT" \
  SHEIKHA_TARGET_ARCH="$ARCH" \
  SHEIKHA_OUTPUT_DIR="$OUTPUT_DIR" \
  npm run "$PACKAGE_SCRIPT"
) 2>&1 | tee -a "$LOG_FILE"
BUILD_RC="${PIPESTATUS[0]}"
set -e

node - \
  "$RESULT_FILE" \
  "$PRODUCT" \
  "$ARCH" \
  "$SOURCE_COMMIT" \
  "$PACKAGE_SCRIPT" \
  "$OUTPUT_DIR" \
  "$LOG_FILE" \
  "$BUILD_RC" <<'NODE'
const fs = require('node:fs');

const [
  output,
  product,
  architecture,
  sourceCommit,
  packageScript,
  outputDir,
  logFile,
  buildRc
] = process.argv.slice(2);

const result = {
  system: 'SHEIKHA_LINUX_NATIVE_INSTALLER_BUILD_RESULT_V1',
  product,
  architecture,
  sourceCommit,
  packageScript,
  outputDir,
  logFile,
  buildExitCode: Number(buildRc),
  delegateExecutionCompleted: Number(buildRc) === 0,
  artifactEvidenceCollected: false,
  installTestExecuted: false,
  smokeTestExecuted: false,
  uninstallTestExecuted: false,
  productionPromotionAuthorized: false
};

fs.writeFileSync(
  output,
  `${JSON.stringify(result, null, 2)}\n`
);
NODE

echo "BUILD_EXIT_CODE=$BUILD_RC"
echo "BUILD_RESULT=$RESULT_FILE"
echo "ARTIFACT_INSPECTION_REQUIRED=true"
echo "INSTALL_SMOKE_UNINSTALL_EVIDENCE_REQUIRED=true"

exit "$BUILD_RC"
