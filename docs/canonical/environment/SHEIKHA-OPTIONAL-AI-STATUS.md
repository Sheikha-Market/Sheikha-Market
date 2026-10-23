# مسارات حالة الذكاء الاختيارية

## حدود التفعيل

يربط `server.js` المسارات التالية بعد محاولة تحميل AI-Core عندما تكون قيمة
`SHEIKHA_ENABLE_ALL_ENGINES` مساوية حرفيًا لـ `true`:

- `/api/research/agi-asi-science-fabric/status`
- `/api/intelligence/integration-fabric/status`
- `/api/sdk-fabric-mcp/integration/status`

الربط مستقل عن نجاح AI-Core. يسجّل فشل كل وحدة دون منع الوحدات الأخرى،
ولا يكرر مسجّل Fabric الديناميكي هذه المسارات. عند غياب المفتاح أو اختلاف
قيمته لا تُحمّل هذه الوحدات من أي من موضعي الربط في `server.js`.

هذه واجهات قراءة لسجلات وتقارير محلية محفوظة، وليست تفعيلًا حيًا لـ AGI أو ASI
ولا تفويضًا بتشغيل أجهزة أو مزوّدين. لا يفعّل اسم المتغير كل محركات المشروع.
يحتفظ مسجّل Fabric بسلوكه السابق في المستدعين الآخرين غير الممررين للاستثناءات.

## الأوامر

كل `export` أمر مستقل. لا تنتقل متغيرات المضيف إلى الحاوية إلا باستخدام `-e`.
لا حاجة لتعديل ملفات `.env` أو إضافة أسرار إلى Dockerfile.

```bash
code server.js
export SHEIKHA_ENABLE_ALL_ENGINES=true
export SHEIKHA_LOCALMIND_BOOT=true
export SHEIKHA_ENABLE_CRON=true
podman build --no-cache -t localhost/sheikha-main-portal:test-local .
```

الإقلاع الإنتاجي يتطلب `JWT_SECRET` و`DATA_ENCRYPTION_KEY` و`PASSWORD_SALT` صالحين من مخزن
الأسرار المعتمد. لا تُلغَ فحوصهما، ولا تُنشر قيمهما في الطرفية أو المحادثة.
بعد تهيئتهما في البيئة يمكن إجراء اختبار محدود على loopback:

```bash
timeout --kill-after=5s 20s podman run --rm \
  -p 127.0.0.1:18080:8080 \
  -e PORT=8080 \
  -e SHEIKHA_ENABLE_ALL_ENGINES \
  -e SHEIKHA_LOCALMIND_BOOT \
  -e SHEIKHA_ENABLE_CRON \
  -e JWT_SECRET \
  -e DATA_ENCRYPTION_KEY \
  -e PASSWORD_SALT \
  localhost/sheikha-main-portal:test-local
```

انتهاء `timeout` بالرمز `124` يعني انتهاء المهلة، وليس إثبات صحة الخادم.
يجب فحص استجابات HTTP أيضًا. مفاتيح الاختبار العشوائية ليست مفاتيح إنتاج
ولا تصلح لقراءة بيانات مشفرة بمفاتيح سابقة. تشغيل cron الدائم يحتاج عاملًا
مخصصًا وتنسيقًا يمنع ازدواج المهام؛ تفعيل المتغير لا يثبت تنفيذ دورة مجدولة.
لا ينشر هذا الاختبار خدمة دائمة، ولا يدفع الحاوية إلى سجل خارجي.

## الاختبارات

```bash
node --check server.js
node --test tests/sheikha-optional-ai-status-routes.test.cjs
node node_modules/jest/bin/jest.js --config jest.config.js --runInBand --runTestsByPath tests/agi-asi-research-science-fabric-v1.test.js tests/intelligence-integration-fabric-v1.test.js tests/sdk-fabric-mcp-integration-v1.test.js
```

نجحت 12 حالة للربط المشروط ومنع التكرار وعزل الأعطال وHTTP، و16 حالة قائمة
لسجلات الوحدات. هذه نتيجة اختبارات محددة، وليست اعتمادًا أمنيًا للتبعيات
أو إثباتًا لإقلاع `server.js` كاملًا داخل الحاوية.

## نتيجة اختبار الحاوية

في 2026-10-22 نجح بناء نسخة اختبار منفصلة باسم
`localhost/sheikha-main-portal:ai-status-smoke-20261022` على Node `20.20.2`.
بصمة الحاوية:
`d24ef27ed3ccdf7f8555852e43ea23b2605b776306bb10a81d94a557334fd69c`.

تغيّر `Dockerfile` و`.dockerignore` أثناء العمل من جهة أخرى. أُوقفت محاولة
البناء الأولى ولم تُستبدل النسختان الجاريتان. استُخدم ملفّا الاختبار المؤقتان
في `/tmp/sheikha-ai-status-smoke-20261022/`، مع منع تضمين ملفات البيئة
والاعتماد واستثناء مخرجات تجميع سطح المكتب والتوزيع وضبط الملكية أثناء النسخ.
لذلك لا تمثل النتيجة اعتمادًا لملفّي البناء الجذريين الحاليين. قبل استخدام
أمر البناء المعتاد أعلاه يلزم مراجعة استثناءات الأسرار في سياقه.

نجح `npm ci --omit=dev --ignore-scripts --no-audit --no-fund` في البناء
المنفصل. في المحاولة الأولى أبلغ npm عن 32 ثغرة: 20 متوسطة، 11 عالية،
وواحدة حرجة. لم تُعالج التبعيات أو تُعتبر معتمدة أمنيًا.

- تطابقت بصمات `server.js` ومساعد الربط ومسجّل Fabric بين المضيف والحاوية.
- لم توجد المسارات المحددة `.env` و`.env.runtime` و`.env.local` و`.aws`
  و`.codex` و`.mcp.json` داخل جذر التطبيق. هذا ليس فحصًا شاملًا لكل الأسرار.
- نجحت واجهات الوحدات المنفصلة: `200` عند التفعيل و`404` عند التعطيل،
  و`404` لطلبات POST.
- أُقلع `server.js` كاملًا بالمفاتيح الثلاثة `SHEIKHA_*` المطلوبة وقيم أمان
  اختبارية عشوائية. أعادت نقاط الحالة الثلاث `200` مع `success: true`.
- كانت الشبكة الخارجية معطلة، دون ملفات مضيف أو أجهزة أو نشر منفذ 18080.
  تم فحص HTTP من داخل الحاوية على loopback.
- أنهى `timeout` الاختبار بعد 20 ثانية بالرمز `124`، وتحقق غياب الحاوية
  المسماة `sheikha-ai-status-full-20261022` من قائمة الحاويات العاملة.

لا تثبت هذه التجربة تنفيذ دورة cron يومية أو تدريب نموذج بجودة معينة أو
اتصال مزوّد خارجي أو صحة جميع محركات المشروع. لم تُحفظ مفاتيح الاختبار.
