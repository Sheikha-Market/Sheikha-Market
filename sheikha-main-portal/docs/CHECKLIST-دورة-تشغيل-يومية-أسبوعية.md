# بسم الله الرحمن الرحيم

# 📋 خطة التشغيل اليومية/الأسبوعية — منظومة شيخة
## Local → Git → VPS | دورة التطوير والنشر الكاملة

> **المسار المحلي:** `~/Projects/sheikha/sheikha-main-portal`
> **مسار VPS:**      `/opt/sheikha/current/sheikha-main-portal`
> **المستودع:**      `github.com/Sheikha-Market/Sheikha-Market`
> **فرع الإنتاج:**   `main`

---

## 🌅 الدورة اليومية — Daily Cycle

### ── مرحلة ١: فحص الصباح (قبل أي تطوير)

**المدة المتوقعة: 5-10 دقائق**

#### ١·١ فحص صحة VPS
```bash
# من الجهاز المحلي — تحقق أن الإنتاج يعمل قبل البدء
ssh sheikhaops@srv949321.hstgr.cloud \
  "curl -s http://127.0.0.1:8080/api/health"
```
- [ ] الرد: `{"status":"ok"}` أو ما يعادله ✅

#### ١·٢ فحص الشبكة العصبية على VPS
```bash
ssh sheikhaops@srv949321.hstgr.cloud \
  "cd /opt/sheikha/current/sheikha-main-portal && bash scripts/neural-gate.sh"
```
- [ ] البوابة مفتوحة (Gate PASSED) ✅
- [ ] عدد الـ endpoints الفاشلة = 0 ✅

#### ١·٣ فحص حالة Docker Compose
```bash
ssh sheikhaops@srv949321.hstgr.cloud \
  "cd /opt/sheikha/current/sheikha-main-portal/infra/docker/compose/prod \
   && docker compose ps"
```
- [ ] جميع الحاويات `Up` (nginx, main-portal, postgres, redis) ✅

#### ١·٤ فحص البيئة المحلية
```bash
cd ~/Projects/sheikha/sheikha-main-portal
git status
git log --oneline -3
```
- [ ] Working tree نظيف أو التغييرات معروفة ✅
- [ ] الفرع الحالي معروف ✅

---

### ── مرحلة ٢: التطوير المحلي

**المكان:** `~/Projects/sheikha/sheikha-main-portal`

#### ٢·١ تشغيل الخادم المحلي
```bash
cd ~/Projects/sheikha/sheikha-main-portal
cp infra/docker/compose/prod/.env.example .env    # أول مرة فقط
# أو
bash infra/docker/compose/prod/setup-env.sh        # توليد أسرار تلقائي

npm install
npm run dev                    # وضع تطوير مع hot-reload
# أو
npm start                      # تشغيل مباشر
```
- [ ] الخادم يستجيب على `http://localhost:8080/api/health` ✅

#### ٢·٢ تشغيل الاختبار الدخاني محليًا
```bash
bash scripts/sheikha-smoke-test.sh http://127.0.0.1:8080
```
- [ ] جميع الاختبارات تنجح ✅

#### ٢·٣ فحص البوابة العصبية محليًا (اختياري عند تغيير النواة)
```bash
bash scripts/neural-gate.sh http://127.0.0.1:8080
```
- [ ] البوابة مفتوحة ✅

---

### ── مرحلة ٣: الاعتماد على Git

**قاعدة ذهبية: لا نشر بدون commit موصوف + push إلى GitHub**

#### ٣·١ مراجعة التغييرات قبل الـ commit
```bash
git diff --stat
git diff
```
- [ ] التغييرات منطقية ومقصودة ✅
- [ ] لا secrets أو بيانات حساسة في الكود ✅
- [ ] الامتثال الشرعي محقق (لا ربا، لا غرر، لا محرّمات) ✅

#### ٣·٢ Commit باتباع Conventional Commits
```bash
git add .
git commit -m "feat: وصف موجز للتغيير باللغة العربية أو الإنجليزية"
# أمثلة:
#   feat: إضافة نظام تحقق الهوية للموردين
#   fix: إصلاح خطأ في حساب هامش الربح الحلال
#   chore: تحديث اعتماديات الأمان
#   security: تقوية حماية endpoints الإدارة
```
- [ ] رسالة الـ commit واضحة وتتبع Conventional Commits ✅

#### ٣·٣ رفع التغييرات إلى GitHub
```bash
git push origin main            # أو الفرع المناسب
```
- [ ] Push ناجح بدون أخطاء ✅
- [ ] GitHub Actions CI تبدأ تلقائياً ✅

#### ٣·٤ انتظار نجاح CI/CD على GitHub
```
https://github.com/Sheikha-Market/Sheikha-Market/actions
```
- [ ] Workflow `CI – Lint & Security` نجح ✅
- [ ] Workflow `CodeQL` نجح (إن كان مُفعَّلاً) ✅

---

### ── مرحلة ٤: النشر على VPS

**نشر واحد يومي كحد أدنى — أو عند كل ميزة مكتملة**

#### ٤·١ النشر الآلي الكامل (الأمر الوحيد المطلوب)
```bash
cd ~/Projects/sheikha/sheikha-main-portal
bash scripts/vps-deploy.sh
```

السكربت يُنفّذ تلقائياً بالترتيب:
1. فحص ما قبل النشر (git clean, branch check)
2. فحص اتصال SSH بـ VPS
3. `git pull` على VPS من `origin/main`
4. `npm ci --omit=dev`
5. `docker compose build main-portal && up`
6. انتظار جاهزية الخادم (60 ثانية حد أقصى)
7. **البوابة العصبية الإلزامية** (تمنع النشر عند الفشل)
8. الاختبار الدخاني الشامل
9. تسجيل النشر في `/opt/sheikha/current/deploy-logs/`

- [ ] النشر اكتمل: `🚀 VPS Deploy Successful` ✅

#### ٤·٢ محاكاة النشر بدون تغييرات فعلية (اختبار الآلية)
```bash
bash scripts/vps-deploy.sh --dry-run
```
- [ ] جميع الخطوات تُطبع بدون تنفيذ ✅

#### ٤·٣ تحقق سريع بعد النشر
```bash
ssh sheikhaops@srv949321.hstgr.cloud \
  "curl -s http://127.0.0.1:8080/api/health && \
   docker compose -f /opt/sheikha/current/sheikha-main-portal/infra/docker/compose/prod/docker-compose.yml ps"
```
- [ ] جميع الحاويات `Up` ✅

---

### ── مرحلة ٥: إغلاق اليوم

**المدة المتوقعة: 5 دقائق**

#### ٥·١ فحص ختامي يومي
```bash
ssh sheikhaops@srv949321.hstgr.cloud \
  "cd /opt/sheikha/current/sheikha-main-portal \
   && bash scripts/sheikha-daily-ops-check.sh"
```
- [ ] الفحص اليومي نجح ✅

#### ٥·٢ توثيق اليوم (ملاحظة قصيرة في git log أو ملاحظات داخلية)
- [ ] هل نُشر شيء اليوم؟ → ما الـ commit؟ _______________
- [ ] هل حدث أي حادث أو خطأ؟ → هل سُجّل؟ _______________
- [ ] هل تحتاج نقطة للغد؟ → _______________

---

## 📅 الدورة الأسبوعية — Weekly Cycle

**يوم مقترح: كل أحد صباحاً (قبل بداية أسبوع العمل)**

### ── فحص أسبوعي أ: الأمان والتبعيات

```bash
cd ~/Projects/sheikha/sheikha-main-portal

# فحص الثغرات في التبعيات
npm audit --production

# تحقق من التحديثات الأمنية المتاحة
npm outdated | head -20
```
- [ ] `npm audit` يُظهر 0 vulnerabilities (أو مراجعة أي ثغرات حرجة) ✅
- [ ] لا تحديثات أمنية حرجة معلّقة ✅

### ── فحص أسبوعي ب: النسخ الاحتياطي والاستعادة

```bash
# نسخ احتياطي مشفر (من VPS)
ssh sheikhaops@srv949321.hstgr.cloud \
  "cd /opt/sheikha/current/sheikha-main-portal \
   && export BACKUP_PASSPHRASE='<قيمتك من .env>' \
   && npm run ops:backup:encrypted"
```
- [ ] النسخة الاحتياطية أُنشئت بنجاح ✅
- [ ] الملف موجود في `backups/encrypted/` ✅

```bash
# اختبار الاستعادة (drill) — كل أسبوعين على الأقل
ssh sheikhaops@srv949321.hstgr.cloud \
  "cd /opt/sheikha/current/sheikha-main-portal \
   && export BACKUP_PASSPHRASE='<قيمتك من .env>' \
   && npm run ops:restore:drill -- /path/to/latest/backup.tar.gz.enc"
```
- [ ] اختبار الاستعادة نجح ✅

### ── فحص أسبوعي ج: المراقبة والإنذارات

```bash
# فتح لوحة Grafana (من المتصفح)
# http://<VPS_HOST>:3000
```
- [ ] لوحة Grafana تعمل وتُظهر بيانات حقيقية ✅
- [ ] لا إنذارات حرجة نشطة ✅
- [ ] Prometheus يجمع المقاييس ✅
- [ ] Loki يُخزّن السجلات ✅

### ── فحص أسبوعي د: الحوكمة الشرعية

```bash
# فحص جاهزية الامتثال
cd ~/Projects/sheikha/sheikha-main-portal
npm run ops:readiness
```
- [ ] لا مخالفات شرعية مكتشفة (ربا، غرر، محرّمات) ✅
- [ ] الشفافية في التسعير محققة ✅
- [ ] حماية المستهلك فعّالة ✅

### ── فحص أسبوعي ه: دورة التشغيل الذاتي (Autonomous)

```bash
ssh sheikhaops@srv949321.hstgr.cloud \
  "cd /opt/sheikha/current/sheikha-main-portal \
   && npm run ops:autonomy:cycle 2>&1 | tail -20"
```
- [ ] دورة الحوكمة الذاتية نجحت ✅

### ── فحص أسبوعي و: سجل النشر

```bash
ssh sheikhaops@srv949321.hstgr.cloud \
  "cat /opt/sheikha/current/deploy-logs/deploy-history.log"
```
- [ ] كل نشر الأسبوع مُسجّل ✅
- [ ] لا نشر يدوي خارج السكربت الرسمي ✅

---

## 🚨 بروتوكول الطوارئ — Emergency Protocol

### حالة: الخادم لا يستجيب

```bash
# ١) تحقق من الحاويات
ssh sheikhaops@srv949321.hstgr.cloud \
  "docker compose -f /opt/sheikha/current/sheikha-main-portal/infra/docker/compose/prod/docker-compose.yml ps"

# ٢) إعادة تشغيل الحاوية
ssh sheikhaops@srv949321.hstgr.cloud \
  "docker compose -f /opt/sheikha/current/sheikha-main-portal/infra/docker/compose/prod/docker-compose.yml restart main-portal"

# ٣) فحص السجلات
ssh sheikhaops@srv949321.hstgr.cloud \
  "docker compose -f /opt/sheikha/current/sheikha-main-portal/infra/docker/compose/prod/docker-compose.yml logs main-portal --tail=50"
```

### حالة: نشر فاشل (البوابة العصبية مغلقة)

```bash
# ١) تحقق من السجلات المحلية
ssh sheikhaops@srv949321.hstgr.cloud \
  "cd /opt/sheikha/current/sheikha-main-portal \
   && bash scripts/neural-gate.sh 2>&1"

# ٢) تشغيل الفحص اليومي الكامل
ssh sheikhaops@srv949321.hstgr.cloud \
  "cd /opt/sheikha/current/sheikha-main-portal \
   && bash scripts/sheikha-daily-ops-check.sh"

# ٣) الرجوع للإصدار السابق (إن لزم)
ssh sheikhaops@srv949321.hstgr.cloud "
  cd /opt/sheikha/current/sheikha-main-portal
  git log --oneline -5
  git reset --hard <PREVIOUS_COMMIT_HASH>
  docker compose -f infra/docker/compose/prod/docker-compose.yml restart main-portal
"
```

### حالة: اختراق أمني محتمل

1. أوقف الخادم فوراً: `docker compose stop main-portal`
2. راجع سجلات fail2ban: `sudo fail2ban-client status sshd`
3. راجع سجلات nginx: `docker compose logs nginx --tail=100`
4. غيّر جميع الأسرار في `.env`
5. أعد توليد أسرار جديدة: `bash infra/docker/compose/prod/setup-env.sh --force`
6. أعد النشر: `bash scripts/vps-deploy.sh`

---

## ⚙️ الاختصارات (npm scripts) — جديدة

| الأمر | الوظيفة |
|-------|---------|
| `npm run ops:neural:gate` | تشغيل البوابة العصبية محليًا |
| `npm run ops:vps:deploy` | نشر على VPS بالأمر الكامل |
| `npm run ops:vps:deploy:dry` | محاكاة النشر بدون تنفيذ |
| `npm run server:smoke` | اختبار دخاني محلي |
| `npm run ops:backup:encrypted` | نسخ احتياطي مشفر |
| `npm run ops:restore:drill` | اختبار استعادة النسخة |
| `npm run ops:vps:harden:apply` | تقسية VPS الأمنية |

---

## 📊 مؤشرات النجاح الأسبوعية — Weekly KPIs

| المؤشر | الهدف | الحالة |
|--------|-------|--------|
| Availability (توفر الخادم) | ≥ 99.5% | ⬜ |
| Deploy Success Rate | 100% | ⬜ |
| Neural Gate Pass Rate | 100% | ⬜ |
| Zero Critical Vulnerabilities | ✅ صفر | ⬜ |
| Backup Drill Passed | أسبوعياً | ⬜ |
| Sharia Compliance | 100% | ⬜ |
| Uncommitted Changes at EOD | صفر | ⬜ |

---

## 🧠 مبادئ الحوكمة الثابتة

```
﴿ وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ﴾

• لا نشر يدوي على VPS خارج scripts/vps-deploy.sh
• لا secrets في الكود — Environment Variables فقط
• لا تغيير مالي بدون مراجعة sharia-compliance
• كل commit موصوف بـ Conventional Commits
• كل نشر مسجَّل في deploy-history.log
• الإنسان هو المرجع والقرار النهائي
```

---

*آخر تحديث: 2026-05-18 | منظومة سوق شيخة™*
