# Status Route Classification

## Current Finding
Most `/status` handlers are not exact duplicates. They are namespace-local handlers mounted under different API prefixes.

## High-cost candidates
- routes/live-ai.js
- routes/neural.js
- routes/neural-erp-scm-admin.js
- routes/universal-sovereign.js
- routes/sheikha-network.js

## Do not touch yet
- routes/health/*
- routes/readiness/*
- routes/telemetry/*

## Next rule
Do not delete status routes blindly. First identify:
1. mount prefix
2. dependency cost
3. dynamic require/import usage
4. synchronous filesystem access
5. response allocation size
