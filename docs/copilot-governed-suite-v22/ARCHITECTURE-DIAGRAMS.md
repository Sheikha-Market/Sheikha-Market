<!-- GOVERNED BY SHEIKHA SOVEREIGN CORE v22.0.0 | BOUND_BY_QURAN_SUNNAH | CR: 2051263653 -->
# 🏗️ Sheikha Platform - Architecture & Integration Diagram

## System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                        SHEIKHA PLATFORM                           │
│                     (Integrated Architecture)                      │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     CLIENT LAYER                            │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │ │
│  │  │  Web Console │  │ Mobile App   │  │  Integrations  │   │ │
│  │  │  (React/Vue) │  │  (Native)    │  │  (GitHub/APIs) │   │ │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬───────┘   │ │
│  │         │                 │                   │             │ │
│  └─────────┼─────────────────┼───────────────────┼─────────────┘ │
│            │                 │                   │               │
│  ┌─────────▼─────────────────▼───────────────────▼─────────────┐ │
│  │                  API GATEWAY LAYER                          │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  REST API  │  gRPC  │  GraphQL  │  WebSockets     │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  Auth Middleware  │  Rate Limiting  │  Logging    │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  └─────────┬─────────────────────────────────────────────────┘ │
│            │                                                    │
│  ┌─────────▼──────────────────────────────────────────────────┐ │
│  │            INTEGRATION ORCHESTRATION LAYER                │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │          Integration Orchestrator                   │ │ │
│  │  │  - Google Workspace ↔ Sheikha Sync                 │ │ │
│  │  │  - Conflict Detection & Resolution                 │ │ │
│  │  │  - Transaction Management                          │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │  Sync Queue  │  │  Lock Mgmt   │  │  Conflict    │   │ │
│  │  │  Service     │  │  (Redis)     │  │  Resolver    │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  │                                                            │ │
│  └────────┬──────────────────┬───────────────┬──────────┬────┘ │
│           │                  │               │          │       │
│  ┌────────▼────────┐ ┌──────▼─────────┐ ┌──▼──────┐ ┌──▼─────┐│
│  │   GOOGLE        │ │   SHEIKHA      │ │ WEBHOOK │ │ CACHE  ││
│  │   WORKSPACE     │ │   PLATFORM     │ │ HANDLERS│ │(Redis) ││
│  │   INTEGRATION   │ │   INTEGRATION  │ │        │ │        ││
│  └────────┬────────┘ └──────┬─────────┘ └──┬─────┘ └────────┘│
│           │                 │               │               │
│           ▼                 ▼               ▼               ▼
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│  │  Google      │   │  Sheikha     │   │   Webhooks &     │
│  │  Services    │   │  Services    │   │   Real-time      │
│  │              │   │              │   │   Events         │
│  │ - OAuth 2.0  │   │ - Deployment │   │                  │
│  │ - Drive API  │   │ - Workspaces │   │ - Drive Changes  │
│  │ - Gmail API  │   │ - Monitoring │   │ - Deploy Events  │
│  │ - Sheets API │   │ - Scaling    │   │ - Alerts         │
│  └──────────────┘   └──────────────┘   └──────────────────┘
│           │                 │                   │
│           └────────────────┬┴───────────────────┘
│                            │
│  ┌─────────────────────────▼──────────────────────────┐
│  │          DATA PERSISTENCE LAYER                   │
│  ├───────────────────────────────────────────────────┤
│  │                                                   │
│  │  ┌────────────────────────────────────────────┐ │
│  │  │   PostgreSQL Database                      │ │
│  │  │                                            │ │
│  │  │  Tables:                                   │ │
│  │  │  - google_workspace_users                 │ │
│  │  │  - google_sheikha_mappings                │ │
│  │  │  - sync_operations                        │ │
│  │  │  - conflicts & resolutions                │ │
│  │  │  - deployments & applications             │ │
│  │  │  - sync_logs & audit_trail                │ │
│  │  │                                            │ │
│  │  └────────────────────────────────────────────┘ │
│  │                                                   │
│  │  ┌─────────────┐  ┌─────────────┐              │ │
│  │  │  Redis      │  │   Backups   │              │ │
│  │  │  (Cache &   │  │   (S3/GCS)  │              │ │
│  │  │   Queue)    │  │             │              │ │
│  │  └─────────────┘  └─────────────┘              │ │
│  │                                                   │
│  └───────────────────────────────────────────────────┘
│
│  ┌─────────────────────────────────────────────────────┐
│  │        MONITORING & OBSERVABILITY LAYER            │
│  ├─────────────────────────────────────────────────────┤
│  │                                                     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  │  Prometheus │  │  Grafana    │  │  ELK Stack │ │
│  │  │  (Metrics)  │  │  (Dashboards│  │  (Logs)    │ │
│  │  └─────────────┘  └─────────────┘  └────────────┘ │
│  │                                                     │
│  │  ┌───────────────────────────────────────────────┐ │
│  │  │  Alerts & Notifications                      │ │
│  │  │  - Slack  - Email  - PagerDuty              │ │
│  │  └───────────────────────────────────────────────┘ │
│  │                                                     │
│  └─────────────────────────────────────────────────────┘
│
│  ┌─────────────────────────────────────────────────────┐
│  │      DEPLOYMENT & INFRASTRUCTURE LAYER             │
│  ├─────────────────────────────────────────────────────┤
│  │                                                     │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │  │  Cloudflare│  │  Container │  │  Kubernetes  │ │
│  │  │  Pages     │  │  Registry  │  │ (Optional)   │ │
│  │  └────────────┘  └────────────┘  └──────────────┘ │
│  │                                                     │
│  │  CI/CD Pipeline:                                   │
│  │  GitHub → Tests → Security → Build → Deploy       │
│  │                                                     │
│  └─────────────────────────────────────────────────────┘
│
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │ 1. Click "Sync Google Drive"
       ▼
┌─────────────────────────────────────┐
│   Sheikha Web Console               │
│   (Frontend)                        │
└──────┬──────────────────────────────┘
       │ 2. POST /api/integrations/sync
       ▼
┌──────────────────────────────────────────────────┐
│   API Gateway & Auth Middleware                  │
│   - Verify JWT token                             │
│   - Check permissions                            │
└──────┬───────────────────────────────────────────┘
       │ 3. Route to Integration Orchestrator
       ▼
┌──────────────────────────────────────────────────────┐
│   Integration Orchestrator                           │
│   - Lock mapping (prevent conflicts)                │
│   - Fetch user's Google tokens                      │
│   - Queue sync operation                            │
└──────┬───────────────────────────────────────────────┘
       │ 4a. Fetch access token          4b. Get Google files
       ▼                                   ▼
┌──────────────────────────────┐  ┌────────────────────┐
│   Token Refresh Service      │  │  Google Services   │
│   - Check expiry             │  │  - OAuth          │
│   - Refresh if needed        │  │  - Drive API      │
│   - Update DB               │  │  - Gmail API      │
└──────┬───────────────────────┘  └────────┬───────────┘
       │                                   │
       │ 4c. Valid tokens                  │ 4d. Files data
       ▼                                   ▼
┌───────────────────────────────────────────────────┐
│   Sync Queue Service                             │
│   - Enqueue: { source: google, action: sync }   │
│   - Set priority                                 │
│   - Schedule next check                          │
└──────┬────────────────────────────────────────────┘
       │ 5. Process queue
       ▼
┌───────────────────────────────────────────────────┐
│   Conflict Detection                              │
│   - Compare with Sheikha data                     │
│   - Detect versions, duplicates, missing         │
│   - Create conflict records if found             │
└──────┬────────────────────────────────────────────┘
       │
       ├─── No Conflicts ──────────┐
       │                           │
       └─── Conflicts Found ───┐   │
           (resolve strategy)  │   │
                              │   │
                              ▼   ▼
            ┌──────────────────────────────────────┐
            │   Update PostgreSQL Database         │
            │   - Google data                      │
            │   - Mappings                         │
            │   - Sync history                     │
            └──────────┬───────────────────────────┘
                       │ 6. Data synchronized
                       ▼
            ┌──────────────────────────────────────┐
            │   Update Sheikha Platform            │
            │   - Push synced data                 │
            │   - Create/update resources          │
            │   - Trigger deployments if needed    │
            └──────────┬───────────────────────────┘
                       │ 7. Sync complete
                       ▼
            ┌──────────────────────────────────────┐
            │   Send Webhook Notifications         │
            │   - Deployment status                │
            │   - Sync completion                  │
            │   - Any errors                       │
            └──────────┬───────────────────────────┘
                       │ 8. Notify user
                       ▼
            ┌──────────────────────────────────────┐
            │   Update Web Console                 │
            │   - Show sync status                 │
            │   - Display results                  │
            │   - Alert on conflicts              │
            └──────────────────────────────────────┘
```

---

## Component Interaction Matrix

```
┌────────────┬──────────┬─────────────┬──────────────────────────┐
│ Component  │ Protocol │ Auth        │ Primary Responsibility   │
├────────────┼──────────┼─────────────┼──────────────────────────┤
│ GoogleSvc  │ REST+gRPC│ OAuth 2.0   │ Google APIs access       │
│ SheikhaSvc │ REST     │ Bearer Token│ Sheikha APIs access      │
│ Orchestrat │ Internal │ JWT         │ Sync coordination        │
│ SyncQueue  │ Internal │ Internal    │ Operation queuing        │
│ ConflictRes│ Internal │ Internal    │ Conflict handling        │
│ Database   │ JDBC/ODBC│ SQL Auth    │ Data persistence         │
│ Cache      │ RESP     │ Redis Auth  │ Performance caching      │
│ Webhooks   │ REST     │ Signatures  │ Event notifications      │
└────────────┴──────────┴─────────────┴──────────────────────────┘
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Perimeter Security                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ - Cloudflare WAF                                   │   │
│  │ - DDoS Protection                                  │   │
│  │ - Rate Limiting                                    │   │
│  │ - IP Allowlisting (optional)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Layer 2: Authentication & Authorization                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ - Google OAuth 2.0                                 │   │
│  │ - JWT Token validation                             │   │
│  │ - Bearer token (Sheikha API)                       │   │
│  │ - Role-based access control (RBAC)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Layer 3: Data Protection                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ - Encryption at rest (PostgreSQL)                 │   │
│  │ - Encryption in transit (TLS 1.3)                 │   │
│  │ - Token encryption (sensitive data)                │   │
│  │ - Database credentials in vault                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Layer 4: API Security                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ - Input validation & sanitization                 │   │
│  │ - SQL injection prevention                        │   │
│  │ - CSRF protection                                  │   │
│  │ - Webhook signature verification                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Layer 5: Monitoring & Logging                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ - Audit logs (all API calls)                       │   │
│  │ - Security events alerting                         │   │
│  │ - Failed login attempt tracking                    │   │
│  │ - Sensitive operation logging                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│          MULTI-ENVIRONMENT DEPLOYMENT                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Development Environment:                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │ - Local: docker-compose or localhost              │ │
│  │ - Database: PostgreSQL local                       │ │
│  │ - Cache: Redis local                               │ │
│  │ - Deploy tool: npm run dev                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Staging Environment:                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ - Cloudflare Pages (staging.sheikha.cloud)        │ │
│  │ - Database: PostgreSQL staging (AWS RDS)          │ │
│  │ - Cache: Redis staging (AWS ElastiCache)          │ │
│  │ - Deploy: GitHub Actions (develop branch)         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Production Environment:                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │ - Cloudflare Pages (sheikha.cloud)                │ │
│  │ - Database: PostgreSQL prod (AWS RDS Multi-AZ)   │ │
│  │ - Cache: Redis prod (AWS ElastiCache)             │ │
│  │ - Deploy: GitHub Actions (release tag)            │ │
│  │ - Backup: Automated daily                         │ │
│  │ - Failover: Multi-region enabled                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Architecture Decision Records (ADRs)

### ADR-001: Why PostgreSQL?
- ✅ ACID compliance (critical for sync operations)
- ✅ Advanced conflict resolution support
- ✅ Excellent JSON support (for integration metadata)
- ✅ Mature ecosystem

### ADR-002: Why Redis for Sync Queue?
- ✅ Fast message processing
- ✅ Built-in expiry (automatic cleanup)
- ✅ Atomic operations (prevent duplicate processing)
- ✅ Pub/Sub for real-time notifications

### ADR-003: Google OAuth 2.0 Flow
- ✅ Industry standard
- ✅ Secure token refresh mechanism
- ✅ User data isolation
- ✅ No password storage

### ADR-004: Conflict Resolution Strategy
- ✅ Configurable per-mapping
- ✅ Support for multiple strategies (google-wins, sheikha-wins, merge)
- ✅ Manual resolution workflow
- ✅ Full audit trail

---

**🎉 Architecture complete and production-ready!**
