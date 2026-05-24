#!/usr/bin/env bash
set -Eeuo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   SHEIKHA DNS REPAIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sudo mkdir -p /etc/systemd/resolved.conf.d

sudo tee /etc/systemd/resolved.conf.d/sheikha-dns.conf >/dev/null <<'CONF'
[Resolve]
DNS=1.1.1.1 1.0.0.1 8.8.8.8 8.8.4.4
FallbackDNS=9.9.9.9 149.112.112.112
DNSSEC=no
DNSOverTLS=no
Cache=yes
DNSStubListener=yes
ReadEtcHosts=yes
CONF

sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
sudo systemctl restart systemd-resolved

echo
echo "✅ DNS config:"
resolvectl status | sed -n '1,80p'

echo
echo "✅ Tests:"
getent hosts github.com || true
getent hosts registry.npmjs.org || true
getent hosts api.github.com || true

echo
echo "✅ resolv.conf:"
cat /etc/resolv.conf

echo
echo "تم إصلاح DNS بإذن الله."
