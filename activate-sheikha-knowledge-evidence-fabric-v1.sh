#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_KNOWLEDGE_EVIDENCE_FABRIC_V1 =="

mkdir -p runtime/knowledge-evidence-fabric/v1
mkdir -p routes/knowledge-evidence-fabric
mkdir -p tools/knowledge-evidence-fabric
mkdir -p docs/knowledge-evidence-fabric
mkdir -p data/knowledge-evidence-fabric

cat > runtime/knowledge-evidence-fabric/v1/sheikha-knowledge-evidence-fabric-v1.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'knowledge-evidence-fabric');

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function traceId() {
  return `ev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function confidenceFromEvidence(evidence = []) {
  if (evidence.length >= 3) return 'HIGH';
  if (evidence.length >= 1) return 'MEDIUM';
  return 'LOW';
}

function createEvidenceRecord(input = {}) {
  ensureData();

  const record = {
    success: true,
    system: 'SHEIKHA_KNOWLEDGE_EVIDENCE_FABRIC_V1',
    status: 'RECORDED',
    apexLevel: 29,
    traceId: input.traceId || traceId(),
    ts: new Date().toISOString(),
    request: String(input.message || ''),
    agent: input.agent || 'runtime-agent',
    model: input.model || 'Sheikha-Core:latest',
    governance: input.governance || 'SHARIA_GOVERNED',
    confidence: confidenceFromEvidence(input.evidence || []),
    evidence: input.evidence || [],
    memory: input.memory || [],
    artifacts: input.artifacts || [],
    timeline: [
      'REQUEST',
      'SHARIA_GOVERNANCE',
      'MEMORY_LOOKUP',
      'EVIDENCE_RECORD',
      'AGENT_SELECTION',
      'EXECUTION',
      'ARTIFACTS',
      'RESPONSE'
    ]
  };

  fs.writeFileSync(
    path.join(DATA_DIR, `${record.traceId}.json`),
    JSON.stringify(record, null, 2)
  );

  return record;
}

function status() {
  ensureData();
  const records = fs.readdirSync(DATA_DIR).filter((x) => x.endsWith('.json')).length;

  return {
    success: true,
    system: 'SHEIKHA_KNOWLEDGE_EVIDENCE_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 29,
    role: 'TRACEABLE_KNOWLEDGE_EVIDENCE_LAYER',
    records,
    capabilities: [
      'TRACE_ID',
      'EVIDENCE_RECORDING',
      'CONFIDENCE_CLASSIFICATION',
      'SOURCE_LIST',
      'MEMORY_LINKING',
      'ARTIFACT_LINKING',
      'EXECUTION_TIMELINE'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      shariaGovernanceRequired: true,
      noIndependentFatwaClaim: true,
      secretsProtected: true,
      envProtected: true
    }
  };
}

module.exports = {
  status,
  createEvidenceRecord,
  confidenceFromEvidence
};
JS

cat > routes/knowledge-evidence-fabric/sheikha-knowledge-evidence-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  createEvidenceRecord
} = require('../../runtime/knowledge-evidence-fabric/v1/sheikha-knowledge-evidence-fabric-v1');

router.get('/api/sheikha/knowledge-evidence-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/knowledge-evidence-fabric/v1/record', (req, res) => {
  res.json(createEvidenceRecord(req.body || {}));
});

module.exports = router;
JS

cat > tools/knowledge-evidence-fabric/sheikha-knowledge-evidence-fabric-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  createEvidenceRecord
} = require('../../runtime/knowledge-evidence-fabric/v1/sheikha-knowledge-evidence-fabric-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'record') {
  console.log(JSON.stringify(createEvidenceRecord({
    message: process.argv.slice(3).join(' ') || 'اختبار دليل معرفة',
    evidence: [{ source: 'local-runtime', type: 'test' }],
    memory: [{ source: 'session' }],
    artifacts: []
  }), null, 2));
} else {
  console.error('Usage: status|record <message>');
  process.exit(1);
}
JS

chmod +x tools/knowledge-evidence-fabric/sheikha-knowledge-evidence-fabric-cli.js

cat > docs/knowledge-evidence-fabric/SHEIKHA-KNOWLEDGE-EVIDENCE-FABRIC-V1.md <<'MD'
# SHEIKHA_KNOWLEDGE_EVIDENCE_FABRIC_V1

APEX LEVEL 29.

طبقة أدلة ومعرفة تجعل مخرجات شيخة قابلة للتتبع والمراجعة.

## المسار

User → Sharia Governance → Knowledge Evidence → Autonomous Execution → Agent Mesh → Sheikha-Core → Response

## الضوابط

- لا ضرر ولا ضرار.
- حماية الأسرار.
- حماية `.env`.
- لا فتوى مستقلة.
- حفظ Trace ID لكل طلب.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/knowledge-evidence-fabric/sheikha-knowledge-evidence-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-knowledge-evidence-fabric] route mount skipped:', error.message);
}
"""

if "sheikha-knowledge-evidence-fabric" not in s:
    marker = "app.use(express.json"
    idx = s.find(marker)
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find server.js insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Checks =="
node --check server.js
node --check runtime/knowledge-evidence-fabric/v1/sheikha-knowledge-evidence-fabric-v1.js
node --check routes/knowledge-evidence-fabric/sheikha-knowledge-evidence-fabric-routes.js
node --check tools/knowledge-evidence-fabric/sheikha-knowledge-evidence-fabric-cli.js

echo "== CLI tests =="
node tools/knowledge-evidence-fabric/sheikha-knowledge-evidence-fabric-cli.js status | jq '.system,.status,.apexLevel'
node tools/knowledge-evidence-fabric/sheikha-knowledge-evidence-fabric-cli.js record "اختبار دليل معرفة" | jq '.traceId,.confidence,.timeline'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API tests =="
curl -s http://127.0.0.1:8080/api/sheikha/knowledge-evidence-fabric/v1/status | jq
curl -s -X POST http://127.0.0.1:8080/api/sheikha/knowledge-evidence-fabric/v1/record \
  -H "Content-Type: application/json" \
  -d '{"message":"اختبار من API","agent":"governance-agent","model":"Sheikha-Core:latest","evidence":[{"source":"api-test","type":"runtime"}]}' | jq '.traceId,.confidence,.status'

echo "== Done =="
