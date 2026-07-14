# بسم الله الرحمن الرحيم

# Sheikha System Builder Fabric V1

## الغرض

طبقة أدوات محكومة لبناء الحزم، وصور أنظمة التشغيل،
والتوزيعات المخصصة، والأنظمة المضمنة، ووسائط التثبيت،
والصور السحابية والافتراضية.

## القاعدة المعمارية

تسجيل الأداة لا يعني تثبيتها أو منحها صلاحية التنفيذ.

لكل عائلة أدوات:

1. صورة بناء مستقلة.
2. بصمة أساس ثابتة.
3. عقد مكتوب محدد النطاق.
4. أقل صلاحيات.
5. سجل منشأ للمدخلات والمخرجات.
6. تحقق من الحمولة.
7. اختبار دورة الحياة.
8. منع النشر الخارجي افتراضيًا.

## الملفات الأساسية

- سجل الأدوات:
  `runtime/system-builder-fabric/v1/sheikha-system-builder-tool-registry-v1.json`

- مصفوفة القدرات:
  `runtime/system-builder-fabric/v1/sheikha-system-builder-capability-matrix-v1.json`

- عقد النسيج:
  `runtime/system-builder-fabric/v1/sheikha-system-builder-fabric-v1.json`

## الملف التشغيلي الحالي

`FEDORA_RPM_MINIMAL_V7`

يتضمن:

- rpm
- rpmbuild
- rpmdevtools

داخل صورة Fedora المحلية المثبتة بالبصمة.

التنفيذ المثبت:

- بُني RPM أصلي واحد داخل العائلة المعزولة.
- SHA-256 للأثر:
  `936bdc0dfbb794e1fe41d8fd7799af95a9e3cc92b117a62c0b8b2383f6a571b9`
- تطابقت أسماء ومسارات وأنواع وأحجام وبصمات محتوى `40013` عنصرًا.
- شدد RPM 6 أذونات group-write فقط؛ لا توجد زيادة صلاحيات.
- لم يُنفذ تثبيت Native أو اختبار lifecycle.
- ينقص Spec الحالي إعلان `bash` و`coreutils` و`nodejs >= 20`؛ لذلك لا توجد دعوى جاهزية تثبيت.

تقرير التنفيذ:

`runtime/distribution/v7/evidence/sheikha-v7-rpm-native-build-report.json`

## الملفات المسجلة غير القابلة للتنفيذ حاليًا

- Fedora Cleanroom: Mock وMockchain.
- Fedora Build Farm: Koji.
- Fedora Compose: Pungi وLorax.
- Fedora Image Builder: osbuild وImage Builder.
- Immutable/Image Mode: rpm-ostree وbootc.
- Embedded: Yocto وBitBake وBuildroot.
- Cross-distribution: KIWI NG وmkosi.
- Declarative: Nix وGuix.
- Debian image and package builders.
- Android وBSD وAlpine وArch adapters.

كل ملف من هذه الملفات حالته `PLANNED`. التسجيل هنا كتالوج قدرة،
ولا يعني التثبيت أو التشغيل. يتطلب تفعيل أي عائلة صورة مستقلة ببصمة
ثابتة، ومحولًا مدرجًا في قائمة السماح، وعقدًا مكتوبًا، واختبارات حمولة
ودورة حياة خاصة بها. لا يسمح النسيج بجمع هذه العائلات في صورة واحدة.

المصفوفة الحالية تسجل `22` عائلة: عائلة واحدة لتنفيذ الحاويات بوصفها
ركيزة، و`21` عائلة بناء منفصلة. منها عائلة RPM واحدة نشطة و`20`
ملفًا مخططًا محجوبًا عن التنفيذ.

## الحوكمة

- الأصل المنع.
- لا تثبيت آلي على المضيف.
- لا صلاحيات موسعة تلقائيًا.
- لا بيانات اعتماد افتراضيًا.
- لا نشر خارجي افتراضيًا.
- لا ادعاء اعتماد رسمي من أي منصة.
- لا ضرر ولا ضرار.
