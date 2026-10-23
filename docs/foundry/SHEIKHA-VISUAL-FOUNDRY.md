# فوندري شيخة البصري والواجهات

المصدر: `/home/sheikha/مستندات/شيخة الهوية`، بالقراءة فقط.
التخزين الخاص: `runtime/visual-foundry/`، خارج المجلد العام وغير مضاف إلى Git.
هذه نسخة محلية على الجهاز نفسه وليست نسخة احتياطية خارجية ضد فقدان القرص.

المصطلح المعتمد في النصوص الظاهرة: «مرئيات»، ويستخدم «بصريات» أو `Visual`
بحسب السياق. تبقى أسماء الأصول والمعرّفات التقنية الأصلية دون تغيير.

توثيق مطابقة الطلب المنقول من Gemini وحدود ادعاءات V37.3:
[سجل التحقق من الطلب والتنفيذ](SHEIKHA-V37-3-REQUEST-RECONCILIATION.md).

## المعمارية

```text
Identity source (read-only)
  -> archive: stable copy + SHA-256 + content-addressed objects
  -> catalog: versioned snapshots, original filenames, media classification
  -> guard: source changes + missing files + archive integrity
  -> daily Foundry: visual review board + UI component + generation brief
  -> review: human approval required
  -X-> production: no automatic merge, deploy, publish or hardware commands

Watch: filesystem events -> 2-second debounce -> reconciliation
Fallback reconciliation: every 60 seconds while the service is running
Guard: existing systemd timer, every 10 minutes
Daily: existing systemd timer, 09:00 Asia/Riyadh, persistent catch-up
```

## خطوط الإنتاج

1. الأرشيف: يحفظ كل ملف دون تغيير الأصل، مع إزالة تكرار المحتوى فقط. تبقى أسماء الملفات والإصدارات السابقة محفوظة.
2. البصريات: يولد معرض مراجعة وموجز توليد يومي. مرئية الجلسة الأولى مولدة بالأداة المدمجة، وسجلها في `generated.json` مع نص الموجز والمراجع.
3. الحركة: يحفظ الفيديوهات الأصلية وينتج خطة لقطات؛ لا يدّعي ترميز أو توليد فيديو جديد.
4. الواجهات: يولد `component.mjs` و`component.css` ضمن مسودة معزولة، ولا يعدّل صفحات المنصة تلقائيًا.
5. التحسين: ينتج قائمة ملاحظات ومهام مراجعة؛ لا يعدّ الملاحظات تحسينات منفذة أو جودة مقاسة تلقائيًا.
6. واتش والحارس: أرشفة التغيرات، فحص البصمات، وإيقاف إصدار الحزمة عند فقدان أصل أو وجود ملف غير آمن.

التوليد الجديد بالذكاء الاصطناعي المجدول **غير مفعّل**. الأداة المدمجة داخل الجلسة
ليست خدمة يمكن استدعاؤها من systemd. يلزم اختيار مزود مرئيات وفيديو، وإعداده محليًا،
وتحديد ميزانية وحدود استخدام قبل إضافة عامل توليد خارجي. لا مفاتيح أو رسوم أو رفع ملفات تلقائي.

مكونات الواجهة تُنتج من وصفة محلية ثابتة؛ لا يوجد وكيل يعدّل الكود ذاتيًا كل يوم.
كل تغيير في الوصفة ينتج إصدارًا جديدًا. لكل تاريخ وبصمة مصادر ووصفة إصدار ثابت؛
إعادة التشغيل تتحقق من البصمات ولا تضاعف المخرجات. تغيّر المصادر يمكن أن ينتج
مسودة جديدة في اليوم نفسه، بينما المسودة المجدولة تعمل في موعد المؤقت.

## المخرجات

- `index.html`: مدخل ثابت يحيل إلى أحدث حزمة، دون خادم أو نشر عام.
- `catalog.json`: الملفات الحالية وأسماء النسخ المحفوظة.
- `objects/`: المحتوى الأصلي، بأسماء مشتقة من SHA-256.
- `snapshots/`: فهارس إصدارات سابقة، لا تُحذف عند تغير الأصول.
- `runs/<date>-<revision>/index.html`: معرض مراجعة محلي يمكن فتحه مباشرة.
- `brief.json`, `motion-plan.json`, `improvements.json`, `review.json`, `checksums.json`: داخل كل إصدار.
- `latest.json`: مسار آخر إصدار؛ `watch.json`: نبضة الخدمة؛ `guard.json`: آخر فحص.
- `integrity.json`: آخر تحقق شامل لبصمات الأرشيف، منفصل عن المصالحة السريعة لبيانات الملفات.
- `events.jsonl`: سجل تغيرات محدود الحجم، حتى أربع نسخ دورية سابقة.

حد الملف 256 MiB وحد المخزن 4 GiB؛ تجاوز الحد يوقف المهمة دون حذف الأصول.
بصمات SHA-256 تحقق سلامة بايتات، وليست توقيعًا أو إثبات ملكية. الوثائق وملفات HTML
تُحفظ بصيغة ثنائية دون تنفيذها أو تفسير تعليماتها. الحقوق ومصداقية التصورات تحتاج مراجعة بشرية.

## التشغيل والتحقق

```bash
node tools/media/sheikha-visual-foundry.cjs archive
node tools/media/sheikha-visual-foundry.cjs daily
node tools/media/sheikha-visual-foundry.cjs guard
node tools/media/sheikha-visual-foundry.cjs status
node tests/sheikha-visual-foundry.test.cjs
PLAYWRIGHT_MODULE=/tmp/sheikha-architecture-tools/node_modules/playwright node tests/sheikha-visual-foundry-browser.test.cjs
```

حالة `watch.fresh` تشترط نبضة حديثة وعملية موجودة، ولا تثبت جودة المرئيات أو جاهزية الإنتاج.
قد يظهر `processProbe: UNAVAILABLE` داخل بيئة معزولة لا تسمح بفحص عمليات المضيف؛ تُقرأ الحالة حينها من جلسة المستخدم أو systemd.
الملفات غير المتغيرة تُراجع بياناتها الوصفية كل دقيقة دون نسخها مجددًا؛
الحارس كل عشر دقائق وخط الإنتاج اليومي يعيدان حساب البصمات كاملة.
الفحص اللحظي هنا استجابة لأحداث الملفات، وليس ضمان زمن حقيقي صلب.
تعطل القرص أو توقف الجهاز يمنع التنفيذ؛ المؤقت المستمر يستدرك مهمة فائتة عند عودته.

## خدمات المستخدم

المثبت يحافظ على ملفات الخدمات القديمة، ويضيف تجاوزات محددة بدل استبدالها:

```bash
node tools/media/install-visual-foundry-user.cjs
node tools/media/install-visual-foundry-user.cjs --install
systemctl --user status sheikha-visual-foundry-watch.service
systemctl --user list-timers 'sheikha-visual-foundry-*'
journalctl --user -u sheikha-visual-foundry-watch.service -n 30
```

المثبت يحتاج صلاحية كتابة إعدادات systemd للمستخدم. لا يغيّر خدمات أخرى،
ولا يثبّت مزودًا مدفوعًا، ولا يمنح سلطة نشر أو تشغيل معدات.
إيقاف التشغيل الآلي:

```bash
systemctl --user disable --now sheikha-visual-foundry-watch.service sheikha-visual-foundry-daily.timer sheikha-visual-foundry-guard.timer
```

لاستعادة وصفة SVG القديمة لاحقًا، تزال فقط ملفات `50-local-pipeline.conf` الثلاثة
المذكورة في معاينة المثبت ثم ينفذ `systemctl --user daemon-reload`؛ لا تُحذف أرشيفات أو مخرجات سابقة.
