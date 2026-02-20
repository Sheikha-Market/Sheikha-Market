# بسم الله الرحمن الرحيم
# CLAUDE.md — منظومة وسوق شيخة

## المالك
سلمان أحمد بن سلمان الراجح — المالك الوحيد — لا تعديل بدون إذن صريح.

## المشروع
**SHEIKHA** — أول منظومة اقتصادية إسلامية رقمية للمعادن والسكراب.
مبنية على مبادئ سوق المدينة المنورة — الكتاب والسنة.
الدومين: sheikha.top | البريد: market@sheikha.top

## التقنيات
- **Backend:** Node.js + Express.js (`server.js` — 12,790 سطر — 200+ API)
- **Frontend:** HTML5 + CSS3 + Vanilla JS — RTL عربي — بدون frameworks
- **تخزين:** JSON files في `data/`
- **مصادقة:** JWT + OAuth (Google, Microsoft, Apple, Nafath)
- **WebSocket:** أسعار لحظية
- **PWA:** Service Worker + manifest.json
- **نشر:** Vercel
- **التصميم:** Dark + ذهبي #D4AF37 + نحاسي #B87333 + خط Tajawal

## الأوامر
```bash
npm start          # تشغيل على PORT 8080
npm run dev        # تشغيل مع auto-reload
vercel --prod      # نشر
```

## الهيكل
```
server.js            ← الخادم (200+ endpoint)
lib/                 ← محركات: AI, شريعة, إعراب, تطوير
middleware/           ← auth, security, validation, logger
routes/              ← auth, ai, arabic, market, sharia
data/                ← JSON: users, traders, companies, listings
config/              ← config.js, database.js
public/              ← 14 صفحة HTML رئيسية
  index.html         ← الرئيسية (PWA)
  سوق-شيخة.html      ← السوق (HS codes, فلاتر, RFQ, مؤشر شيخة)
  لوحة-الادمن.html    ← الأدمن (15+ قسم)
  لوحة-تحكم-المستخدم.html ← المستخدم (15+ قسم)
  لوحة-الشركة.html    ← الشركة (10+ قسم)
  تسجيل-الدخول.html   ← 5 طرق مصادقة
  تسجيل-الشركات.html  ← 5 خطوات تسجيل
  المجتمع.html        ← منتدى + مختبرات ابتكار
  الشريعة-الاسلامية.html ← مرجع شرعي + حاسبة زكاة
  css/, js/, icons/, assets/
```

## المبادئ الشرعية
- لا ربا — لا غرر — لا غش — لا احتكار — لا نجش
- البيع عن تراضٍ — صدق القول — دقة الوزن
- مؤشر شيخة للمعرفة فقط (ليس تسعير إلزامي)

## قواعد الكود
- تعليقات بالعربية
- 4 مسافات للإزاحة
- camelCase للمتغيرات
- Single quotes + semicolons
- كل API يرجع: `{ success, data, message, timestamp }`
- Error handling بالعربية
- تحقق من كل المدخلات

## بروتوكول التكامل (دور Claude)
- Claude = تدقيق شرعي + مخاطر + سياسات + مراجعة
- **لا يكتب UI** — لا يفرض refactor — لا يغير منطق تشغيلي
- لا قرار مالي — لا فتوى — اقتراح ومراجعة فقط
- التنفيذ الفعلي يتم في Cursor فقط وبإذن المالك
- ممنوع كشف أسرار (JWT_SECRET, API keys) — placeholders فقط
- قبل أي اقتراح تنفيذي: وصف + انتظار إذن المالك
