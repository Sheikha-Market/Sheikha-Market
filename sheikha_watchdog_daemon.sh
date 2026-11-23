#!/usr/bin/env bash
export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
PORTAL_DIR="/home/sheikha/Projects/sheikha/sheikha-main-portal"
LOG_STORE="/tmp/store_7788.log"
LOG_CF="/tmp/cf_tunnel_7788.log"
STATE_JSON="$PORTAL_DIR/direct_drive_governed_vault_v247/master_b_governed_editable/sheikha_watchdog_state.json"

heals_count=0

while true; do
  # أ) فحص استجابة الخادم الرئيسي على المنفذ 7788
  if ! curl -fsS --max-time 3 http://127.0.0.1:7788/api/pmf-lab-state >/dev/null 2>&1; then
    heals_count=$((heals_count + 1))
    pkill -f "store-7788.js" 2>/dev/null || true
    sleep 0.5
    nohup "/home/sheikha/.nvm/versions/node/v22.22.2/bin/node" "$PORTAL_DIR/store-7788.js" >> "$LOG_STORE" 2>&1 &
    sleep 1.5
  fi

  # ب) فحص نفق Cloudflare الخارجي (إذا كانت أداة cloudflared مثبتة ولم يكن النفق نشطاً)
  if command -v cloudflared >/dev/null 2>&1; then
    if ! pgrep -f "cloudflared.*7788" >/dev/null 2>&1; then
      nohup cloudflared tunnel --url http://127.0.0.1:7788 --no-autoupdate > "$LOG_CF" 2>&1 &
      sleep 3
    fi
    if [ -f "$LOG_CF" ]; then
      detected_url=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$LOG_CF" | tail -n 1)
      if [ -n "$detected_url" ]; then
        echo "$detected_url" > /tmp/sheikha_live_tunnel_url.txt
      fi
    fi
  fi

  live_url=$(cat /tmp/sheikha_live_tunnel_url.txt 2>/dev/null | tr -d '\n' || echo "https://advertisers-federation-attempt-formed.trycloudflare.com")
  store_pid=$(pgrep -f "store-7788.js" | head -n 1 || echo "0")
  cf_pid=$(pgrep -f "cloudflared" | head -n 1 || echo "0")
  now_ts=$(date '+%Y-%m-%d %H:%M:%S')

  cat <<JSON > "$STATE_JSON"
{
  "watchdog_id": "SHK-IMMORTAL-WATCHDOG-V15000",
  "status": "IMMORTAL_24_7_ACTIVE",
  "last_check": "$now_ts",
  "store_7788_pid": "$store_pid",
  "cloudflared_pid": "$cf_pid",
  "auto_heals_count": $heals_count,
  "live_tunnel_base_url": "$live_url",
  "live_bot_checkout_url": "$live_url/bot",
  "live_mobile_core_url": "$live_url/one-core"
}
JSON

  sleep 10
done
