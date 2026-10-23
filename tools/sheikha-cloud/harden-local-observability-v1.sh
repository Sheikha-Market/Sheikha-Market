#!/usr/bin/env bash
set -Eeuo pipefail

PROMETHEUS_DEFAULT=/etc/default/prometheus
GRAFANA_CONFIG=/etc/grafana/grafana.ini
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="/var/backups/sheikha-cloud-observability-${STAMP}"
CHANGED=false

if [[ ${EUID} -ne 0 ]]; then
  printf '%s\n' 'ERROR=ROOT_REQUIRED'
  printf 'RUN=sudo bash %q\n' "$0"
  exit 77
fi

for file in "$PROMETHEUS_DEFAULT" "$GRAFANA_CONFIG"; do
  [[ -f "$file" ]] || { printf 'ERROR=REQUIRED_FILE_MISSING FILE=%s\n' "$file"; exit 1; }
done

mkdir -p "$BACKUP_DIR"
cp -a "$PROMETHEUS_DEFAULT" "$BACKUP_DIR/prometheus.default"
cp -a "$GRAFANA_CONFIG" "$BACKUP_DIR/grafana.ini"

rollback() {
  local exit_code=$?
  if [[ "$CHANGED" == true && $exit_code -ne 0 ]]; then
    cp -a "$BACKUP_DIR/prometheus.default" "$PROMETHEUS_DEFAULT"
    cp -a "$BACKUP_DIR/grafana.ini" "$GRAFANA_CONFIG"
    systemctl restart prometheus grafana-server || true
    printf 'ROLLBACK_COMPLETE=true BACKUP_DIR=%s\n' "$BACKUP_DIR"
  fi
  exit "$exit_code"
}
trap rollback EXIT

sed -i 's|^ARGS=.*$|ARGS="--web.listen-address=127.0.0.1:9090"|' "$PROMETHEUS_DEFAULT"

if grep -Eq '^[;#]?[[:space:]]*http_addr[[:space:]]*=' "$GRAFANA_CONFIG"; then
  sed -i '0,/^[;#]\?[[:space:]]*http_addr[[:space:]]*=.*/s//http_addr = 127.0.0.1/' "$GRAFANA_CONFIG"
else
  sed -i '/^\[server\]/a http_addr = 127.0.0.1' "$GRAFANA_CONFIG"
fi

CHANGED=true
systemctl restart prometheus grafana-server

for attempt in {1..20}; do
  if curl -fsS http://127.0.0.1:9090/-/ready >/dev/null \
    && curl -fsS http://127.0.0.1:3000/api/health >/dev/null; then
    break
  fi
  sleep 1
done

curl -fsS http://127.0.0.1:9090/-/ready >/dev/null
curl -fsS http://127.0.0.1:3000/api/health >/dev/null

if ss -ltn | grep -Eq '(^|[[:space:]])(0\.0\.0\.0|\*|\[::\]):(3000|9090)([[:space:]]|$)'; then
  printf '%s\n' 'ERROR=OBSERVABILITY_PORT_STILL_PUBLIC'
  exit 1
fi

trap - EXIT
printf '%s\n' 'SHEIKHA_CLOUD_OBSERVABILITY_HARDENING_COMPLETE=true'
printf 'BACKUP_DIR=%s\n' "$BACKUP_DIR"
printf '%s\n' 'PROMETHEUS_BIND=127.0.0.1:9090'
printf '%s\n' 'GRAFANA_BIND=127.0.0.1:3000'
