# شيخة — دليل إعداد Cron Jobs للمراقبة الآلية

## الخطوات

### الخطوة 1: الدخول إلى VPS

```bash
ssh root@31.97.190.74
```

### الخطوة 2: إنشاء مجلد السجلات

```bash
mkdir -p /var/log/sheikha
chmod 755 /var/log/sheikha
```

### الخطوة 3: فتح محرر Crontab

```bash
crontab -e
```

### الخطوة 4: أضف الـ Cron Jobs التالية

**اختر محرر (مثلاً nano) واضف التالي**:

```cron
# شيخة — Automated Maintenance Tasks
# ────────────────────────────────────

# ✓ Every 5 minutes: Health monitoring
*/5 * * * * /opt/sheikha/current/scripts/health-monitor.sh >> /var/log/sheikha/health-monitor.log 2>&1

# ✓ Every Friday at 03:00 UTC: Weekly backup
0 3 * * 5 /opt/sheikha/current/scripts/backup-before-deploy.sh >> /var/log/sheikha/backup.log 2>&1

# ✓ Every 1st of month at 04:00 UTC: Monthly full check
0 4 1 * * (echo "=== Monthly System Check $(date) ===" >> /var/log/sheikha/monthly-check.log; /opt/sheikha/current/scripts/health-monitor.sh >> /var/log/sheikha/monthly-check.log 2>&1; df -h >> /var/log/sheikha/monthly-check.log 2>&1)

# ✓ Every day at 02:00 UTC: Log rotation
0 2 * * * find /var/log/sheikha -name "*.log" -mtime +30 -delete
```

### الخطوة 5: حفظ الإعدادات

- اضغط **Ctrl+X** في nano
- اضغط **Y** للموافقة
- اضغط **Enter** لحفظ

### الخطوة 6: التحقق من Cron Jobs

```bash
crontab -l
```

يجب أن ترى الـ jobs المضافة.

---

## شرح الـ Cron Jobs

| الجدول | التوقيت | المهمة | الملف |
|--------|---------|-------|------|
| `*/5 * * * *` | كل 5 دقائق | فحص الصحة | health-monitor.log |
| `0 3 * * 5` | الجمعة 3 صباحًا | نسخة احتياطية | backup.log |
| `0 4 1 * *` | الأول من كل شهر 4 صباحًا | فحص شامل | monthly-check.log |
| `0 2 * * *` | كل يوم 2 صباحًا | تنظيف السجلات | - |

---

## مراقبة السجلات

### مشاهدة السجلات الحية

```bash
# آخر 50 سطر من health monitoring
tail -50 /var/log/sheikha/health-monitor.log

# عرض حي للسجلات
tail -f /var/log/sheikha/health-monitor.log
```

### تحليل السجلات

```bash
# عد الأخطاء
grep -c "ERROR\|FAILED" /var/log/sheikha/health-monitor.log

# آخر 10 أخطاء
grep "ERROR\|FAILED" /var/log/sheikha/health-monitor.log | tail -10

# حجم السجلات
du -sh /var/log/sheikha/*
```

---

## تعديل الجدول الزمني

### تغيير توقيت Job

```bash
# مثال: تشغيل health check كل دقيقة بدلاً من كل 5 دقائق
crontab -e

# غيّر هذا السطر:
*/5 * * * * ...

# إلى هذا:
* * * * * ...
```

### حذف Job

```bash
crontab -e

# احذف السطر المطلوب
# ثم احفظ
```

### إيقاف جميع Jobs مؤقتاً

```bash
crontab -r
```

---

## استكشاف الأخطاء في Cron

### التحقق من تشغيل الـ Jobs

```bash
# اعرض سجلات النظام
grep CRON /var/log/syslog | tail -20

# على Ubuntu 24.04:
grep CRON /var/log/auth.log | tail -20
```

### تصحيح أخطاء الأذونات

```bash
# تأكد من أن scripts قابلة للتنفيذ
chmod +x /opt/sheikha/current/scripts/*.sh

# تحقق من الملكية
ls -la /opt/sheikha/current/scripts/

# تأكد من وجود المجلد
ls -la /var/log/sheikha/
```

### اختبار Job يدويًا

```bash
# جرب الـ health check يدويًا
bash /opt/sheikha/current/scripts/health-monitor.sh

# تحقق من الناتج
echo $?  # 0 = نجاح, غير 0 = فشل
```

---

## نصائح عملية

### 1. استخدم `/root/bin/` للـ Scripts المخصصة

```bash
mkdir -p /root/bin
ln -s /opt/sheikha/current/scripts/health-monitor.sh /root/bin/
```

### 2. إضافة Email للتنبيهات (إذا كان Postfix مثبتاً)

```bash
*/5 * * * * /opt/sheikha/current/scripts/health-monitor.sh 2>&1 | mail -s "Health Check" market@sheikha.top
```

### 3. تسجيل آخر Execution في ملف

```bash
*/5 * * * * echo "Last run: $(date)" > /var/log/sheikha/last-run.log && /opt/sheikha/current/scripts/health-monitor.sh >> /var/log/sheikha/health-monitor.log 2>&1
```

### 4. محاسبة Cron في Log مركزي

```bash
# أضف هذا إلى crontab
SHELL=/bin/bash
LOGFILE=/var/log/sheikha/cron.log

*/5 * * * * (echo "[$(date)]" >> $LOGFILE; /opt/sheikha/current/scripts/health-monitor.sh >> $LOGFILE 2>&1)
```

---

## الجدول الزمني الموصى به

```
┌─────────────────────────────────┐
│    شيخة — Maintenance Schedule  │
├─────────────────────────────────┤
│ كل 5 دقائق:    Health Check    │
│ كل جمعة 3 AM:  Backup          │
│ الأول 4 AM:    Full Check      │
│ يوميًا 2 AM:   Log Cleanup     │
└─────────────────────────────────┘
```

---

**آخر تحديث**: 16 مايو 2026  
**الإصدار**: 2.1.0
