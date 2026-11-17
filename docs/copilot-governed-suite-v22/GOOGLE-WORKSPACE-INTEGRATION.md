<!-- GOVERNED BY SHEIKHA SOVEREIGN CORE v22.0.0 | BOUND_BY_QURAN_SUNNAH | CR: 2051263653 -->
# 🔐 Google Workspace Integration Guide - Sheikha Platform

## 1️⃣ OAuth 2.0 Configuration

### Step 1: Google Cloud Setup

```bash
# 1. Go to Google Cloud Console
# https://console.cloud.google.com

# 2. Create new project
Project Name: Sheikha Platform
Organization: Your Organization

# 3. Enable APIs
- Google Drive API
- Gmail API
- Google Sheets API
- Google Calendar API
- Google Cloud Admin SDK
- People API
```

### Step 2: Create OAuth 2.0 Credentials

```bash
# In Google Cloud Console:
# Navigate to: Credentials → Create Credentials → OAuth 2.0 Client ID

# Application Type: Web application

# Authorized JavaScript origins:
http://localhost:3000
http://localhost:3000/api
https://sheikha.cloud
https://app.sheikha.cloud
https://staging.sheikha.cloud

# Authorized redirect URIs:
http://localhost:3000/api/auth/google/callback
https://sheikha.cloud/api/auth/google/callback
https://staging.sheikha.cloud/api/auth/google/callback
```

### Step 3: Store Credentials Securely

```env
# .env file (DO NOT COMMIT)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# GitHub Secrets (for CI/CD)
GOOGLE_CLIENT_ID → stored in GitHub Secrets
GOOGLE_CLIENT_SECRET → stored in GitHub Secrets
```

---

## 2️⃣ Implementation: Google OAuth Service

### src/services/google-service.ts

```typescript
import { google, Auth, drive_v3, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface GoogleUser {
  id: string;
  email: string;
  displayName: string;
}

interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
}

export class GoogleService {
  private oauth2Client: OAuth2Client;
  private drive: drive_v3.Drive;
  private gmail: gmail_v1.Gmail;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Generate Google login URL
   */
  getAuthUrl(scopes: string[] = []): string {
    const defaultScopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.length > 0 ? scopes : defaultScopes,
      prompt: 'consent', // Force consent screen to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<GoogleTokens> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      };
    } catch (error) {
      throw new Error(`Failed to get tokens from code: ${error.message}`);
    }
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      return {
        accessToken: credentials.access_token!,
        expiryDate: credentials.expiry_date,
      };
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  /**
   * Set credentials for API calls
   */
  setCredentials(tokens: GoogleTokens): void {
    this.oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiryDate,
    });
  }

  /**
   * Get authenticated user info
   */
  async getAuthenticatedUser(accessToken: string): Promise<GoogleUser> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        email: data.email,
        displayName: data.name,
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  /**
   * Get files from Google Drive
   */
  async getDriveFiles(
    accessToken: string,
    options?: { pageSize?: number; query?: string }
  ): Promise<any[]> {
    try {
      this.setCredentials({ accessToken });

      const response = await this.drive.files.list({
        pageSize: options?.pageSize || 100,
        fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink)',
        q: options?.query,
      });

      return response.data.files || [];
    } catch (error) {
      throw new Error(`Failed to get Drive files: ${error.message}`);
    }
  }

  /**
   * Get Gmail messages
   */
  async getGmailMessages(
    accessToken: string,
    options?: { pageSize?: number; query?: string }
  ): Promise<any[]> {
    try {
      this.setCredentials({ accessToken });

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: options?.pageSize || 100,
        q: options?.query,
      });

      return response.data.messages || [];
    } catch (error) {
      throw new Error(`Failed to get Gmail messages: ${error.message}`);
    }
  }

  /**
   * Get specific Gmail message details
   */
  async getGmailMessage(accessToken: string, messageId: string): Promise<any> {
    try {
      this.setCredentials({ accessToken });

      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get Gmail message: ${error.message}`);
    }
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh(expiryDate?: number): boolean {
    if (!expiryDate) return false;

    const now = Date.now();
    const bufferMs = 5 * 60 * 1000; // 5-minute buffer

    return expiryDate - now < bufferMs;
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `token=${accessToken}`,
      });
    } catch (error) {
      console.error(`Failed to revoke token: ${error.message}`);
    }
  }
}
```

---

## 3️⃣ Conflict Prevention Database Schema

### Database Integration Mapping

```typescript
// src/database/schemas/google-sheikha-mapping.sql

-- Prevents duplicate Google-Sheikha associations
CREATE TABLE google_sheikha_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_user_id VARCHAR NOT NULL UNIQUE,
    google_email VARCHAR NOT NULL,
    sheikha_workspace_id UUID NOT NULL,
    sheikha_user_id VARCHAR NOT NULL,
    sync_status VARCHAR CHECK (sync_status IN ('active', 'paused', 'error')),
    last_sync_at TIMESTAMP,
    next_sync_at TIMESTAMP,
    conflict_strategy VARCHAR DEFAULT 'google-wins' 
      CHECK (conflict_strategy IN ('google-wins', 'sheikha-wins', 'manual')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(google_user_id, sheikha_workspace_id),
    CONSTRAINT different_platforms CHECK (google_user_id != sheikha_user_id)
);

-- Track sync operations to prevent concurrent conflicts
CREATE TABLE sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapping_id UUID NOT NULL REFERENCES google_sheikha_mappings(id),
    operation_type VARCHAR NOT NULL 
      CHECK (operation_type IN ('google_to_sheikha', 'sheikha_to_google', 'bidirectional')),
    status VARCHAR DEFAULT 'pending' 
      CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    locked_until TIMESTAMP,
    source_system VARCHAR CHECK (source_system IN ('google', 'sheikha', 'manual')),
    changes_summary JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    INDEX idx_mapping_id (mapping_id),
    INDEX idx_status (status)
);

-- Record conflicts for manual resolution
CREATE TABLE conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_operation_id UUID REFERENCES sync_operations(id),
    conflict_type VARCHAR NOT NULL 
      CHECK (conflict_type IN ('version', 'duplicate', 'missing', 'type_mismatch')),
    google_resource JSONB,
    sheikha_resource JSONB,
    resolution VARCHAR,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4️⃣ Conflict Detection & Resolution

### src/services/conflict-resolution.ts

```typescript
interface Resource {
  id: string;
  name: string;
  lastModified: Date;
  source: 'google' | 'sheikha';
  content?: any;
}

export class ConflictResolver {
  /**
   * Detect conflicts between systems
   */
  async detectConflicts(
    googleResources: Resource[],
    sheikhResources: Resource[]
  ): Promise<any[]> {
    const conflicts: any[] = [];

    // Check for duplicate IDs
    const googleIds = new Set(googleResources.map(r => r.id));
    const sheikhIds = new Set(sheikhResources.map(r => r.id));

    for (const resource of googleResources) {
      if (sheikhIds.has(resource.id)) {
        const sheikhResource = sheikhResources.find(r => r.id === resource.id);

        // Version conflict: Different modification times
        if (
          sheikhResource &&
          resource.lastModified.getTime() !== sheikhResource.lastModified.getTime()
        ) {
          conflicts.push({
            type: 'version-conflict',
            googleResource: resource,
            sheikhResource,
            googleModified: resource.lastModified,
            sheikhModified: sheikhResource.lastModified,
          });
        }

        // Content conflict: Same ID but different content
        if (sheikhResource && resource.content !== sheikhResource.content) {
          conflicts.push({
            type: 'content-conflict',
            googleResource: resource,
            sheikhResource,
          });
        }
      }
    }

    // Check for missing resources
    for (const resource of googleResources) {
      if (!sheikhIds.has(resource.id)) {
        conflicts.push({
          type: 'missing-in-sheikha',
          googleResource: resource,
        });
      }
    }

    for (const resource of sheikhResources) {
      if (!googleIds.has(resource.id)) {
        conflicts.push({
          type: 'missing-in-google',
          sheikhResource: resource,
        });
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflicts based on strategy
   */
  async resolveConflict(
    conflict: any,
    strategy: 'google-wins' | 'sheikha-wins' | 'merge' | 'manual'
  ): Promise<any> {
    switch (strategy) {
      case 'google-wins':
        return conflict.googleResource;

      case 'sheikha-wins':
        return conflict.sheikhResource;

      case 'merge':
        return this.mergeResources(conflict.googleResource, conflict.sheikhResource);

      case 'manual':
        return {
          conflictId: conflict.id,
          status: 'pending-manual-resolution',
          googleResource: conflict.googleResource,
          sheikhResource: conflict.sheikhResource,
        };

      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`);
    }
  }

  /**
   * Merge two resources intelligently
   */
  private mergeResources(googleResource: any, sheikhResource: any): any {
    return {
      id: googleResource.id,
      name: googleResource.name, // Use Google as source of truth for names
      content: { ...sheikhResource.content, ...googleResource.content }, // Merge content
      lastModified:
        googleResource.lastModified > sheikhResource.lastModified
          ? googleResource.lastModified
          : sheikhResource.lastModified,
      source: 'merged',
      mergedFrom: ['google', 'sheikha'],
      mergedAt: new Date(),
    };
  }
}
```

---

## 5️⃣ Webhook Setup for Real-time Sync

### Google Drive Change Notifications

```typescript
// src/api/routes/webhooks/google-drive.ts

import express from 'express';
import { db } from '../../database';
import { SyncQueueService } from '../../services/sync-queue-service';

export const googleDriveRouter = express.Router();
const syncQueue = new SyncQueueService();

/**
 * Setup watch on Google Drive
 * This creates a subscription for file change notifications
 */
export async function setupDriveWatch(
  accessToken: string,
  userId: string
): Promise<string> {
  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files/watch',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: `sheikha-watch-${userId}-${Date.now()}`,
        type: 'web_hook',
        address: `https://sheikha.cloud/api/webhooks/google/drive/changes`,
        payload: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to setup drive watch: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id; // Channel ID
}

/**
 * Receive drive change notifications
 */
googleDriveRouter.post('/drive/changes', async (req, res) => {
  try {
    const channelId = req.headers['x-goog-channel-id'] as string;
    const resourceId = req.headers['x-goog-resource-id'] as string;

    // Verify webhook signature
    if (!verifyGoogleWebhookSignature(req)) {
      return res.status(401).send('Unauthorized');
    }

    // Get user from channel ID
    const user = await db.query(
      `SELECT google_user_id FROM google_sheikha_mappings WHERE channel_id = $1`,
      [channelId]
    );

    if (!user.rows.length) {
      return res.status(404).send('User not found');
    }

    // Queue sync operation
    await syncQueue.enqueue({
      mappingId: user.rows[0].id,
      action: 'google_to_sheikha',
      source: 'google',
      trigger: 'drive-change',
      resourceId,
      timestamp: new Date(),
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Drive webhook error:', error);
    res.status(500).send('Error');
  }
});

function verifyGoogleWebhookSignature(req: express.Request): boolean {
  // Implement Google's webhook signature verification
  // See: https://developers.google.com/drive/api/guides/push
  return true; // Placeholder
}
```

---

## 6️⃣ Error Handling & Token Refresh

### src/middleware/google-auth-middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { GoogleService } from '../services/google-service';
import { db } from '../database';

export async function googleAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id; // Assuming user is set by earlier middleware
    if (!userId) {
      return res.status(401).send('Not authenticated');
    }

    // Get user's Google credentials
    const userCreds = await db.query(
      `SELECT google_access_token, google_refresh_token, google_token_expiry 
       FROM google_workspace_users WHERE id = $1`,
      [userId]
    );

    if (!userCreds.rows.length) {
      return res.status(401).send('No Google credentials found');
    }

    const creds = userCreds.rows[0];
    const googleService = new GoogleService();

    // Check if token needs refresh
    if (googleService.needsRefresh(creds.google_token_expiry)) {
      try {
        const newTokens = await googleService.refreshAccessToken(
          creds.google_refresh_token
        );

        // Update in database
        await db.query(
          `UPDATE google_workspace_users 
           SET google_access_token = $1, google_token_expiry = $2, updated_at = NOW()
           WHERE id = $3`,
          [newTokens.accessToken, newTokens.expiryDate, userId]
        );

        // Update in request
        req.googleAccessToken = newTokens.accessToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return res.status(401).send('Token refresh failed');
      }
    } else {
      req.googleAccessToken = creds.google_access_token;
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).send('Authentication error');
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      googleAccessToken?: string;
    }
  }
}
```

---

## 7️⃣ Testing Google Integration

### tests/integration/google-integration.test.ts

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { GoogleService } from '../../src/services/google-service';
import { ConflictResolver } from '../../src/services/conflict-resolution';

describe('Google Workspace Integration', () => {
  let googleService: GoogleService;
  let conflictResolver: ConflictResolver;

  beforeAll(() => {
    googleService = new GoogleService();
    conflictResolver = new ConflictResolver();
  });

  describe('OAuth Flow', () => {
    it('should generate auth URL with correct scopes', () => {
      const url = googleService.getAuthUrl();

      expect(url).toContain('client_id');
      expect(url).toContain('scope');
      expect(url).toContain('redirect_uri');
      expect(url).toContain('response_type=code');
    });

    it('should validate redirect URI', () => {
      const url = googleService.getAuthUrl();

      expect(url).toContain(encodeURIComponent(process.env.GOOGLE_REDIRECT_URI!));
    });
  });

  describe('Token Management', () => {
    it('should refresh expired token', async () => {
      // Mock refresh token
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN_TEST;
      if (!refreshToken) {
        console.log('Skipping token refresh test - no test token available');
        return;
      }

      const tokens = await googleService.refreshAccessToken(refreshToken);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.accessToken).not.toBe('');
    });

    it('should detect token needs refresh', () => {
      const expiredTime = Date.now() - 10000; // 10 seconds ago
      const freshTime = Date.now() + 20 * 60 * 1000; // 20 minutes from now

      expect(googleService.needsRefresh(expiredTime)).toBe(true);
      expect(googleService.needsRefresh(freshTime)).toBe(false);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect version conflicts', async () => {
      const googleResource = {
        id: '1',
        name: 'Document',
        lastModified: new Date('2024-01-15'),
        source: 'google' as const,
      };

      const sheikhResource = {
        id: '1',
        name: 'Document',
        lastModified: new Date('2024-01-10'),
        source: 'sheikha' as const,
      };

      const conflicts = await conflictResolver.detectConflicts(
        [googleResource],
        [sheikhResource]
      );

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('version-conflict');
    });

    it('should resolve conflicts correctly', async () => {
      const conflict = {
        googleResource: { id: '1', lastModified: new Date() },
        sheikhResource: { id: '1', lastModified: new Date(0) },
      };

      const resolved = await conflictResolver.resolveConflict(
        conflict,
        'google-wins'
      );

      expect(resolved).toEqual(conflict.googleResource);
    });
  });
});
```

---

## ✅ قائمة التحقق النهائية

```
Google OAuth Setup:
[ ] OAuth 2.0 credentials created in Google Cloud Console
[ ] Redirect URIs configured correctly
[ ] Client ID and Secret stored securely
[ ] Scopes verified for Drive, Gmail, Sheets, Calendar

Implementation:
[ ] GoogleService class implemented
[ ] Token refresh logic working
[ ] Error handling for expired tokens
[ ] Webhook handlers configured

Conflict Prevention:
[ ] Database schema with unique constraints
[ ] ConflictResolver service implemented
[ ] Mapping tables created
[ ] Sync queue operational

Testing:
[ ] OAuth flow tests passing
[ ] Token refresh tests passing
[ ] Conflict detection tests passing
[ ] Integration tests passing

Deployment:
[ ] Secrets stored in GitHub/environment
[ ] Webhooks registered with Google
[ ] Monitoring alerts configured
[ ] Error logging enabled
```

---

**Google Workspace Integration جاهزة! 🚀**
