# شيخة — دليل التشغيل والصيانة (Operations Guide)

## جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الإعدادات الأساسية](#الإعدادات-الأساسية)
3. [مهام يومية](#مهام-يومية)
4. [الصيانة الدورية](#الصيانة-الدورية)
5. [استكشاف الأخطاء](#استكشاف-الأخطاء)
6. [الحوادث والأزمات](#الحوادث-والأزمات)

---

## نظرة عامة

### البنية المعمارية

```
┌─────────────────────────────────────────────┐
│       GitHub (sheikha-main-portal)         │
│     ↓ (push) | ↑ (pull)                    │
├─────────────────────────────────────────────┤
│     GitHub Actions (CI/CD Pipeline)        │
│   • Pre-deployment checks                   │
│   • SSH deployment to VPS                   │
│   • Health checks                           │
├─────────────────────────────────────────────┤
│     VPS (31.97.190.74)                      │
│   • /opt/sheikha/current (repo)             │
│   • PM2 process manager                     │
│   • Node.js v20.20.2                        │
│   • Express server (port 8080)              │
│   • JSON data storage                       │
└─────────────────────────────────────────────┘
```

### المكونات الرئيسية

| المكون | الموقع | الدور |
|-------|--------|------|
| **Express Server** | server.js | الخادم الرئيسي |
| **PM2** | /root/.pm2/ | إدارة العمليات |
| **SSH Key** | /root/.ssh/github_vps | المصادقة على GitHub |
| **Config Files** | config/ | إعدادات النظام |
| **Data** | data/ | قاعدة البيانات (JSON) |
| **Logs** | /var/log/sheikha/ | سجلات التطبيق |

---

## الإعدادات الأساسية

### الوصول إلى VPS

```bash
# الدخول الأساسي
ssh root@31.97.190.74

# أو باستخدام مفتاح معين
ssh -i ~/.ssh/sheikha_vps root@31.97.190.74
```

### بدء الخادم

```bash
# بدء يدوي
cd /opt/sheikha/current
npm start

# أو عبر PM2
pm2 start server.js --name sheikha-main-portal

# أو عبر script مخصص
bash scripts/deploy-vps.sh
```

### إيقاف وإعادة تشغيل

```bash
# إيقاف مؤقت
pm2 stop sheikha-main-portal

# إعادة تشغيل
pm2 restart sheikha-main-portal

# إيقاف نهائي
pm2 delete sheikha-main-portal

# حفظ الإعدادات
pm2 save
```

---

## مهام يومية

### 1. التحقق من صحة الخادم

```bash
# فحص سريع
bash scripts/health-monitor.sh

# أو يدويًا:
curl http://31.97.190.74:8080/api/health
```

### 2. مراجعة السجلات

```bash
# آخر 50 سطر
pm2 logs sheikha-main-portal --lines 50

# Real-time monitoring
pm2 logs sheikha-main-portal

# حفظ السجلات في ملف
pm2 logs sheikha-main-portal > logs.txt

# بحث في السجلات
pm2 logs sheikha-main-portal | grep ERROR
```

### 3. مراقبة الموارد

```bash
# استهلاك الذاكرة والـ CPU
pm2 monit

# معلومات النظام
free -h          # الذاكرة
df -h /           # القرص
nproc             # عدد المعالجات
uptime            # الحمولة
```

### 4. النشر اليومي

```bash
# طريقة 1: من المحلي
bash scripts/deploy-vps.sh

# طريقة 2: من VPS
cd /opt/sheikha/current
git pull origin main
npm restart

# طريقة 3: تلقائياً عند push على GitHub
git push origin main  # GitHub Actions ينشر تلقائياً
```

---

## الصيانة الدورية

### أسبوعياً 📅

```bash
# 1. تنظيف السجلات القديمة
pm2 flush

# 2. فحص التحديثات الأمنية
apt update && apt list --upgradable

# 3. إنشاء backup
bash scripts/backup-before-deploy.sh

# 4. مراجعة استهلاك الموارد
echo "القرص:" && df -h /
echo "الذاكرة:" && free -h
```

### شهرياً 📆

```bash
# 1. تحديث Node.js (إن توفر)
node --version
# للترقية: nvm install lts

# 2. تنظيف النسخ الاحتياطية القديمة
find /opt/sheikha/backups -mtime +7 -delete

# 3. مراجعة استهلاك النطاق الترددي
# (بحسب مزود الاستضافة)

# 4. تحديث المكتبات الأمنية
cd /opt/sheikha/current
npm audit fix --save
npm restart
```

### ربع سنوي 🔄

```bash
# 1. تحديث الحزم الكاملة
npm update

# 2. اختبار البيئة الكاملة
npm test

# 3. تحديث الأنظمة الأساسية
sudo apt upgrade -y

# 4. تقييم الأداء والتحسينات
```

---

## استكشاف الأخطاء

### المشكلة: الخادم لا يستجيب

```bash
# 1. تحقق من الحالة
pm2 status

# 2. اعرض السجلات
pm2 logs sheikha-main-portal --lines 50

# 3. أعد التشغيل
pm2 restart sheikha-main-portal

# 4. اختبر الاتصال
curl http://localhost:8080/api/health

# 5. تحقق من الموارد
free -h && df -h /
```

### المشكلة: استهلاك الذاكرة عالي

```bash
# 1. اعرض الاستهلاك
pm2 status

# 2. إذا كان أكثر من 1500MB:
pm2 delete sheikha-main-portal
sleep 10
pm2 start server.js --name sheikha-main-portal

# 3. أو اعد التشغيل مع حد أقصى:
pm2 start server.js --name sheikha-main-portal \
  --max-memory-restart 1500M
```

### المشكلة: خطأ في النشر

```bash
# 1. افحص git status
cd /opt/sheikha/current
git status

# 2. أعد تعيين التغييرات
git reset --hard HEAD

# 3. اسحب آخر نسخة
git pull origin main

# 4. أعد التشغيل
npm restart
```

### المشكلة: فشل SSH access

```bash
# 1. تحقق من المفتاح
ls -la ~/.ssh/github_vps

# 2. اختبر الاتصال
ssh -T git@github.com

# 3. تحقق من SSH config
cat ~/.ssh/config

# 4. إعادة تعيين الصلاحيات
chmod 700 ~/.ssh
chmod 600 ~/.ssh/github_vps
```

---

## الحوادث والأزمات

### حالة الطوارئ: Rollback سريع

إذا فشل النشر وأثر على الخادم:

```bash
# 1. استعد من backup آخر
bash scripts/rollback-deployment.sh

# 2. أو استعد من آخر git commit
cd /opt/sheikha/current
git reset --hard HEAD~1
pm2 restart sheikha-main-portal

# 3. اختبر الخادم
curl http://localhost:8080/api/health
```

### حالة الطوارئ: استعادة قاعدة البيانات

إذا تلفت بيانات JSON:

```bash
# 1. استخرج من backup
tar -xzf /opt/sheikha/backups/sheikha_backup_XXXXXXXX.tar.gz data/

# 2. أعد تشغيل الخادم
pm2 restart sheikha-main-portal

# 3. تحقق من البيانات
curl http://localhost:8080/api/data | head -20
```

### حالة الطوارئ: مساحة القرص ممتلئة

```bash
# 1. افحص الاستخدام
du -sh /opt/sheikha/*
du -sh /var/log/sheikha/*

# 2. نظف السجلات
pm2 flush
rm -f /var/log/sheikha/*.log

# 3. احذف الـ backups القديمة
find /opt/sheikha/backups -mtime +30 -delete
```

---

## أوامر مفيدة

### مراقبة في الوقت الفعلي

```bash
# عرض live logs
pm2 logs sheikha-main-portal

# عرض عمليات النظام
pm2 monit

# عرض استهلاك الموارد
watch -n 1 'pm2 status'
```

### النسخ الاحتياطية

```bash
# إنشاء backup يدوي
bash scripts/backup-before-deploy.sh

# استعادة من backup
bash scripts/rollback-deployment.sh

# قائمة الـ backups
ls -lh /opt/sheikha/backups/
```

### النشر

```bash
# نشر من المحلي
bash scripts/deploy-vps.sh

# نشر يدوي من VPS
cd /opt/sheikha/current
git config pull.rebase true
git pull origin main
pm2 restart sheikha-main-portal
```

---

## أوقات الصيانة الموصى بها

| الوقت | المهمة | المدة |
|------|--------|------|
| **يوميًا (2:00 AM UTC)** | Health checks | 5 دقائق |
| **أسبوعيًا (الجمعة - 3:00 AM)** | Backup + Cleanup | 15 دقيقة |
| **شهريًا (الأول - 4:00 AM)** | Full system check | 30 دقيقة |

---

## التواصل والدعم

- 📧 **البريد**: market@sheikha.top
- 🐙 **GitHub**: https://github.com/Sheikha-Market/sheikha-main-portal
- 📊 **VPS**: 31.97.190.74:8080

---

**آخر تحديث**: 16 مايو 2026
**المسؤول**: Sheikha Operations Team
**الإصدار**: 2.1.0
