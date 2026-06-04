# Sheikha Root Identity

## الهوية
- الاسم الأعلى: Sheikha Root
- الاسم العربي: جذر شيخة
- الاسم التشغيلي: Sheikha Root Operating Core
- الاسم النظامي: Sheikha Operating System
- الاسم القديم: sheikha-main-portal

## الرفع
- من: PORTAL_LAYER
- إلى: ROOT_LAYER
- تغيير المسار الآن: لا
- السبب: منع كسر VPS / PM2 / Git

## الربط الفعلي
- package: sheikha-operating-system
- Express: sheikhaRuntimeIdentity
- Root endpoint: /api/root-identity/status
- Operating endpoint: /api/operating-system/status
- Runtime endpoint: /api/runtime/identity/status
- Fabric root mount: /api/root-identity

## الفحوص
- OK packageNameRaised
- OK packageDisplayNameRaised
- OK expressRootIdentityBound
- OK fabricRootIdentityBound
- OK wellKnownRaised
- OK operatingSystem
- OK rootOperatingCore
- OK unifiedGovernanceFabric
- OK architectureFreeze
- OK stabilityLayer

ولا حول ولا قوة إلا بالله.
