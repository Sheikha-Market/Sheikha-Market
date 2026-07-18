# إغلاق فجوات الإخراج والآثار الجانبية لبناء Linux x64 — الإصدار 1

## المشكلة المثبتة

فحص ما قبل البناء أثبت أن أوامر DEB وtar.gz وCLI كانت صحيحة الصياغة، لكنها لم تحقق عقد الإخراج الآمن المطلوب لبناء تحقق مضبوط.

## الحل

أضيف منشئ تحقق محكوم للمنتجات الثلاثة:

- `LINUX_DEB_X64`
- `LINUX_TAR_GZ_X64`
- `LINUX_CLI_X64`

ويفرض ما يلي:

1. التشغيل على Linux x64.
2. مصدر Git نظيف ومربوط بـ commit.
3. مسار إخراج صريح خارج المستودع.
4. قصر الإخراج على:
   `$HOME/Backups/sheikha/native-installer-validation-builds`
5. عدم تنزيل أي شيء من الشبكة.
6. عدم تثبيت حزم.
7. عدم التحكم بالخدمات.
8. عدم إجراء تعديل بعيد.
9. عدم ادعاء أن الناتج إصدار تجاري.
10. بقاء اختبارات التثبيت والتشغيل والإزالة والمراجعة البشرية مطلوبة.

## طبيعة النواتج

النواتج القادمة ستكون **حزم تحقق غير مخصصة للإصدار**. وجود ملف DEB أو tar.gz أو CLI لا يعني اعتماده للبيع أو الإنتاج.

## أمر فحص الجاهزية

```bash
node tools/distribution/sheikha-linux-x64-controlled-validation-builder-v1.js \
  status \
  --product deb \
  --arch x64 \
  --output-dir "$HOME/Backups/sheikha/native-installer-validation-builds/deb-x64"
```

## أمر البناء المستقبلي

```bash
scripts/distribution/linux/build-sheikha-linux-installers-v1.sh \
  deb \
  x64 \
  "$HOME/Backups/sheikha/native-installer-validation-builds/deb-x64"
```

هذه المرحلة لا تنفذ الأمر السابق، بل تنشئ الأساس وتتحقق منه فقط.
