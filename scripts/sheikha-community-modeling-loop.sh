#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/home/sheikha/Projects/sheikha/sheikha-main-portal"
unset npm_config_prefix || true
unset NPM_CONFIG_PREFIX || true
unset npm_lifecycle_script || true
unset npm_lifecycle_event || true
cd "$ROOT_DIR"

while true; do
  node scripts/sheikha-community-modeling-ignite.js
  sleep 21600
done
