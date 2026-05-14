# بسم الله الرحمن الرحيم
# سياسة المزامنة متعددة المستودعات — MULTI-REPO SYNC POLICY

> «وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا» — آل عمران: 103

---

## نظرة عامة / Overview

منظومة سوق شيخة™ تعتمد على **مستودعين جذريين** متزامنَين:

| الدور | المستودع | الـ Remote | الغرض |
|-------|----------|-----------|--------|
| السوق التشغيلي (Primary) | `Sheikha-Market/sheikha-main-portal` | `origin` | الخادم الرئيسي + API + الخلايا العصبية |
| البوابة الاستراتيجية (Strategic) | `Sheikha-top/sheikha-enterprise-portal` | `enterprise` | السياسات + الحوكمة + الوثائق الاستراتيجية |

---

## هيكل المزامنة / Sync Architecture

```
origin (sheikha-main-portal)     enterprise (sheikha-enterprise-portal)
          │                                         │
          │  ── runtime branches ──►                │
          │  stable/runtime-baseline                │
          │  stable/production                      │
          │  rings/production                       │
          │                                         │
          │  ◄── strategic docs ──                  │
          │  docs/VISION.md                         │
          │  docs/FOUNDATIONS.md                    │
          │  docs/ARCHITECTURE.md                   │
          │  docs/BUSINESS-MODELS.md                │
          │                                         │
          │  ◄──── feature branches ────►           │
          │  feature/*  (bidirectional)             │
          └─────────────────────────────────────────┘
```

---

## إعداد الـ Remotes / Remote Configuration

### الإعداد الصحيح لـ .git/config

```ini
[remote "origin"]
    url = git@github.com-sheikha:Sheikha-Market/sheikha-main-portal.git
    fetch = +refs/heads/*:refs/remotes/origin/*

[remote "enterprise"]
    url = https://github.com/Sheikha-top/sheikha-enterprise-portal.git
    fetch = +refs/heads/*:refs/remotes/enterprise/*
```

> ⚠️ **تنبيه**: تأكد من استخدام `+refs/heads/*:refs/remotes/remote-name/*` (مع النجمة `*`)
> وليس `+refs/heads/:refs/remotes/remote-name/` (بدون نجمة — خاطئ يسبب فشل الجلب).

### إصلاح refspec خاطئ

إذا ظهر خطأ `fatal: invalid refspec`, نفّذ:

```bash
git config --local --replace-all remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
git config --local --replace-all remote.enterprise.fetch '+refs/heads/*:refs/remotes/enterprise/*'
git fetch origin --prune
git fetch enterprise --prune
```

---

## ملف إعداد المزامنة / .env.neural-sync

أنشئ ملف `.env.neural-sync` في جذر المشروع:

```env
# فرع origin الرئيسي
ORIGIN_BRANCH=main

# فرع enterprise المرجعي
ENTERPRISE_BRANCH=stable/runtime-baseline
```

---

## تشغيل المزامنة / Running the Sync

### من سطر الأوامر

```bash
# مزامنة كاملة ثنائية الاتجاه (مع إخراج تفصيلي)
bash tools/neural/sync-neural-cells.sh full --verbose

# مزامنة الوثائق الاستراتيجية فقط
bash tools/neural/sync-neural-cells.sh docs

# مزامنة فروع الميزات فقط
bash tools/neural/sync-neural-cells.sh features

# التحقق من سلامة المزامنة فقط (بدون دفع)
bash tools/neural/sync-neural-cells.sh validate
```

### عبر API

```bash
# فحص حالة المزامنة
curl -s http://localhost:8080/api/neural-sync/status | python3 -m json.tool

# تشغيل المزامنة يدوياً (يتطلب VPS key)
curl -s -X POST http://localhost:8080/api/neural-sync/trigger \
  -H "Content-Type: application/json" \
  -H "x-sheikha-vps-key: ${SHEIKHA_VPS_KEY}" \
  -d '{"type":"full"}'
```

---

## سياسة الفروع / Branch Policy

### فروع Runtime (origin → enterprise)

| الفرع | الغرض | الاتجاه |
|-------|--------|---------|
| `stable/runtime-baseline` | خط الأساس للتشغيل | `origin` → `enterprise` |
| `stable/production` | الإنتاج المستقر | `origin` → `enterprise` |
| `rings/production` | حلقات النشر | `origin` → `enterprise` |

### الوثائق الاستراتيجية (enterprise → origin)

| الملف | الغرض | الاتجاه |
|-------|--------|---------|
| `docs/VISION.md` | الرؤية الاستراتيجية | `enterprise` → `origin` |
| `docs/FOUNDATIONS.md` | الأسس والمبادئ | `enterprise` → `origin` |
| `docs/ARCHITECTURE.md` | البنية المعمارية | `enterprise` → `origin` |
| `docs/BUSINESS-MODELS.md` | نماذج الأعمال | `enterprise` → `origin` |

### فروع الميزات (ثنائية الاتجاه)

جميع الفروع التي تبدأ بـ `feature/` تُزامَن في كلا الاتجاهين.

---

## مراقبة الحالة / Monitoring

### نقطة API للفحص

```
GET /api/neural-sync/status
```

**حالات الاستجابة:**

| الحالة | المعنى |
|--------|--------|
| `active` | كلا الـ remotes مُهيآن وآخر commit محمّل |
| `degraded` | أحد الـ remotes غير مُهيأ أو commit مفقود |

---

## الأمان / Security

- يتطلب تشغيل المزامنة عبر API متغير بيئة `SHEIKHA_ENTERPRISE_VPS_KEY` أو `SHEIKHA_VPS_KEY`
- لا تُخزّن بيانات اعتماد git في الكود — استخدم SSH keys أو Personal Access Tokens
- اختبار الاتصال: `ssh -T git@github.com-sheikha` (للـ origin)

---

## الترقيم بالكتاب والسنة / Quranic & Prophetic Numbering

كل خلية عصبية مرتبطة بآية قرآنية أو حديث نبوي:

| الخلية | المرجع |
|--------|--------|
| التوحيد (Tawheed) | «قُلْ هُوَ اللَّهُ أَحَدٌ» — الإخلاص: 1 |
| الرزق (Rizq) | «وَفِي السَّمَاءِ رِزْقُكُمْ وَمَا تُوعَدُونَ» — الذاريات: 22 |
| الاعتصام (Unity) | «وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا» — آل عمران: 103 |
| الشورى (Consultation) | «وَشَاوِرْهُمْ فِي الْأَمْرِ» — آل عمران: 159 |
| الإتقان (Excellence) | «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — رواه البيهقي |
| الأمانة (Trust) | «أَدِّ الْأَمَانَةَ إِلَى مَنِ ائْتَمَنَكَ» — رواه أبو داود |

---

*سوق شيخة™ — منظومة متكاملة للتجارة الإسلامية العادلة*  
*«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»*
