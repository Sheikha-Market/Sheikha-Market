#!/bin/bash
# SHEIKHA UNIFIED DASHBOARD LAUNCHER (V141 -> V153 + Supervisor)
BASE_URL="http://127.0.0.1:18082"
ROUTES=(
  "/v143"
  "/v144-trinity"
  "/v147"
  "/v148"
  "/v149"
  "/v150"
  "/v150-topology"
  "/v151-geo-mind"
  "/v152"
  "/v153-infra"
  "/v155"
)
echo "▶ جاري فحص وفتح جميع اللوحات السيادية على النواة (18082)..."
for r in "${ROUTES[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${r}")
  printf "  %-18s -> HTTP %s\n" "$r" "$code"
done
# فتح أحدث لوحة (V153) ولوحة المراقب الساعي في المتصفح
xdg-open "${BASE_URL}/v153-infra" 2>/dev/null || sensible-browser "${BASE_URL}/v153-infra" &
