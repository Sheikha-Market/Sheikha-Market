'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-reviewer-assignment-audit-drift-guard-v1.json'
);

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function readBytes(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath));
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function assignmentIds(registry) {
  return (registry.assignments || [])
    .map((item) => item.assignmentId)
    .filter(Boolean)
    .sort();
}

function findLatestAudit(ledger) {
  const records = Array.isArray(ledger.records) ? ledger.records : [];
  return records.length > 0 ? records[records.length - 1] : null;
}

function verifyAuditChain(ledger) {
  const records = Array.isArray(ledger.records) ? ledger.records : [];
  const findings = [];

  for (let index = 1; index < records.length; index += 1) {
    const previous = records[index - 1];
    const current = records[index];

    if (current.preStateSha256 !== previous.postStateSha256) {
      findings.push({
        index,
        auditId: current.auditId || null,
        type: 'HASH_CHAIN_BREAK',
      });
    }

    if (
      current.preRecordCount !== null &&
      previous.postRecordCount !== null &&
      current.preRecordCount !== previous.postRecordCount
    ) {
      findings.push({
        index,
        auditId: current.auditId || null,
        type: 'RECORD_COUNT_CHAIN_BREAK',
      });
    }
  }

  return {
    valid: findings.length === 0,
    findings,
  };
}

function inspectAssignmentDrift() {
  const config = readConfig();
  const registry = readJson(config.registrySource);
  const bytes = readBytes(config.registrySource);
  const ledger = readJson(config.auditLedgerSource);
  const writePlans = readJson(config.writePlanSource);
  const commitIntents = readJson(config.commitIntentSource);
  const proposals = readJson(config.proposalSource);
  const ratifications = readJson(config.ratificationSource);

  const currentHash = sha256(bytes);
  const currentCount = (registry.assignments || []).length;
  const currentAssignmentIds = assignmentIds(registry);
  const latestAudit = findLatestAudit(ledger);
  const chain = verifyAuditChain(ledger);

  const baselineHash = latestAudit?.postStateSha256 || null;
  const baselineCount = latestAudit?.postRecordCount ?? null;
  const hashMatchesBaseline =
    Boolean(baselineHash) && baselineHash === currentHash;
  const recordCountMatchesBaseline =
    baselineCount !== null && baselineCount === currentCount;

  const driftDetected =
    !hashMatchesBaseline ||
    !recordCountMatchesBaseline ||
    !chain.valid;

  const latestChangeClaimed =
    latestAudit && latestAudit.eventType !== 'GENESIS_BASELINE';

  const evidenceCompleteness = latestChangeClaimed
    ? {
        writePlanRef: Boolean(latestAudit.writePlanRef),
        commitIntentRef: Boolean(latestAudit.commitIntentRef),
        proposalId: Boolean(latestAudit.proposalId),
        ratificationRef: Boolean(latestAudit.ratificationRef),
        authorizedWriteClaim:
          latestAudit.authorizedWriteClaim === true,
      }
    : {
        writePlanRef: true,
        commitIntentRef: true,
        proposalId: true,
        ratificationRef: true,
        authorizedWriteClaim: true,
      };

  const missingEvidence = Object.entries(evidenceCompleteness)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  const status =
    driftDetected || missingEvidence.length > 0
      ? 'DRIFT_OR_AUDIT_GAP_DETECTED'
      : 'CLEAR';

  return {
    system: config.system,
    version: config.version,
    status,
    mode: config.mode,
    governance: config.governance,
    summary: {
      assignmentRecords: currentCount,
      auditRecords: Array.isArray(ledger.records)
        ? ledger.records.length
        : 0,
      writePlanRecords: Array.isArray(writePlans.records)
        ? writePlans.records.length
        : 0,
      commitIntentRecords: Array.isArray(commitIntents.records)
        ? commitIntents.records.length
        : 0,
      proposalRecords: Array.isArray(proposals.records)
        ? proposals.records.length
        : 0,
      ratificationRecords: Array.isArray(ratifications.records)
        ? ratifications.records.length
        : 0,
      driftDetected: driftDetected ? 1 : 0,
      auditChainBreaks: chain.findings.length,
      auditEvidenceGaps: missingEvidence.length,
      automaticRepairsPerformed: 0,
    },
    currentState: {
      sha256: currentHash,
      recordCount: currentCount,
      assignmentIds: currentAssignmentIds,
    },
    baseline: latestAudit
      ? {
          auditId: latestAudit.auditId || null,
          eventType: latestAudit.eventType || null,
          postStateSha256: latestAudit.postStateSha256 || null,
          postRecordCount: latestAudit.postRecordCount ?? null,
        }
      : null,
    checks: {
      hashMatchesBaseline,
      recordCountMatchesBaseline,
      auditChainValid: chain.valid,
      auditEvidenceComplete: missingEvidence.length === 0,
    },
    findings: {
      chain: chain.findings,
      missingEvidence,
    },
    decision:
      status === 'CLEAR'
        ? 'ALLOW_READ_ONLY_STATE'
        : 'DENY_ASSIGNMENT_WRITE_UNTIL_RECONCILED',
    repairPerformed: false,
    rollbackPerformed: false,
    assignmentMutationPerformed: false,
  };
}

function buildAuditDriftGuardStatus() {
  return inspectAssignmentDrift();
}

module.exports = {
  buildAuditDriftGuardStatus,
  inspectAssignmentDrift,
  verifyAuditChain,
};
