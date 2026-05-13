# حدود شيخة الكونية التشغيلية

## المقصد
تثبيت حدود تشغيلية تمنع الضرر، وتحافظ على الاستقرار، وتجعل النظام يتجدد للأفضل بقياس واضح.

## القاعدة
لا ترقية بلا تحقق.
لا توسع بلا قياس.
لا تشغيل متداخل.
لا تجاوز للذاكرة أو السجلات أو المنافذ.
لا اعتماد إلا إذا كانت البصمة verified.

## الحدود المعتمدة
- Node LTS: 22.22.2
- PM2 runtime واحد: sheikha-main-portal
- منفذ رئيسي واحد: 8080
- RSS لا يتجاوز 512MB
- Heap لا يتجاوز 85%
- Restart لا يتجاوز 3 مرات في الساعة
- Event loop lag لا يتجاوز 150ms
- p95 latency لا يتجاوز 750ms
- error rate لا يتجاوز 1%
- disk usage لا يتجاوز 80%
- logs لا تتضخم فوق 100MB

## التجدد للأفضل
أي تحسين جديد يدخل عبر:
stable/runtime-baseline
ثم feature/targeted-improvement
ثم فحص:
- /api/health
- /api/runtime
- /api/version
- /api/observability/summary

ولا يعتمد إلا إذا بقيت الحالة verified.
