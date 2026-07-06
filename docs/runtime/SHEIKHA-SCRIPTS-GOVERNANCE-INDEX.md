# منظومة فهرسة وتفسير وتوحيد السكربتات

## الهدف
هذه المنظومة تضيف طبقة حوكمة تشغيلية لفهم سكربتات npm وتفسيرها وتوحيدها تدريجيًا.

المنظومة تربط التشغيل بقيم:
- الأمانة التقنية.
- التحقق والشفافية.
- دفع الضرر.
- إتقان العمل.

> تنبيه: هذه المنظومة أداة تنظيم ومراجعة تشغيلية، وليست أداة فتوى شرعية.

## السكربت الأساسي
- `scripts/sheikha-scripts-governance-index.js`

## الأوامر
- `npm run -s ops:scripts:governance:index`
  - توليد فهرس JSON فقط.
- `npm run -s ops:scripts:governance:tafsir`
  - توليد JSON + تقرير Markdown تفسيري.
- `npm run -s ops:scripts:governance:unify`
  - نفس مخرجات التفسير مع إبراز مجموعات التوحيد (aliases) المقترحة.

## المخرجات
تُحفَظ المخرجات في:
- `reports/governance/scripts-governance-index.latest.json`
- `reports/governance/scripts-governance-index.latest.md`
- نسخة مؤرشفة مختومة بالوقت لكل تشغيل.

## كيف يشتغل
1. قراءة `package.json` واستخراج كل `scripts`.
2. تصنيف السكربتات إلى فئات تشغيلية.
3. تفسير كل سكربت بوصف عربي عملي.
4. إضافة وسوم حوكمة قيمية حسب طبيعة التنفيذ.
5. اكتشاف التكرارات (عدة أسماء لنفس الأمر) واقتراح canonical command.
6. إبراز المسار الحاكم الموحّد للتشغيل.

## المسار الحاكم المقترح
- `ops:control`
- `ops:repo:topology:audit`
- `ops:repo:topology:apply`
- `ops:runtime:check`
- `ops:vps:unified`
- `ops:vps:unified:push`

## سياسة التوحيد
- لا حذف فوري للـ aliases.
- كل توحيد يتم على مرحلتين:
  1. إعلان canonical command في التقرير.
  2. نقل الاستهلاك تدريجيًا ثم إلغاء alias بعد ثبات دورة تشغيل كاملة.
