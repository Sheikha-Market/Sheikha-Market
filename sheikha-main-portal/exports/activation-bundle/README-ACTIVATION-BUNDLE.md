# Sheikha Activation Bundle

## Purpose
This bundle contains the key operational blueprints, server policies, model files, and training/network state needed to activate and replicate the current Sheikha setup on production VPS.

## Target VPS
- Provider: Hostinger (Malaysia - Kuala Lumpur)
- Host: `srv949321.hstgr.cloud`
- IPv4: `31.97.190.74`
- OS: Ubuntu 24.04 LTS
- Plan: KVM 4 (4 vCPU, 16 GB RAM, 200 GB disk)

## Contact / Identity
- Site: `www.sheikha.top`
- Email: `market@sheikha.top`
- Phone: `+966554942904`

## Included Contents
- `docs/`:
  - Sheikha operating model root
  - Charter and governance references
  - Final binding plan/blueprint
  - Final classification report
- `server/`:
  - Active `server.js`
  - Engine tiering and bindings (`critical-engines.json`, `engines-jawami-final.json`, `bindings.json`)
- `mcp/`:
  - `allowlist.json`
  - `denylist.json`
  - `policies.json`
- `models/`:
  - AI, local-mind, neural-core, agentic files
- `data/`:
  - AI learning/training state
  - production/monitor/pilot state
  - market pretrained data snapshots

## Recommended Upload Path on VPS
- `/root/sheikha-backups/activation-bundle-YYYYMMDD-HHMMSS/`

## Post-Upload Quick Validation
1. Verify file hashes and counts.
2. Confirm MCP policies are mounted read-only.
3. Start stack and check:
   - `/api/health`
   - main market page
   - auth page
   - MCP status tool

