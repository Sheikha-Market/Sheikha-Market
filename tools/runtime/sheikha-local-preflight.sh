#!/usr/bin/env bash
# Build and test a new isolated local candidate. No cloud calls or host ports.
set -euo pipefail
umask 077

if (( $# > 1 )); then
  printf 'Usage: %s [local-image-tag]\n' "$0" >&2
  exit 2
fi
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd -- "$script_dir/../.." && pwd -P)"
image="${1:-localhost/sheikha-main-portal:v43.83-preflight}"
[[ "$image" == localhost/* && "$image" != *[[:space:]]* ]] || {
  printf 'Use a localhost/ image tag.\n' >&2; exit 2;
}
for command in node python3 podman timeout mktemp; do
  command -v "$command" >/dev/null || { printf 'Required command missing: %s\n' "$command" >&2; exit 1; }
done
helper="$script_dir/sheikha-local-preflight.cjs"
[[ -f "$helper" && ! -L "$helper" ]] || { printf 'Local harness missing.\n' >&2; exit 1; }
report_dir="$(mktemp -d /tmp/sheikha-local-preflight.XXXXXX)"
container_name="sheikha-preflight-${report_dir##*.}-$$"
container_name="${container_name,,}"
context=''
image_id=''
stage='prepare'
created=false

cleanup() {
  local run_code=$? cleanup_ok=true receipt_code=1
  trap - EXIT INT TERM
  if [[ "$created" == true ]]; then
    podman logs "$container_name" >"$report_dir/container.log" 2>&1 || true
    if ! timeout 20s podman rm -f "$container_name" >>"$report_dir/cleanup.log" 2>&1; then
      cleanup_ok=false
    fi
  fi
  # This path is returned by the staging tool; never remove the source tree.
  if [[ "$context" == /tmp/sheikha-deploy.* && -d "$context" && ! -L "$context" ]]; then
    rm -rf -- "$context" || cleanup_ok=false
  fi
  if node "$helper" receipt "$report_dir" "$image" "$container_name" "$stage" "$run_code" "$cleanup_ok" "$image_id" "$repo_root/.dockerignore"; then
    receipt_code=0
  fi
  exit "$receipt_code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# No dependency download: the application dependency layer must be cached.
context="$(bash "$script_dir/sheikha-prepare-cloud-run-context.sh" 2>"$report_dir/context.log")"
[[ "$context" == /tmp/sheikha-deploy.* && -d "$context" && ! -L "$context" ]]
node "$helper" hash "$context" >"$report_dir/source.json"
stage='build'
podman build --network=none --pull=false -t "$image" "$context" >"$report_dir/build.log" 2>&1
image_id="$(podman image inspect --format '{{.Id}}' "$image" 2>"$report_dir/image.log")"
stage='create'
# Old Podman syntax; no cgroup controllers, external network or published ports.
podman create --name "$container_name" --network none --cgroups disabled --entrypoint node \
  "$image_id" /tmp/sheikha-local-preflight.cjs launch >"$report_dir/container.id" 2>"$report_dir/create.log"
created=true
podman cp "$helper" "$container_name:/tmp/sheikha-local-preflight.cjs" >"$report_dir/copy.log" 2>&1
podman start "$container_name" >"$report_dir/start.log" 2>&1
stage='http'
timeout 180s podman exec "$container_name" node /tmp/sheikha-local-preflight.cjs test \
  >"$report_dir/http.json" 2>"$report_dir/http.log"
stage='complete'
