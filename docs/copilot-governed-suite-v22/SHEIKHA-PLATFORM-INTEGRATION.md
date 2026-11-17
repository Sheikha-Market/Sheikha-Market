<!-- GOVERNED BY SHEIKHA SOVEREIGN CORE v22.0.0 | BOUND_BY_QURAN_SUNNAH | CR: 2051263653 -->
# 🚀 Sheikha Platform Integration Guide

## 1️⃣ Sheikha Platform Overview

**Sheikha** هي منظومة تقنية شاملة توفر:

```
┌─────────────────────────────────────────┐
│      Sheikha Platform Architecture      │
├─────────────────────────────────────────┤
│                                         │
│  ┌─ Native Operating System ──────┐   │
│  │  Bare Metal / Edge Computing    │   │
│  │  Advanced Performance Tuning    │   │
│  └─────────────────────────────────┘   │
│                │                        │
│  ┌─────────────▼──────────────────┐   │
│  │  Sheikha Cloud Platform        │   │
│  │  - Deployment Manager          │   │
│  │  - Resource Orchestration      │   │
│  │  - Performance Monitoring      │   │
│  │  - Multi-workspace Support     │   │
│  └────────────────────────────────┘   │
│                │                       │
│  ┌─────────────▼──────────────────┐   │
│  │  API Gateway                   │   │
│  │  - REST APIs                   │   │
│  │  - WebSocket Support           │   │
│  │  - gRPC Services               │   │
│  │  - Webhooks                    │   │
│  └─────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

---

## 2️⃣ Authentication & API Keys

### Generate API Key

```bash
# 1. Login to Sheikha Dashboard
# https://dashboard.sheikha.cloud

# 2. Navigate to: Settings → API Keys

# 3. Create new key
Name: Sheikha Google Workspace Sync
Permissions: read:deployments, write:deployments, read:workspaces
TTL: 90 days

# 4. Store securely
SHEIKHA_API_KEY=sk_live_xxxxxxxxxxxxx
SHEIKHA_API_URL=https://api.sheikha.cloud
SHEIKHA_WORKSPACE_ID=ws_xxxxxxxxxxxxx
```

### Authentication Headers

```bash
curl -H "Authorization: Bearer ${SHEIKHA_API_KEY}" \
  -H "Content-Type: application/json" \
  https://api.sheikha.cloud/v1/workspaces
```

---

## 3️⃣ Sheikha Service Implementation

### src/services/sheikha-service.ts

```typescript
interface WorkspaceConfig {
  id: string;
  name: string;
  region: string;
  environment: 'development' | 'staging' | 'production';
}

interface DeploymentConfig {
  applicationId: string;
  version: string;
  replicas: number;
  resources: {
    cpu: string;
    memory: string;
    storage?: string;
  };
  environment: Record<string, string>;
}

interface DeploymentStatus {
  id: string;
  status: 'pending' | 'deploying' | 'running' | 'failed' | 'stopped';
  progress: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SheikhaPlatformService {
  private apiUrl: string;
  private apiKey: string;
  private workspaceId: string;

  constructor(
    apiUrl: string = process.env.SHEIKHA_API_URL!,
    apiKey: string = process.env.SHEIKHA_API_KEY!,
    workspaceId: string = process.env.SHEIKHA_WORKSPACE_ID!
  ) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.workspaceId = workspaceId;
  }

  /**
   * Make authenticated request to Sheikha API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = `${this.apiUrl}/v1${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          `Sheikha API Error [${response.status}]: ${error}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      throw new Error(
        `Failed to call Sheikha API: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get current workspace configuration
   */
  async getWorkspace(): Promise<WorkspaceConfig> {
    return this.request('GET', `/workspaces/${this.workspaceId}`);
  }

  /**
   * List all applications in workspace
   */
  async listApplications(): Promise<any[]> {
    const response = await this.request<{ applications: any[] }>(
      'GET',
      `/workspaces/${this.workspaceId}/applications`
    );
    return response.applications;
  }

  /**
   * Deploy application to Sheikha
   */
  async deployApplication(
    applicationId: string,
    config: DeploymentConfig
  ): Promise<DeploymentStatus> {
    return this.request('POST', `/workspaces/${this.workspaceId}/deployments`, {
      applicationId,
      ...config,
    });
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    return this.request('GET', `/deployments/${deploymentId}`);
  }

  /**
   * Wait for deployment to complete
   */
  async waitForDeployment(
    deploymentId: string,
    maxWaitMs: number = 600000, // 10 minutes
    checkIntervalMs: number = 5000
  ): Promise<DeploymentStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getDeploymentStatus(deploymentId);

      if (status.status === 'running') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(`Deployment failed: ${status.message}`);
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }

    throw new Error(
      `Deployment timeout after ${maxWaitMs / 1000}s for deployment ${deploymentId}`
    );
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    const response = await this.request<{ logs: string[] }>(
      'GET',
      `/deployments/${deploymentId}/logs`
    );
    return response.logs;
  }

  /**
   * Scale application
   */
  async scaleApplication(
    applicationId: string,
    replicas: number
  ): Promise<DeploymentStatus> {
    return this.request(
      'PUT',
      `/applications/${applicationId}`,
      { replicas }
    );
  }

  /**
   * Stop application
   */
  async stopApplication(applicationId: string): Promise<void> {
    await this.request(
      'POST',
      `/applications/${applicationId}/stop`
    );
  }

  /**
   * Restart application
   */
  async restartApplication(applicationId: string): Promise<DeploymentStatus> {
    return this.request(
      'POST',
      `/applications/${applicationId}/restart`
    );
  }

  /**
   * Get application metrics
   */
  async getApplicationMetrics(
    applicationId: string,
    period: '1h' | '24h' | '7d' = '24h'
  ): Promise<any> {
    return this.request(
      'GET',
      `/applications/${applicationId}/metrics?period=${period}`
    );
  }

  /**
   * Sync data to Sheikha from Google Workspace
   */
  async syncWorkspaceData(
    data: any,
    metadata: { source: 'google'; timestamp: Date }
  ): Promise<{ syncId: string; status: string }> {
    return this.request(
      'POST',
      `/workspaces/${this.workspaceId}/sync`,
      {
        data,
        metadata,
      }
    );
  }

  /**
   * Check API connectivity
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      const response = await this.request<{ status: string }>(
        'GET',
        '/health'
      );
      return { status: 'ok', message: 'Connected to Sheikha Platform' };
    } catch (error) {
      return {
        status: 'error',
        message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
```

---

## 4️⃣ Deployment Workflow

### src/workflows/deployment-workflow.ts

```typescript
import { GoogleService } from '../services/google-service';
import { SheikhaPlatformService } from '../services/sheikha-service';
import { SyncQueueService } from '../services/sync-queue-service';

export class DeploymentWorkflow {
  private googleService: GoogleService;
  private sheikhService: SheikhaPlatformService;
  private syncQueue: SyncQueueService;

  constructor() {
    this.googleService = new GoogleService();
    this.sheikhService = new SheikhaPlatformService();
    this.syncQueue = new SyncQueueService();
  }

  /**
   * Complete workflow: Google Workspace → Sheikha Deployment
   */
  async deployFromGoogleWorkspace(
    googleAccessToken: string,
    applicationId: string,
    version: string
  ): Promise<string> {
    console.log('Starting deployment workflow...');

    try {
      // Step 1: Get application data from Google Drive
      console.log('Step 1: Fetching application data from Google Drive...');
      const files = await this.googleService.getDriveFiles(googleAccessToken, {
        query: `appProperties has { key="sheikha-app" and value="${applicationId}" }`,
      });

      if (!files.length) {
        throw new Error(`Application ${applicationId} not found in Google Drive`);
      }

      // Step 2: Prepare deployment configuration
      console.log('Step 2: Preparing deployment configuration...');
      const deploymentConfig = this.buildDeploymentConfig(
        files,
        applicationId,
        version
      );

      // Step 3: Deploy to Sheikha
      console.log('Step 3: Deploying to Sheikha Platform...');
      const deployment = await this.sheikhService.deployApplication(
        applicationId,
        deploymentConfig
      );

      // Step 4: Monitor deployment
      console.log('Step 4: Monitoring deployment progress...');
      const finalStatus = await this.sheikhService.waitForDeployment(
        deployment.id
      );

      // Step 5: Update sync status
      console.log('Step 5: Updating sync status...');
      await this.syncQueue.enqueue(
        'deployment-completed',
        {
          deploymentId: deployment.id,
          applicationId,
          version,
          status: finalStatus.status,
        },
        10 // High priority
      );

      console.log(`✅ Deployment completed: ${deployment.id}`);
      return deployment.id;
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    }
  }

  /**
   * Build deployment config from Google Drive files
   */
  private buildDeploymentConfig(
    files: any[],
    applicationId: string,
    version: string
  ): any {
    return {
      applicationId,
      version,
      replicas: 3,
      resources: {
        cpu: '500m',
        memory: '512Mi',
        storage: '1Gi',
      },
      environment: {
        GOOGLE_INTEGRATION_ENABLED: 'true',
        APPLICATION_VERSION: version,
        DEPLOYMENT_SOURCE: 'google-workspace',
      },
    };
  }

  /**
   * Rollback deployment
   */
  async rollbackDeployment(applicationId: string, previousVersion: string): Promise<void> {
    console.log(
      `Rolling back ${applicationId} to version ${previousVersion}...`
    );

    const config = {
      applicationId,
      version: previousVersion,
      replicas: 3,
      resources: { cpu: '500m', memory: '512Mi' },
      environment: {},
    };

    const deployment = await this.sheikhService.deployApplication(
      applicationId,
      config
    );

    await this.sheikhService.waitForDeployment(deployment.id);

    console.log('✅ Rollback completed');
  }
}
```

---

## 5️⃣ Error Handling & Recovery

### src/middleware/sheikha-error-handler.ts

```typescript
import { Request, Response, NextFunction } from 'express';

export class SheikhErrorHandler {
  static async handle(error: any, req: Request, res: Response) {
    console.error('Sheikha error:', error);

    if (error.message.includes('401')) {
      return res.status(401).json({
        error: 'Invalid Sheikha API key',
        message: 'Please check your SHEIKHA_API_KEY',
      });
    }

    if (error.message.includes('404')) {
      return res.status(404).json({
        error: 'Resource not found on Sheikha Platform',
        message: error.message,
      });
    }

    if (error.message.includes('503')) {
      return res.status(503).json({
        error: 'Sheikha Platform is temporarily unavailable',
        message: 'Please try again later',
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
```

---

## 6️⃣ Webhook Integration

### Sheikha → Application Webhooks

```typescript
// src/api/routes/webhooks/sheikha-webhooks.ts

import express from 'express';
import { db } from '../../database';
import crypto from 'crypto';

export const sheikhWebhookRouter = express.Router();

/**
 * Verify Sheikha webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

/**
 * Handle deployment status webhook from Sheikha
 */
sheikhWebhookRouter.post('/deployment-status', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-sheikha-signature'] as string;
    const payload = req.body.toString();

    if (!verifyWebhookSignature(payload, signature, process.env.SHEIKHA_WEBHOOK_SECRET!)) {
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(payload);

    // Update deployment status in our database
    await db.query(
      `UPDATE deployments 
       SET status = $1, message = $2, updated_at = NOW()
       WHERE sheikha_deployment_id = $3`,
      [event.status, event.message, event.deploymentId]
    );

    // Notify connected clients via WebSocket if applicable
    // ... WebSocket notification code ...

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

/**
 * Handle application error from Sheikha
 */
sheikhWebhookRouter.post('/application-error', async (req, res) => {
  try {
    const signature = req.headers['x-sheikha-signature'] as string;
    const payload = JSON.stringify(req.body);

    if (
      !verifyWebhookSignature(payload, signature, process.env.SHEIKHA_WEBHOOK_SECRET!)
    ) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;

    // Log error
    console.error(`Application ${event.applicationId} error:`, event.error);

    // Store in error tracking
    await db.query(
      `INSERT INTO application_errors (application_id, error_message, stack_trace, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [event.applicationId, event.error, event.stackTrace]
    );

    // Trigger alert if critical
    if (event.severity === 'critical') {
      // Send alert to team
      // ... alert notification code ...
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});
```

---

## 7️⃣ Testing Sheikha Integration

### tests/integration/sheikha-integration.test.ts

```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';
import { SheikhaPlatformService } from '../../src/services/sheikha-service';

describe('Sheikha Platform Integration', () => {
  let sheikhService: SheikhaPlatformService;

  beforeAll(() => {
    sheikhService = new SheikhaPlatformService(
      process.env.SHEIKHA_API_URL_TEST,
      process.env.SHEIKHA_API_KEY_TEST,
      process.env.SHEIKHA_WORKSPACE_ID_TEST
    );
  });

  describe('Health Check', () => {
    it('should connect to Sheikha API', async () => {
      const health = await sheikhService.healthCheck();

      expect(health.status).toBe('ok');
    });
  });

  describe('Workspace Operations', () => {
    it('should get workspace configuration', async () => {
      const workspace = await sheikhService.getWorkspace();

      expect(workspace.id).toBeDefined();
      expect(workspace.name).toBeDefined();
      expect(workspace.environment).toMatch(/development|staging|production/);
    });

    it('should list applications in workspace', async () => {
      const apps = await sheikhService.listApplications();

      expect(Array.isArray(apps)).toBe(true);
    });
  });

  describe('Deployment', () => {
    it('should deploy application', async () => {
      const deploymentConfig = {
        applicationId: 'test-app',
        version: '1.0.0',
        replicas: 1,
        resources: { cpu: '250m', memory: '256Mi' },
        environment: { TEST: 'true' },
      };

      const deployment = await sheikhService.deployApplication(
        'test-app',
        deploymentConfig
      );

      expect(deployment.id).toBeDefined();
      expect(deployment.status).toMatch(/pending|deploying/);
    }, 30000); // 30-second timeout
  });

  describe('Metrics', () => {
    it('should get application metrics', async () => {
      const metrics = await sheikhService.getApplicationMetrics('test-app');

      expect(metrics).toBeDefined();
      expect(metrics.cpu).toBeDefined();
      expect(metrics.memory).toBeDefined();
    });
  });
});
```

---

## ✅ قائمة التحقق النهائية

```
API Setup:
[ ] API key generated from Sheikha Dashboard
[ ] Workspace ID configured
[ ] API URL verified (production/staging)
[ ] Credentials stored securely

Implementation:
[ ] SheikhaPlatformService class created
[ ] Authentication middleware working
[ ] Deployment workflow implemented
[ ] Error handling in place

Webhooks:
[ ] Webhook endpoints created
[ ] Signature verification working
[ ] Deployment status tracking
[ ] Error alerts configured

Testing:
[ ] Health check passing
[ ] Workspace operations tested
[ ] Deployment workflow tested
[ ] Integration tests passing
[ ] Error scenarios covered

Monitoring:
[ ] Deployment logs accessible
[ ] Error tracking enabled
[ ] Performance metrics collected
[ ] Alerts configured
[ ] Dashboard configured
```

---

**Sheikha Platform Integration جاهزة! 🚀**
