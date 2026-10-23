#!/usr/bin/env bash
# Start/status/stop one governed local container. Never changes cloud or devices.
set -euo pipefail
umask 077

[[ $# == 1 && "$1" =~ ^(start|status|stop)$ ]] || {
  printf 'Usage: %s start|status|stop\n' "$0" >&2; exit 2;
}
action="$1"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd -- "$script_dir/../.." && pwd -P)"
helper="$script_dir/sheikha-local-runtime.cjs"
name='sheikha-local-governed-v1'
owner_label='io.sheikha.local-runtime'
owner_value='governed-v1'
expected_image='4d0bb4c274eaad02a4c7996afe1897280135ad846e19f5d539d496dc51998375'
verified_receipt="$repo_root/private/reports/SHEIKHA-V43.83-LOCAL-PREFLIGHT-20261022T222134Z.json"
operations="$repo_root/private/operations"
for command in node podman timeout mktemp; do
  command -v "$command" >/dev/null || { printf 'Required command missing: %s\n' "$command" >&2; exit 1; }
done
[[ ! -L "$repo_root/private" && ! -L "$operations" && -f "$helper" && ! -L "$helper" ]] || exit 1
mkdir -p -m 700 "$operations"
report_dir="$(mktemp -d "$operations/local-runtime.XXXXXX")"
created=false
successful=false
port=''
container_id=''

owned_container() {
  local label image
  label="$(podman inspect --type container --format '{{index .Config.Labels "io.sheikha.local-runtime"}}' "$name" 2>>"$report_dir/inspect.log")" || return 1
  image="$(podman inspect --type container --format '{{.Image}}' "$name" 2>>"$report_dir/inspect.log")" || return 1
  [[ "$label" == "$owner_value" && "${image#sha256:}" == "$expected_image" ]]
}
cleanup() {
  local code=$?
  trap - EXIT INT TERM
  if [[ "$created" == true && "$successful" != true ]]; then
    podman logs "$name" >"$report_dir/container.log" 2>&1 || true
    if owned_container; then timeout 20s podman rm -f "$name" >>"$report_dir/cleanup.log" 2>&1 || true; fi
    node "$helper" receipt "$report_dir" "$action" FAILED "$port" "$container_id" || true
  fi
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

if podman container exists "$name" 2>"$report_dir/exists.log"; then
  if ! owned_container; then
    printf 'Refusing: named container ownership label or immutable image differs.\n' >&2; exit 1
  fi
  container_id="$(podman inspect --type container --format '{{.Id}}' "$name" 2>>"$report_dir/inspect.log")"
  if [[ "$action" == stop ]]; then
    timeout 20s podman stop --time 10 "$name" >"$report_dir/stop.log" 2>&1
    podman rm "$name" >"$report_dir/remove.log" 2>&1
    node "$helper" receipt "$report_dir" "$action" STOPPED '' "$container_id"
    exit 0
  fi
  running="$(podman inspect --type container --format '{{.State.Running}}' "$name" 2>>"$report_dir/inspect.log")"
  if [[ "$running" != true ]]; then
    printf 'Owned local container is stopped; use stop to remove it before start.\n' >&2; exit 1
  fi
  binding="$(podman port "$name" 8080/tcp 2>>"$report_dir/inspect.log")"
  [[ "$binding" =~ ^127\.0\.0\.1:(1918[5-9]|1919[0-5])$ ]] || {
    printf 'Refusing: local port publication differs from the allowed loopback range.\n' >&2; exit 1;
  }
  port="${binding##*:}"
  timeout 150s node "$helper" probe "$port" "$report_dir/probe.json" 2>"$report_dir/probe.log"
  node "$helper" receipt "$report_dir" "$action" RUNNING "$port" "$container_id"
  successful=true
  exit 0
else
  exists_code=$?
  [[ "$exists_code" == 1 ]] || { printf 'Podman inventory could not be read.\n' >&2; exit 1; }
fi

if [[ "$action" != start ]]; then
  node "$helper" receipt "$report_dir" "$action" ABSENT '' ''
  exit 0
fi

image_id="$(node "$helper" prepare "$verified_receipt" "$report_dir/verified-source.json" 2>"$report_dir/prepare.log")"
[[ "$image_id" == "$expected_image" ]]
observed_image="$(podman image inspect --format '{{.Id}}' "$image_id" 2>"$report_dir/image.log")"
[[ "${observed_image#sha256:}" == "$expected_image" ]]
port="$(node "$helper" port 2>"$report_dir/port.log")"
# Standard unprivileged rootless networking supports localhost publication.
# This is not an egress firewall; the child receives no provider/API credentials.
podman create --name "$name" --label "$owner_label=$owner_value" \
  --network slirp4netns:allow_host_loopback=false --cgroups disabled \
  --publish "127.0.0.1:$port:8080" --entrypoint node \
  "$image_id" /tmp/sheikha-local-runtime.cjs launch \
  >"$report_dir/container.id" 2>"$report_dir/create.log"
created=true
container_id="$(cat "$report_dir/container.id")"
podman cp "$helper" "$name:/tmp/sheikha-local-runtime.cjs" >"$report_dir/copy.log" 2>&1
podman cp "$report_dir/verified-source.json" "$name:/tmp/sheikha-local-runtime-source.json" >>"$report_dir/copy.log" 2>&1
podman start "$name" >"$report_dir/start.log" 2>&1
timeout 150s node "$helper" probe "$port" "$report_dir/probe.json" 2>"$report_dir/probe.log"
node "$helper" receipt "$report_dir" "$action" RUNNING "$port" "$container_id"
successful=true
