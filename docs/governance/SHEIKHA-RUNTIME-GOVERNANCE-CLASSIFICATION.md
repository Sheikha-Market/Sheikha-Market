# فهرس حوكمة وتصنيف منظومة شيخة

---

# 1. الهدف

تنظيم ملفات وطبقات منظومة شيخة حتى لا تتحول إلى توسع غير منضبط.

الهدف الأعلى:

لا ضرر ولا ضرار.

---

# 2. القاعدة الحاكمة

لا يتم اعتماد أي ملف أو طبقة أو سكربت أو Runtime إلا بعد تصنيفه ضمن حالة واضحة.

---

# 3. حالات التصنيف الرسمية

| الحالة | المعنى |
|---|---|
| ACTIVE | مفعّل ومعتمد |
| STAGING | جاهز للاختبار |
| EXPERIMENTAL | تجربة غير معتمدة |
| INTERNAL | داخلي غير مخصص للعرض العام |
| PROTECTED | محمي ولا يعدل إلا بحذر |
| DEPRECATED | مستبعد أو قديم |
| REVIEW_REQUIRED | يحتاج مراجعة |
| BLOCKED | موقوف حتى التحقق |

---

# 4. خريطة الملكية

| المسار | التصنيف | المالك التنظيمي |
|---|---|---|
| core/ | PROTECTED | Runtime Kernel Organization |
| runtime/ | PROTECTED | Runtime Governance Organization |
| routes/ | ACTIVE | API Federation Organization |
| scripts/ | REVIEW_REQUIRED | Automation Organization |
| docs/ | ACTIVE | Documentation Governance |
| topology/ | EXPERIMENTAL | Architecture Organization |
| governance/ | PROTECTED | Governance Organization |
| lib/runtime/ | STAGING | Runtime Kernel Organization |
| sheikha-vscode-extension/ | STAGING | IDE Organization |

---

# 5. ضوابط السلامة

## 5.1 منع التنفيذ غير المصنف

أي ملف غير مصنف لا يدخل الإنتاج.

## 5.2 منع التوسع غير المنضبط

أي توسع جديد يجب أن يمر عبر:
- classification
- ownership
- validation
- isolation
- safety review

## 5.3 حماية الملفات الحساسة

المسارات التالية محمية:

- core/
- runtime/
- governance/
- routes/
- scripts/

## 5.4 منع الضرر

أي ملف أو طبقة أو سكربت يُحتمل منه ضرر غير مقبول يجب أن يكون BLOCKED حتى تتم مراجعته.

---

# 6. قرار الاعتماد

تم اعتماد هذا الفهرس كمرجع أولي لحوكمة وتصنيف ملفات منظومة شيخة.

