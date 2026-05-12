#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

mkdir -p logs

# تجهيز البيئة لـ nvm عند التشغيل من cron
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
    if command -v nvm >/dev/null 2>&1; then
        nvm use 25.6.1 >/dev/null 2>&1 || true
    fi
fi

status='PASS'
healthState='ok'
authState='ok'
adcState='ok'
account='unknown'
project='unset'

if ! curl -fsS -m 20 http://127.0.0.1:8080/api/health >/dev/null 2>&1; then
    status='WARN'
    healthState='failed'
fi

if ! npm run -s ops:auth:readiness >/tmp/sheikha-auth-readiness.out 2>/tmp/sheikha-auth-readiness.err; then
    status='WARN'
    authState='failed'
fi

if command -v gcloud >/dev/null 2>&1; then
    if ! gcloud --quiet auth application-default print-access-token >/dev/null 2>&1; then
        status='WARN'
        adcState='relogin-required'
    fi
    account="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null | head -1)"
    project="$(gcloud config get-value project 2>/dev/null || true)"
    [ -z "${account}" ] && account='none'
    [ -z "${project}" ] && project='unset'
else
    status='WARN'
    adcState='gcloud-missing'
fi

ts="$(date '+%Y-%m-%dT%H:%M:%S%z')"
summary="${ts} status=${status} health=${healthState} auth=${authState} adc=${adcState} account=${account} project=${project}"

echo "${summary}" | tee -a logs/daily-health-auth-adc.log > logs/daily-health-auth-adc.latest

echo '{'
echo "  \"success\": true,"
echo '  "data": {'
echo "    \"status\": \"${status}\"," 
echo "    \"health\": \"${healthState}\"," 
echo "    \"auth\": \"${authState}\"," 
echo "    \"adc\": \"${adcState}\"," 
echo "    \"account\": \"${account}\"," 
echo "    \"project\": \"${project}\""
echo '  },'
echo "  \"message\": \"Daily watch cycle completed\","
echo "  \"timestamp\": \"${ts}\""
echo '}'
