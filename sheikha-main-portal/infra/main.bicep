// بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
// Bicep — البنية التحتية الكاملة لشيخة على Azure
// المالك: سلمان أحمد بن سلمان الراجح
targetScope = 'resourceGroup'

// ══════════════════════════════════════════════════════
// المتغيرات
// ══════════════════════════════════════════════════════
@description('اسم المشروع')
param projectName string = 'sheikha'

@description('المنطقة الجغرافية')
param location string = resourceGroup().location

@description('البيئة: production | staging')
@allowed(['production', 'staging'])
param environment string = 'production'

@description('صورة Docker')
param containerImage string = 'sheikhaacr.azurecr.io/sheikha-portal:latest'

@description('الحد الأدنى من Replicas')
param minReplicas int = 1

@description('الحد الأقصى من Replicas')
param maxReplicas int = 10

var prefix = '${projectName}-${environment}'
var tags = {
  project: 'sheikha'
  environment: environment
  owner: 'Sheikha-top'
  quran: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا'
}

// ══════════════════════════════════════════════════════
// ١. Log Analytics Workspace
// ══════════════════════════════════════════════════════
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${prefix}-logs'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// ══════════════════════════════════════════════════════
// ٢. Azure Container Registry
// ══════════════════════════════════════════════════════
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: 'sheikhaacr'
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false  // نستخدم OIDC — أكثر أماناً
    publicNetworkAccess: 'Enabled'
    zoneRedundancy: 'Disabled'
  }
}

// ══════════════════════════════════════════════════════
// ٣. Container Apps Environment
// ══════════════════════════════════════════════════════
resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${prefix}-env'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// ══════════════════════════════════════════════════════
// ٤. Container App — شيخة البوابة الرئيسية
// ══════════════════════════════════════════════════════
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'sheikha-portal'
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'  // Managed Identity — بلا كلمات مرور
  }
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'http'
        allowInsecure: false
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
        // customDomains: يضاف بعد توجيه DNS وإصدار شهادة SSL
        // az containerapp hostname add --hostname sheikha.top --resource-group sheikha-rg --name sheikha-portal
      }
      registries: [
        {
          server: '${containerRegistry.name}.azurecr.io'
          identity: 'system'
        }
      ]
      secrets: [
        {
          name: 'jwt-secret'
          // استخدم Azure Key Vault reference في الإنتاج
          value: 'REPLACE_WITH_KEY_VAULT_REF'
        }
        {
          name: 'openai-api-key'
          value: 'REPLACE_WITH_KEY_VAULT_REF'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'sheikha-portal'
          image: containerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT', value: '8080' }
            { name: 'BASE_URL', value: 'https://sheikha.top' }
            { name: 'PUBLIC_URL', value: 'https://sheikha.top' }
            { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
            { name: 'OPENAI_API_KEY', secretRef: 'openai-api-key' }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 8080
              }
              initialDelaySeconds: 15
              periodSeconds: 30
              timeoutSeconds: 10
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 8080
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              failureThreshold: 5
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// ══════════════════════════════════════════════════════
// ٥. إذن ACR Pull لـ Container App (Managed Identity)
// ══════════════════════════════════════════════════════
resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, containerApp.id, 'acrpull')
  scope: containerRegistry
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '7f951dda-4ed3-4680-a7ca-43fe172d538d'  // AcrPull
    )
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ══════════════════════════════════════════════════════
// ٦. Azure DNS Zone — sheikha.top
// ══════════════════════════════════════════════════════
resource dnsZone 'Microsoft.Network/dnsZones@2018-05-01' = {
  name: 'sheikha.top'
  location: 'global'
  tags: tags
}

// CNAME record: www → sheikha-portal FQDN
resource wwwRecord 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = {
  parent: dnsZone
  name: 'www'
  properties: {
    TTL: 300
    CNAMERecord: {
      cname: containerApp.properties.configuration.ingress.fqdn
    }
  }
}

// TXT verification record للـ custom domain
resource verifyRecord 'Microsoft.Network/dnsZones/TXT@2018-05-01' = {
  parent: dnsZone
  name: 'asuid.sheikha.top'
  properties: {
    TTL: 300
    TXTRecords: [
      {
        value: [ containerApp.properties.customDomainVerificationId ]
      }
    ]
  }
}

// MX record — Microsoft 365 للبريد الإلكتروني
resource mxRecord 'Microsoft.Network/dnsZones/MX@2018-05-01' = {
  parent: dnsZone
  name: '@'
  properties: {
    TTL: 3600
    MXRecords: [
      {
        preference: 0
        exchange: 'sheikha-top.mail.protection.outlook.com'  // Microsoft 365
      }
    ]
  }
}

// SPF record للحماية من انتحال البريد
resource spfRecord 'Microsoft.Network/dnsZones/TXT@2018-05-01' = {
  parent: dnsZone
  name: '@'
  properties: {
    TTL: 3600
    TXTRecords: [
      {
        value: [ 'v=spf1 include:spf.protection.outlook.com -all' ]
      }
    ]
  }
}

// ══════════════════════════════════════════════════════
// ٧. Azure Key Vault — لحماية الأسرار
// ══════════════════════════════════════════════════════
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: '${prefix}-kv'
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true  // أكثر أماناً من access policies
    enableSoftDelete: true
    softDeleteRetentionInDays: 30
    enablePurgeProtection: true
    publicNetworkAccess: 'Enabled'
  }
}

// إذن Container App للوصول لـ Key Vault
resource kvSecretUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, containerApp.id, 'kvsecretuser')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '4633458b-17de-408a-b874-0445c86b69e6'  // Key Vault Secrets User
    )
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ══════════════════════════════════════════════════════
// ٨. Application Insights — المراقبة
// ══════════════════════════════════════════════════════
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${prefix}-insights'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    RetentionInDays: 90
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ══════════════════════════════════════════════════════
// Outputs — المخرجات
// ══════════════════════════════════════════════════════
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output registryLoginServer string = containerRegistry.properties.loginServer
output keyVaultUri string = keyVault.properties.vaultUri
output appInsightsKey string = appInsights.properties.InstrumentationKey
output dnsZoneNameServers array = dnsZone.properties.nameServers
output managedIdentityId string = containerApp.identity.principalId
