# شيخة — خريطة البنية التشغيلية (Topology Map)

- هذا الملف يوضح العلاقات بين جميع مكونات التشغيل (Canonical Runtime Tree)
- كل عقدة تمثل وحدة تشغيلية أو معرفية أو حوكمة

```mermaid
graph TD
    CORE[core/]
    RUNTIME[runtime/]
    ROUTES[routes/]
    GOVERNANCE[governance/]
    KNOWLEDGE[knowledge/]
    COMPUTE[compute/]
    INFRA[infrastructure/]
    INTEGRATION[integration/]
    REGISTRY[registry/]
    VERIFICATION[verification/]
    OPTIMIZATION[optimization/]

    CORE --> RUNTIME
    RUNTIME --> ROUTES
    RUNTIME --> GOVERNANCE
    RUNTIME --> KNOWLEDGE
    RUNTIME --> COMPUTE
    RUNTIME --> INFRA
    RUNTIME --> INTEGRATION
    RUNTIME --> REGISTRY
    RUNTIME --> VERIFICATION
    RUNTIME --> OPTIMIZATION
```

- كل تحديث في الشجرة يجب أن ينعكس هنا وفي GLOBAL_MANIFEST.md
