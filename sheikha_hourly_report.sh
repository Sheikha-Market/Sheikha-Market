#!/bin/bash
set +H
BASE_DIR="$HOME/Projects/sheikha/sheikha-main-portal"
REPORT_DIR="$BASE_DIR/reports/archive"
LOG_FILE="$BASE_DIR/reports/sheikha_cron.log"
mkdir -p "$REPORT_DIR"
TS=$(date +"%Y%m%d_%H%M%S")
TS_HUMAN=$(date +"%Y-%m-%d %H:%M:%S %z")
FILE_PATH="$REPORT_DIR/sheikha_report_${TS}.json"
source ~/.config/sheikha/telegram.env 2>/dev/null || true
API_URL="http://127.0.0.1:18080/api/sheikha-unified/v79/status"
API_CODE=$(curl -s -o /tmp/sheikha_api.json -w "%{http_code}" "$API_URL" 2>&1 || echo "000")
cat > "$FILE_PATH" <<EOF
{"seal":"BOUND_BY_QURAN_SUNNAH","ts":"$TS_HUMAN","api":"$API_CODE","archive":"NEVER_OVERWRITE","games":"BOUNTIFUL"}
EOF
echo "[$TS_HUMAN] BOUND $FILE_PATH API:$API_CODE" >> "$LOG_FILE"
if [ "$API_CODE" != "200" ]; then
  MSG="🚨 SHEIKHA API DOWN%0A⏰ $TS_HUMAN%0A🔢 Code:$API_CODE%0A🛡️ BOUND_BY_QURAN_SUNNAH%0A741/5741/12464%0A🎮 Games BOUND"
  [ -n "$TELEGRAM_BOT" ] && curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT/sendMessage" -d "chat_id=$TELEGRAM_CHAT&text=$MSG" >> "$LOG_FILE" 2>&1 || true
  if [[ "$DISCORD_WEBHOOK" == https://discord.com/api/webhooks/* ]]; then
    curl -s -X POST "$DISCORD_WEBHOOK" -H "Content-Type: application/json" -d "{\"content\":\"🚨 SHEIKHA API DOWN - $TS_HUMAN - Code:$API_CODE - BOUND - 741/5741/12464 - 🎮\",\"username\":\"Sheikha BOUND\"}" >> "$LOG_FILE" 2>&1 || true
  fi
fi
ls -lh "$FILE_PATH"
