# تحقق وسوم Meta — شيخة
## Meta Tags Verification Checklist

---

## بسم الله الرحمن الرحيم

---

## 1. التحقق اليدوي

| العنصر | المسار | التحقق |
|--------|--------|--------|
| تكوين Meta | `data/sheikha-meta-tags-config.json` | ✓ موجود |
| robots.txt | `public/robots.txt` | ✓ موجود |
| sitemap.xml | `public/sitemap.xml` | ✓ موجود |
| صورة OG | `public/images/og-sheikha.png` | ✓ موجود |
| Injector | `public/js/sheikha-meta-injector.js` | ✓ موجود |
| Helper | `public/js/sheikha-meta-helper.js` | ✓ موجود |

---

## 2. التحقق عبر المتصفح

1. **API:** افتح `https://sheikha.top/api/meta/config` — يجب أن يرجع JSON بالتكوين
2. **robots:** افتح `https://sheikha.top/robots.txt`
3. **sitemap:** افتح `https://sheikha.top/sitemap.xml`
4. **صورة OG:** افتح `https://sheikha.top/images/og-sheikha.png`
5. **الكونسول:** افتح أي صفحة → F12 → Console — لا يجب أن يظهر `[شيخة Meta] وسوم ناقصة`

---

## 3. التحقق المحلي

```bash
npm start
# ثم:
curl http://localhost:8080/api/meta/config
curl http://localhost:8080/robots.txt
curl http://localhost:8080/sitemap.xml
```

---

## 4. الحالة — مُفعّل بالكامل ✓

- [x] تكوين Meta
- [x] robots.txt
- [x] sitemap.xml
- [x] صورة OG 1200×630
- [x] Injector على 12 صفحة
- [x] Helper على 12 صفحة (تحقق تلقائي)
- [x] API `/api/meta/config`
- [x] CSP عبر Helmet

---

*آخر تحديث: فبراير 2026*
