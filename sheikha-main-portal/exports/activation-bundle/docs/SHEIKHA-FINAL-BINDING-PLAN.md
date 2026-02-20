# منظومة شيخة
## مخطط الربط النهائي لمنظومة شيخة
### (Repo Structure + Docker Compose + CI/CD + MCP Allowlist + Observability)

بسم الله الرحمن الرحيم — ﴿وَاللَّهُ غَالِبٌ عَلَىٰ أَمْرِهِ﴾

هذا الملف هو مخطط ربط نهائي جاهز للإرسال والتنفيذ داخل فريق كروز، مبني على `CHARTER.md` و`SHEIKHA-TAWHEED-OPERATING-MODEL-ROOT.md`.

## 0) الهدف التنفيذي
- توحيد المستودع بهيكل واضح.
- تشغيل إنتاجي على VPS عبر Docker Compose.
- CI/CD آمن: Build ثم Test ثم Scan ثم Deploy.
- MCP بوضع `deny-by-default` مع `allowlist` وتدقيق.
- Observability كاملة: Logs + Metrics + Tracing + Alerts.
- قابلية نقل كاملة بين المزودين.

## 1) هيكل المستودع (Mono)
هيكل التنفيذ المعتمد فعليا في هذا المستودع:

- `sheikha-main-portal/` التطبيق الرئيسي.
- `sheikha-main-portal/infra/docker/compose/prod/` تشغيل الإنتاج.
- `sheikha-main-portal/mcp-servers/` خادم MCP وسياساته.
- `sheikha-main-portal/.github/workflows/` CI/CD.
- `sheikha-main-portal/config/` خرائط الربط والتصنيف.
- `docs/` وملفات الميثاق في الجذر للتوجيه التنفيذي.

## 2) Binding Maps (Domain ↔ Engine ↔ Route)
الملف التنفيذي:
- `sheikha-main-portal/config/bindings.json`

قاعدة التشغيل:
- المحرك لا ينتقل عشوائيا.
- المنظومات تتبادل مخرجات معيارية فقط.

## 3) Docker Compose (Production)
الملف التنفيذي:
- `sheikha-main-portal/infra/docker/compose/prod/docker-compose.yml`

الخدمات الأساسية:
- `nginx`
- `main-portal`
- `mcp-server`
- `postgres`
- `redis`
- `prometheus`
- `grafana`
- `loki`
- `otel-collector`

الشبكات:
- `front_net` للبوابة.
- `back_net` للخدمات الداخلية.

## 4) CI/CD
ملفات التنفيذ:
- `sheikha-main-portal/.github/workflows/ci.yml`
- `sheikha-main-portal/.github/workflows/deploy-prod.yml`

سياسة:
- لا نشر قبل نجاح lint/tests/scans/build.
- نشر الإنتاج فقط من `main` أو `release/*`.

## 5) MCP Security
مسار السياسات:
- `sheikha-main-portal/mcp-servers/config/allowlist.json`
- `sheikha-main-portal/mcp-servers/config/denylist.json`
- `sheikha-main-portal/mcp-servers/config/policies.json`

سياسة إلزامية:
- `default = deny`
- حد مهلة وحدود Payload.
- منع الكتابة على الملفات وتنفيذ الأوامر افتراضيا.
- تدقيق لكل طلب/استجابة بدون أسرار.

## 6) Observability
الملفات:
- `sheikha-main-portal/infra/observability/prometheus/prometheus.yml`
- `sheikha-main-portal/infra/observability/loki/loki-config.yml`
- `sheikha-main-portal/infra/observability/otel/otel-collector-config.yml`
- `sheikha-main-portal/infra/observability/grafana/provisioning/datasources/datasources.yml`

الهدف:
- قياس `availability`, `p95 latency`, `error rate`.
- ربط logs/metrics/traces برقم طلب موحد.

## 7) واجهات الاتصال
سياسة الاختيار:
- REST للواجهات العامة.
- gRPC للخدمات الداخلية عند التوسع.
- MCP لتكامل الذكاء.

## 8) النسخ الاحتياطي
- نسخ يومية لقاعدة البيانات.
- نسخ أسبوعية خارجية مشفرة.
- سياسات احتفاظ يومي/أسبوعي/شهري.

## 9) التشغيل الدائم
- VPS هو بيئة الإنتاج الدائمة.
- الأجهزة المحلية للتطوير فقط.
- النشر عبر CI/CD وليس من الأجهزة الشخصية.

## 10) خطة التدرج
- مرحلة 0/1: VPS واحد + Compose.
- مرحلة 2: فصل DB/Workers عند الضغط.
- مرحلة 3: Kubernetes + HA + Autoscaling.

## 11) Checklist تنفيذ سريع
- تفعيل متغيرات البيئة.
- تشغيل compose production.
- تفعيل CI وDeploy.
- تفعيل MCP allowlist + audit.
- تفعيل observability.
- smoke tests: `health + MCP + login + market`.

## 12) الأمر التنفيذي النهائي
هذا الملف مرجع الربط النهائي.
أي تنفيذ خارج هذا الإطار: يوقف ثم يراجع ثم يصحح.

﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾

