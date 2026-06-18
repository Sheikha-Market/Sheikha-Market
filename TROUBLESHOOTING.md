# شيخة — دليل استكشاف الأخطاء المتقدم (Troubleshooting Guide)

## الأخطاء الشائعة وحلولها

### ❌ خطأ: "Connection refused on port 8080"

**السبب المحتمل**: الخادم معطل أو مغلق

**الخطوات**:
```bash
# 1. تحقق من حالة PM2
pm2 status sheikha-main-portal

# 2. اعرض الأخطاء
pm2 logs sheikha-main-portal --err

# 3. تحقق من البورت
lsof -i :8080

# 4. أعد التشغيل
pm2 restart sheikha-main-portal

# 5. اختبر مرة أخرى
curl http://localhost:8080/api/health
```

---

### ❌ خطأ: "git push rejected - non-fast-forward"

**السبب**: الفرع المحلي متأخر عن الفرع البعيد

**الحل**:
```bash
# الطريقة 1: Rebase (الأنظف)
git pull origin main --rebase
git push origin main

# الطريقة 2: Merge (التقليدي)
git pull origin main
git push origin main

# الطريقة 3: Force (الأخير - احذر!)
git push --force origin main  # ⚠️ استخدم بحذر فقط!
```

---

### ❌ خطأ: "Cannot find module 'express'"

**السبب**: الحزم لم تُثبّت

**الحل**:
```bash
cd /opt/sheikha/current

# 1. تثبيت جديد
npm ci --omit=dev

# 2. أو تحديث
npm install

# 3. تحقق
npm list express

# 4. أعد التشغيل
pm2 restart sheikha-main-portal
```

---

### ❌ خطأ: "ENOSPC: no space left on device"

**السبب**: القرص ممتلئ

**الحل الفوري**:
```bash
# 1. افحص الاستخدام
df -h /
du -sh /var/log/sheikha/*

# 2. نظف السجلات
pm2 flush
rm -f /var/log/sheikha/*.log

# 3. احذف backups قديمة
find /opt/sheikha/backups -mtime +7 -delete

# 4. تحقق من النتيجة
df -h /
```

---

### ❌ خطأ: "ENOMEM: Cannot allocate memory"

**السبب**: استهلاك الذاكرة عالي جداً

**الحل**:
```bash
# 1. اعرض الاستخدام
pm2 status

# 2. إذا تجاوز 1500MB:
pm2 stop sheikha-main-portal
sleep 10

# 3. حذف وإعادة تشغيل
pm2 delete sheikha-main-portal
pm2 start server.js --name sheikha-main-portal \
  --max-memory-restart 1500M

# 4. احفظ الإعدادات
pm2 save
```

---

### ❌ خطأ: "SSH Permission denied (publickey)"

**السبب**: مفتاح SSH غير صحيح أو غير مضاف

**الحل**:
```bash
# 1. تحقق من المفتاح
ssh -v git@github.com

# 2. تحقق من SSH config
cat ~/.ssh/config

# 3. تأكد من الصلاحيات
chmod 700 ~/.ssh
chmod 600 ~/.ssh/github_vps
chmod 644 ~/.ssh/github_vps.pub

# 4. أضف المفتاح إلى ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/github_vps

# 5. اختبر
ssh -T git@github.com
```

---

### ❌ خطأ: "Health check failed - API not responding"

**السبب**: الخادم يعمل لكن لا يستجيب للـ health check

**الحل**:
```bash
# 1. اختبر الاتصال
curl -v http://localhost:8080/api/health

# 2. تحقق من السجلات
pm2 logs sheikha-main-portal --lines 100 | grep -i "error\|fail"

# 3. تحقق من الـ port
netstat -tlnp | grep 8080

# 4. جرب port مختلف (مؤقتاً)
PORT=8081 pm2 restart sheikha-main-portal

# 5. تحقق من الحريق
sudo iptables -L -n | grep 8080
# أو عبر ufw:
sudo ufw status
```

---

### ❌ خطأ: "Deployment script failed"

**السبب**: مشكلة في سكريبت النشر

**الحل**:
```bash
# 1. شغّل بـ debug mode
bash -x scripts/deploy-vps.sh

# 2. تحقق من:
# - SSH connection
ssh -i ~/.ssh/sheikha_vps root@31.97.190.74 "echo OK"

# - Git access
ssh -T git@github.com

# - File permissions
ls -la scripts/deploy-vps.sh

# 3. جرب يدويًا
cd /opt/sheikha/current
git config pull.rebase true
git pull origin main
pm2 restart sheikha-main-portal
```

---

## جداول التشخيص السريعة

### جدول: الأخطاء ورموزها

| رمز | المعنى | الحل |
|-----|--------|------|
| **E500** | خطأ خادم | اعرض logs (pm2 logs) |
| **E404** | غير موجود | تحقق من المسار |
| **E403** | ممنوع | تحقق من الصلاحيات |
| **ENOENT** | ملف مفقود | تحقق من git pull |
| **ECONNREFUSED** | رفض الاتصال | أعد تشغيل الخادم |

### جدول: الموارد الحرجة

| المورد | التحذير | الحرج | الإجراء |
|------|---------|------|--------|
| **RAM** | > 1200MB | > 1500MB | أعد التشغيل |
| **Disk** | > 80% | > 90% | نظف السجلات |
| **CPU** | > 80% | > 95% | افحص العمليات |
| **Restarts** | > 10/ساعة | > 50/ساعة | تحقق من الكود |

---

## نصائح الأداء

### تحسين الأداء

```bash
# 1. تحديث npm
npm update -g npm

# 2. تنظيف الـ cache
npm cache clean --force

# 3. تحسين العمليات
pm2 start server.js --name sheikha-main-portal \
  --instances max \
  --exec-mode cluster

# 4. مراقبة الأداء
pm2 web  # Dashboard على port 9615
```

### مراقبة الأداء

```bash
# استهلاك الموارد
pm2 monit

# عرض الإحصائيات
pm2 show sheikha-main-portal

# تصدير الإحصائيات
pm2 dump
```

---

## قائمة فحص التشخيص الشاملة

عند حدوث مشكلة، اتبع هذه الخطوات بالترتيب:

- [ ] هل الخادم قيد التشغيل؟ (`pm2 status`)
- [ ] هل السجلات تظهر أخطاء؟ (`pm2 logs`)
- [ ] هل الموارد كافية؟ (`free -h`, `df -h /`)
- [ ] هل الاتصال يعمل؟ (`curl localhost:8080`)
- [ ] هل git محدث؟ (`git status`, `git log`)
- [ ] هل SSH يعمل؟ (`ssh -T git@github.com`)
- [ ] هل npm packages مثبتة؟ (`npm list`)
- [ ] هل البيانات موجودة؟ (`ls -la data/`)
- [ ] هل الإعدادات صحيحة؟ (`cat .env`)
- [ ] هل هناك backup سابق؟ (`ls -la backups/`)

---

## الأوامر السريعة

```bash
# Status السريع
pm2 status && free -h && df -h / && uptime

# إعادة تشغيل سريعة
pm2 restart sheikha-main-portal && sleep 3 && curl -s http://localhost:8080/api/health | jq

# تنظيف سريع
pm2 flush && find /opt/sheikha/backups -mtime +7 -delete

# فحص شامل
bash scripts/health-monitor.sh
```

---

## إعداد NLTK بدون اتصال (Offline)

إذا كان `import nltk` يعمل لكن تنزيل الحزم من الإنترنت غير متاح، استخدم مجلد بيانات محلي وثبّت الموارد المطلوبة فيه مرة واحدة ثم أعد استخدامه داخل الـ venv نفسه.

```bash
# داخل المشروع
source .venv/bin/activate

# اختر مسارًا محليًا ثابتًا لبيانات NLTK
export NLTK_DATA="$PWD/.nltk_data"
mkdir -p "$NLTK_DATA"

# إن كانت الملفات متوفرة لديك مسبقًا، انسخها إلى:
#   $NLTK_DATA/tokenizers
#   $NLTK_DATA/corpora
# ثم اختبر:
python -c "import nltk; print('nltk ok')"
python -c "import nltk; print(nltk.data.path)"
```

للتحقق السريع من البيئة الحالية:

```bash
python -V
python -c "import torch; print('torch ok', torch.__version__, torch.cuda.is_available())"
python -c "import tensorflow as tf; print('tf ok', tf.__version__)"
python -c "import transformers; print('transformers ok', transformers.__version__)"
python -c "import nltk; print('nltk ok')"
jupyter kernelspec list
```

تم التحقق محليًا من عمل `nltk` داخل `.venv` مع ظهور kernelين هما `python3` و `sheikha-venv`.

---

## المراجع

- **PM2 Docs**: https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
- **Node.js Docs**: https://nodejs.org/docs/
- **Express Docs**: https://expressjs.com/
- **GitHub Docs**: https://docs.github.com/

---

**آخر تحديث**: 1 يونيو 2026
**النسخة**: 2.1.0
