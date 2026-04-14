# منظومة شيخة | Sheikha Market

[![Deploy – Azure Container Apps](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/deploy-azure.yml/badge.svg)](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/deploy-azure.yml)
[![CI – Lint & Security](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/ci.yml/badge.svg)](https://github.com/Sheikha-Market/Sheikha-Market/actions/workflows/ci.yml)

منظومة رقمية متكاملة لإدارة السوق والتشغيل والحوكمة التقنية وفق:
- كتاب الله
- سنة النبي ﷺ
- العدل والشفافية والأمانة

## الرؤية
بناء منظومة تشغيلية وتجارية ذكية وآمنة تحقق الأثر والاستدامة مع امتثال شرعي كامل.

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
