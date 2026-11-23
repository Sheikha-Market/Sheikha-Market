#!/usr/bin/env bash
if ! pgrep -f "store-7788.js" > /dev/null; then
  nohup node "$HOME/Projects/sheikha/sheikha-main-portal/store-7788.js" > /tmp/store_7788.log 2>&1 &
  echo "✅ [Watchdog Bot] تم تشغيل الخادم المحلي على المنفذ 7788"
else
  echo "✅ [Watchdog Bot] الخادم المحلي مستقر على المنفذ 7788"
fi

if ! pgrep -f "1e82b6c7-fcbf-4ed8-b145-c11661d81516" > /dev/null; then
  nohup cloudflared tunnel --config "$HOME/Projects/sheikha/sheikha-main-portal/cloudflared-12-domains.yml" run 1e82b6c7-fcbf-4ed8-b145-c11661d81516 > /tmp/cloudflared_enterprise.log 2>&1 &
  echo "🔒 [Watchdog Bot] تم تشغيل نفق Cloudflare الرسمي (jed03)"
else
  echo "🔒 [Watchdog Bot] نفق Cloudflare الرسمي متصل ومستقر (jed03)"
fi
