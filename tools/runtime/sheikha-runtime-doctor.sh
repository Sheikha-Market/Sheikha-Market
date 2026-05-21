#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
IDENTITY_FILE="$ROOT_DIR/runtime/core/runtime.identity.json"
AUTHORITY_FILE="$ROOT_DIR/runtime/contracts/process-authority.json"

authoritative_process='sheikha-main-portal'
single_port='8080'
disallowed_processes=''

if [[ -f "$AUTHORITY_FILE" ]]; then
	authoritative_process="$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(j.authoritativeProcess||'sheikha-main-portal');" "$AUTHORITY_FILE")"
	single_port="$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(String(j.singlePortAuthority||8080));" "$AUTHORITY_FILE")"
	disallowed_processes="$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write((j.disallowedProcesses||[]).join('\n'));" "$AUTHORITY_FILE")"
fi

echo "SHEIKHA RUNTIME DOCTOR"
echo "======================"

echo
echo "[IDENTITY]"
if [[ -f "$IDENTITY_FILE" ]]; then
	cat "$IDENTITY_FILE"
else
	echo "WARN: missing runtime identity file"
fi

echo
echo "[AUTHORITY]"
if [[ -f "$AUTHORITY_FILE" ]]; then
	cat "$AUTHORITY_FILE"
else
	echo "WARN: missing process authority file"
fi

echo
echo "[PM2]"
pm2 status

echo
echo "[PORT ${single_port}]"
ss -ltnp | grep ":${single_port}" || true

echo
echo "[HEALTH]"
curl -s "http://127.0.0.1:${single_port}/api/health" || true
echo

echo "[PROCESS]"
pm2 jlist | grep "$authoritative_process" | head || true

echo
echo "[AUTHORITY CHECK]"
echo "authoritative_process=${authoritative_process}"
echo "single_port=${single_port}"
if pm2 describe "$authoritative_process" >/dev/null 2>&1; then
	echo "OK: authoritative process is registered in PM2"
else
	echo "WARN: authoritative process is missing from PM2"
fi

if [[ -n "$disallowed_processes" ]]; then
	while IFS= read -r process_name; do
		[[ -z "$process_name" ]] && continue
		if pm2 describe "$process_name" >/dev/null 2>&1; then
			echo "WARN: disallowed PM2 process detected => $process_name"
		fi
	done <<< "$disallowed_processes"
fi

echo
echo "[GIT]"
git branch --show-current
git status --short
