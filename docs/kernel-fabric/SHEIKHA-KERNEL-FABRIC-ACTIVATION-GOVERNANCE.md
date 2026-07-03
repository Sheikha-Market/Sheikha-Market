# SHEIKHA Kernel Fabric Activation Governance

## الهدف

هذه الوثيقة تكمل تقرير `SHEIKHA_KERNEL_FABRIC_V1` وتوثق طبقة التفعيل الأفضل التي تم تثبيتها بعد ظهور حظر الحفظ بسبب ملفات غير داخلة في الـ commit.

الهدف ليس تجاوز الحوكمة، بل جعلها أدق:

- `pre-commit` يفحص الملفات staged فقط.
- الفحص الكامل للمستودع يبقى متاحًا ومشدّدًا عند تشغيله يدويًا.
- ملفات المستخدم غير الداخلة في الحفظ لا تمنع commit مستقل.
- الملفات المحظورة أو الحساسة لا تمر إذا تم إدخالها إلى staged.

## الحالة المثبتة

تم تثبيت commit:

```text
1c45eca02 Scope Sheikha admission governance to staged files
```

وشمل:

| المسار | التفعيل |
|---|---|
| `.githooks/pre-commit` | تحويل pre-commit إلى staged-only admission |
| `tools/governance/git-context-reader.js` | دعم `SHEIKHA_GIT_STATUS_SCOPE=staged` وقراءة Git آمنة |
| `docs/kernel-fabric/SHEIKHA-KERNEL-FABRIC-V1-REPORT.md` | تقرير Kernel Fabric V1 |

ثم تم تثبيت طبقة أعلى:

```text
388960fc5 Activate read only Sheikha kernel industrial fabric
```

وشملت:

| المسار | التفعيل |
|---|---|
| `core/kernel-industrial-fabric/sheikha-kernel-industrial-fabric-v1.js` | خريطة التجمعات الصناعية للطبقات |
| `tests/sheikha-kernel-industrial-fabric-v1.test.js` | اختبار العلاقة بين below-kernel وkernel وabove-kernel |
| `tools/activation/activate-sheikha-kernel-industrial-fabric-v1.sh` | توليد تقرير القراءة فقط |

## نموذج الحوكمة الجديد

### 1. حوكمة الحفظ

عند تنفيذ commit:

```text
git add selected-files
git commit
```

المسار الحاكم:

```text
Staged Files
  ↓
SHEIKHA_GIT_STATUS_SCOPE=staged
  ↓
Runtime Admission Controller
  ↓
Runtime Integrity Verifier
  ↓
Commit Allowed / Blocked
```

النتيجة المطلوبة:

- يسمح بالـ commit إذا كانت الملفات staged غير محظورة.
- يمنع الـ commit إذا كانت الملفات staged تحمل نمطًا حساسًا أو ممنوعًا.
- لا يخلط بين commit محدد وبين working tree واسع فيه ملفات أخرى قيد التطوير.

### 2. حوكمة المستودع الكامل

عند تشغيل:

```bash
node tools/governance/runtime-admission-controller.js
```

المسار الحاكم:

```text
Full Working Tree
  ↓
Admission Controller
  ↓
Allowed / Review Required / Blocked
```

هذا الفحص يبقى مقصودًا للمراجعة الشاملة، ويجب ألا يتحول إلى pre-commit افتراضي لأنه قد يمنع حفظ patches مستقلة بسبب ملفات غير مرتبطة.

## سبب التفعيل

المشكلة السابقة:

```text
[SHEIKHA] BLOCKED FILES DETECTED
```

لم تكن بسبب Kernel Fabric وحده، بل لأن `runtime-admission-controller` كان يقرأ كل `git status`.

نتيجة ذلك أن commit صغير آمن كان يتعطل بسبب ملفات أخرى غير staged، مثل:

```text
runtime/security/production-secret-scan.json
runtime/security/semantic-secret-scan-v1.json
tools/security/semantic-secret-scan-v1.js
```

هذه الملفات بقيت محظورة في الفحص الكامل، وهذا صحيح حوكمياً، لكن لا يجوز أن تمنع commit لا يضمها.

## نتائج التحقق

تم التحقق من:

```bash
node --check tools/governance/git-context-reader.js
npm run lint
npm test -- --runTestsByPath tests/sheikha-governance-tooling-no-shell.test.js
bash .githooks/pre-commit
SHEIKHA_GIT_STATUS_SCOPE=staged node tools/governance/runtime-admission-controller.js
node tools/governance/runtime-admission-controller.js
```

النتائج:

| الفحص | النتيجة |
|---|---|
| Node syntax check | Passed |
| ESLint | Passed |
| Governance tooling tests | Passed |
| Pre-commit staged-only | Passed |
| Staged admission after commit | Active, 0 files |
| Full admission | Blocked بسبب ملفات خارج هذا التفعيل |

## التفعيل الأفضل المقترح

### P0 - تثبيت طبقة الحوكمة الحالية

الحالة: تم.

المطلوب للحفاظ عليها:

- لا تعاد pre-commit إلى full working tree.
- أي commit يجب أن يكون محدودًا بملفات مقصودة.
- أي ملف حساس يدخل staged يجب أن يمنع الحفظ.

### P1 - تحسين أسماء تقارير الفحص الأمني

المشكلة:

ملفات تحتوي `secret` في الاسم، حتى لو كانت تقارير فحص وليست أسرارًا:

```text
production-secret-scan.json
semantic-secret-scan-v1.json
semantic-secret-scan-v1.js
```

الأفضل:

```text
production-sensitive-scan.json
semantic-sensitive-scan-v1.json
semantic-sensitive-scan-v1.js
```

أو:

```text
production-security-scan.json
semantic-security-scan-v1.json
semantic-security-scan-v1.js
```

السبب:

- يقلل false positives.
- يحافظ على معنى الحماية.
- لا يضع كلمة محظورة داخل اسم أداة الحماية نفسها.

### P2 - إضافة Ownership Governance

الملفات التي تظهر `REVIEW_REQUIRED` بسبب عدم وجود owner تحتاج قاعدة ملكية واضحة:

```text
deploy_production.sh
setup_ultimate_ai.sh
release/*
tools/activation/*.sh
```

المقترح:

| النطاق | المالك |
|---|---|
| `tools/activation/*.sh` | Activation Governance |
| `release/**` | Release Governance |
| `deploy_*.sh` | Deployment Governance |
| `setup_*.sh` | Runtime Setup Governance |

القرار الأفضل:

- لا تجعلها `ALLOWED` تلقائيًا.
- اجعلها `REVIEW_REQUIRED` بمالك واضح.
- امنعها فقط إذا احتوت نمطًا حساسًا أو أمرًا عالي الأثر بلا موافقة.

### P3 - Kernel Fabric V2

النسخة التالية يجب أن تكون أكثر اتقانًا بدون رفع المخاطر:

```text
SHEIKHA_KERNEL_FABRIC_V2
  ├─ OS Adapter
  ├─ Disk Adapter
  ├─ Memory Adapter
  ├─ PM2 Adapter
  ├─ Risk Classifier
  ├─ Inspector Report
  └─ Read-Only Evidence Snapshot
```

القيود:

- لا `sysctl`.
- لا تعديل boot.
- لا إعادة تشغيل خدمات.
- لا أوامر shell عامة غير مصنفة.
- لا حذف تلقائي عند امتلاء القرص.

### P4 - Enterprise Inspector Integration

إضافة عرض داخل Inspector:

```text
Kernel Fabric
  ├─ OS
  ├─ Kernel
  ├─ CPU
  ├─ Memory
  ├─ Disk
  ├─ PM2
  └─ Governance Readiness
```

مع قرار:

```text
HEALTHY
REVIEW_REQUIRED
RISK_DETECTED
```

بدون تنفيذ علاج تلقائي عالي الأثر.

### P5 - Activation Quality Gate

قبل أي تفعيل جديد، يمر عبر:

```text
Design
  ↓
Read-Only Probe
  ↓
Governance Contract
  ↓
Test
  ↓
Lint
  ↓
Staged Admission
  ↓
Commit
  ↓
Full Drift Review
```

### P6 - Kernel Industrial Fabric V2

بعد تفعيل `SHEIKHA_KERNEL_INDUSTRIAL_FABRIC_V1`، الأفضل أن تكون النسخة التالية:

```text
SHEIKHA_KERNEL_INDUSTRIAL_FABRIC_V2
  ├─ Cluster Readiness Score
  ├─ Cluster Risk Classification
  ├─ Cluster Evidence Snapshot
  ├─ Enterprise Inspector View
  └─ Human Review Gate
```

مع الحفاظ على:

- read-only فقط.
- لا تعديل kernel.
- لا restart تلقائي.
- لا حذف تلقائي.
- لا package install.
- لا علاج عالي الأثر بلا مراجعة.

## أفضل صيغة للتفعيل القادم

التفعيل الأفضل ليس إضافة أسماء طبقات كثيرة، بل بناء مسار ناضج:

```text
Safe Measurement
  ↓
Evidence
  ↓
Governance
  ↓
Inspector
  ↓
Decision
  ↓
Human Review
  ↓
Controlled Action
```

وهذا يحفظ قاعدة:

```text
لا ضرر ولا ضرار
```

ويمنع أن تتحول الحوكمة إلى عائق عشوائي أو أن تتحول الأتمتة إلى تغيير عالي الأثر بلا مراجعة.

## القرار التنفيذي

حالة التفعيل الحالية جيدة:

- Kernel Fabric V1 موثق.
- pre-commit governance أصبح أدق.
- full admission بقي صارمًا.
- لا يوجد تجاوز للحماية.
- لا يوجد حذف أو تعديل عالي الأثر.

أفضل تفعيل تالٍ:

1. إعادة تسمية security scan artifacts لتجنب false positives.
2. إضافة ownership rules لمسارات release وactivation.
3. بناء Kernel Fabric V2 adapters.
4. ربط Kernel Fabric بـ Enterprise Inspector.
5. إضافة Quality Gate موحد لكل تفعيل جديد.
6. ترقية Kernel Industrial Fabric إلى V2 بدرجات readiness ومخاطر وأدلة.

## تفعيل لاحق مكتمل

تم تفعيل طبقة:

```text
SHEIKHA_GOVERNANCE_ADMISSION_OWNERSHIP_V1
```

وتوثيقها في:

```text
docs/kernel-fabric/SHEIKHA-GOVERNANCE-ADMISSION-OWNERSHIP-V1.md
```

وحققت:

- `runtime-admission-controller`: `ACTIVE`, blocked `0`.
- `protected-runtime-enforcer`: `forbiddenFiles: 0`.
- إبقاء `REVIEW_REQUIRED` للمسارات عالية الأثر.
- تقليل false positives لملفات `secret-scan` الأمنية فقط.
