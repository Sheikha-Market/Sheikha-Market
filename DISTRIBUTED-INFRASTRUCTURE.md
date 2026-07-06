# بسم الله الرحمن الرحيم

# 🌍 SHEIKHA Distributed Infrastructure Guide

> **النقلة الكبيرة من "مجرد سيرفر" إلى "منصة عالمية موزعة"**

---

## 📋 فهرس المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [البنية المعمارية](#البنية-المعمارية)
3. [المكونات الثلاثة](#المكونات-الثلاثة)
4. [التثبيت السريع](#التثبيت-السريع)
5. [التكوين المتقدم](#التكوين-المتقدم)
6. [المراقبة والـ Logging](#المراقبة-والـ-logging)
7. [استكشاف الأخطاء](#استكشاف-الأخطاء)
8. [الخطوة القادمة: Kubernetes](#الخطوة-القادمة-kubernetes)

---

## 🎯 نظرة عامة

هذا النظام يحول منظومة شيخة من:

```
❌ Single Server (نقطة فشل واحدة)
↓
✅ Distributed Platform (نظام موزع مرن)
```

### المميزات الرئيسية:

| الميزة | التفاصيل |
|--------|---------|
| **HAProxy Mesh** | توزيع ذكي للطلبات بين السيرفرات |
| **Health-Aware Routing** | لا ترسل طلبات لسيرفر معطوب |
| **Auto Scaling** | توسع تلقائي بناءً على الحمل |
| **DNS Failover** | توجيه ذكي للدومين عند السقوط |
| **Zero Downtime** | تحديثات بدون إيقاف الخدمة |

---

## 🏗️ البنية المعمارية

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL USERS                           │
│                   (شيخة.top + IPs)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ (DNS + Port 80/443)
                     ▼
        ┌──────────────────────────────┐
        │   HAProxy (Mesh + Routing)   │
        │   Port 80/443 → Backend      │
        │   Port 8404 → Stats          │
        └──────────┬───────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
  ┌──────────────┐    ┌──────────────┐
  │ Primary SRV  │    │Secondary SRV │ (optional)
  │127.0.0.1:8080│    │X.X.X.X:8080  │
  │ (Always On)  │    │ (Scale Up)   │
  └──────────────┘    └──────────────┘

┌───────────────────────────────────────────────────────┐
│           MONITORING & AUTO-MANAGEMENT LAYER           │
├───────────────────────────────────────────────────────┤
│ • HAProxy Health Check (30s)                           │
│ • Auto Scaling Engine (10s)                            │
│ • DNS Failover Manager (30s)                           │
│ • Root Cells Integration                               │
└───────────────────────────────────────────────────────┘
```

---

## 🔧 المكونات الثلاثة

### 1️⃣ HAProxy Mesh (القلب الموزع)

**الملف:** `config/haproxy.cfg`

**الدور:**
- توزيع الطلبات بين السيرفرات
- فحص صحة كل سيرفر تلقائياً
- إعادة توجيه ذكية حسب المسار
- Dashboard للإحصائيات

**المنافذ:**
- `80` و `443`: الطلبات الحقيقية
- `8404`: Stats Dashboard

**الـ Backends:**
```
/api/*              → api_backend (balanced)
/سوق-شيخة/*        → market_backend
/لوحة-الادمن/*     → admin_backend (restricted)
/ws/*               → ws_backend (WebSocket)
/api/health         → health_backend (dedicated)
```

---

### 2️⃣ Auto Scaling Engine (التوسع الذكي)

**الملف:** `scripts/sheikha-autoscale.sh`

**الدور:**
- مراقبة الحمل والموارد
- تشغيل السيرفر الثاني عند الحاجة
- إيقاف السيرفر الثاني عند انخفاض الحمل
- تكامل مع HAProxy تلقائياً

**المقاييس المراقَبة:**
```
Load Average:
  - HIGH: > 2.0   → بدء التوسع
  - LOW:  < 0.5   → إيقاف التوسع

CPU Usage:
  - Threshold: > 75%

Memory:
  - HIGH: > 80%   → بدء التوسع
  - LOW:  < 40%   → إيقاف التوسع
```

**الـ Cooldown:**
- Scale UP:   60 ثانية (تجنب التذبذب)
- Scale DOWN: 300 ثانية (5 دقائق)

---

### 3️⃣ DNS Failover Manager (التوجيه العالمي)

**الملف:** `scripts/sheikha-dns-failover.sh`

**الدور:**
- فحص صحة السيرفر الرئيسي
- توجيه DNS للسيرفر الثاني عند السقوط
- دعم Cloudflare، Route53، و/etc/hosts

**الخيارات:**
```bash
# Cloudflare API
export CLOUDFLARE_API_KEY='sk_...'
export CLOUDFLARE_ZONE_ID='zone_...'

# أو Local Failover
# استخدم /etc/hosts
```

**فترة الفحص:** 30 ثانية

---

## 🚀 التثبيت السريع

### المتطلبات:
```bash
# تحديث النظام
apt update && apt upgrade -y

# الأدوات المطلوبة
apt install -y \
    curl \
    jq \
    bc \
    haproxy \
    openssh-client \
    pm2
```

### التثبيت الكامل (one-liner):

```bash
sudo /home/sheikha/Projects/sheikha/sheikha-main-portal/scripts/sheikha-distribute-setup.sh --all
```

### أو اختر المكونات:

```bash
# HAProxy فقط
sudo ./scripts/sheikha-distribute-setup.sh --haproxy-only

# Auto Scaling فقط
sudo ./scripts/sheikha-distribute-setup.sh --autoscale-only

# مع السيرفر الثاني
sudo ./scripts/sheikha-distribute-setup.sh --all --secondary-ip 192.168.1.100

# اختبار بدون تنفيذ
sudo ./scripts/sheikha-distribute-setup.sh --all --dry-run
```

---

## ⚙️ التكوين المتقدم

### 1. تكوين السيرفر الثاني

**على السيرفر الثاني:**

```bash
# 1. نسخ المشروع
git clone https://github.com/Sheikha-Market/sheikha-main-portal.git
cd sheikha-main-portal

# 2. تثبيت المتطلبات
npm install

# 3. تشغيل عبر PM2 (مع اسم مختلف)
pm2 start server.js --name sheikha-api-2
pm2 save

# 4. تفعيل SSH Access من السيرفر الرئيسي
# على السيرفر الرئيسي:
ssh-keygen -t rsa -f ~/.ssh/id_rsa -N ""
ssh-copy-id -i ~/.ssh/id_rsa.pub root@SECONDARY_IP
```

### 2. تكوين Cloudflare DNS

```bash
# احصل على API Key من Cloudflare:
# 1. Dashboard → My Profile → API Tokens
# 2. Create Token → Use template "Edit zone DNS"

# اعدّ المتغيرات:
export CLOUDFLARE_API_KEY='sk_live_...'
export CLOUDFLARE_ZONE_ID='zone_...'

# اختبر الاتصال:
curl -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_KEY}" \
    -H "Content-Type: application/json"
```

### 3. تكوين الـ Health Check

**تخصيص الـ Health Endpoint:**

```bash
# عدّل HAProxy config
nano /etc/haproxy/haproxy.cfg

# غيّر health check endpoint حسب احتياجك:
option httpchk GET /api/health HTTP/1.1\r\nHost:\ sheikha.top

# اختبر:
haproxy -c -f /etc/haproxy/haproxy.cfg
```

---

## 📊 المراقبة والـ Logging

### Dashboard الرئيسي:

```bash
# في المتصفح:
http://localhost:8404/stats
```

### السجلات:

```bash
# HAProxy Logs
tail -f /var/log/haproxy.log

# Health Check Logs
journalctl -u sheikha-haproxy-health -f

# Auto Scaling Logs
journalctl -u sheikha-autoscale -f

# DNS Failover Logs
journalctl -u sheikha-dns-failover -f
```

### المقاييس:

```bash
# HAProxy Metrics
cat /home/sheikha/Projects/sheikha/sheikha-main-portal/logs/haproxy-metrics.json

# Auto Scaling Metrics
cat /home/sheikha/Projects/sheikha/sheikha-main-portal/logs/autoscale-metrics.json

# DNS Failover Metrics
cat /home/sheikha/Projects/sheikha/sheikha-main-portal/logs/dns-failover-metrics.json
```

### Monitoring كامل:

```bash
# Script يجمع كل المقاييس
watch -n 5 'echo "=== HAProxy ===" && \
    curl -s http://localhost:8404/stats | head -20 && \
    echo "" && \
    echo "=== Metrics ===" && \
    cat /home/sheikha/Projects/sheikha/sheikha-main-portal/logs/*-metrics.json | jq'
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: HAProxy لا يبدأ

```bash
# فحص الـ Config
haproxy -c -f /etc/haproxy/haproxy.cfg

# اعرض الخطأ
systemctl status haproxy
journalctl -u haproxy -n 50
```

### المشكلة: السيرفر الثاني لا يبدأ

```bash
# تحقق من SSH Access
ssh -v root@SECONDARY_IP

# تحقق من PM2
ssh root@SECONDARY_IP "pm2 list"

# تحقق من الحمل
ssh root@SECONDARY_IP "uptime"
```

### المشكلة: DNS لا يتحدث

```bash
# تحقق من API Key
env | grep CLOUDFLARE

# اختبر الاتصال
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_KEY}"

# اعرض السجلات
tail -f /home/sheikha/Projects/sheikha/sheikha-main-portal/logs/sheikha-dns-failover.log
```

### المشكلة: Auto Scaling لا يعمل

```bash
# تحقق من الحمل
uptime

# تحقق من الـ Thresholds
grep THRESHOLD /home/sheikha/Projects/sheikha/sheikha-main-portal/scripts/sheikha-autoscale.sh

# اختبر يدوياً
DEBUG=1 bash /home/sheikha/Projects/sheikha/sheikha-main-portal/scripts/sheikha-autoscale.sh
```

---

## 🎯 الخطوة القادمة: Kubernetes (المستوى الأعلى)

عندما تصل لـ 10000+ من الطلبات في الثانية، انتقل إلى:

### Kubernetes Architecture:
```
Ingress Controller (Nginx/HAProxy)
  ↓
Service Load Balancer
  ↓
Deployment Pods (Auto-scaling via HPA)
  ↓
StatefulSet (للبيانات)
  ↓
Persistent Volumes
```

### الأمر:
```bash
# قل فقط:
"فعّل Kubernetes (MicroK8s Cluster كامل)"

# وسأبني لك:
# ✓ Multi-node Cluster
# ✓ Auto Healing
# ✓ Zero Downtime Deploy
# ✓ Full Observability
```

---

## 📞 Support & Contact

**الدعم الفني:**
- البريد: market@sheikha.top
- الموقع: https://sheikha.top
- الدومين: sheikha.top

**الملكية:**
سلمان أحمد بن سلمان الراجح — المالك الوحيد

---

## 🙏 الدعاء

> «الحمد لله على هذا النظام، والشكر لله على الرزق»
>
> اللهم اجعل هذا العمل خالصاً لوجهك الكريم، واجعله نافعاً للمسلمين

---

**آخر تحديث:** 5 مايو 2026
**الإصدار:** 1.0.0-distributed
