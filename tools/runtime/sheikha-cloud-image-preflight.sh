#!/usr/bin/env bash
# Cloud Build image gate only: no upload, push, deployment, real secrets or ports.
# Can also be inlined with bash -c from /workspace; arguments stay separate.
set -euo pipefail
umask 077

if (( $# < 1 || $# > 2 )); then
  printf 'Usage: %s image-reference [expected-source-json]\n' "$0" >&2
  exit 2
fi
image="$1"
if [[ "$image" == -* || ! "$image" =~ ^[A-Za-z0-9][A-Za-z0-9_./:@-]*$ ]]; then
  printf 'Refusing invalid image reference.\n' >&2
  exit 2
fi
for command in docker timeout mktemp sha256sum; do
  command -v "$command" >/dev/null || { printf 'Required command missing: %s\n' "$command" >&2; exit 1; }
done
if [[ -n "${BASH_SOURCE[0]:-}" && -f "${BASH_SOURCE[0]}" ]]; then
  script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
  workspace="$(cd -- "$script_dir/../.." && pwd -P)"
else
  workspace="${SHEIKHA_PREFLIGHT_WORKSPACE:-$PWD}"
fi
helper="${SHEIKHA_PREFLIGHT_HELPER:-$workspace/tools/runtime/sheikha-local-preflight.cjs}"
[[ -f "$helper" && ! -L "$helper" ]] || { printf 'Verified image harness is missing.\n' >&2; exit 1; }
if [[ $# == 2 && ( ! -f "$2" || -L "$2" ) ]]; then
  printf 'Expected source manifest is missing or unsafe.\n' >&2
  exit 2
fi
report_dir="$(mktemp -d "${SHEIKHA_PREFLIGHT_REPORT_DIR:-${TMPDIR:-/tmp}}/sheikha-cloud-preflight.XXXXXX")"
container_name="sheikha-ci-preflight-${report_dir##*.}-$$"
container_name="${container_name,,}"
owner_value='owned-preflight-v1'
created=false
stage='source-manifest'
image_id=''
cleanup() {
  local code=$? observed_label=''
  trap - EXIT INT TERM
  if [[ "$created" == true ]]; then
    observed_label="$(timeout -k 5s 15s docker inspect --format '{{index .Config.Labels "io.sheikha.image-preflight"}}' "$container_name" 2>"$report_dir/cleanup-inspect.log")" || code=1
    if [[ "$observed_label" == "$owner_value" ]]; then
      timeout -k 5s 20s docker rm -f "$container_name" >"$report_dir/cleanup.log" 2>&1 || code=1
    else
      code=1
      printf 'Refused cleanup: own-container label could not be verified.\n' >&2
    fi
  fi
  if (( code != 0 )); then
    printf 'FAIL: image preflight phase=%s; no push or deployment performed.\n' "$stage" >&2
  fi
  printf 'Image preflight report directory: %s\n' "$report_dir"
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

if [[ $# == 2 ]]; then
  cp -- "$2" "$report_dir/expected-source.json"
else
  # The optional fallback hashes only these eleven fixed paths, never env/data.
  critical=(server.js runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js
    runtime/sheikha-natural-integration/v1/sheikha-natural-integration-model.js
    routes/sheikha-infinite-agent/sheikha-infinite-agent-routes.js
    middleware/auth.js config/config.js Dockerfile package.json package-lock.json .dockerignore .gcloudignore)
  {
    printf '{"sourceHashes":{'
    separator=''
    for relative in "${critical[@]}"; do
      [[ -f "$workspace/$relative" && ! -L "$workspace/$relative" ]] || exit 1
      digest="$(sha256sum -- "$workspace/$relative")"
      digest="${digest%% *}"
      [[ "$digest" =~ ^[0-9a-f]{64}$ ]] || exit 1
      printf '%s"%s":"%s"' "$separator" "$relative" "$digest"
      separator=','
    done
    printf '}}\n'
  } >"$report_dir/expected-source.json"
fi

stage='image-inspection'
image_id="$(timeout -k 5s 20s docker image inspect --format '{{.Id}}' "$image" 2>"$report_dir/image.log")"
[[ "$image_id" =~ ^sha256:[0-9a-f]{64}$ ]] || { printf 'Immutable local image ID was not verified.\n' >&2; exit 1; }
launch_code="$(cat <<'NODE'
const keep = new Set(['PATH', 'HOME', 'HOSTNAME', 'LANG', 'TZ']);
for (const name of Object.keys(process.env)) if (!keep.has(name)) delete process.env[name];
Object.assign(process.env, {
  NODE_ENV: 'production', PORT: '8080', HOST: '0.0.0.0',
  SHEIKHA_ENABLE_ALL_ENGINES: 'false', SHEIKHA_ENABLE_CRON: 'false', SHEIKHA_LOCALMIND_BOOT: 'false',
  SHEIKHA_ENABLE_ANTHROPIC: 'false', SHEIKHA_AI_ROUTER_ENABLED: 'false',
  OLLAMA_ENABLED: 'false', OLLAMA_AUTO_UPDATE: 'false', OLLAMA_ALLOW_PULL: 'false', AI_MODE: 'local-first'
});
process.argv = [process.execPath, '/tmp/sheikha-ci-preflight.cjs', 'launch'];
require('/tmp/sheikha-ci-preflight.cjs');
NODE
)"
stage='container-create'
timeout -k 5s 30s docker create --name "$container_name" \
  --label "io.sheikha.image-preflight=$owner_value" --network none \
  --memory 1536m --cpus 2 --entrypoint node "$image_id" -e "$launch_code" \
  >"$report_dir/container.id" 2>"$report_dir/create.log"
created=true
timeout -k 5s 20s docker cp "$helper" "$container_name:/tmp/sheikha-ci-preflight.cjs" >"$report_dir/copy.log" 2>&1
timeout -k 5s 20s docker cp "$report_dir/expected-source.json" "$container_name:/tmp/sheikha-ci-expected-source.json" >>"$report_dir/copy.log" 2>&1
timeout -k 5s 20s docker start "$container_name" >"$report_dir/start.log" 2>&1

stage='http-41'
http_code=0
timeout -k 5s 180s docker exec "$container_name" node /tmp/sheikha-ci-preflight.cjs test \
  >"$report_dir/http.json" 2>"$report_dir/http.stderr" || http_code=$?
timeout -k 5s 20s docker cp "$report_dir/http.json" "$container_name:/tmp/sheikha-ci-http.json" >>"$report_dir/copy.log" 2>&1
stage='critical-source-verification'
verification_code=0
# Root here only reads the copied non-secret manifests and eleven fixed app files;
# the application and test harness continue under the image's normal USER.
timeout -k 5s 30s docker exec --user 0 -i "$container_name" node - \
  /tmp/sheikha-ci-expected-source.json /tmp/sheikha-ci-http.json "$image_id" "$http_code" \
  >"$report_dir/receipt.json" 2>"$report_dir/verification.stderr" <<'NODE' || verification_code=$?
'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const critical = ['server.js', 'runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js',
  'runtime/sheikha-natural-integration/v1/sheikha-natural-integration-model.js',
  'routes/sheikha-infinite-agent/sheikha-infinite-agent-routes.js', 'middleware/auth.js',
  'config/config.js', 'Dockerfile', 'package.json', 'package-lock.json', '.dockerignore', '.gcloudignore'];
let requests = [];
let sourceMatch = false;
let contextSha256 = null;
let passed = false;
let errorType = null;
try {
  const expected = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const result = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  const hashes = expected.sourceHashes || expected;
  assert.deepEqual(Object.keys(hashes).sort(), critical.slice().sort());
  for (const relative of critical) {
    assert.match(hashes[relative], /^[0-9a-f]{64}$/);
    const actual = crypto.createHash('sha256').update(fs.readFileSync('/app/' + relative)).digest('hex');
    assert.equal(actual, hashes[relative]);
    assert.equal(result.imageHashes[relative], actual);
  }
  sourceMatch = true;
  if (/^[0-9a-f]{64}$/.test(expected.contextSha256 || '')) contextSha256 = expected.contextSha256;
  assert.ok(Array.isArray(result.results));
  requests = result.results.map(row => {
    assert.match(row.method, /^(GET|POST|HEAD)$/);
    assert.match(row.path, /^\/[A-Za-z0-9_./-]{1,180}$/);
    assert.ok(Number.isInteger(row.status) && row.status >= 100 && row.status <= 599);
    assert.equal(typeof row.authenticated, 'boolean');
    assert.equal(typeof row.passed, 'boolean');
    return { method: row.method, path: row.path, authenticated: row.authenticated, status: row.status, passed: row.passed };
  });
  assert.equal(Number(process.argv[5]), 0);
  assert.equal(result.passed, true);
  assert.equal(result.envFilesAbsent, true);
  assert.equal(result.privateAssetsAbsent, true);
  assert.equal(requests.length, 41);
  assert.ok(requests.every(row => row.passed));
  passed = true;
} catch (error) { errorType = error.name; }
process.stdout.write(JSON.stringify({ schema: 'SHEIKHA_CLOUD_IMAGE_PREFLIGHT_V1', timestamp: new Date().toISOString(),
  passed, errorType, imageId: process.argv[4], sourceMatch, criticalFiles: critical.length, contextSha256,
  network: 'none', hostPorts: false, providerKeysInherited: false, realSecretManagerPayloadRead: false,
  externalDeployment: false, passedRequests: requests.filter(row => row.passed).length,
  totalRequests: requests.length, requests }) + '\n');
process.exitCode = passed ? 0 : 1;
NODE
if [[ -s "$report_dir/receipt.json" ]]; then cat -- "$report_dir/receipt.json"; fi
if (( http_code != 0 || verification_code != 0 )); then exit 1; fi
stage='passed'
printf 'PASS: 41/41 image HTTP checks and 11 matching critical source hashes; no push or deployment performed.\n'
