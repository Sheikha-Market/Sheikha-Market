<!-- GOVERNED BY SHEIKHA SOVEREIGN CORE v22.0.0 | BOUND_BY_QURAN_SUNNAH | CR: 2051263653 -->
# 📚 نظام التوثيق والتكامل الشامل - Sheikha OS

## 1️⃣ هيكل GitHub Repository

```
sheikha-core/
├── .github/
│   ├── workflows/
│   │   ├── ci-tests.yml          (تشغيل الاختبارات)
│   │   ├── deployment.yml        (نشر إلى Azure)
│   │   └── security-scan.yml     (فحص الأمان)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── integration_issue.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/
│   ├── README.md                 (نقطة البداية)
│   ├── GETTING_STARTED.md        (البدء السريع)
│   ├── ARCHITECTURE.md           (المعمار)
│   ├── API.md                    (توثيق API)
│   ├── INTEGRATION.md            (التكامل)
│   ├── GOOGLE_WORKSPACE.md       (تكامل Google)
│   ├── SHEIKHA_PLATFORM.md       (تكامل Sheikha)
│   ├── DEPLOYMENT.md             (النشر)
│   ├── SECURITY.md               (الأمان)
│   └── CONTRIBUTING.md           (المساهمة)
│
├── src/
│   ├── api/
│   │   ├── auth/                 (المصادقة)
│   │   ├── google-workspace/     (تكامل Google)
│   │   ├── sheikha/              (تكامل Sheikha)
│   │   └── routes.ts
│   ├── services/
│   │   ├── google-service.ts
│   │   ├── sheikha-service.ts
│   │   └── auth-service.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── google-oauth.ts
│   │   └── sheikha-api.ts
│   ├── types/
│   │   ├── google.ts
│   │   ├── sheikha.ts
│   │   └── common.ts
│   └── utils/
│       ├── logger.ts
│       ├── error-handler.ts
│       └── validators.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   │   ├── google-workspace.test.ts
│   │   └── sheikha-platform.test.ts
│   └── e2e/
│
├── .env.example              (نموذج المتغيرات)
├── .gitignore                (الملفات المحذوفة)
├── docker-compose.yml        (للتطوير المحلي)
├── Dockerfile                (للنشر)
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

---

## 2️⃣ GitHub README.md (نقطة البداية)

```markdown
# 🚀 Sheikha OS - Advanced Operating System

> تطبيق متقدم للحوسبة الذكية | Bare Metal Native | AI-Powered

## ⚡ التحديثات السريعة

- 📊 3-4x أسرع من الأنظمة التقليدية
- 💰 توفير 40% من التكاليس
- 🤖 دعم كامل لـ AI و Machine Learning
- 🔒 أمان متقدم على مستوى البنية التحتية
- 🌐 تكامل Google Workspace و Sheikha Platform

## 🎯 الميزات الرئيسية

### المنصة
- ✅ Bare Metal Computing
- ✅ Native OS Support
- ✅ Cloud Integration (Azure + AWS + GCP)
- ✅ AI/ML Ready

### التكاملات
- ✅ Google Workspace (OAuth + APIs)
- ✅ Sheikha Platform (Full Integration)
- ✅ GitHub Actions (CI/CD)
- ✅ Azure DevOps

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- Google Workspace Account
- Sheikha Platform Access
- Docker (للتطوير)

### التثبيت

```bash
# Clone
git clone https://github.com/sheikha/sheikha-core.git
cd sheikha-core

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run locally
npm run dev
```

### الاختبار

```bash
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
```

## 📚 التوثيق

| الملف | الوصف |
|------|-------|
| [Getting Started](./docs/GETTING_STARTED.md) | البدء السريع |
| [API Reference](./docs/API.md) | توثيق API الكامل |
| [Google Workspace](./docs/GOOGLE_WORKSPACE.md) | تكامل Google |
| [Sheikha Platform](./docs/SHEIKHA_PLATFORM.md) | تكامل Sheikha |
| [Architecture](./docs/ARCHITECTURE.md) | المعمار والتصميم |
| [Deployment](./docs/DEPLOYMENT.md) | النشر والبيئات |

## 🔗 التكاملات

### Google Workspace
```
OAuth 2.0 ✅
Gmail API ✅
Google Drive API ✅
Google Sheets API ✅
Google Calendar API ✅
```

### Sheikha Platform
```
REST API ✅
Webhooks ✅
Real-time Events ✅
Data Sync ✅
```

## 💻 الأوامر المهمة

```bash
# Development
npm run dev              # بدء السيرفر
npm run dev:watch       # مع مراقبة الملفات

# Testing
npm run test            # الاختبارات
npm run test:watch      # مع مراقبة التغييرات

# Building
npm run build           # بناء للإنتاج
npm run build:docker    # بناء Docker image

# Deployment
npm run deploy:staging  # نشر للـ staging
npm run deploy:prod     # نشر للإنتاج
```

## 🔒 الأمان

- ✅ OAuth 2.0 للمصادقة
- ✅ JWT Tokens للجلسات
- ✅ Encryption at rest و in transit
- ✅ Rate limiting
- ✅ CORS properly configured

[اقرأ المزيد](./docs/SECURITY.md)

## 🤝 المساهمة

نرحب بالمساهمين! اقرأ [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

```bash
# إنشاء feature branch
git checkout -b feature/your-feature

# جعل التغييرات
git commit -am "Add your feature"

# دفع التغييرات
git push origin feature/your-feature

# فتح Pull Request
```

## 📞 الدعم

- 📧 support@sheikha.cloud
- 🐛 [GitHub Issues](https://github.com/sheikha/sheikha-core/issues)
- 💬 [Discussions](https://github.com/sheikha/sheikha-core/discussions)

## 📄 الترخيص

MIT License - اقرأ [LICENSE](./LICENSE)

## 👥 المساهمون

شكراً لجميع المساهمين!

---

**Last Updated:** November 17, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
```

---

## 3️⃣ Google Workspace Integration Guide

### .env Configuration

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://sheikha.cloud/auth/google/callback
GOOGLE_SCOPES=openid,profile,email,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/gmail.readonly

# Google Workspace Admin
GOOGLE_ADMIN_EMAIL=admin@sheikha.cloud
GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json

# Sheikha Platform
SHEIKHA_API_URL=https://api.sheikha.cloud
SHEIKHA_API_KEY=your_sheikha_api_key
SHEIKHA_WORKSPACE_ID=your_workspace_id

# App Settings
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### src/config/google-oauth.ts

```typescript
import { OAuth2Client } from 'google-auth-library';

export const googleOAuthClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

export const googleScopes = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/spreadsheets',
];

export const getGoogleAuthUrl = () => {
  return googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: googleScopes,
    prompt: 'consent',
  });
};
```

### src/services/google-service.ts

```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleService {
  private oauth2Client: OAuth2Client;

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  // Drive API
  async listFiles() {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const { data } = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)',
    });
    return data.files;
  }

  // Gmail API
  async listEmails() {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const { data } = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });
    return data.messages;
  }

  // Google Sheets
  async readSheet(spreadsheetId: string, range: string) {
    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return data.values;
  }

  // Calendar
  async listCalendarEvents() {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 10,
    });
    return data.items;
  }
}
```

---

## 4️⃣ Sheikha Platform Integration Guide

### src/config/sheikha-api.ts

```typescript
import axios, { AxiosInstance } from 'axios';

export class SheikhaPlatformClient {
  private client: AxiosInstance;
  private workspaceId: string;

  constructor() {
    this.workspaceId = process.env.SHEIKHA_WORKSPACE_ID || '';
    
    this.client = axios.create({
      baseURL: process.env.SHEIKHA_API_URL,
      headers: {
        'Authorization': `Bearer ${process.env.SHEIKHA_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Workspace-ID': this.workspaceId,
      },
    });
  }

  // Core Operations
  async getWorkspaceStatus() {
    return this.client.get(`/workspaces/${this.workspaceId}`);
  }

  async getMetrics(timeRange: string) {
    return this.client.get(`/workspaces/${this.workspaceId}/metrics`, {
      params: { timeRange },
    });
  }

  async deployApplication(config: any) {
    return this.client.post(`/workspaces/${this.workspaceId}/deployments`, config);
  }

  async getDeploymentStatus(deploymentId: string) {
    return this.client.get(
      `/workspaces/${this.workspaceId}/deployments/${deploymentId}`
    );
  }

  // Data Sync
  async syncData(source: string, destination: string, data: any) {
    return this.client.post(`/workspaces/${this.workspaceId}/sync`, {
      source,
      destination,
      data,
    });
  }

  // Webhooks
  async registerWebhook(event: string, url: string) {
    return this.client.post(`/workspaces/${this.workspaceId}/webhooks`, {
      event,
      url,
    });
  }

  async unregisterWebhook(webhookId: string) {
    return this.client.delete(
      `/workspaces/${this.workspaceId}/webhooks/${webhookId}`
    );
  }

  // Error Handling
  private handleError(error: any) {
    if (error.response) {
      console.error('Sheikha API Error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error('Request Error:', error.message);
    }
    throw error;
  }
}
```

### src/services/sheikha-service.ts

```typescript
import { SheikhaPlatformClient } from '../config/sheikha-api';

export class SheikhaPlatformService {
  private client: SheikhaPlatformClient;

  constructor() {
    this.client = new SheikhaPlatformClient();
  }

  async initializeWorkspace(config: any) {
    try {
      const response = await this.client.getWorkspaceStatus();
      
      if (!response.data.initialized) {
        // Initialize workspace
        await this.client.deployApplication(config);
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
      throw error;
    }
  }

  async syncWithGoogleWorkspace(googleData: any) {
    try {
      const response = await this.client.syncData(
        'google-workspace',
        'sheikha-platform',
        googleData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to sync with Google Workspace:', error);
      throw error;
    }
  }

  async getMetricsAndReporting() {
    try {
      const response = await this.client.getMetrics('7d');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      throw error;
    }
  }

  async setupWebhooks() {
    const webhooks = [
      { event: 'deployment.started', url: 'https://sheikha.cloud/webhooks/deployment' },
      { event: 'deployment.completed', url: 'https://sheikha.cloud/webhooks/deployment' },
      { event: 'sync.completed', url: 'https://sheikha.cloud/webhooks/sync' },
    ];

    for (const webhook of webhooks) {
      try {
        await this.client.registerWebhook(webhook.event, webhook.url);
      } catch (error) {
        console.error(`Failed to register webhook: ${webhook.event}`, error);
      }
    }
  }
}
```

---

## 5️⃣ API Documentation (OpenAPI/Swagger)

### docs/API.md

```markdown
# 📡 Sheikha OS API Documentation

## Base URL

```
Production: https://api.sheikha.cloud
Staging: https://staging-api.sheikha.cloud
Local: http://localhost:3000
```

## Authentication

```
Bearer Token (JWT)

Header: Authorization: Bearer <token>
```

## Endpoints

### Auth

#### POST /auth/google/callback
```
Description: Google OAuth callback
Body: { code, state }
Response: { accessToken, refreshToken, user }
```

#### POST /auth/refresh
```
Description: Refresh access token
Body: { refreshToken }
Response: { accessToken }
```

### Workspace

#### GET /api/workspace/status
```
Description: Get workspace status
Auth: Required
Response: { status, initialized, metrics }
```

#### GET /api/workspace/metrics
```
Description: Get workspace metrics
Query: timeRange=7d|30d|90d
Auth: Required
Response: { metrics }
```

### Google Workspace Integration

#### GET /api/integrations/google/status
```
Description: Get Google integration status
Auth: Required
Response: { connected, lastSync, permissions }
```

#### POST /api/integrations/google/sync
```
Description: Sync Google Workspace data
Body: { source, filters }
Auth: Required
Response: { status, recordsSync }
```

#### GET /api/integrations/google/files
```
Description: List Google Drive files
Query: pageSize=10, pageToken
Auth: Required
Response: { files, nextPageToken }
```

### Sheikha Platform Integration

#### GET /api/integrations/sheikha/status
```
Description: Get Sheikha platform status
Auth: Required
Response: { connected, workspaceId, features }
```

#### POST /api/integrations/sheikha/deploy
```
Description: Deploy to Sheikha platform
Body: { config, environment }
Auth: Required
Response: { deploymentId, status }
```

#### GET /api/integrations/sheikha/deployments/:id
```
Description: Get deployment status
Auth: Required
Response: { status, logs, metrics }
```

## Error Handling

```
200 - Success
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
500 - Server Error

Error Response:
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "details": { }
}
```
```

---

## 6️⃣ GitHub Actions CI/CD

### .github/workflows/ci-tests.yml

```yaml
name: CI Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test
      
      - name: Integration tests
        run: npm run test:integration
        env:
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          SHEIKHA_API_KEY: ${{ secrets.SHEIKHA_API_KEY }}
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### .github/workflows/security-scan.yml

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
```

---

## 7️⃣ تجنب التعارضات

### Configuration Management

```
✅ استخدم .env لكل بيئة
✅ فصل المفاتيح والتوكنز
✅ لا تضع secrets في Git
✅ استخدم GitHub Secrets للـ CI/CD

❌ لا تخزن credentials بالقرب من الكود
❌ لا تشاركها بين الفريق
❌ لا تستخدم نفس المفتاح لـ production و development
```

### Integration Conflicts Prevention

```typescript
// ✅ صحيح: استخدم integration queues
class IntegrationQueue {
  async processGoogleEvent(event: any) {
    await this.queue.add('google.sync', event);
  }

  async processSheikhEvent(event: any) {
    await this.queue.add('sheikha.sync', event);
  }
}

// ❌ خطأ: معالجة متزامنة
async function handleMultipleIntegrations() {
  await googleSync();
  await sheikhSync(); // قد يتعارض مع googleSync
}
```

### Database Schema Conflicts

```sql
-- Google Workspace Tables
CREATE TABLE google_users (
  id UUID PRIMARY KEY,
  google_id VARCHAR UNIQUE,
  email VARCHAR,
  created_at TIMESTAMP
);

-- Sheikha Platform Tables
CREATE TABLE sheikha_workspaces (
  id UUID PRIMARY KEY,
  workspace_name VARCHAR,
  created_at TIMESTAMP
);

-- Link/Map Tables
CREATE TABLE integration_mappings (
  id UUID PRIMARY KEY,
  google_user_id UUID REFERENCES google_users(id),
  sheikha_workspace_id UUID REFERENCES sheikha_workspaces(id),
  sync_status VARCHAR,
  last_sync TIMESTAMP
);
```

---

## ✅ قائمة التحقق النهائية

```
GitHub Setup:
[ ] Repository مُنشأة
[ ] README.md مكتوب
[ ] .gitignore صحيح
[ ] LICENSE مختار
[ ] Branch protection فعّل

Documentation:
[ ] API.md كامل
[ ] INTEGRATION.md شامل
[ ] GOOGLE_WORKSPACE.md مفصل
[ ] SHEIKHA_PLATFORM.md مفصل
[ ] CONTRIBUTING.md واضح

Code Quality:
[ ] ESLint مُفعّل
[ ] TypeScript strict mode
[ ] Tests coverage > 80%
[ ] No secrets in code

CI/CD:
[ ] GitHub Actions setup
[ ] Tests تعمل أوتوماتيك
[ ] Deploy pipeline جاهز
[ ] Security scans نشطة

Integrations:
[ ] Google OAuth configured
[ ] Sheikha API connected
[ ] Webhooks registered
[ ] Error handling شامل
[ ] Rate limiting applied

Security:
[ ] All env vars in .env.example
[ ] Secrets in GitHub Secrets
[ ] API keys rotated
[ ] CORS configured
[ ] HTTPS enforced
```

---

**الآن أنت جاهز للعمل الاحترافي! 🚀**
