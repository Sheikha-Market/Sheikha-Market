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
