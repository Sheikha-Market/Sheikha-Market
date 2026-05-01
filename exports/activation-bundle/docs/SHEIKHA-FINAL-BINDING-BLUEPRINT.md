# منظومة شيخة
## مخطط الربط النهائي لمنظومة شيخة
### (Repo Structure + Docker Compose + CI/CD + MCP Allowlist + Observability)

بسم الله الرحمن الرحيم — ﴿وَاللَّهُ غَالِبٌ عَلَىٰ أَمْرِهِ﴾

هذا الملف هو مخطط الربط النهائي الجاهز للإرسال والتنفيذ، مبني على الميثاق والنموذج التشغيلي الحاكم.

## 0) الهدف التنفيذي
- توحيد هيكل المستودع (Monorepo عملي).
- تشغيل إنتاجي على VPS عبر Docker Compose.
- CI/CD آمن: build → test → scan → deploy.
- MCP بوضع deny-by-default + allowlist + audit.
- Observability كاملة: logs + metrics + traces + alerts.
- قابلية نقل وتشغيل على أي مزود لاحقًا.

## 1) البنية المعتمدة في هذا المستودع
- المسار التشغيلي الحالي: `sheikha-main-portal/`.
- محرك MCP الحالي: `sheikha-main-portal/mcp-servers/sheikha-mcp-server.js`.
- خرائط الربط: `sheikha-main-portal/config/bindings.json`.
- سياسات MCP: `sheikha-main-portal/mcp-servers/config/*.json`.
- الإنتاج (compose): `sheikha-main-portal/infra/docker/compose/prod/docker-compose.yml`.
- CI/CD: `sheikha-main-portal/.github/workflows/ci.yml` و `deploy-prod.yml`.

## 2) قواعد الربط (Binding Rules)
- المحرك لا ينتقل عشوائيًا بين النطاقات.
- المشاركة تكون عبر outputs معيارية فقط.
- Startup = L0 فقط.
- غير L0 = lazy عند الطلب عبر route/job واضح.

## 3) أمان MCP (إلزامي)
- default deny.
- allowlist صريحة للأدوات الآمنة.
- حظر `filesystem write` و`process exec` افتراضيًا.
- تدقيق request/response metadata بدون أسرار.

## 4) تشغيل ومراقبة
- gateway/app + mcp + postgres + redis + observability stack.
- مؤشرات أساسية: latency/error-rate/availability/resource usage.
- تنبيهات: 5xx, p95 latency, disk, db saturation.

## 5) أمر تنفيذي
أي عنصر خارج هذا الإطار: يوقف → يراجع → يصحح.

﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾

