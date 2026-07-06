# Sheikha JDK Root Neural Cell

## التعريف

خلية JDK الجذرية تضبط Java Development Kit داخل منظومة Sheikha كمسار مؤسسي محكوم للبناء والتشغيل والتصحيح والنشر.

## الأساس

- التوحيد لله وحده.
- الحوكمة بالكتاب والسنة.
- التقنية أداة تشغيل وتحليل لا تدعي وعيًا ولا علم غيب ولا سلطة مستقلة.
- الإنسان صاحب القرار قبل أي تثبيت أو ترقية أو نشر مؤثر.

## المكونات

- `javac`: تحويل ملفات `.java` إلى bytecode.
- `JRE`: مكتبات التشغيل الأساسية.
- `JVM`: تنفيذ bytecode على Linux وWindows وmacOS.
- `jdb`: تصحيح الأخطاء في بيئة التطوير.
- `javadoc`: توثيق الكود.
- `keytool` و`jarsigner`: الثقة والتوقيع وإدارة المفاتيح.

## الاستخدامات المؤسسية

- تطبيقات الشركات.
- الأنظمة البنكية والمالية.
- أنظمة ERP.
- السحابة والحاويات وOpenShift.
- البيانات الضخمة مثل Hadoop وSpark.
- خوادم الويب مثل Tomcat وJBoss.
- التطوير متعدد المنصات.

## قنوات التوزيع

- Linux: `rpm`, `deb`, `tar.gz`, container image, CLI.
- Windows: `msi`, `zip`, user installer, system installer, CLI.
- macOS: `dmg`, `pkg`, `tar.gz`, CLI.
- Containers: UBI/container images للحاويات والسحابة الهجينة.

## قواعد الأمان

- لا تثبيت من مصدر غير موثوق.
- لا نشر دون فحص checksum أو توقيع.
- تفضيل LTS للمؤسسات.
- لا ترقية إنتاجية دون اختبارات ونسخة احتياطية وموافقة بشرية.
- لا أسرار في سجلات البناء أو النشر.

## API

- `GET /api/sheikha/jdk/status`
- `POST /api/sheikha/jdk/plan`
- `POST /api/sheikha/jdk/evaluate`

## CLI

- `sheikha jdk`
- `sheikha jdk-plan linux`
- `sheikha jdk-evaluate`

## قرار التشغيل

الخلية مفعلة للتخطيط والتقييم المؤسسي. أي تثبيت فعلي أو ترقية أو تغيير إنتاجي يبقى مشروطًا بالمراجعة البشرية والفحص الأمني.
