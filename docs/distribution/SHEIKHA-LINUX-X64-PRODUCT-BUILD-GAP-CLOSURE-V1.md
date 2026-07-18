# إغلاق فجوات أوامر بناء Linux x64 وواجهة المشغل — الإصدار 1

## النطاق

تشمل هذه المرحلة أربعة أهداف:

- `LINUX_DEB_X64`
- `LINUX_RPM_X64`
- `LINUX_TAR_GZ_X64`
- `LINUX_CLI_X64`

## ما تم إعداده

- أمر مستقل في `package.json` لكل منتج.
- أمر حالة مستقل لكل منتج.
- واجهة مشغل صريحة تقبل المنتج ثم المعمارية.
- تمرير متغير المنتج والمعمارية ومسار الإخراج.
- منع الرجوع إلى أمر عام غير محدد.
- ربط كل هدف بأمر بناء موجود سابقًا بوصفه delegate يحتاج تحققًا تنفيذيًا.

## الحدود

إضافة الأوامر وواجهة المشغل لا تثبت إنشاء حزمة صحيحة. ما زال مطلوبًا:

1. تشغيل الأمر على Linux x64.
2. فحص نوع الحزمة واسمها ومحتواها.
3. حساب SHA-256.
4. إنشاء SBOM وسجل مصدر البناء.
5. اختبار التثبيت.
6. اختبار التشغيل الأساسي.
7. اختبار الإزالة.
8. تسجيل حالة التوقيع.
9. مراجعة بشرية قبل اعتماد الإصدار.

أداة `rpmbuild` مطلوبة لهدف RPM، ولا تقوم هذه المرحلة بتثبيتها.

## أوامر الحالة

```bash
npm run sheikha:dist:linux:status:deb:x64
npm run sheikha:dist:linux:status:rpm:x64
npm run sheikha:dist:linux:status:tar-gz:x64
npm run sheikha:dist:linux:status:cli:x64
```

## تشغيل المشغل

```bash
scripts/distribution/linux/build-sheikha-linux-installers-v1.sh deb x64
scripts/distribution/linux/build-sheikha-linux-installers-v1.sh rpm x64
scripts/distribution/linux/build-sheikha-linux-installers-v1.sh tar-gz x64
scripts/distribution/linux/build-sheikha-linux-installers-v1.sh cli x64
```

لا تنفذ هذه الوثيقة أو مرحلة الإغلاق الحالية أي بناء أو تثبيت حزم.
