# Sheikha Unified Commerce & Economy Runtime V1

## النطاق

توحّد هذه الطبقة منتجات شيخة التجارية، وبرامج المعرفة، وSheikha Cloud SaaS،
والقطاعات، ومسارات السوق وسلسلة الإمداد في عقد قراءة وتشغيل واحد.

## مصادر الحقيقة

- سجل المنتجات التجارية المحلي.
- سجل منتجات تجربة العميل والإيرادات.
- سجل خدمات وأدوار SaaS.
- سجل عمليات Marketplace Operating System.
- سجل Supply Chain Control Tower.
- تقرير Unified Product Runtime للربط مع جنات وأشجار شيخة.

## التغطية المتحققة

- 13 منتجًا وخدمة في الكتالوج الموحد.
- 14 خدمة ضمن Sheikha Cloud SaaS.
- 30 قطاعًا ضمن 7 عائلات سوقية.
- 12 مسار عمل مشتركًا من تأهيل الأطراف إلى التدقيق.

## واجهات التشغيل

- السوق: `/market/`
- لوحة التحكم: `/dashboard/`
- API: `/api/sheikha/commerce/v1`
- تقرير التفعيل: `runtime/commerce/v1/sheikha-unified-commerce-runtime-v1-report.json`

## حدود الادعاء والتنفيذ

- الكتالوج المحلي متحقق من ملفات المستودع، وليس إثباتًا لمبيعات حية.
- السعر الافتراضي هو `REQUEST_QUOTE`؛ لا تعرض أسعار حية بلا مصدر مستقل.
- عروض التجار تأتي من مصدر منفصل، وقد تكون القائمة فارغة.
- لا تنفذ الواجهة عقدًا أو طلبًا أو فاتورة أو دفعًا تلقائيًا.
- العمليات عالية الأثر تتطلب مراجعة وموافقة بشرية منفصلة.
- لا توجد فتوى آلية أو دعوى سلطة شرعية أو اعتماد خارجي غير مثبت.

## مسار العملية

`Need -> Product/Service -> RFQ -> Quotation -> Human Review -> Contract -> Order -> Supply Chain -> Invoice -> Audit Evidence`

## الاختبار

```bash
npm run -s ops:commerce:activate:v1
npm run -s ops:commerce:test:v1
npm run -s ops:site:catalog:v2
npm run -s ops:site:smoke:local:v1
```
