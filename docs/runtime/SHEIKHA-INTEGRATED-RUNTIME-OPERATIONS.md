# SHEIKHA Integrated Runtime Operations

## الهدف

توحيد التشغيل بين الجهاز المحلي وGitHub وVPS وPM2 والتقارير.

## المسار المعتمد

Local Development → GitHub stable/runtime-baseline → VPS → PM2 → Health Check → Runtime Report

## القاعدة الذهبية

لا تشغيل إنتاجي إلا من:
stable/runtime-baseline

## ممنوع

- تشغيل production من فروع مؤقتة
- استرجاع server.js من backup قديم
- إضافة طبقات كبيرة قبل ثبات baseline
- تشغيل Docker على منفذ 8080 مع PM2

## التحقق

tools/runtime/sheikha-runtime-check.sh

## تنفيذ موحد غير تفاعلي (VPS)

أمر واحد ينفذ:

- deploy من الفرع stable/runtime-baseline
- restart عبر PM2
- topology (apply + audit + sync)
- runtime check

الأمر:

npm run ops:vps:unified

للتشغيل مع push لقنوات الكتابة فقط (rw) داخل topology:

npm run ops:vps:unified:push

ملاحظات:

- يعمل من الجهاز المحلي عبر SSH أو من داخل VPS مباشرة.
- مسار topology الصحيح هو:
scripts/repo-topology-sync.js
