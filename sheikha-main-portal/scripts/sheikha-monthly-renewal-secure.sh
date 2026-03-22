#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

mkdir -p logs

if [ -f "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
    if command -v nvm >/dev/null 2>&1; then
        nvm use 25.6.1 >/dev/null 2>&1 || true
    fi
fi

startedAt="$(date '+%Y-%m-%dT%H:%M:%S%z')"

# سياسة إلزامية: فحص أمني قبل أي تحديث
npm run -s release:validate

# أي أمر تحديث يجب أن يمر بعد البوابة الأمنية
updateCmd="${SHEIKHA_MONTHLY_UPDATE_CMD:-}"
if [ -n "${updateCmd}" ]; then
    bash -lc "${updateCmd}"
fi

npm run -s dev:vscode:doctor
npm run -s ops:readiness
npm run -s ops:auth:readiness
bash scripts/sheikha-daily-health-auth-adc.sh >/tmp/sheikha-monthly-daily.out 2>/tmp/sheikha-monthly-daily.err || true
sealStatus='FAIL'
sealType='unknown'
if npm run -s ops:servers:covenant:monthly-seal; then
    sealStatus='PASS'
fi

latestSealFile='reports/servers/signed-seals/unified-server-covenant-seal-latest.json'
if [ -f "${latestSealFile}" ]; then
    parsedSealType="$(node -e "const fs=require('fs');const p='${latestSealFile}';const j=JSON.parse(fs.readFileSync(p,'utf8'));process.stdout.write((j?.data?.seal?.sealType)||'unknown');")"
    if [ -n "${parsedSealType}" ]; then
        sealType="${parsedSealType}"
    fi
fi

finishedAt="$(date '+%Y-%m-%dT%H:%M:%S%z')"
line="${finishedAt} policy=monthly-renewal security_gate=passed update_cmd=${updateCmd:-none}"

echo "${line}" | tee -a logs/monthly-renewal-secure.log > logs/monthly-renewal-secure.latest

printf '{\n'
printf '  "success": true,\n'
printf '  "data": {\n'
printf '    "securityGate": "passed",\n'
printf '    "sealStatus": "%s",\n' "${sealStatus}"
printf '    "sealType": "%s",\n' "${sealType}"
printf '    "updateCommand": "%s",\n' "${updateCmd:-none}"
printf '    "startedAt": "%s",\n' "${startedAt}"
printf '    "finishedAt": "%s"\n' "${finishedAt}"
printf '  },\n'
printf '  "message": "Monthly secure renewal completed",\n'
printf '  "timestamp": "%s"\n' "${finishedAt}"
printf '}\n'
