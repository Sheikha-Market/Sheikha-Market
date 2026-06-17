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
