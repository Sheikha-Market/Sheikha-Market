# تفعيل التسلسل الهرمي المؤسسي — Enterprise Hierarchy Activation

هذا الدليل يثبت التسلسل الهرمي التشغيلي المعتمد:

1. **Infrastructure Layer**
2. **Orchestration Layer**
3. **MLOps Platform Layer**
4. **Governance & Mesh Layer**

مع تفعيل شبكة الخلايا الجذرية العصبية وتنظيم الكلستر على مستويين:
- كلستر منظومة الذكاء الصناعي (الأساس)
- كلستر VS Code Chat (طبقة أداة/تكامل)

## أوامر التشغيل

```bash
# وضع التخطيط (لا يكتب ملف تقرير)
npm run -s ops:enterprise:hierarchy

# وضع التطبيق (ينتج تقرير تشغيلي)
npm run -s ops:enterprise:hierarchy:apply
```

## مخرجات التقرير

عند وضع التطبيق يتم إنشاء:

`reports/operations/enterprise-hierarchy-latest.json`

ويشمل:
- تقييم الطبقات الأربع بالتسلسل
- حالة تنشيط شبكة الخلايا الجذرية العصبية (Top-Down / Bottom-Up / Activation Ratio)
- نموذج الكلستر (AI Core مقابل VS Code Chat)
- مؤشرات كفاءة الشات (Health checks + fallback + retries + SLO)

## مبدأ معماري ملزم

- **VS Code Extension أداة استخدام وليست الأساس.**
- الأساس هو **خدمات الـBackend + الحوكمة + التشغيل المركزي**.
