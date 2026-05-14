# منظومة شيخة | Sheikha Market

[![Deploy – Azure Container Apps](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/deploy-azure.yml/badge.svg)](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/deploy-azure.yml)
[![CI – Lint & Security](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/ci.yml/badge.svg)](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/codeql.yml/badge.svg)](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/codeql.yml)
[![PR Validation](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/pr-validation.yml)

منظومة رقمية متكاملة لإدارة السوق والتشغيل والحوكمة التقنية وفق:
- كتاب الله
- سنة النبي ﷺ
- العدل والشفافية والأمانة

## 🚀 إمكانيات GitHub المُفعَّلة / GitHub Features Activated

### 🤖 GitHub Copilot
| الميزة | الحالة |
|--------|--------|
| Copilot Code Review (مراجعة الكود التلقائية) | ✅ مُفعَّل |
| Copilot Cloud Agent (وكيل البرمجة الذكي) | ✅ مُفعَّل |
| Copilot Instructions مخصصة للمشروع | ✅ [`.github/copilot-instructions.md`](.github/copilot-instructions.md) |

### ⚙️ GitHub Actions (15 Workflow)
| الـ Workflow | الوظيفة |
|-------------|---------|
| CI — Lint & Security & MVP Smoke Test | فحص الكود والأمان والاختبار |
| CodeQL Security Analysis | تحليل أمني متقدم |
| Deploy — Azure Container Apps | النشر التلقائي على Azure |
| PR — Validation & Quality Gate | بوابة جودة كل PR |
| Release — Automated | إصدارات تلقائية |
| Projects — Auto-Management | أتمتة لوحة المشاريع |
| Milestone — Auto-Management | إدارة المراحل التلقائية |
| Discussions — Community Automation | أتمتة النقاشات |
| Stale — Issues & PRs | إغلاق العناصر الخاملة |
| Labeler — Auto PR Labels | تصنيف PRs تلقائياً |
| Labels — Sync | مزامنة التسميات |
| Health — Weekly Repository Report | تقرير صحة المستودع |
| Greet — First-Time Contributors | ترحيب بالمساهمين الجدد |
| Neural — Root Cell Network Activation | تفعيل المحرك العصبي |
| Dependabot Updates | تحديثات أمنية تلقائية |

### 📋 GitHub Projects
| الميزة | الوظيفة |
|--------|---------|
| Auto-add Issues to Work Queue | ربط Issues الجديدة تلقائياً بلوحة العمل |
| Auto-triage by Label | تصنيف تلقائي بناءً على Labels |
| PR Tracking | تتبع حالة كل PR |
| Milestone Management | 6 مراحل تشغيلية مُدارة تلقائياً |

### 🔒 الأمان / Security
| الميزة | الحالة |
|--------|--------|
| Dependabot (npm + Actions) | ✅ مُفعَّل |
| CodeQL Analysis | ✅ مُفعَّل |
| CODEOWNERS | ✅ مُضبوط |
| Security Policy (SECURITY.md) | ✅ موجود |
| Private vulnerability reporting | ✅ مُفعَّل |

---

## النشر على Azure Container Apps

| المتغير | القيمة |
|---------|--------|
| Subscription | `Azure subscription 1` |
| Resource Group | `Sheikha_Sovereign_RG` |
| Location | `uaenorth` (الإمارات الشمالية) |
| Container App | `sheikha-main-portal` |
| Registry | `sheikha.azurecr.io` |

### إعداد GitHub Secrets

أضف هذه الأسرار في **Settings → Secrets and variables → Actions**:

| السر | الوصف |
|------|-------|
| `AZURE_CREDENTIALS` | JSON لـ Service Principal (انظر الأمر أدناه) |
| `AZURE_SUBSCRIPTION_ID` | معرّف الاشتراك من Azure Portal |

**إنشاء `AZURE_CREDENTIALS`:**
```bash
az ad sp create-for-rbac \
  --name "sheikha-github-deploy" \
  --role contributor \
  --scopes /subscriptions/<AZURE_SUBSCRIPTION_ID>/resourceGroups/Sheikha_Sovereign_RG \
  --sdk-auth
```
انسخ الـ JSON الناتج كاملاً والصقه كقيمة للسر `AZURE_CREDENTIALS`.

### التشغيل اليدوي
```bash
# من GitHub Actions → Deploy – Azure Container Apps → Run workflow
```
