# SHEIKHA ENTERPRISE EVENT BUS V1

## الهدف

ربط وحدات شيخة داخليًا عبر أحداث موحدة بدل الاعتماد على استدعاءات مباشرة بين الصفحات.

## القاعدة

- الأحداث داخلية فقط.
- لا يوجد تعديل خارجي.
- كل حدث يحمل سياقًا وحوكمة وسجل تدقيق.
- أي نوع حدث غير معتمد يتم حظره.

## أمثلة

- PRODUCT_APPROVED
- WORKSPACE_CHANGED
- CONTEXT_CHANGED
- GOVERNANCE_PASSED
- HEALTH_CHECKED
- PRODUCTION_GATE_CHECKED

## الحالة

ACTIVE  
GOVERNED_INTERNAL_EVENT_BUS
