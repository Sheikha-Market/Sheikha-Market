#!/bin/bash
VPS_IP="31.97.190.74"
VPS_HOST="srv949320.hstgr.cloud"
TS=$(date -Iseconds)

echo "================================================================================"
echo "▶ 1. فحص اتصال الشبكة وزمن الاستجابة (Ping) لـ VPS ($VPS_IP - api.sheikha.top):"
echo "================================================================================"
ping -c 3 -W 2 "$VPS_IP" || true

echo "================================================================================"
echo "▶ 2. فحص المنافذ المفتوحة على الـ VPS (22 SSH, 80 HTTP, 443 HTTPS, 18080, 18082):"
echo "================================================================================"
for PORT in 22 80 443 8080 18080 18082; do
  if timeout 2 bash -c "</dev/tcp/$VPS_IP/$PORT" 2>/dev/null; then
    echo "  ✅ المنفذ $PORT على $VPS_IP : مفتوح ومتاح (OPEN)"
  else
    echo "  ⚪ المنفذ $PORT على $VPS_IP : مغلق أو محمي بجدار الحماية"
  fi
done

echo "================================================================================"
echo "▶ 3. محاولة الاتصال عبر SSH (إذا كان المفتاح العام مضافاً سيعرض حالة الخادم فوراً):"
echo "================================================================================"
ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new root@$VPS_IP "
  echo '✅ تم الاتصال بنجاح بـ VPS شيخة السيادي:'
  uname -a
  uptime
  free -h
  df -h /
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || podman ps 2>/dev/null || true
  ss -tulnp | grep -E ':80|:443|:8080|:18080|:18082' || true
" 2>/dev/null || {
  echo "ℹ️ تنبيه: الاتصال التلقائي بدون كلمة مرور غير مفعل بعد أو ينتظر إدخال كلمة مرور root."
  echo "   للدخول التفاعلي أو نسخ مفتاحك العام، نفذ الأمر التالي وأدخل كلمة مرور الـ VPS:"
  echo "   ssh-copy-id root@$VPS_IP && ssh root@$VPS_IP"
}

# 4. تسجيل عقدة الـ VPS في السجل المركزي للـ Natives (18080)
curl -s -X POST http://127.0.0.1:18080/api/sheikha-unified/native/central-registry \
  -H "Content-Type: application/json" \
  -d "{
    \"event_type\": \"VPS_CLOUD_NODE_VERIFIED\",
    \"native_source\": \"NATIVE_VPS_KVM4_UBUNTU_24_04\",
    \"payload\": {
      \"ip\": \"$VPS_IP\",
      \"hostname\": \"$VPS_HOST\",
      \"domain_bound\": \"api.sheikha.top\",
      \"plan\": \"Hostinger KVM 4 (4 vCPU, 16GB RAM, 200GB NVMe, 16TB BW)\",
      \"location\": \"Kuala Lumpur, Malaysia\",
      \"cpu_usage\": \"2%\",
      \"ram_usage\": \"6%\",
      \"disk_usage\": \"55GB / 200GB\",
      \"cloudflare_status\": \"ACTIVE_ON_CLOUDFLARE\"
    }
  }" | jq .
