# شيخة | سجل حسابات GitHub في VS Code (R3)
**التصنيف: داخلي / خاص — توثيق محلي فقط؛ لا تعديلات على الحسابات أو الميزانيات أو صلاحيات GitHub.**

## الحسابات الموثقة
- Sheikha-Market: حساب شخصي؛ login ومعرّف GitHub مثبتان عبر الموصل.
- Sheikha Top Enterprise: ظاهر في صفحة Enterprise مع شارة Owner؛ المعرّف الرسمي غير موثّق.
- Sheikha-top: منظمة تظهر بصفة Owner في الواجهة، وما زالت رسالة Flagged ظاهرة.
- لا يُفترض تلقائيًا أن Enterprise هو ذاته منظمة Sheikha-top.

## ملفات السجل
- accounts-registry.json: **الأصل المرجعي**؛ سجل الحسابات والجهات والعلاقات والأدلة والمتابعات والميزانيات.
- accounts-register.xlsx: نسخة مرجعية محلية **R2 محفوظة** من ملف التنزيلات الموثّق؛ 8 أوراق. النسخة R3 الموسّعة ذات 9 أوراق متاحة من حزمة R3 داخل محادثة ChatGPT ولم تُنقل إلى هذا المجلد حتى الآن.
- accounts-register.csv: إسقاط R3 لجدول الحسابات، وليس كل الجداول.
- FILE_SHA256.json: بصمات محلية تساعد على كشف تغيير الملفات، وليست توقيعًا مستقلًا.
- verify_registry.py: فحص بنية JSON/CSV وسلامة الملفات بالقراءة فقط.

## في VS Code
افتح الملف README.md من داخل docs/governance/github-accounts ثم نفذ من طرفية جذر المشروع:
python3 -I -S -B docs/governance/github-accounts/verify_registry.py

## الحوكمة
- منع حفظ كلمات المرور وPAT وAPI Keys وOAuth و2FA وأرقام بطاقات الدفع.
- مبالغ Budgets من لقطة 2026-10-16 فقط، ولا تفويض بإنفاق أو رفع الحدود.
- مستندات هذا المجلد محلية ويمنع إدراج الحسابات وبيانات الميزانيات في Git آليًا.
- No merge / No deploy / No production / No payment / No secret mutation.
- لا شهادة ملكية قانونية أو اعتماد طرف مستقل بمجرد ظهور Owner أو hash.
