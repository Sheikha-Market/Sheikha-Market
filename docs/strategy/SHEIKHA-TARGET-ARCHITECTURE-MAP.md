# SHEIKHA — Target Architecture Map

## الاعتماد الرسمي

هذه الوثيقة تحدد الخريطة المعمارية التنفيذية المعتمدة للتفعيل الكامل، وحدود الوحدات، ومسارات البيانات، وحدود APIs، وطوبولوجيا التشغيل.

## 1) الطبقات المعمارية المعتمدة

1. Experience/API Layer
2. Runtime & Orchestration Layer
3. Intelligence & Neural Layer
4. Data & State Layer
5. Observability & Governance Layer
6. Security & Compliance Layer

## 2) الوحدات الأساسية (Modules)

- API Gateway / Route Layer
- Auth & Access Control
- Catalog & Supplier Domain
- Orders & Transaction Domain
- Market Analytics Domain
- Neural Orchestration Core
- Integration Connectors
- Observability Services
- Governance & Policy Engine

## 3) حدود واجهات API (API Boundaries)

- Public APIs:
  - `/api/health`
  - `/api/catalog`
  - `/api/catalog/categories`
  - `/api/suppliers`
  - `/api/market-analytics/market`
- Authenticated APIs:
  - `/api/auth/register`
  - `/api/auth/login`
  - `/api/market-orders`
- Unified Runtime APIs:
  - `/api/v2/status`
  - `/api/v2/health`
  - `/api/v2/root/status`
  - `/api/v2/root/activate`

## 4) نموذج تدفق البيانات (Data Flow)

1. Client Request → API Route Guard (validation/rate-limit/auth)
2. Domain Handler → Business Rules / Sharia Compliance Checks
3. Neural Orchestration (if required) → Inference/Status Contract
4. Response Builder → Safe Output + Structured Logging
5. Observability Pipeline → Metrics/Logs/Alerts

## 5) شبكة الخلايا العصبية كطبقة مستقلة

## 5.1 دورة الحياة (Lifecycle)

- Boot
- Integrity Check
- Activation
- Runtime Monitoring
- Graceful Degradation
- Recovery/Reactivation

## 5.2 العقود (Contracts)

- Contract-N-01: كل خلية لها معرّف فريد، حالة، وزن، ونسخة عقد.
- Contract-N-02: واجهة الحالة تعيد `ready`, `totalCells`, `healthSignals`.
- Contract-N-03: أي فشل تحقق يعيد حالة قابلة للرصد والتنبيه.

## 5.3 الرصد (Observability)

- مؤشرات إلزامية:
  - Cell Readiness Ratio
  - Activation Success Rate
  - Inference Error Rate
  - Recovery Time

## 5.4 التعافي (Failover & Recovery)

- تفعيل نمط degraded mode عند فشل جزئي.
- إعادة المحاولة وفق سياسة backoff محددة.
- تصعيد تلقائي عند تجاوز عتبة الفشل.

## 6) طوبولوجيا التشغيل (Runtime Topology)

- Node Runtime (Primary API runtime)
- Neural Runtime Components (cell network + root status)
- Optional Integration Nodes (external connectors)
- CI/CD Quality Gates + Security Scans

## 7) معايير القبول المعمارية لكل مكون

- API Layer: حدود واضحة + توثيق + اختبارات endpoint أساسية.
- Auth Layer: JWT validation + role policy.
- Neural Layer: تحقق جاهزية الخلايا الأساسية قبل التشغيل الحرج.
- Observability Layer: تنبيهات للأعطال الحرجة خلال زمن استجابة معتمد.
- Governance Layer: سجل قرار واعتماد قبل التغييرات الكبرى.
