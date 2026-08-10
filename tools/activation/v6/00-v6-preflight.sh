#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${SHEIKHA_ROOT:-$HOME/Projects/sheikha/sheikha-main-portal}"
EXPECTED_HEAD="${SHEIKHA_V6_EXPECTED_HEAD:-}"
BASELINE_REL="distribution/artifacts/v2/1.0.51/artifacts/sheikha-1.0.51-linux-amd64.deb"
BASELINE_SHA="3ca1dfdcf690c01efdbeb382c936f2a1f9a347123d92e663176011b5972ebc42"
REPORT_DIR="$ROOT/runtime/distribution/v6/evidence"
ENV_FILE="$REPORT_DIR/selected-environment.env"
CONTRACT="$ROOT/runtime/distribution/v6/sheikha-v6-limited-approval-contract.json"
BASE_DIGEST_FILE="$ROOT/runtime/distribution/v6/test-environment/base-image-digest.txt"

ENGINE="docker"
SELECTED_IMAGE="sheikha/debian-node20-v6:local"
APPROVED_DIGEST="debian@sha256:28de0877c2189802884ccd20f15ee41c203573bd87bb6b883f5f46362d24c5c2"

cd "$ROOT"
mkdir -p "$REPORT_DIR"

trap '
  code=$?
  if [[ $code -ne 0 ]]; then
    echo "SHEIKHA_V6_PREFLIGHT_STOPPED_SAFELY code=$code"
  fi
' EXIT

node "$CONTRACT" <<'NODE'
const fs = require('node:fs');

const contract = JSON.parse(
  fs.readFileSync(process.argv[1], 'utf8')
);

const checks = [
  contract.status === 'ACTIVE_LIMITED_DEFAULT_DENY',
  contract.defaultAuthorization === 'DENY',
  contract.allowed?.containerEngine === 'docker',
  contract.allowed?.containerNetworkDuringVerification === 'none',
  contract.forbidden?.hostSudo === true,
  contract.forbidden?.hostPackageInstallation === true,
  contract.forbidden?.privilegedContainer === true,
  contract.forbidden?.hostNetwork === true,
  contract.forbidden?.github === true,
  contract.forbidden?.externalPublishing === true,
  contract.ethicalSafety?.noHarm === true,
  contract.ethicalSafety?.noPermissionWithoutExplicitApproval === true,
  contract.visualContentPolicy?.livingBeingImagesAllowed === false,
  contract.visualContentPolicy?.unreviewedMediaDefault === 'DENY'
];

if (!checks.every(Boolean)) {
  console.error(JSON.stringify(contract, null, 2));
  process.exit(2);
}

console.log('SHEIKHA_V6_LIMITED_APPROVAL_CONTRACT_VERIFIED');
NODE

HEAD_SHA="$(git rev-parse HEAD)"
REGISTRY_SHA="$(git rev-parse local-registry/main)"

if [[ -z "$EXPECTED_HEAD" ]]; then
  EXPECTED_HEAD="$REGISTRY_SHA"
fi

printf 'HEAD=%s\n' "$HEAD_SHA"
printf 'LOCAL_REGISTRY_MAIN=%s\n' "$REGISTRY_SHA"

if [[ "$HEAD_SHA" != "$EXPECTED_HEAD" ]]; then
  echo "ERROR: HEAD غير مطابق لنقطة V5 المعتمدة."
  echo "EXPECTED=$EXPECTED_HEAD"
  echo "ACTUAL=$HEAD_SHA"
  exit 10
fi

if [[ "$HEAD_SHA" != "$REGISTRY_SHA" ]]; then
  echo "ERROR: HEAD لا يطابق local-registry/main."
  exit 11
fi

BASELINE="$ROOT/$BASELINE_REL"

if [[ ! -f "$BASELINE" ]]; then
  echo "ERROR: حزمة baseline غير موجودة: $BASELINE"
  exit 12
fi

echo "$BASELINE_SHA  $BASELINE" | sha256sum -c -

node <<'NODE'
const fs = require('node:fs');

const file =
  'runtime/distribution/v5/' +
  'sheikha-linux-package-native-verification-v5-report.json';

const report = JSON.parse(fs.readFileSync(file, 'utf8'));

const valid =
  report.status === 'TAR_NATIVE_VERIFIED_DEB_BLOCKED' &&
  report.tar?.nativeVerified === true &&
  report.canonicalPromotionAllowed === true;

if (!valid) {
  console.error(JSON.stringify({
    status: report.status,
    tarNativeVerified: report.tar?.nativeVerified,
    canonicalPromotionAllowed: report.canonicalPromotionAllowed
  }, null, 2));

  process.exit(13);
}

console.log('SHEIKHA_V5_BASELINE_VERIFIED');
NODE

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker غير موجود."
  exit 20
fi

if [[ ! -f "$BASE_DIGEST_FILE" ]]; then
  echo "ERROR: ملف بصمة Base Image غير موجود."
  exit 21
fi

ACTUAL_APPROVED_DIGEST="$(tr -d '\r\n' < "$BASE_DIGEST_FILE")"

if [[ "$ACTUAL_APPROVED_DIGEST" != "$APPROVED_DIGEST" ]]; then
  echo "ERROR: بصمة Debian الأساسية لا تطابق الموافقة المحدودة."
  echo "EXPECTED=$APPROVED_DIGEST"
  echo "ACTUAL=$ACTUAL_APPROVED_DIGEST"
  exit 22
fi

if ! docker image inspect "$SELECTED_IMAGE" >/dev/null 2>&1; then
  echo "ERROR: الصورة المحلية المصرح بها غير موجودة:"
  echo "$SELECTED_IMAGE"
  exit 23
fi

IMAGE_ID="$(
  docker image inspect \
    "$SELECTED_IMAGE" \
    --format '{{.Id}}'
)"

echo "فحص الصورة المحلية المصرح بها فقط: $SELECTED_IMAGE"
echo "IMAGE_ID=$IMAGE_ID"

if ! docker run --rm \
  --network none \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --pids-limit 256 \
  "$SELECTED_IMAGE" \
  sh -s <<'INNER'
set -eu

test -r /etc/os-release
. /etc/os-release

case "${ID:-}" in
  debian|ubuntu) ;;
  *) exit 30 ;;
esac

command -v dpkg >/dev/null
command -v dpkg-query >/dev/null
command -v dpkg-deb >/dev/null
command -v node >/dev/null
command -v npm >/dev/null

dpkg-query -W \
  -f='${db:Status-Abbrev} ${Version}\n' \
  nodejs |
  grep -Eq '^ii[[:space:]]'

dpkg-query -W \
  -f='${db:Status-Abbrev} ${Version}\n' \
  npm |
  grep -Eq '^ii[[:space:]]'

node_dpkg_version="$(
  dpkg-query -W -f='${Version}' nodejs
)"

npm_dpkg_version="$(
  dpkg-query -W -f='${Version}' npm
)"

dpkg --compare-versions \
  "$node_dpkg_version" \
  ge 20

node -e '
  const major = Number(
    process.versions.node.split(".")[0]
  );

  process.exit(major >= 20 ? 0 : 31);
'

test -n "$npm_dpkg_version"
INNER
then
  cat > "$REPORT_DIR/environment-inspection.json" <<JSON
{
  "schemaVersion": "6.0.0",
  "system": "SHEIKHA_LINUX_DEB_NATIVE_LIFECYCLE_V6",
  "status": "LOCAL_APPROVED_IMAGE_FAILED_VERIFICATION",
  "containerEngine": "$ENGINE",
  "containerImage": "$SELECTED_IMAGE",
  "externalNetworkUsed": false,
  "hostPackagesInstalled": false
}
JSON

  echo "ERROR: الصورة المحلية لم تجتز تحقق Debian/Node/npm/dpkg."
  exit 24
fi

VERSIONS_FILE="$REPORT_DIR/node-npm-dpkg-versions.txt"

if ! docker run --rm \
  --network none \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --pids-limit 256 \
  "$SELECTED_IMAGE" \
  sh -s > "$VERSIONS_FILE" <<'INNER'
set -eu

. /etc/os-release

printf 'ID=%s\n' "${ID:-unknown}"
printf 'VERSION_ID=%s\n' "${VERSION_ID:-unknown}"
printf 'PRETTY_NAME=%s\n' "${PRETTY_NAME:-unknown}"
printf 'ARCH=%s\n' "$(dpkg --print-architecture)"
printf 'NODE_COMMAND=%s\n' "$(node --version)"
printf 'NPM_COMMAND=%s\n' "$(npm --version)"
printf 'NODE_DPKG=%s\n' \
  "$(dpkg-query -W -f='${Version}' nodejs)"
printf 'NPM_DPKG=%s\n' \
  "$(dpkg-query -W -f='${Version}' npm)"
printf 'DPKG=%s\n' \
  "$(dpkg --version | head -1)"
INNER
then
  echo "ERROR: فشل تسجيل إصدارات البيئة المحلية."
  exit 25
fi

{
  printf 'ENGINE=%q\n' "$ENGINE"
  printf 'IMAGE=%q\n' "$SELECTED_IMAGE"
  printf 'BASELINE=%q\n' "$BASELINE_REL"

  RUNTIME_BASELINE_REL="distribution/artifacts/v6/1.0.51_sheikha.v6.1/artifacts/sheikha-1.0.51-linux-amd64-v6-1.0.51_sheikha.v6.1.deb"
  RUNTIME_BASELINE="$ROOT/$RUNTIME_BASELINE_REL"

  if [[ -f "$RUNTIME_BASELINE" ]] &&
     [[ "$(dpkg-deb -f "$RUNTIME_BASELINE" Package)" == "sheikha" ]] &&
     [[ "$(dpkg-deb -f "$RUNTIME_BASELINE" Version)" == "1.0.51+sheikha.v6.1" ]] &&
     [[ "$(dpkg-deb -f "$RUNTIME_BASELINE" Architecture)" == "amd64" ]]
  then
    printf 'RUNTIME_BASELINE=%q\n' "$RUNTIME_BASELINE_REL"
  fi

  printf 'IMAGE_ID=%q\n' "$IMAGE_ID"
  printf 'APPROVED_BASE_DIGEST=%q\n' "$APPROVED_DIGEST"
} > "$ENV_FILE"

node - \
  "$ENGINE" \
  "$SELECTED_IMAGE" \
  "$IMAGE_ID" \
  "$APPROVED_DIGEST" \
  "$HEAD_SHA" <<'NODE'
const fs = require('node:fs');

const [
  engine,
  image,
  imageId,
  approvedBaseDigest,
  head
] = process.argv.slice(2);

const report = {
  schemaVersion: '6.0.0',
  system: 'SHEIKHA_LINUX_DEB_NATIVE_LIFECYCLE_V6',
  status: 'BUILD_READY',
  sourceHead: head,
  containerEngine: engine,
  localImage: image,
  localImageId: imageId,
  approvedBaseDigest,
  suitableLocalImageFound: true,
  networkMode: 'none',
  capDropAll: true,
  noNewPrivileges: true,
  privileged: false,
  hostNetwork: false,
  externalNetworkPerformed: false,
  hostPackagesInstalled: false,
  githubUsed: false,
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(
  'runtime/distribution/v6/evidence/environment-inspection.json',
  JSON.stringify(report, null, 2) + '\n'
);

console.log(JSON.stringify(report, null, 2));
NODE

echo "SHEIKHA_V6_PREFLIGHT_OK"
echo "ENGINE=$ENGINE"
echo "IMAGE=$SELECTED_IMAGE"
echo "NETWORK=none"
echo "PRIVILEGED=false"
echo "HOST_SUDO=false"
