#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SYSTEMD_DIR='/etc/systemd/system'
BIN_DIR='/usr/local/bin'

if [[ "$(id -u)" -ne 0 ]]; then
  echo 'ERROR: this installer must run as root (sudo).'
  exit 1
fi

install -m 0755 "$ROOT_DIR/scripts/sheikha-neural-gate-watchdog.sh" "$BIN_DIR/sheikha-neural-gate-watchdog.sh"
install -m 0644 "$ROOT_DIR/scripts/sheikha-neural-gate-watchdog.service" "$SYSTEMD_DIR/sheikha-neural-gate-watchdog.service"
install -m 0644 "$ROOT_DIR/scripts/sheikha-neural-gate-watchdog.timer" "$SYSTEMD_DIR/sheikha-neural-gate-watchdog.timer"

systemctl daemon-reload
systemctl enable --now sheikha-neural-gate-watchdog.timer
systemctl start sheikha-neural-gate-watchdog.service || true

echo 'Neural watchdog installed and enabled.'
systemctl status sheikha-neural-gate-watchdog.timer --no-pager || true
