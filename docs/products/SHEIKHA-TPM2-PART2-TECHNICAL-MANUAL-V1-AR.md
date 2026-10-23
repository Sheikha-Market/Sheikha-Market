# كتيب شيخة الفني لهياكل TPM 2.0 Part 2

## 1. هوية الكتيب

- النظام: `SHEIKHA TPM2 PART2 STRUCTURES PROFILE V1`
- المرجع الفني: Trusted Computing Group، TPM 2.0 Library Part 2: Structures، Version 185، 12 مارس 2026.
- النطاق: هياكل التصديق Quote وتوقيعه وهوية مفتاح AK العامة ضمن مسار الثقة في منصة شيخة.
- الحالة: تنفيذ جزئي محدد ومختبر، وليس تطبيقًا كاملًا لجميع هياكل Part 2.

المرجع الرسمي: <https://trustedcomputinggroup.org/wp-content/uploads/Trusted-Platform-Module-2.0-Library-Part-2-Structures_Version-185_pub.pdf>

## 2. الغرض

يشرح هذا الكتيب كيفية انتقال الأدلة الخام من TPM إلى قرار ثقة محكوم، وكيف تُفصل قراءة البنية عن الثقة في المصدر وعن صلاحية إصدار Firmware. لا تمنح سلامة parser وحدها ثقة بالجهاز، ولا تمنح صحة التوقيع وحدها إثبات إقامة AK داخل TPM.

## 3. السلسلة الفنية

```text
TPM2B_PUBLIC / TPMT_PUBLIC
  -> Object Name وAK public identity
TPM2B_ATTEST / TPMS_ATTEST
  -> nonce وclock وPCR selection وpcrDigest
TPMT_SIGNATURE
  -> RSASSA أو RSAPSS أو ECDSA
PCR export + event log
  -> replay ومطابقة القيم
EK/AK enrollment + credential activation
  -> TPM residency evidence
Release Gate + execution lease
  -> تنفيذ محدود منفصل
```

## 4. الهياكل المنفذة

### 4.1 TPMS_ATTEST

يُقبل النوع `TPM_ST_ATTEST_QUOTE=0x8018` فقط، مع `TPM_GENERATED=0xff544347`. تُقرأ `qualifiedSigner` و`extraData` و`clockInfo` و`firmwareVersion` و`TPMS_QUOTE_INFO`. تُرفض البيانات الناقصة والزائدة وsafe flag غير الصحيح.

### 4.2 TPMT_SIGNATURE

تدعم المنصة `RSASSA` و`RSAPSS` و`ECDSA`. يُتحقق من التوقيع فوق bytes بنية `TPMS_ATTEST` الداخلية؛ حجم `TPM2B_ATTEST` الخارجي ليس جزءًا من البيانات الموقعة.

### 4.3 TPM2B_PUBLIC وTPMT_PUBLIC

يدعم profile الحالي RSA وECC فقط. يحسب Object Name كالتالي:

```text
UINT16_BE(nameAlg) || HASH_nameAlg(TPMT_PUBLIC_marshaled_bytes)
```

لا يدخل حجم `TPM2B_PUBLIC` الخارجي في hash. الأس RSA ذو القيمة صفر يفسر كـ65537 عند مطابقة المفتاح. يدعم ECC منحنيات P-256 وP-384 وP-521.

### 4.4 Object Name وQualified Name

هما قيمتان مختلفتان من حيث المعنى والبناء. لا تفترض شيخة أن `TPMS_ATTEST.qualifiedSigner` يساوي Object Name. يلزم سجل enrollment يربط Qualified Name بالمنصة وقرار الحوكمة والأدلة.

## 5. ما لم يكتمل

- لم يُجمع Quote حقيقي من الجهاز بعد.
- لم يُصدّر AK public area حقيقي.
- لم ينفذ MakeCredential/ActivateCredential.
- Secure Boot غير مفعل في اللقطة الحالية.
- سجل measured boot موجود لكنه غير مقروء للمستخدم الحالي.
- بقية هياكل Part 2 خارج profile الحالي أو مخطط لها.

لذلك الحالة ليست `FULL_PART2_CONFORMANCE` وليست `PRODUCTION_ATTESTATION_READY`.

## 6. تشغيل الفحوص

```bash
npm run -s ops:governance:tpm-public:test:v1
npm run -s ops:governance:tpm-attestation:test:v1
npm run -s ops:governance:tpm-signature:test:v1
npm run -s ops:governance:tpm-evidence:test:v1
npm run -s ops:governance:tpm-quote-readiness:inspect:v1
```

أمر preflight لا ينفذ أوامر TPM، ولا ينشئ AK، ولا يغير Secure Boot أو Firmware.

## 7. قواعد الأمان

1. كل بنية غير معروفة أو خوارزمية غير مدعومة تُرفض.
2. لا تتحول بصمة الملف إلى إثبات صحة محتواه.
3. لا تثبت شهادة X.509 وحدها إقامة AK في TPM.
4. لا يثبت تطابق AK public key وحده هوية المنصة.
5. لا تنفذ كتابة Firmware دون recovery وrollback وتوقيع وموافقة بشرية منفصلة.
6. لا تحفظ مفاتيح production الخاصة في المستودع.
7. لا تُرقّى fixture اختبار إلى دليل جهاز حقيقي.

## 8. إصلاح العقود بلا ضرر

يفحص `SHEIKHA_CONTRACT_HARM_REPAIR_V1` العقود التقنية المنظمة آليًا. يحفظ الأصل ويولد مسودة إصلاح عند غياب fail-closed أو المراجعة البشرية أو حدود المفاتيح والتنفيذ. المسودة لا تعد قبولًا قانونيًا، ولا فتوى، ولا تفويض تنفيذ. العقود القانونية والتجارية والشرعية تتطلب مراجعة بشرية مؤهلة بحسب الاختصاص.

## 9. التكامل مع لغة شيخة والجنات

لغة شيخة تمثل دورة الثقة بأسماء تخطيطية دنيوية: التربة هي أساس المنصة، والبذرة هي الأثر المعرّف بالبصمة، والمشتل هو الاختبار المعزول، والسقاية موارد محدودة، والثمرة إصدار موقع، والتكاثر توزيع محكوم. هذا مجاز هندسي ولا يدخل الغيب في الحساب.

## 10. مسار الإكمال

1. تجهيز `/dev/tpmrm0` وقراءة event log بأقل صلاحية.
2. تثبيت نسخة مراجعة ومثبتة من `tpm2-tools`.
3. إنشاء AK غير قابل للتصدير مع سجل enrollment.
4. تصدير TPM2B_PUBLIC وPCR وQuote وتوقيعه إلى مجلد أدلة محكوم.
5. تنفيذ التحقق offline وإعادة PCR.
6. إضافة EK trust وcredential activation.
7. تفعيل Secure Boot ضمن خطة تعافٍ منفصلة.
8. إعادة بوابة الإصدار؛ أي نقص يبقي `RELEASE_DENY`.

## 11. بوابة التجربة والإنتاج

تشغل بالأمر:

```bash
npm run -s ops:governance:tpm-production-trial:activate:v1
```

وتصدر واحدة من الحالات: `LAB_BLOCKED` أو `LAB_READY_PHYSICAL_TRIAL_BLOCKED` أو `PHYSICAL_TRIAL_READY_PRODUCTION_BLOCKED` أو `PRODUCTION_READY`. لا تنفذ البوابة أوامر TPM؛ إنها تجمع الأدلة الحالية وتحدد الخطوة التالية وشروط التوقف.
