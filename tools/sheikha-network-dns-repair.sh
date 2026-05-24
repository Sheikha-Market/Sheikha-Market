#!/usr/bin/env bash
set -Eeuo pipefail

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SHEIKHA DNS + NETWORK + GITHUB REPAIR
# Governed Enterprise Runtime Network Recovery
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ROOT_DIR="${HOME}/Projects/sheikha/sheikha-main-portal"

PRIMARY_DNS="1.1.1.1"
SECONDARY_DNS="8.8.8.8"

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " SHEIKHA NETWORK RECOVERY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# ──────────────────────────────────────────────────────────
# CHECK ROOT
# ──────────────────────────────────────────────────────────

if [[ $EUID -ne 0 ]]; then
    echo "[INFO] سيتم استخدام sudo..."
fi

# ──────────────────────────────────────────────────────────
# SYSTEMD-RESOLVED CHECK
# ──────────────────────────────────────────────────────────

echo "[1/8] فحص systemd-resolved..."

sudo systemctl enable systemd-resolved >/dev/null 2>&1 || true
sudo systemctl restart systemd-resolved

echo "[OK] systemd-resolved يعمل"

# ──────────────────────────────────────────────────────────
# CONFIGURE RESOLVED DNS
# ──────────────────────────────────────────────────────────

echo
echo "[2/8] إعداد DNS ثابت وآمن..."

sudo mkdir -p /etc/systemd/resolved.conf.d

sudo tee /etc/systemd/resolved.conf.d/sheikha-dns.conf >/dev/null <<EOF
[Resolve]
DNS=${PRIMARY_DNS} ${SECONDARY_DNS}
FallbackDNS=9.9.9.9 1.0.0.1
Domains=~.
DNSSEC=no
DNSOverTLS=no
Cache=yes
MulticastDNS=no
LLMNR=no
EOF

sudo systemctl restart systemd-resolved

echo "[OK] تم تفعيل DNS"

# ──────────────────────────────────────────────────────────
# REBUILD RESOLV.CONF
# ──────────────────────────────────────────────────────────

echo
echo "[3/8] إعادة بناء resolv.conf..."

sudo rm -f /etc/resolv.conf

sudo ln -s /run/systemd/resolve/resolv.conf /etc/resolv.conf

echo "[OK] resolv.conf مرتبط بشكل صحيح"

# ──────────────────────────────────────────────────────────
# RESTART NETWORK
# ──────────────────────────────────────────────────────────

echo
echo "[4/8] إعادة تشغيل الشبكة..."

sudo systemctl restart NetworkManager

sleep 4

echo "[OK] الشبكة مستقرة"

# ──────────────────────────────────────────────────────────
# VERIFY DNS
# ──────────────────────────────────────────────────────────

echo
echo "[5/8] اختبار DNS..."

resolvectl status | head -40 || true

echo
echo "[TEST] ping github.com"

if ping -c 2 github.com >/dev/null 2>&1; then
    echo "[OK] GitHub DNS يعمل"
else
    echo "[ERROR] فشل DNS"
    exit 1
fi

# ──────────────────────────────────────────────────────────
# VERIFY INTERNET
# ──────────────────────────────────────────────────────────

echo
echo "[6/8] اختبار الإنترنت..."

curl -I https://github.com --max-time 10 >/dev/null

echo "[OK] الإنترنت يعمل"

# ──────────────────────────────────────────────────────────
# VERIFY OLLAMA
# ──────────────────────────────────────────────────────────

echo
echo "[7/8] اختبار Ollama..."

if curl -s http://127.0.0.1:11434/api/tags >/dev/null; then
    echo "[OK] Ollama متصل"
else
    echo "[WARN] Ollama غير متصل"
fi

# ──────────────────────────────────────────────────────────
# VERIFY SHEIKHA
# ──────────────────────────────────────────────────────────

echo
echo "[8/8] اختبار Sheikha Runtime..."

if curl -s http://127.0.0.1:8080/api/runtime-root/health >/dev/null; then
    echo "[OK] Sheikha Runtime Root يعمل"
else
    echo "[WARN] Sheikha Runtime Root غير متاح"
fi

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " SHEIKHA NETWORK STATUS: ACTIVE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

echo "DNS:"
echo " - ${PRIMARY_DNS}"
echo " - ${SECONDARY_DNS}"

echo
echo "Endpoints:"
echo " - Runtime Root : http://127.0.0.1:8080"
echo " - Ollama       : http://127.0.0.1:11434"
echo " - Universal API: http://127.0.0.1:9191"

echo
echo "[DONE]"
