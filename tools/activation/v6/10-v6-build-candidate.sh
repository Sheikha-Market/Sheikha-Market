#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${SHEIKHA_ROOT:-$HOME/Projects/sheikha/sheikha-main-portal}"
REPORT_DIR="$ROOT/runtime/distribution/v6/evidence"
ENV_FILE="$REPORT_DIR/selected-environment.env"
V5_REPORT="$ROOT/runtime/distribution/v5/sheikha-linux-package-native-verification-v5-report.json"
OUT_ROOT="$ROOT/distribution/artifacts/v6"

cd "$ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "شغّل 00-v6-preflight.sh أولًا."
  exit 20
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

V5_ARTIFACT_REL="$(
  node -p "
    require('./runtime/distribution/v5/sheikha-linux-package-native-verification-v5-report.json')
      .candidate.artifact.path
  "
)"

V5_ARTIFACT="$ROOT/$V5_ARTIFACT_REL"

if [[ ! -f "$V5_ARTIFACT" ]]; then
  echo "ERROR: V5 TAR artifact غير موجود: $V5_ARTIFACT"
  exit 21
fi

node <<'NODE'
const report =
  require('./runtime/distribution/v5/' +
    'sheikha-linux-package-native-verification-v5-report.json');

if (
  report.source?.sourceCommitted !== true ||
  report.tar?.nativeVerified !== true ||
  report.canonicalPromotionAllowed !== true
) {
  console.error('V5 source/artifact is not eligible for V6.');
  process.exit(22);
}
NODE

BASE_VERSION="$(dpkg-deb -f "$BASELINE" Version)"
PACKAGE_NAME="$(dpkg-deb -f "$BASELINE" Package)"
ARCH="$(dpkg-deb -f "$BASELINE" Architecture)"

if [[ "$ARCH" != "amd64" ]]; then
  echo "ERROR: baseline architecture ليست amd64: $ARCH"
  exit 23
fi

V6_RELEASE="${SHEIKHA_V6_RELEASE:-v6.2}"

if [[ ! "$V6_RELEASE" =~ ^v6\.[1-9][0-9]*$ ]]; then
  echo "ERROR: إصدار V6 غير صالح: $V6_RELEASE"
  exit 241
fi

CANDIDATE_VERSION="${BASE_VERSION}+sheikha.${V6_RELEASE}"

if ! dpkg --compare-versions "$CANDIDATE_VERSION" gt "$BASE_VERSION"; then
  echo "ERROR: candidate version ليست أكبر من baseline."
  exit 24
fi

SAFE_VERSION="$(
  printf '%s' "$CANDIDATE_VERSION" |
    tr ':~+/' '____'
)"

DEST="$OUT_ROOT/$SAFE_VERSION"
ARTIFACTS="$DEST/artifacts"
METADATA="$DEST/metadata"

mkdir -p "$ARTIFACTS" "$METADATA"

OUT="$ARTIFACTS/sheikha-1.0.51-linux-amd64-v6-${SAFE_VERSION}.deb"

if [[ -e "$OUT" ]]; then
  echo "ERROR: يرفض السكربت استبدال Artifact موجود:"
  echo "$OUT"
  exit 25
fi

TMP="$(mktemp -d /tmp/sheikha-v6-build-XXXXXX)"
trap 'rm -rf -- "$TMP"' EXIT

PKGROOT="$TMP/package-root"
SRCEXTRACT="$TMP/v5-source"

mkdir -p "$PKGROOT" "$SRCEXTRACT"

dpkg-deb -R "$BASELINE" "$PKGROOT"
tar -xzf "$V5_ARTIFACT" -C "$SRCEXTRACT"

APPROOT=""

while IFS= read -r candidate; do
  parent="$(dirname "$candidate")"

  if [[ -f "$parent/bin/sheikha" ]]; then
    APPROOT="$parent"
    break
  fi
done < <(
  find "$PKGROOT" \
    -type f \
    -name server.js \
    -not -path '*/DEBIAN/*' \
    -print
)

if [[ -z "$APPROOT" ]]; then
  echo "ERROR: لم يتم اكتشاف مسار التطبيق داخل baseline DEB."
  exit 26
fi

case "$APPROOT" in
  "$PKGROOT"/*) ;;
  *)
    echo "ERROR: APPROOT خارج staging root."
    exit 27
    ;;
esac

# SHEIKHA_V6_PROJECT_LOCAL_DEPENDENCIES
#
# تستخدم شجرة Dependencies المحلية الموجودة مسبقًا فقط.
# لا تنزيل، لا npm registry، لا lifecycle scripts، ولا صلاحيات إضافية.

PROJECT_DEPS="$ROOT/node_modules"
DEPSROOT="$TMP/dependencies"

if [[ ! -d "$PROJECT_DEPS" ]]; then
  echo "ERROR: node_modules المحلية غير موجودة."
  echo "لا يسمح بتنزيل Dependencies دون موافقة جديدة."
  exit 271
fi

if [[ ! -f "$ROOT/package-lock.json" ]]; then
  echo "ERROR: package-lock.json المحلي غير موجود."
  exit 272
fi

shopt -s dotglob nullglob

entries=("$SRCEXTRACT"/*)

if (( ${#entries[@]} == 1 )) &&
   [[ -d "${entries[0]}" ]]
then
  SRCROOT="${entries[0]}"
else
  SRCROOT="$SRCEXTRACT"
fi

for required in \
  package.json \
  package-lock.json \
  server.js \
  bin/sheikha
do
  if [[ ! -e "$SRCROOT/$required" ]]; then
    echo "ERROR: الملف مفقود من V5 source: $required"
    exit 273
  fi
done

ROOT_LOCK_SHA="$(
  sha256sum "$ROOT/package-lock.json" |
    awk '{print $1}'
)"

SOURCE_LOCK_SHA="$(
  sha256sum "$SRCROOT/package-lock.json" |
    awk '{print $1}'
)"

if [[ "$ROOT_LOCK_SHA" != "$SOURCE_LOCK_SHA" ]]; then
  echo "ERROR: package-lock.json المحلي لا يطابق V5."
  echo "ROOT=$ROOT_LOCK_SHA"
  echo "V5=$SOURCE_LOCK_SHA"
  echo "يرفض البناء إعادة استخدام Dependencies غير مطابقة."
  exit 274
fi

mkdir -p "$DEPSROOT"

cp -a "$SRCROOT/package.json" "$DEPSROOT/"
cp -a "$SRCROOT/package-lock.json" "$DEPSROOT/"
cp -a "$PROJECT_DEPS" "$DEPSROOT/node_modules"

echo "بناء إغلاق Production محلي دون npm Registry."

# SHEIKHA_V6_LOCKFILE_OFFLINE_CLOSURE
CLOSURE_SCRIPT="$ROOT/tools/activation/v6/sheikha-v6-offline-production-closure.js"

if [[ ! -f "$CLOSURE_SCRIPT" ]]; then
  echo "ERROR: محرك الإغلاق المحلي غير موجود."
  exit 278
fi

node --check "$CLOSURE_SCRIPT"

docker run --rm \
  --network none \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --pids-limit 256 \
  --user "$(id -u):$(id -g)" \
  --mount \
    type=bind,src="$DEPSROOT",dst=/work \
  --mount \
    type=bind,src="$CLOSURE_SCRIPT",dst=/runner/sheikha-v6-offline-production-closure.js,readonly \
  "$IMAGE" \
  node \
    /runner/sheikha-v6-offline-production-closure.js \
    /work

if [[ ! -f "$DEPSROOT/dependency-closure.json" ]]; then
  echo "ERROR: لم يُنشأ تقرير إغلاق Dependencies."
  exit 278
fi

node - "$DEPSROOT/dependency-closure.json" <<'NODE_VERIFY'
const fs = require('node:fs');

const report = JSON.parse(
  fs.readFileSync(process.argv[2], 'utf8')
);

const passed = [
  report.status ===
    'PRODUCTION_CLOSURE_VERIFIED',
  report.missingRequiredCount === 0,
  report.remainingDevPackageCount === 0,
  report.remainingExtraneousPackageCount === 0,
  report.externalNetworkUsed === false,
  report.npmRegistryUsed === false,
  report.npmCommandUsed === false,
  report.lifecycleScriptsExecuted === false
].every(Boolean);

if (!passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(279);
}

console.log(
  'SHEIKHA_V6_OFFLINE_PRODUCTION_CLOSURE_VERIFIED'
);
NODE_VERIFY

if [[ ! -d "$DEPSROOT/node_modules" ]]; then
  echo "ERROR: لم تنتج شجرة Production Dependencies."
  exit 275
fi

mapfile -d '' NATIVE_ADDONS < <(
  find "$DEPSROOT/node_modules" \
    -type f \
    -name '*.node' \
    -print0
)

if (( ${#NATIVE_ADDONS[@]} > 0 )); then
  python3 - \
    "$REPORT_DIR/native-addon-gate.json" \
    "${NATIVE_ADDONS[@]}" <<'PY_NATIVE'
from pathlib import Path
from datetime import datetime, timezone
import json
import sys

report = Path(sys.argv[1])
files = sys.argv[2:]

result = {
    "schemaVersion": "6.0.0",
    "system": "SHEIKHA_V6_NATIVE_NODE_ADDON_GATE",
    "status": "BLOCKED_UNVERIFIED_NATIVE_NODE_ADDONS",
    "nativeAddonCount": len(files),
    "files": files,
    "networkUsed": False,
    "approvalRequired": True,
    "claim": (
        "Native Node addons require an ABI-correct build "
        "inside the approved Node 20 container."
    ),
    "generatedAt": datetime.now(
        timezone.utc
    ).isoformat()
}

report.write_text(
    json.dumps(result, ensure_ascii=False, indent=2) + "
",
    encoding="utf-8"
)

print(json.dumps(result, ensure_ascii=False, indent=2))
PY_NATIVE

  echo "ERROR: توجد Native Node Addons غير متحققة."
  echo "راجع:"
  echo "$REPORT_DIR/native-addon-gate.json"
  exit 276
fi

SYMLINK_CHECKER="$ROOT/tools/activation/v6/sheikha-v6-verify-dependency-symlinks.py"
SYMLINK_REPORT="$REPORT_DIR/dependency-symlink-verification.json"

if [[ ! -f "$SYMLINK_CHECKER" ]]; then
  echo "ERROR: فاحص الروابط الرمزية غير موجود."
  exit 277
fi

python3 -m py_compile "$SYMLINK_CHECKER"

python3 \
  "$SYMLINK_CHECKER" \
  "$DEPSROOT/node_modules" \
  "$SYMLINK_REPORT"

node - "$SYMLINK_REPORT" <<'NODE_SYMLINK_GATE'
const fs = require('node:fs');

const report = JSON.parse(
  fs.readFileSync(process.argv[2], 'utf8')
);

const passed = [
  report.status ===
    'DEPENDENCY_SYMLINKS_VERIFIED',
  report.violationCount === 0,
  report.externalFilesystemAccessAllowed === false,
  report.defaultAuthorization === 'DENY',
  report.networkUsed === false,
  report.hostPrivilegesUsed === false
].every(Boolean);

if (!passed) {
  console.error(
    JSON.stringify(report, null, 2)
  );

  process.exit(277);
}

console.log(
  'SHEIKHA_V6_DEPENDENCY_SYMLINKS_VERIFIED'
);
NODE_SYMLINK_GATE

DEPENDENCY_TREE_SHA="$(
  tar \
    --sort=name \
    --mtime='UTC 1970-01-01' \
    --owner=0 \
    --group=0 \
    --numeric-owner \
    -C "$DEPSROOT" \
    -cf - \
    node_modules |
  sha256sum |
  awk '{print $1}'
)"

find "$APPROOT" \
  -mindepth 1 \
  -maxdepth 1 \
  -exec rm -rf -- {} +

cp -a "$SRCROOT"/. "$APPROOT"/
cp -a "$DEPSROOT/node_modules" "$APPROOT/node_modules"

chmod +x "$APPROOT/bin/sheikha"

# SHEIKHA_V6_CANONICAL_CLI_ENTRYPOINT
#
# CLI القانوني يأتي من V5 source داخل APPROOT.
# مدخل /usr/bin لا يحتفظ بنسخة V2 التاريخية القديمة،
# بل يرتبط بالمدخل القانوني داخل الحزمة الجديدة.

APPROOT_REL="${APPROOT#"$PKGROOT"}"

case "$APPROOT_REL" in
  /usr/*|/opt/*)
    ;;
  *)
    echo "ERROR: APPROOT_REL غير مسموح: $APPROOT_REL"
    exit 281
    ;;
esac

CANONICAL_CLI_TARGET="$APPROOT_REL/bin/sheikha"
GLOBAL_CLI="$PKGROOT/usr/bin/sheikha"

if [[ ! -f "$PKGROOT$CANONICAL_CLI_TARGET" ]]; then
  echo "ERROR: CLI القانوني غير موجود داخل staging."
  echo "TARGET=$CANONICAL_CLI_TARGET"
  exit 282
fi

mkdir -p "$(dirname "$GLOBAL_CLI")"

rm -f -- "$GLOBAL_CLI"

ln -s   "$CANONICAL_CLI_TARGET"   "$GLOBAL_CLI"

if [[ ! -L "$GLOBAL_CLI" ]]; then
  echo "ERROR: تعذر إنشاء رابط CLI القانوني."
  exit 283
fi

if [[ "$(readlink "$GLOBAL_CLI")" != "$CANONICAL_CLI_TARGET" ]]; then
  echo "ERROR: هدف رابط CLI غير مطابق."
  exit 284
fi

CANONICAL_CLI_SHA="$(
  sha256sum "$PKGROOT$CANONICAL_CLI_TARGET" |
  awk '{print $1}'
)"

node - \
  "$REPORT_DIR/cli-entrypoint-linkage.json" \
  "$CANONICAL_CLI_TARGET" \
  "$CANONICAL_CLI_SHA" <<'NODE_CLI_LINKAGE'
const fs = require('node:fs');

const [
  reportFile,
  canonicalTarget,
  canonicalSha256
] = process.argv.slice(2);

const report = {
  schemaVersion: '6.0.0',
  system:
    'SHEIKHA_V6_CANONICAL_CLI_ENTRYPOINT',
  status: 'CANONICAL_CLI_ENTRYPOINT_LINKED',
  publicEntrypoint: '/usr/bin/sheikha',
  canonicalTarget,
  canonicalSha256,
  previousBaselineEntrypointReused: false,
  symlinkCreatedInTemporaryPackageStaging: true,
  sourceRepositoryModifiedByLinkage: false,
  externalNetworkUsed: false,
  sudoUsed: false,
  hostPackagesInstalled: false,
  defaultAuthorization: 'DENY',
  principle: 'لا ضرر ولا ضرار',
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(
  reportFile,
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8'
);

console.log(
  'SHEIKHA_V6_CANONICAL_CLI_ENTRYPOINT_LINKED'
);
NODE_CLI_LINKAGE

cat > "$REPORT_DIR/dependency-assembly.json" <<JSON
{
  "schemaVersion": "6.0.0",
  "system": "SHEIKHA_V6_DEPENDENCY_ASSEMBLY",
  "status": "ASSEMBLED_OFFLINE_FROM_LOCAL_TREE",
  "source": "project-local-node_modules",
  "packageLockSha256": "$SOURCE_LOCK_SHA",
  "dependencyTreeSha256": "$DEPENDENCY_TREE_SHA",
  "approvedContainer": "$IMAGE",
  "networkMode": "none",
  "lifecycleScriptsExecuted": false,
  "nativeAddonCount": 0,
  "hostPackagesInstalled": false,
  "sudoUsed": false,
  "githubUsed": false,
  "reproducibleInstallClaimed": false
}
JSON

chmod +x "$APPROOT/bin/sheikha"

bash tools/activation/v6/05-v6-content-policy.sh "$APPROOT"

CONTROL="$PKGROOT/DEBIAN/control"

python3 - "$CONTROL" "$CANDIDATE_VERSION" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
version = sys.argv[2]

lines = path.read_text(encoding="utf-8").splitlines()
result = []
found = False

for line in lines:
    if line.startswith("Version:"):
        result.append(f"Version: {version}")
        found = True
    else:
        result.append(line)

if not found:
    raise SystemExit("Version field not found in DEBIAN/control")

path.write_text("\n".join(result) + "\n", encoding="utf-8")
PY

(
  cd "$PKGROOT"

  find . \
    -path './DEBIAN' -prune -o \
    -type f -print0 |
    sort -z |
    xargs -0 md5sum |
    sed 's#  \./#  #' \
      > DEBIAN/md5sums
)

# SHEIKHA_V6_HASH_PINNED_SECRET_GATE
SECRET_GATE="$ROOT/tools/activation/v6/sheikha-v6-hash-pinned-secret-gate.py"
SECRET_GATE_REPORT="$ROOT/runtime/distribution/v6/evidence/secret-gate-report.json"
STRUCTURAL_SECRET_AUDIT="$ROOT/runtime/distribution/v6/evidence/structural-secret-audit.json"
SECRET_REFERENCE_APPROVAL="$ROOT/runtime/distribution/v6/sheikha-v6-secret-reference-approval.json"

python3 -m py_compile "$SECRET_GATE"

python3 \
  "$SECRET_GATE" \
  "$APPROOT" \
  "$SECRET_GATE_REPORT" \
  "$STRUCTURAL_SECRET_AUDIT" \
  "$SECRET_REFERENCE_APPROVAL"


dpkg-deb --root-owner-group --build "$PKGROOT" "$OUT"

ACTUAL_PACKAGE="$(dpkg-deb -f "$OUT" Package)"
ACTUAL_VERSION="$(dpkg-deb -f "$OUT" Version)"
ACTUAL_ARCH="$(dpkg-deb -f "$OUT" Architecture)"
SHA="$(sha256sum "$OUT" | awk '{print $1}')"
BYTES="$(stat -c '%s' "$OUT")"

[[ "$ACTUAL_PACKAGE" == "$PACKAGE_NAME" ]]
[[ "$ACTUAL_VERSION" == "$CANDIDATE_VERSION" ]]
[[ "$ACTUAL_ARCH" == "amd64" ]]

dpkg --compare-versions "$ACTUAL_VERSION" gt "$BASE_VERSION"

dpkg-deb --info "$OUT" \
  > "$METADATA/candidate-package-inspection.txt"

dpkg-deb --contents "$OUT" \
  > "$METADATA/candidate-package-contents.txt"

cat > "$METADATA/candidate-manifest.json" <<JSON
{
  "schemaVersion": "6.0.0",
  "system": "SHEIKHA_LINUX_DEB_NATIVE_LIFECYCLE_V6",
  "package": "$ACTUAL_PACKAGE",
  "baselineVersion": "$BASE_VERSION",
  "candidateVersion": "$ACTUAL_VERSION",
  "architecture": "$ACTUAL_ARCH",
  "artifact": "$OUT",
  "bytes": $BYTES,
  "sha256": "$SHA",
  "sourceHead": "$(git rev-parse HEAD)",
  "v5SourceArtifact": "$V5_ARTIFACT_REL",
  "externalDownloadPerformed": false,
  "hostPackagesInstalled": false
}
JSON

{
  printf 'CANDIDATE=%q\n' "${OUT#"$ROOT"/}"
  printf 'PACKAGE_NAME=%q\n' "$PACKAGE_NAME"
  printf 'BASE_VERSION=%q\n' "$BASE_VERSION"
  printf 'CANDIDATE_VERSION=%q\n' "$CANDIDATE_VERSION"
  printf 'CANDIDATE_SHA=%q\n' "$SHA"
  printf 'CANDIDATE_BYTES=%q\n' "$BYTES"
} > "$REPORT_DIR/latest-candidate.env"

printf '%s  %s\n' "$SHA" "$OUT" \
  > "$REPORT_DIR/artifact-sha256.txt"

printf 'BASELINE=%s\nCANDIDATE=%s\n' \
  "$BASE_VERSION" \
  "$CANDIDATE_VERSION" \
  > "$REPORT_DIR/version-comparison.txt"

echo "SHEIKHA_V6_CANDIDATE_BUILT"
echo "ARTIFACT=$OUT"
echo "BYTES=$BYTES"
echo "SHA256=$SHA"
echo "VERSION=$CANDIDATE_VERSION"
