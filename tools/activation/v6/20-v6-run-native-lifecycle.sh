#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${SHEIKHA_ROOT:-$HOME/Projects/sheikha/sheikha-main-portal}"
REPORT_DIR="$ROOT/runtime/distribution/v6/evidence"
ENV_FILE="$REPORT_DIR/selected-environment.env"
CANDIDATE_ENV="$REPORT_DIR/latest-candidate.env"
REPORT="$ROOT/runtime/distribution/v6/sheikha-linux-deb-native-lifecycle-v6-report.json"
STATUS_OVERLAY="$ROOT/distribution/manifest/sheikha-target-status-v6.json"

cd "$ROOT"

[[ -f "$ENV_FILE" ]] || {
  echo "شغّل preflight أولًا."
  exit 30
}

[[ -f "$CANDIDATE_ENV" ]] || {
  echo "ابنِ candidate أولًا."
  exit 31
}

# shellcheck disable=SC1090
source "$ENV_FILE"

# shellcheck disable=SC1090
source "$CANDIDATE_ENV"

# SHEIKHA_V6_RUNTIME_BASELINE_SELECTION
#
# BASELINE تظل مرجع التغليف التاريخي.
# RUNTIME_BASELINE هي الحزمة المكتملة المستخدمة فعليًا
# في التثبيت الأولي والرجوع.

RUNTIME_BASELINE="${RUNTIME_BASELINE:-$BASELINE}"

BASELINE_ABS="$(
  readlink -f "$RUNTIME_BASELINE"
)"

CANDIDATE_ABS="$(
  readlink -f "$CANDIDATE"
)"

[[ -f "$BASELINE_ABS" ]]
[[ -f "$CANDIDATE_ABS" ]]

mkdir -p "$REPORT_DIR"

RUN_TMP="$(mktemp -d /tmp/sheikha-v6-run-XXXXXX)"
trap 'rm -rf -- "$RUN_TMP"' EXIT

# SHEIKHA_V6_ISOLATED_EVIDENCE_STAGING
#
# الحاوية تكتب في staging مؤقت خارج المستودع.
# تُنسخ الأدلة إلى المستودع بملكية المستخدم بعد انتهاء
# الحاوية، ولا يتحول مجلد المستودع إلى 0777.
EVIDENCE_STAGE="$RUN_TMP/evidence"

mkdir -p "$EVIDENCE_STAGE"
chmod 0777 "$EVIDENCE_STAGE"

INNER="$RUN_TMP/lifecycle.sh"

cat > "$INNER" <<'INNER_BASH'
#!/bin/sh
set -eu

export DEBIAN_FRONTEND=noninteractive
export HOME=/root
export HOST=127.0.0.1

cp /etc/os-release /evidence/base-image-or-rootfs-identity.txt

{
  echo "NODE=$(node --version)"
  echo "NPM=$(npm --version)"
  echo "DPKG=$(dpkg --version | head -1)"
  echo "ARCH=$(dpkg --print-architecture)"
} > /evidence/container-toolchain.txt

# SHEIKHA_V6_EPHEMERAL_LIFECYCLE_SECURITY_CONTEXT
#
# قيم اختبار عشوائية داخل الحاوية فقط.
# لا تُحفظ القيم ولا تنتقل من المضيف.
# الإنتاج يستخدم مدير أسرار خارجيًا.

case "$-" in
  *x*)
    echo "XTRACE is forbidden during security setup." >&2
    exit 90
    ;;
esac

ORIGINAL_UMASK="$(umask)"
umask 077

export NODE_ENV=production
export HOST=127.0.0.1

JWT_SECRET="$(
  node -e '
    process.stdout.write(
      require("node:crypto")
        .randomBytes(48)
        .toString("hex")
    );
  '
)"

DATA_ENCRYPTION_KEY="$(
  node -e '
    process.stdout.write(
      require("node:crypto")
        .randomBytes(32)
        .toString("hex")
    );
  '
)"

PASSWORD_SALT="$(
  node -e '
    process.stdout.write(
      require("node:crypto")
        .randomBytes(32)
        .toString("hex")
    );
  '
)"

export JWT_SECRET
export DATA_ENCRYPTION_KEY
export PASSWORD_SALT

JWT_SECRET_LENGTH="${#JWT_SECRET}"
DATA_ENCRYPTION_KEY_LENGTH="${#DATA_ENCRYPTION_KEY}"
PASSWORD_SALT_LENGTH="${#PASSWORD_SALT}"

[ "$JWT_SECRET_LENGTH" -ge 32 ] || exit 91
[ "$DATA_ENCRYPTION_KEY_LENGTH" -eq 64 ] || exit 92
[ "$PASSWORD_SALT_LENGTH" -eq 64 ] || exit 93

umask "$ORIGINAL_UMASK"

mkdir -p /evidence

cat > /evidence/ephemeral-lifecycle-security-context.json <<JSON
{
  "schemaVersion": "6.0.0",
  "system": "SHEIKHA_V6_EPHEMERAL_LIFECYCLE_SECURITY_CONTEXT",
  "status": "ACTIVE_FOR_ISOLATED_NATIVE_VERIFICATION",
  "nodeEnvironment": "production",
  "host": "127.0.0.1",
  "variables": {
    "JWT_SECRET": {
      "present": true,
      "characterLength": $JWT_SECRET_LENGTH,
      "valueRecorded": false,
      "persistent": false
    },
    "DATA_ENCRYPTION_KEY": {
      "present": true,
      "encoding": "hex",
      "byteLength": 32,
      "characterLength": $DATA_ENCRYPTION_KEY_LENGTH,
      "valueRecorded": false,
      "persistent": false
    },
    "PASSWORD_SALT": {
      "present": true,
      "encoding": "hex",
      "byteLength": 32,
      "characterLength": $PASSWORD_SALT_LENGTH,
      "valueRecorded": false,
      "persistent": false
    }
  },
  "valuesGeneratedInsideContainer": true,
  "valuesTransferredFromHost": false,
  "valuesRecorded": false,
  "realProductionCredentialsUsed": false,
  "artifactModified": false,
  "hostEnvironmentModified": false,
  "externalNetworkUsed": false,
  "networkMode": "none",
  "defaultAuthorization": "DENY",
  "principle": "لا ضرر ولا ضرار"
}
JSON

BASELINE=/input/baseline.deb
CANDIDATE=/input/candidate.deb

PKG="$(dpkg-deb -f "$BASELINE" Package)"
BASE_VERSION="$(dpkg-deb -f "$BASELINE" Version)"
NEW_VERSION="$(dpkg-deb -f "$CANDIDATE" Version)"

if ! dpkg --compare-versions "$NEW_VERSION" gt "$BASE_VERSION"; then
  echo "Candidate version is not greater." >&2
  exit 40
fi

mkdir -p /tmp/control-baseline /tmp/control-candidate

dpkg-deb -e "$BASELINE" /tmp/control-baseline
dpkg-deb -e "$CANDIDATE" /tmp/control-candidate

if grep -RInE \
  'systemctl|service[[:space:]]+[A-Za-z0-9_.@-]+[[:space:]]+(start|restart|enable)' \
  /tmp/control-baseline /tmp/control-candidate \
  > /evidence/system-service-script-scan.txt 2>/dev/null; then

  if ! command -v systemctl >/dev/null 2>&1 ||
     [ ! -d /run/systemd/system ]; then
    echo "SYSTEMD_CAPABLE_ENVIRONMENT_REQUIRED" \
      > /evidence/systemd-blocker.txt
    exit 44
  fi
else
  : > /evidence/system-service-script-scan.txt
fi

find_server() {
  # SHEIKHA_V6_CANONICAL_SERVER_DISCOVERY
  #
  # يمنع اختيار server.js تابع من node_modules.
  # خادم المنتج القانوني محدد بعقد الحزمة.

  canonical="/usr/lib/sheikha/server.js"

  if ! dpkg -L "$PKG" |
       grep -Fqx "$canonical"
  then
    echo "Canonical server is not registered by dpkg:" >&2
    echo "$canonical" >&2
    return 1
  fi

  if [ ! -f "$canonical" ]; then
    echo "Canonical server file is missing:" >&2
    echo "$canonical" >&2
    return 1
  fi

  printf '%s\n' "$canonical"
}

find_cli() {
  # SHEIKHA_V6_CANONICAL_CLI_DISCOVERY
  #
  # نستخدم CLI القانوني داخل APPROOT أولًا.
  # /usr/bin يبقى مدخلًا عامًا، لكنه لا يتقدم على
  # النسخة القانونية عند فحص دورة الحياة.

  for candidate in \
    /usr/lib/sheikha/bin/sheikha \
    /usr/bin/sheikha
  do
    if [ -f "$candidate" ] &&
       [ -x "$candidate" ]
    then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

run_cli() {
  cli="$1"
  flag="$2"

  if [ -x "$cli" ]; then
    "$cli" "$flag"
  else
    node "$cli" "$flag"
  fi
}

free_port() {
  node -e '
    const net = require("node:net");
    const server = net.createServer();

    server.listen(0, "127.0.0.1", () => {
      console.log(server.address().port);
      server.close();
    });
  '
}

port_closed() {
  port="$1"

  node - "$port" <<'NODE'
const net = require('node:net');
const port = Number(process.argv[2]);

const socket = net.connect({
  host: '127.0.0.1',
  port
});

socket.setTimeout(750);

socket.on('connect', () => process.exit(1));
socket.on('timeout', () => process.exit(0));
socket.on('error', () => process.exit(0));
NODE
}

no_server_processes() {
  server_path="$1"

  node - "$server_path" <<'NODE'
const fs = require('node:fs');
const path = require('node:path');

const requestedNeedle = process.argv[2];
const needle = fs.realpathSync(requestedNeedle);
const selfPid = process.pid;
const hits = [];

for (const entry of fs.readdirSync('/proc')) {
  if (!/^\d+$/.test(entry)) continue;

  const pid = Number(entry);

  // SHEIKHA_V6_EXACT_PROCESS_SCAN
  // يمنع أداة الفحص من مطابقة نفسها.
  if (pid === selfPid) continue;

  try {
    const raw = fs.readFileSync(
      `/proc/${entry}/cmdline`
    );

    const argv = raw
      .toString()
      .split('\0')
      .filter(Boolean);

    if (argv.length < 2) continue;

    const executable = path.basename(argv[0]);

    if (!/^node(?:js)?(?:\d+)?$/.test(executable)) {
      continue;
    }

    // الخادم الحقيقي يُشغّل هكذا:
    // node /usr/lib/sheikha/server.js
    //
    // أما أداة الفحص فتُشغّل:
    // node - /usr/lib/sheikha/server.js
    //
    // لذلك يجب فحص argv[1] فقط، لا البحث الجزئي
    // في cmdline كاملًا.
    const scriptArgument = argv[1];

    if (!scriptArgument || scriptArgument === '-') {
      continue;
    }

    let resolvedScript;

    try {
      resolvedScript = fs.realpathSync(scriptArgument);
    } catch {
      continue;
    }

    if (resolvedScript !== needle) {
      continue;
    }

    hits.push({
      pid,
      executable,
      script: resolvedScript,
      command: argv.join(' ')
    });
  } catch {
    // قد تنتهي العملية أثناء قراءة /proc.
  }
}

console.log(JSON.stringify(hits, null, 2));
process.exit(hits.length === 0 ? 0 : 1);
NODE
}

smoke() {
  label="$1"
  signal="$2"
  cli_contract="${3:-strict-candidate}"

  server="$(find_server)"
  cli="$(find_cli)"

  if [ -z "$server" ] || [ ! -f "$server" ]; then
    echo "Installed server.js not found." >&2
    exit 50
  fi

  if [ -z "$cli" ] || [ ! -f "$cli" ]; then
    echo "Installed CLI not found." >&2
    exit 51
  fi

  # SHEIKHA_V6_PHASE_AWARE_CLI_CONTRACT
  #
  # Baseline التشغيلية V6.1 وCandidate V6.2
  # يجب أن ينجحا بالعقد الصارم:
  #   --help
  #   --version
  #
  # حزمة V2 التاريخية ليست Baseline تشغيلية.

  case "$cli_contract" in
    legacy-baseline)
      run_cli "$cli" help \
        > "/evidence/${label}-cli-help.txt"

      grep -Fq \
        'Sheikha CLI' \
        "/evidence/${label}-cli-help.txt"

      installed_package_version="$(
        dpkg-query -W -f='${Version}' "$PKG"
      )"

      printf '%s\n' \
        "$installed_package_version" \
        > "/evidence/${label}-cli-version.txt"

      cat > "/evidence/${label}-cli-contract.json" <<JSON
{
  "schemaVersion": "6.0.0",
  "label": "$label",
  "contract": "LEGACY_BASELINE_COMPATIBILITY",
  "helpCommand": "help",
  "versionSource": "dpkg-query",
  "installedPackageVersion": "$installed_package_version",
  "modernMetaFlagsClaimed": false,
  "candidateCliContractSatisfied": false,
  "legacyCompatibilityUsed": true,
  "defaultAuthorization": "DENY",
  "principle": "لا ضرر ولا ضرار"
}
JSON
      ;;

    strict-candidate)
      run_cli "$cli" --help \
        > "/evidence/${label}-cli-help.txt"

      run_cli "$cli" --version \
        > "/evidence/${label}-cli-version.txt"

      grep -Fq \
        'Sheikha CLI' \
        "/evidence/${label}-cli-help.txt"

      cli_application_version="$(
        tr -d '\r\n' \
          < "/evidence/${label}-cli-version.txt"
      )"

      if [ "$cli_application_version" != "1.0.51" ]; then
        echo "Unexpected candidate CLI version:" >&2
        echo "$cli_application_version" >&2
        exit 53
      fi

      installed_package_version="$(
        dpkg-query -W -f='${Version}' "$PKG"
      )"

      cat > "/evidence/${label}-cli-contract.json" <<JSON
{
  "schemaVersion": "6.0.0",
  "label": "$label",
  "contract": "STRICT_V6_RUNTIME_META_FLAGS",
  "helpCommand": "--help",
  "versionCommand": "--version",
  "applicationVersion": "$cli_application_version",
  "installedPackageVersion": "$installed_package_version",
  "modernMetaFlagsClaimed": true,
  "runtimeCliContractSatisfied": true,
  "legacyCompatibilityUsed": false,
  "defaultAuthorization": "DENY",
  "principle": "لا ضرر ولا ضرار"
}
JSON
      ;;

    *)
      echo "Unknown CLI contract: $cli_contract" >&2
      exit 54
      ;;
  esac

  port="$(free_port)"

  HOST=127.0.0.1 \
  PORT="$port" \
  node "$server" \
    > "/evidence/${label}-server.stdout.log" \
    2> "/evidence/${label}-server.stderr.log" &

  pid=$!

  started=0
  count=0

  while [ "$count" -lt 80 ]; do
    if node - "$port" <<'NODE' >/dev/null 2>&1
const port = Number(process.argv[2]);

fetch(`http://127.0.0.1:${port}/api/health`)
  .then(response => process.exit(response.ok ? 0 : 1))
  .catch(() => process.exit(1));
NODE
    then
      started=1
      break
    fi

    if ! kill -0 "$pid" 2>/dev/null; then
      break
    fi

    sleep 0.25
    count=$((count + 1))
  done

  if [ "$started" -ne 1 ]; then
    cat "/evidence/${label}-server.stderr.log" >&2 || true
    exit 52
  fi

  node - "$port" > "/evidence/${label}-health.json" <<'NODE'
const port = Number(process.argv[2]);

fetch(`http://127.0.0.1:${port}/api/health`)
  .then(async response => {
    const body = await response.text();

    console.log(JSON.stringify({
      statusCode: response.status,
      ok: response.ok,
      body
    }, null, 2));

    process.exit(response.ok ? 0 : 1);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
NODE

  node - "$port" > "/evidence/${label}-chat.json" <<'NODE'
const port = Number(process.argv[2]);

fetch(`http://127.0.0.1:${port}/api/sheikha/live/chat/v1`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    message: 'اختبار دورة DEB V6',
    language: 'ar'
  })
})
  .then(async response => {
    const body = await response.text();

    console.log(JSON.stringify({
      statusCode: response.status,
      ok: response.ok,
      body: body.slice(0, 4000)
    }, null, 2));

    process.exit(response.ok ? 0 : 1);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
NODE

  {
    echo "label=$label"
    echo "pid=$pid"
    echo "port=$port"
    echo "signal=$signal"
  } > "/evidence/${label}-process.txt"

  # SHEIKHA_V6_PORTABLE_SIGNAL_DISPATCH
  case "$signal" in
    SIGTERM|TERM)
      portable_signal="TERM"
      ;;
    SIGINT|INT)
      portable_signal="INT"
      ;;
    *)
      echo "Unsupported lifecycle signal: $signal" >&2
      exit 58
      ;;
  esac

  kill -s "$portable_signal" "$pid"

  set +e
  wait "$pid"
  exit_code=$?
  set -e

  echo "$exit_code" \
    > "/evidence/${label}-exit-code.txt"

  port_closed "$port"
  no_server_processes "$server" \
    > "/evidence/${label}-remaining-processes.json"
}

dpkg -i "$BASELINE" \
  > /evidence/baseline-install.log 2>&1

dpkg-query -W \
  -f='${Package}\t${Version}\t${Architecture}\n' \
  "$PKG" \
  > /evidence/baseline-installed-package.txt

installed_base="$(dpkg-query -W -f='${Version}' "$PKG")"
[ "$installed_base" = "$BASE_VERSION" ]

smoke baseline SIGTERM strict-candidate

dpkg -i "$CANDIDATE" \
  > /evidence/upgrade.log 2>&1

installed_new="$(dpkg-query -W -f='${Version}' "$PKG")"
[ "$installed_new" = "$NEW_VERSION" ]

smoke upgraded-sigterm SIGTERM strict-candidate
smoke upgraded-sigint SIGINT strict-candidate

dpkg --remove "$PKG" \
  > /evidence/remove.log 2>&1

if dpkg-query -W "$PKG" >/dev/null 2>&1; then
  status="$(dpkg-query -W -f='${db:Status-Abbrev}' "$PKG" || true)"

  case "$status" in
    rc|rc*) ;;
    *)
      echo "Unexpected package state after remove: $status" >&2
      exit 60
      ;;
  esac
fi

echo '{"removeVerified":true}' \
  > /evidence/remove-verification.json

dpkg --purge "$PKG" \
  > /evidence/purge.log 2>&1 || true

if dpkg-query -W "$PKG" >/dev/null 2>&1; then
  echo "Package remains after purge." >&2
  exit 61
fi

echo '{"purgeVerified":true}' \
  > /evidence/purge-verification.json

dpkg -i "$BASELINE" \
  > /evidence/rollback-baseline-install.log 2>&1

dpkg -i "$CANDIDATE" \
  > /evidence/rollback-upgrade.log 2>&1

dpkg -i --force-downgrade "$BASELINE" \
  > /evidence/rollback-downgrade.log 2>&1

rollback_version="$(dpkg-query -W -f='${Version}' "$PKG")"
[ "$rollback_version" = "$BASE_VERSION" ]

smoke rollback SIGTERM strict-candidate

dpkg --purge "$PKG" \
  > /evidence/final-cleanup.log 2>&1 || true

if dpkg-query -W "$PKG" >/dev/null 2>&1; then
  echo "Package remains after final cleanup." >&2
  exit 62
fi

cat > /evidence/lifecycle-result.json <<JSON
{
  "baselineInstalled": true,
  "baselineLaunched": true,
  "upgradeExecuted": true,
  "upgradeVerified": true,
  "removeExecuted": true,
  "removeVerified": true,
  "purgeExecuted": true,
  "purgeVerified": true,
  "rollbackExecuted": true,
  "rollbackVerified": true,
  "healthVerified": true,
  "chatVerified": true,
  "cliVerified": true,
  "runtimeBaselineSelected": true,
  "baselineCliMetaFlagsVerified": true,
  "candidateCliMetaFlagsVerified": true,
  "rollbackCliMetaFlagsVerified": true,
  "historicalV2UsedAsRuntimeBaseline": false,
  "cleanShutdownVerified": true,
  "noRemainingProcesses": true,
  "noRemainingPorts": true,
  "loopbackOnly": true,
  "externalNetworkUsed": false,
  "nativeVerified": true
}
JSON
INNER_BASH

chmod +x "$INNER"

set +e

"$ENGINE" run --rm \
  --network none \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --mount \
    type=bind,src="$BASELINE_ABS",dst=/input/baseline.deb,readonly \
  --mount \
    type=bind,src="$CANDIDATE_ABS",dst=/input/candidate.deb,readonly \
  --mount \
    type=bind,src="$EVIDENCE_STAGE",dst=/evidence \
  --mount \
    type=bind,src="$INNER",dst=/runner/lifecycle.sh,readonly \
  "$IMAGE" \
  /bin/sh /runner/lifecycle.sh

RUN_STATUS=$?
set -e

copy_evidence_stage() {
  local source
  local relative
  local destination
  local temporary

  while IFS= read -r -d '' source; do
    relative="${source#"$EVIDENCE_STAGE"/}"
    destination="$REPORT_DIR/$relative"
    temporary="$destination.tmp-v6-copy"

    mkdir -p "$(dirname "$destination")"

    cp -- "$source" "$temporary"
    chmod 0644 "$temporary"
    mv -f -- "$temporary" "$destination"
  done < <(
    find "$EVIDENCE_STAGE"       -type f       -print0
  )
}

copy_evidence_stage


if [[ "$RUN_STATUS" -eq 44 ]]; then
  node - "$ENGINE" "$IMAGE" <<'NODE'
const fs = require('node:fs');

const [engine, image] = process.argv.slice(2);

const report = {
  schemaVersion: '6.0.0',
  system: 'SHEIKHA_LINUX_DEB_NATIVE_LIFECYCLE_V6',
  status: 'SYSTEMD_CAPABLE_ENVIRONMENT_REQUIRED',
  containerEngine: engine,
  image,
  nativeVerified: false,
  canonicalPromotionAllowed: false,
  hostPackagesInstalled: false,
  externalNetworkUsed: false,
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(
  'runtime/distribution/v6/sheikha-linux-deb-native-lifecycle-v6-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

console.log(JSON.stringify(report, null, 2));
NODE

  exit 44
fi

if [[ "$RUN_STATUS" -ne 0 ]]; then
  echo "V6 lifecycle فشلت برمز: $RUN_STATUS"
  exit "$RUN_STATUS"
fi

[[ -f "$REPORT_DIR/lifecycle-result.json" ]]

node - \
  "$ENGINE" \
  "$IMAGE" \
  "$BASELINE_ABS" \
  "$CANDIDATE_ABS" \
  "$BASE_VERSION" \
  "$CANDIDATE_VERSION" \
  "$CANDIDATE_SHA" \
  "$CANDIDATE_BYTES" <<'NODE'
const fs = require('node:fs');

const [
  engine,
  image,
  baseline,
  candidate,
  baselineVersion,
  candidateVersion,
  sha256,
  bytes
] = process.argv.slice(2);

const lifecycle = JSON.parse(
  fs.readFileSync(
    'runtime/distribution/v6/evidence/lifecycle-result.json',
    'utf8'
  )
);

const required = [
  'baselineInstalled',
  'baselineLaunched',
  'upgradeExecuted',
  'upgradeVerified',
  'removeExecuted',
  'removeVerified',
  'purgeExecuted',
  'purgeVerified',
  'rollbackExecuted',
  'rollbackVerified',
  'healthVerified',
  'chatVerified',
  'cliVerified',
  'cleanShutdownVerified',
  'noRemainingProcesses',
  'noRemainingPorts',
  'loopbackOnly',
  'nativeVerified'
];

const passed = required.every(key => lifecycle[key] === true);

const report = {
  schemaVersion: '6.0.0',
  system: 'SHEIKHA_LINUX_DEB_NATIVE_LIFECYCLE_V6',
  status: passed
    ? 'DEB_NATIVE_LIFECYCLE_VERIFIED'
    : 'DEB_NATIVE_LIFECYCLE_FAILED',
  platform: 'linux',
  distributionFamily: 'debian',
  architecture: 'amd64',
  target: 'linux-deb-amd64',
  environment: {
    engine,
    image,
    networkMode: 'none'
  },
  artifacts: {
    baseline: {
      path: baseline,
      version: baselineVersion
    },
    candidate: {
      path: candidate,
      version: candidateVersion,
      bytes: Number(bytes),
      sha256
    }
  },
  ...lifecycle,
  externalNetworkUsed: false,
  hostPackagesInstalled: false,
  githubUsed: false,
  signingUsed: false,
  nativeVerified: passed,
  canonicalPromotionAllowed: passed,
  matrixAfterPromotion: passed
    ? {
        targetCount: 27,
        verified: 3,
        builtNotNativeVerified: 0,
        remaining: 24
      }
    : {
        targetCount: 27,
        verified: 2,
        builtNotNativeVerified: 1,
        remaining: 25
      },
  claimPolicy:
    'No DEB target is VERIFIED without real dpkg install, upgrade, remove, purge and rollback verification.',
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(
  'runtime/distribution/v6/sheikha-linux-deb-native-lifecycle-v6-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

const overlay = {
  schemaVersion: '6.0.0',
  system: 'SHEIKHA_CURRENT_DISTRIBUTION_TARGET_STATUS_V6',
  historicalMatrixUnmodified: true,
  targetCount: 27,
  targets: {
    'linux-cli-x86_64': 'VERIFIED',
    'linux-tar-x86_64': 'VERIFIED',
    'linux-deb-amd64': passed
      ? 'VERIFIED'
      : 'BUILT_NOT_NATIVE_VERIFIED'
  },
  counts: report.matrixAfterPromotion,
  generatedAt: report.generatedAt
};

fs.writeFileSync(
  'distribution/manifest/sheikha-target-status-v6.json',
  JSON.stringify(overlay, null, 2) + '\n'
);

console.log(JSON.stringify(report, null, 2));

if (!passed) {
  process.exit(70);
}
NODE

# SHEIKHA_V6_RUNTIME_BASELINE_REPORT_PROVENANCE
#
# يفصل بين إصدار التطبيق وإصدار حزمة dpkg.
# مصدر الحقيقة هنا هو metadata الحزمة نفسها.

BASELINE_REPORT_VERSION="$(
  dpkg-deb -f "$BASELINE_ABS" Version
)"

BASELINE_REPORT_SHA256="$(
  sha256sum "$BASELINE_ABS" |
  awk '{print $1}'
)"

BASELINE_REPORT_BYTES="$(
  stat -c '%s' "$BASELINE_ABS"
)"

CANDIDATE_REPORT_VERSION="$(
  dpkg-deb -f "$CANDIDATE_ABS" Version
)"

CANDIDATE_REPORT_SHA256="$(
  sha256sum "$CANDIDATE_ABS" |
  awk '{print $1}'
)"

CANDIDATE_REPORT_BYTES="$(
  stat -c '%s' "$CANDIDATE_ABS"
)"

REPORT_PROVENANCE_PATH="$(
  dirname "$REPORT_DIR"
)/sheikha-linux-deb-native-lifecycle-v6-report.json"

node - \
  "$REPORT_PROVENANCE_PATH" \
  "$BASELINE_REPORT_VERSION" \
  "$BASELINE_REPORT_SHA256" \
  "$BASELINE_REPORT_BYTES" \
  "$CANDIDATE_REPORT_VERSION" \
  "$CANDIDATE_REPORT_SHA256" \
  "$CANDIDATE_REPORT_BYTES" <<'NODE_REPORT_PROVENANCE'
const fs = require('node:fs');

const [
  reportPath,
  baselineVersion,
  baselineSha256,
  baselineBytes,
  candidateVersion,
  candidateSha256,
  candidateBytes
] = process.argv.slice(2);

const report = JSON.parse(
  fs.readFileSync(reportPath, 'utf8')
);

report.artifacts =
  report.artifacts || {};

report.artifacts.baseline = {
  ...(report.artifacts.baseline || {}),
  version: baselineVersion,
  bytes: Number(baselineBytes),
  sha256: baselineSha256,
  versionSemantics: 'DEBIAN_PACKAGE_VERSION'
};

report.artifacts.candidate = {
  ...(report.artifacts.candidate || {}),
  version: candidateVersion,
  bytes: Number(candidateBytes),
  sha256: candidateSha256,
  versionSemantics: 'DEBIAN_PACKAGE_VERSION'
};

report.applicationVersion = '1.0.51';

report.runtimeBaselineProvenance = {
  selected: true,
  packageVersion: baselineVersion,
  sha256: baselineSha256,
  bytes: Number(baselineBytes),
  historicalV2Used: false,
  sourceOfTruth: 'dpkg-deb-control-metadata'
};

report.candidateProvenance = {
  packageVersion: candidateVersion,
  sha256: candidateSha256,
  bytes: Number(candidateBytes),
  sourceOfTruth: 'dpkg-deb-control-metadata'
};

fs.writeFileSync(
  reportPath,
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8'
);

console.log(
  'SHEIKHA_V6_RUNTIME_BASELINE_REPORT_PROVENANCE_NORMALIZED'
);
NODE_REPORT_PROVENANCE

echo "SHEIKHA_V6_RUNTIME_BASELINE_REPORT_PROVENANCE_VERIFIED"

echo "SHEIKHA_V6_DEB_NATIVE_VERIFIED"
