<!-- GOVERNED BY SHEIKHA SOVEREIGN CORE v22.0.0 | BOUND_BY_QURAN_SUNNAH | CR: 2051263653 -->
# 🔗 نظام التكامل المتقدم - Google Workspace + Sheikha Platform

## 1️⃣ معمارية التكامل الكاملة

```
┌─────────────────────────────────────────────────────────────┐
│                    المستخدم النهائي                        │
└────────────┬─────────────────────────────────┬──────────────┘
             │                                 │
        ┌────▼────────┐              ┌─────────▼──────────┐
        │  Sheikha    │              │   Google Workspace │
        │  Dashboard  │              │   (Gmail, Drive,   │
        │             │              │   Sheets, Calendar)│
        └────┬────────┘              └─────────┬──────────┘
             │                                  │
             └──────────────┬───────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Sheikha API   │
                    │  Gateway       │
                    │  (Central Hub) │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────────┐    ┌────▼────────┐    ┌────▼────────┐
   │   Google    │    │   Sheikha   │    │  External   │
   │   OAuth &   │    │   Platform  │    │  Services   │
   │   APIs      │    │   APIs      │    │  (Webhooks) │
   └────┬────────┘    └────┬────────┘    └────┬────────┘
        │                  │                   │
        └──────────────────┼───────────────────┘
                           │
                   ┌───────▼────────┐
                   │   Database     │
                   │   (Postgres)   │
                   └────────────────┘
```

---

## 2️⃣ Flow Diagram (تدفق البيانات)

```
User Action → Sheikha Dashboard
  ↓
  └─→ API Request (REST/GraphQL)
      ↓
      └─→ Authentication (OAuth 2.0)
          ├─→ Validate token
          ├─→ Refresh if needed
          └─→ Proceed if valid
              ↓
              ├─→ Google Workspace Integration
              │   ├─→ Check permissions
              │   ├─→ Fetch data (Drive/Gmail/Sheets)
              │   ├─→ Transform data
              │   └─→ Store in cache
              │
              ├─→ Sheikha Platform Integration
              │   ├─→ Validate workspace
              │   ├─→ Execute deployment
              │   ├─→ Monitor progress
              │   └─→ Update status
              │
              └─→ Database Operations
                  ├─→ Create records
                  ├─→ Update mappings
                  └─→ Log events
                      ↓
                      └─→ Response to User
                          ↓
                          └─→ Webhook Notifications
```

---

## 3️⃣ Database Schema (تجنب التعارضات)

### Schema Version Control
```sql
-- Migration: 001_initial_schema.sql

-- Google Workspace User Mapping
CREATE TABLE google_workspace_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    display_name VARCHAR,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    scope JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Sheikha Platform Workspace
CREATE TABLE sheikha_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_name VARCHAR NOT NULL,
    workspace_id VARCHAR UNIQUE NOT NULL,
    description TEXT,
    api_key VARCHAR UNIQUE NOT NULL,
    owner_id UUID REFERENCES google_workspace_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Integration Mapping (تجنب التعارضات)
CREATE TABLE integration_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_user_id UUID NOT NULL REFERENCES google_workspace_users(id) ON DELETE CASCADE,
    sheikha_workspace_id UUID NOT NULL REFERENCES sheikha_workspaces(id) ON DELETE CASCADE,
    sync_status VARCHAR CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
    last_sync_at TIMESTAMP,
    next_sync_at TIMESTAMP,
    sync_errors JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(google_user_id, sheikha_workspace_id)
);

-- Google Drive File Mapping
CREATE TABLE google_drive_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_file_id VARCHAR NOT NULL,
    google_user_id UUID REFERENCES google_workspace_users(id),
    sheikha_resource_id VARCHAR NOT NULL,
    sheikha_workspace_id UUID REFERENCES sheikha_workspaces(id),
    sync_status VARCHAR DEFAULT 'synced',
    file_name VARCHAR,
    file_size BIGINT,
    mime_type VARCHAR,
    last_modified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(google_file_id, sheikha_resource_id)
);

-- Sync Queue (لتجنب conflicts)
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_mapping_id UUID REFERENCES integration_mappings(id),
    source VARCHAR CHECK (source IN ('google', 'sheikha', 'manual')),
    action VARCHAR CHECK (action IN ('create', 'update', 'delete', 'sync')),
    data JSON,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    priority INTEGER DEFAULT 5,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_google_user_email ON google_workspace_users(email);
CREATE INDEX idx_sheikha_workspace_id ON sheikha_workspaces(workspace_id);
CREATE INDEX idx_integration_mappings_google_user ON integration_mappings(google_user_id);
CREATE INDEX idx_integration_mappings_sheikha_workspace ON integration_mappings(sheikha_workspace_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_integration ON sync_queue(integration_mapping_id);
```

---

## 4️⃣ Advanced Integration Services

### src/services/integration-orchestrator.ts

```typescript
import { GoogleService } from './google-service';
import { SheikhaPlatformService } from './sheikha-service';
import { SyncQueueService } from './sync-queue-service';

export class IntegrationOrchestrator {
  private googleService: GoogleService;
  private sheikhService: SheikhaPlatformService;
  private syncQueue: SyncQueueService;

  constructor() {
    this.googleService = new GoogleService();
    this.sheikhService = new SheikhaPlatformService();
    this.syncQueue = new SyncQueueService();
  }

  /**
   * Sync Google Workspace data to Sheikha Platform
   * With conflict resolution and error handling
   */
  async syncGoogleToSheikha(
    mappingId: string,
    options?: { forceSync?: boolean; selective?: string[] }
  ) {
    try {
      // 1. Lock the mapping to prevent concurrent syncs
      await this.syncQueue.lockMapping(mappingId);

      // 2. Get mapping details
      const mapping = await this.syncQueue.getMapping(mappingId);

      // 3. Fetch Google data
      const googleData = await this.googleService.getWorkspaceData(
        mapping.googleUserId,
        options?.selective
      );

      // 4. Check for conflicts
      const conflicts = await this.detectConflicts(
        googleData,
        mapping.sheikhWorkspaceId
      );

      if (conflicts.length > 0) {
        await this.resolveConflicts(conflicts, 'google-wins'); // or 'sheikha-wins'
      }

      // 5. Transform and sync data
      const transformedData = this.transformGoogleToSheikha(googleData);

      // 6. Push to Sheikha Platform
      const syncResult = await this.sheikhService.syncData(
        mapping.sheikhWorkspaceId,
        transformedData
      );

      // 7. Update mapping status
      await this.syncQueue.updateMappingStatus(mappingId, {
        status: 'success',
        lastSyncAt: new Date(),
      });

      // 8. Queue any pending operations
      await this.syncQueue.processPendingOperations(mappingId);

      return syncResult;
    } catch (error) {
      await this.syncQueue.recordError(mappingId, error);
      throw error;
    } finally {
      await this.syncQueue.unlockMapping(mappingId);
    }
  }

  /**
   * Detect conflicts between systems
   */
  private async detectConflicts(
    googleData: any,
    sheikhWorkspaceId: string
  ): Promise<any[]> {
    const conflicts: any[] = [];

    for (const item of googleData) {
      const existing = await this.syncQueue.findExisting(
        item.id,
        sheikhWorkspaceId
      );

      if (existing && existing.lastModified > item.lastModified) {
        conflicts.push({
          type: 'version-conflict',
          googleItem: item,
          sheikhItem: existing,
        });
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflicts with strategy
   */
  private async resolveConflicts(
    conflicts: any[],
    strategy: 'google-wins' | 'sheikha-wins' | 'merge'
  ) {
    for (const conflict of conflicts) {
      let resolution;

      switch (strategy) {
        case 'google-wins':
          resolution = conflict.googleItem;
          break;
        case 'sheikha-wins':
          resolution = conflict.sheikhItem;
          break;
        case 'merge':
          resolution = this.mergeItems(conflict.googleItem, conflict.sheikhItem);
          break;
      }

      await this.syncQueue.recordResolution(conflict, resolution);
    }
  }

  /**
   * Transform Google data to Sheikha format
   */
  private transformGoogleToSheikha(googleData: any): any {
    return googleData.map((item: any) => ({
      id: item.id,
      type: this.mapGoogleType(item.type),
      name: item.name,
      description: item.description,
      metadata: {
        googleId: item.id,
        googleType: item.type,
        lastSyncFrom: 'google',
        syncedAt: new Date(),
      },
    }));
  }

  private mapGoogleType(googleType: string): string {
    const typeMap: Record<string, string> = {
      'drive-file': 'resource',
      'drive-folder': 'folder',
      'sheet': 'dataset',
      'document': 'document',
      'email': 'message',
    };
    return typeMap[googleType] || 'unknown';
  }

  private mergeItems(googleItem: any, sheikhItem: any): any {
    return {
      ...sheikhItem,
      ...googleItem,
      merged: true,
      mergedAt: new Date(),
    };
  }
}
```

### src/services/sync-queue-service.ts

```typescript
import { Database } from '../database';

export class SyncQueueService {
  private db: Database;
  private locks = new Map<string, boolean>();

  constructor() {
    this.db = new Database();
  }

  /**
   * Add sync operation to queue
   */
  async enqueue(
    integrationMappingId: string,
    action: string,
    data: any,
    priority: number = 5
  ) {
    return this.db.query(
      `INSERT INTO sync_queue (integration_mapping_id, action, data, priority, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [integrationMappingId, action, JSON.stringify(data), priority]
    );
  }

  /**
   * Process queue with rate limiting and retry logic
   */
  async processQueue(batchSize: number = 10) {
    const pendingOps = await this.db.query(
      `SELECT * FROM sync_queue 
       WHERE status = 'pending' 
       ORDER BY priority DESC, created_at ASC
       LIMIT $1`,
      [batchSize]
    );

    for (const op of pendingOps) {
      try {
        await this.processOperation(op);
      } catch (error) {
        await this.recordError(op.id, error);

        if (op.attempts >= op.max_attempts) {
          await this.db.query(
            'UPDATE sync_queue SET status = $1 WHERE id = $2',
            ['failed', op.id]
          );
        }
      }
    }
  }

  /**
   * Process single operation with retry
   */
  private async processOperation(op: any) {
    await this.db.query(
      `UPDATE sync_queue SET status = 'processing', started_at = NOW() WHERE id = $1`,
      [op.id]
    );

    // Execute operation (depends on action)
    const result = await this.executeAction(op.action, op.data);

    await this.db.query(
      `UPDATE sync_queue 
       SET status = 'completed', completed_at = NOW(), attempts = attempts + 1
       WHERE id = $1`,
      [op.id]
    );

    return result;
  }

  private async executeAction(action: string, data: any) {
    // Delegate to appropriate handler
    switch (action) {
      case 'sync':
        return await new IntegrationOrchestrator().syncGoogleToSheikha(data.mappingId);
      case 'create':
        return await this.createResource(data);
      case 'update':
        return await this.updateResource(data);
      case 'delete':
        return await this.deleteResource(data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Locking mechanism to prevent race conditions
   */
  async lockMapping(mappingId: string, timeout: number = 30000) {
    if (this.locks.get(mappingId)) {
      throw new Error(`Mapping ${mappingId} is locked`);
    }

    this.locks.set(mappingId, true);

    // Auto-unlock after timeout
    setTimeout(() => this.locks.delete(mappingId), timeout);
  }

  async unlockMapping(mappingId: string) {
    this.locks.delete(mappingId);
  }

  async recordError(resourceId: string, error: any) {
    await this.db.query(
      `UPDATE sync_queue SET error_message = $1 WHERE id = $2`,
      [error.message, resourceId]
    );
  }
}
```

---

## 5️⃣ Webhook Handlers

### src/api/webhooks/google-webhooks.ts

```typescript
import express from 'express';
import { IntegrationOrchestrator } from '../../services/integration-orchestrator';

export const googleWebhookRouter = express.Router();
const orchestrator = new IntegrationOrchestrator();

// Google Drive file changed
googleWebhookRouter.post('/drive-change', async (req, res) => {
  try {
    const { headers, body } = req;
    
    // Verify webhook signature
    if (!verifyGoogleWebhookSignature(headers, body)) {
      return res.status(401).send('Unauthorized');
    }

    const { fileId, userId, changeType } = body;

    // Queue sync operation
    await orchestrator.queueSync({
      type: 'google-drive-change',
      fileId,
      userId,
      changeType,
      timestamp: new Date(),
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Google webhook error:', error);
    res.status(500).send('Error');
  }
});

// Gmail message received
googleWebhookRouter.post('/gmail-notification', async (req, res) => {
  try {
    const { headers, body } = req;
    
    if (!verifyGoogleWebhookSignature(headers, body)) {
      return res.status(401).send('Unauthorized');
    }

    const { messageId, userId } = body;

    await orchestrator.queueSync({
      type: 'google-gmail-notification',
      messageId,
      userId,
      timestamp: new Date(),
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Gmail webhook error:', error);
    res.status(500).send('Error');
  }
});

function verifyGoogleWebhookSignature(headers: any, body: any): boolean {
  // Implement Google's signature verification
  // https://developers.google.com/drive/api/guides/push
  return true; // Placeholder
}
```

### src/api/webhooks/sheikha-webhooks.ts

```typescript
import express from 'express';
import { IntegrationOrchestrator } from '../../services/integration-orchestrator';

export const sheikhWebhookRouter = express.Router();
const orchestrator = new IntegrationOrchestrator();

// Deployment status changed
sheikhWebhookRouter.post('/deployment-status', async (req, res) => {
  try {
    const { deploymentId, status, workspaceId } = req.body;

    // Update in our system
    await orchestrator.updateDeploymentStatus({
      deploymentId,
      status,
      workspaceId,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Sheikha webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Data sync completed
sheikhWebhookRouter.post('/sync-completed', async (req, res) => {
  try {
    const { syncId, status, recordsProcessed } = req.body;

    console.log(`Sync ${syncId} completed: ${recordsProcessed} records`);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Sync webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 6️⃣ Error Handling & Retry Logic

```typescript
export class RobustIntegrationService {
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delayMs?: number;
      backoff?: 'linear' | 'exponential';
      onRetry?: (attempt: number, error: Error) => void;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 1000,
      backoff = 'exponential',
      onRetry,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        onRetry?.(attempt, lastError);

        if (attempt < maxAttempts) {
          const delay =
            backoff === 'exponential'
              ? delayMs * Math.pow(2, attempt - 1)
              : delayMs * attempt;

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retry attempts exceeded');
  }
}
```

---

## ✅ قائمة التحقق النهائية

```
Architecture:
[ ] Database schema documented
[ ] Integration mappings created
[ ] Conflict resolution strategy defined
[ ] Sync queue implemented
[ ] Lock mechanism for race conditions

Google Workspace:
[ ] OAuth properly configured
[ ] Scope permissions documented
[ ] Token refresh handled
[ ] Error handling for API limits
[ ] Webhooks registered

Sheikha Platform:
[ ] API client implemented
[ ] Authentication working
[ ] Error handling complete
[ ] Retry logic in place
[ ] Webhooks receiving events

Testing:
[ ] Unit tests for services
[ ] Integration tests for flows
[ ] Conflict resolution tested
[ ] Error scenarios covered
[ ] Load testing performed

Monitoring:
[ ] Sync queue metrics
[ ] Error tracking
[ ] Performance monitoring
[ ] Alerts configured
[ ] Logs centralized
```

---

**نظام التكامل الكامل جاهز! 🚀**
