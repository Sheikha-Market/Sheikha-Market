# SHEIKHA PRODUCT KNOWLEDGE DECISION ENGINE ACTIVATION V1

Branch:
fix/enterprise-inspector-circular-dependency

---

## الهدف

استقرار Product Knowledge بالكامل بحيث تصبح جميع المحركات:

- Validation
- Quality
- Pricing
- Standards
- Decision

تعمل من المتصفح ومن REST API بنفس السلوك.

---

# المرحلة الأولى

التحقق من ترتيب تسجيل المسارات داخل server.js

يجب أن يكون الترتيب:

Routes

↓

Static Files

↓

404 Handler

↓

Global Error Handler

ولا يجوز تسجيل أي Route بعد 404 Handler.

---

# المرحلة الثانية

إضافة سجل تشخيص لمسار القرار

داخل:

routes/product-knowledge/product-knowledge.routes.js

في بداية:

POST /decision

أضف:

console.log(
  '[PRODUCT_DECISION]',
  JSON.stringify(req.body, null, 2)
);

---

ثم داخل catch:

console.error(
  '[PRODUCT_DECISION_ERROR]',
  error
);

return res.status(500).json({
    success:false,
    error:error.name,
    message:error.message,
    stack:error.stack
});

---

# المرحلة الثالثة

التحقق من المحركات

قبل استخدامها:

evaluateProductQuality

evaluateProductPricing

evaluateProductStandards

validateProduct

أضف:

if(typeof evaluateProductQuality!=='function')
    throw new Error('QUALITY_ENGINE_NOT_LOADED');

if(typeof evaluateProductPricing!=='function')
    throw new Error('PRICING_ENGINE_NOT_LOADED');

if(typeof evaluateProductStandards!=='function')
    throw new Error('STANDARDS_ENGINE_NOT_LOADED');

if(typeof validateProduct!=='function')
    throw new Error('VALIDATION_ENGINE_NOT_LOADED');

---

# المرحلة الرابعة

تشغيل الاختبارات

node --check server.js

node --check routes/product-knowledge/product-knowledge.routes.js

npm test -- tests/product-engines-v1.test.js

npm test -- tests/product-knowledge-fabric-v1.test.js

npm run lint

---

# المرحلة الخامسة

إعادة التشغيل

pm2 restart sheikha-main-portal --update-env

---

# المرحلة السادسة

اختبار القرار

curl -X POST \
http://127.0.0.1:8080/api/product-knowledge/decision \
-H "Content-Type: application/json" \
-d '{
"name":"Copper Cable",
"category":"metals",
"price":{"amount":25,"currency":"SAR"},
"quality":{"score":80},
"risk":{"level":"LOW"},
"standards":["internal-inspection-required"]
}'

النتيجة المتوقعة:

HTTP 200

{
"success":true,
"decision":"APPROVED"
}

---

# المرحلة السابعة

بعد نجاح القرار

تفعيل:

Product Registry

Product Classification

Product Catalog

Product Search

Supplier Registry

Quality Registry

Pricing Registry

Standards Registry

Compliance Registry

Lifecycle Registry

Inventory Registry

Commercial Approval Registry

Risk Registry

Knowledge Graph

Semantic Search

Recommendation Engine

Governance Engine

Enterprise Dashboard

Explorer UI

REST API

SDK

Documentation

Integration Registry

Enterprise Architecture Registry

---

هدف المرحلة

الوصول إلى:

SHEIKHA_PRODUCT_KNOWLEDGE_PLATFORM_V1

بدلاً من مجرد

SHEIKHA_PRODUCT_KNOWLEDGE_FABRIC_V2

ليصبح النظام منصة مؤسسية متكاملة لإدارة المعرفة الخاصة بالمنتجات.
