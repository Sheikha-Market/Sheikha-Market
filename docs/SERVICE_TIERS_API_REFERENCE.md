# API Reference — Sheikha Global Service Tiers

## Core Endpoints

### List All Tiers
```
GET /api/service-tiers/list
```
Returns: Array of all service tiers with metadata

### Full Configuration
```
GET /api/service-tiers/config
```
Returns: Complete configuration for all tiers

### Tier Status
```
GET /api/service-tiers/{tierName}/status
```
Parameters:
- tierName: b2b, b2c, b2g, b2e, p2p, integration, governance, analytics

### Tier Endpoints
```
GET /api/service-tiers/{tierName}/endpoints
```
Returns: All available endpoints for a specific tier

## B2B Endpoints

### Automation Workflow
```
POST /api/service-tiers/b2b/automation/workflow
```
Body: { process, documents, priority }

### Predictive Analytics
```
POST /api/service-tiers/b2b/analytics/predictive
```
Body: { dataset, horizon }

### Decision Support
```
POST /api/service-tiers/b2b/decision/recommendation
```
Body: { scenario, data }

### Consulting
```
POST /api/service-tiers/b2b/consulting/strategy
```
Body: { company, market, objectives }

## B2C Endpoints

### Create Course
```
POST /api/service-tiers/b2c/education/course
```
Body: { title, description, level, language }

### Career Advice
```
POST /api/service-tiers/b2c/consulting/career-advice
```
Body: { background, interests, goals }

### Productivity Tools
```
POST /api/service-tiers/b2c/productivity/task-manager
```
Body: { tasks, priorities }

### Idea Validation
```
POST /api/service-tiers/b2c/entrepreneurship/idea-validation
```
Body: { idea, market, timeline }

## B2G Endpoints

### Digital Services Design
```
POST /api/service-tiers/b2g/digital-services/design
```
Body: { service, citizens, security }

### Compliance Audit
```
POST /api/service-tiers/b2g/compliance/audit
```
Body: { department, policies, period }

### Strategic Analysis
```
POST /api/service-tiers/b2g/intelligence/strategic-analysis
```
Body: { topic, region, classification }

### Policy Impact Analysis
```
POST /api/service-tiers/b2g/policy/impact-analysis
```
Body: { policy, affected_groups, metric }

## P2P Endpoints

### Share Knowledge
```
POST /api/service-tiers/p2p/knowledge/share
```
Body: { topic, content, language }

### Create Community
```
POST /api/service-tiers/p2p/community/create
```
Body: { name, focus, description }

### Find Partners
```
POST /api/service-tiers/p2p/collaboration/find-partner
```
Body: { skills, interests, project_type }

## Integration Layer

### Gateway Status
```
GET /api/service-tiers/integration/gateway/status
```

### Register Webhook
```
POST /api/service-tiers/integration/webhooks/register
```
Body: { event, url, headers }

### Configure Data Sync
```
POST /api/service-tiers/integration/data-sync/configure
```
Body: { source, destination, frequency }

## Governance Layer

### Sharia Compliance Check
```
POST /api/service-tiers/governance/sharia-compliance/check
```
Body: { transaction, type, details }

### Ethics Audit
```
POST /api/service-tiers/governance/ethics/audit
```
Body: { operation, stakeholders, criteria }

### Audit Trail
```
GET /api/service-tiers/governance/audit/trail
```

## Analytics Layer

### Real-time Dashboard
```
GET /api/service-tiers/analytics/real-time/dashboard
```

### Predictive Forecast
```
POST /api/service-tiers/analytics/predictive/forecast
```
Body: { metric, historical_data, period }

### Competitive Intelligence
```
POST /api/service-tiers/analytics/competitive/analysis
```
Body: { competitors, market, timeframe }

---

## Quick Test

Run all tests:
```bash
bash test-service-tiers.sh
```

---

Last Updated: 2026-06-07
Status: Production Ready ✅
