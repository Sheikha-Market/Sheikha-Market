#!/bin/bash
DOMAIN="sheikha.top"
NS_OUT=$(dig NS $DOMAIN +short 2>/dev/null | tr '\n' ' ')
DKIM_OUT=$(dig TXT google._domainkey.$DOMAIN +short 2>/dev/null | head -n 1)
TS=$(date -Iseconds)

if echo "$NS_OUT" | grep -qi "cloudflare.com"; then
  STATUS="ACTIVE_ON_CLOUDFLARE"
  MSG="✅ مبروك! نطاق $DOMAIN يعمل الآن رسمياً عبر خوادم Cloudflare ($NS_OUT)"
else
  STATUS="PENDING_NAMESERVERS"
  MSG="⏳ نطاق $DOMAIN حالياً على ($NS_OUT) — بانتظار تحديث Nameservers إلى jeremy.ns.cloudflare.com و nena.ns.cloudflare.com"
fi

echo "[$TS] $STATUS | $MSG | DKIM: ${DKIM_OUT:0:45}..." | tee -a logs/cloudflare_domain_monitor.log
