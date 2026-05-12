#!/bin/bash
# بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
# شيخة — سكريبت تهيئة Azure الكاملة
# يُشغَّل مرة واحدة لإنشاء جميع موارد Azure
# المالك: سلمان أحمد بن سلمان الراجح

set -e

# ════════════════════════════════════
# الإعدادات
# ════════════════════════════════════
SUBSCRIPTION_ID="a7f53237-9f57-4530-af1d-c4b3751efde8"
RESOURCE_GROUP="sheikha-rg"
LOCATION="uaenorth"        # الإمارات الشمالية — أقرب للسعودية
REGISTRY_NAME="sheikhaacr"
APP_NAME="sheikha-portal"
IMAGE_NAME="sheikha-portal"
APP_ENV_NAME="sheikha-env"
DOMAIN="sheikha.top"

echo "══════════════════════════════════════════"
echo "🚀 شيخة → Azure Container Apps"
echo "الاشتراك: $SUBSCRIPTION_ID"
echo "المنطقة: $LOCATION (اﻹمارات — قريب للسعودية)"
echo "══════════════════════════════════════════"

# ═══ ٠. تثبيت Azure CLI إن لم يكن موجوداً ═══
if ! command -v az &>/dev/null; then
  echo ""
  echo "تثبيت Azure CLI..."
  curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
  echo "✅ Azure CLI مثبت"
fi

# ═══ ١. تسجيل الدخول وضبط الاشتراك ═══
echo ""
echo "١. ضبط اشتراك Azure..."
az account set --subscription "$SUBSCRIPTION_ID"
az account show --query "{name:name, id:id, state:state}" -o table

# ═══ ٢. تسجيل الموفرين المطلوبين ═══
echo ""
echo "٢. تسجيل موفرين Azure..."
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait
az provider register --namespace Microsoft.ContainerRegistry --wait
az provider register --namespace Microsoft.KeyVault --wait
az provider register --namespace Microsoft.Network --wait
echo "✅ الموفرون جاهزون"

# ═══ ٣. إنشاء Resource Group ═══
echo ""
echo "٣. إنشاء Resource Group: $RESOURCE_GROUP"
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --tags project=sheikha owner="Sheikha-top" quran="وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا"
echo "✅ Resource Group جاهز"

# ═══ ٤. نشر Bicep ═══
echo ""
echo "٤. نشر البنية التحتية (Bicep)..."
DEPLOY_OUTPUT=$(az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file infra/main.bicep \
  --parameters infra/main.parameters.json \
  --query "properties.outputs" \
  -o json)

echo "$DEPLOY_OUTPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('  📦 Registry:', d.get('registryLoginServer',{}).get('value',''))
print('  🌍 App FQDN:', d.get('containerAppFqdn',{}).get('value',''))
print('  🔑 Key Vault:', d.get('keyVaultUri',{}).get('value',''))
print('  📊 AppInsights:', d.get('appInsightsKey',{}).get('value','')[:8]+'...' if d.get('appInsightsKey',{}).get('value') else '')
print('  🌐 DNS Servers:', d.get('dnsZoneNameServers',{}).get('value',[]))
"

APP_FQDN=$(echo "$DEPLOY_OUTPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('containerAppFqdn',{}).get('value',''))")
echo "✅ Bicep نُشر بنجاح"

# ═══ ٥. إعداد GitHub Actions Secrets ═══
echo ""
echo "٥. GitHub Actions Secrets المطلوبة..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "أضف هذه الـ Secrets في:"
echo "https://github.com/Sheikha-top/sheikha-enterprise-portal/settings/secrets/actions"
echo ""
echo "AZURE_CLIENT_ID     = (من federated identity)"
echo "AZURE_TENANT_ID     = $(az account show --query tenantId -o tsv)"
echo "AZURE_SUBSCRIPTION_ID = $SUBSCRIPTION_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══ ٦. إعداد OIDC Federated Identity ═══
echo ""
echo "٦. إعداد GitHub OIDC (Federated Credentials)..."
APP_ID=$(az ad app create \
  --display-name "sheikha-github-actions" \
  --query appId -o tsv 2>/dev/null || echo "موجود مسبقاً")

if [[ "$APP_ID" != "موجود مسبقاً" ]]; then
  SP_ID=$(az ad sp create --id "$APP_ID" --query id -o tsv 2>/dev/null || true)

  # دور Contributor على Resource Group
  az role assignment create \
    --assignee "$APP_ID" \
    --role "Contributor" \
    --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
    2>/dev/null || echo "الدور موجود"

  # دور AcrPush على Registry
  az role assignment create \
    --assignee "$APP_ID" \
    --role "AcrPush" \
    --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$REGISTRY_NAME" \
    2>/dev/null || echo "الدور موجود"

  # Federated Credential لـ main branch
  az ad app federated-credential create \
    --id "$APP_ID" \
    --parameters "{
      \"name\": \"sheikha-main\",
      \"issuer\": \"https://token.actions.githubusercontent.com\",
      \"subject\": \"repo:Sheikha-top/sheikha-enterprise-portal:ref:refs/heads/main\",
      \"audiences\": [\"api://AzureADTokenExchange\"]
    }" 2>/dev/null || echo "Federated credential موجودة"

  echo "✅ OIDC App ID: $APP_ID"
  echo "  → أضف AZURE_CLIENT_ID=$APP_ID في GitHub Secrets"
fi

# ═══ ٧. إعداد DNS في Azure ═══
echo ""
echo "٧. معلومات DNS لتحديثها في هوستينجر..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
DNS_SERVERS=$(az network dns zone show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DOMAIN" \
  --query nameServers -o tsv 2>/dev/null || echo "قيد الإنشاء")
echo "Name Servers لـ sheikha.top في Azure DNS:"
echo "$DNS_SERVERS"
echo ""
echo "في Hostinger Domain Manager:"
echo "  غيّر Nameservers لـ sheikha.top للقيم أعلاه"
echo "  أو أضف CNAME: @ → $APP_FQDN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══ ٨. إعداد Microsoft 365 Email ═══
echo ""
echo "٨. إعداد Microsoft 365 للبريد الإلكتروني..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "١. افتح: https://admin.microsoft.com"
echo "٢. Settings → Domains → Add Domain → sheikha.top"
echo "٣. أضف سجل MX:"
echo "   MX: sheikha-top.mail.protection.outlook.com  (priority: 0)"
echo "٤. أضف سجل SPF:"
echo "   TXT: v=spf1 include:spf.protection.outlook.com -all"
echo "٥. البريد market@sheikha.top سيعمل تلقائياً ✅"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "══════════════════════════════════════════"
echo "✅ تهيئة Azure اكتملت!"
echo "🌍 التطبيق: https://$APP_FQDN"
echo "🔗 النطاق المخطط: https://$DOMAIN"
echo "📧 البريد: market@sheikha.top → Microsoft 365"
echo ""
echo "الخطوة التالية:"
echo "  git push origin main  → GitHub Actions ينشر تلقائياً"
echo "══════════════════════════════════════════"
