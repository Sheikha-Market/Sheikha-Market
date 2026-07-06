'use strict';

const fs = require('fs');
const path = require('path');
const policy = require('./sheikha-storage-governance-v1.json');

const projectRoot = path.join(__dirname, '../../..');

function bytes(value) {
  return Number(typeof value === 'bigint' ? value : BigInt(value || 0));
}

function round(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function classifyUsage(usedPercent) {
  if (usedPercent >= policy.thresholds.criticalPercent) return 'CRITICAL';
  if (usedPercent >= policy.thresholds.highPercent) return 'HIGH';
  if (usedPercent >= policy.thresholds.warningPercent) return 'WARNING';
  return 'NORMAL';
}

function filesystemSnapshot(targetPath = projectRoot) {
  const stats = fs.statfsSync(targetPath, { bigint: true });
  const totalBytes = bytes(stats.blocks * stats.bsize);
  const freeBytes = bytes(stats.bavail * stats.bsize);
  const usedBytes = Math.max(0, totalBytes - freeBytes);
  const usedPercent = totalBytes ? round((usedBytes / totalBytes) * 100) : 0;

  return {
    targetPath,
    totalBytes,
    usedBytes,
    freeBytes,
    usedPercent,
    severity: classifyUsage(usedPercent)
  };
}

function normalizeInventory(items = []) {
  return items
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      path: String(item.path || '').slice(0, 500),
      sizeBytes: Math.max(0, Number(item.sizeBytes) || 0),
      kind: item.kind === 'directory' ? 'directory' : 'file',
      tracked: item.tracked === true
    }))
    .filter(item => item.path)
    .sort((left, right) => right.sizeBytes - left.sizeBytes);
}

function isProtected(relativePath) {
  return policy.protectedPaths.some(protectedPath =>
    relativePath === protectedPath || relativePath.startsWith(`${protectedPath}/`)
  );
}

function plan(input = {}) {
  const inventory = normalizeInventory(input.inventory);
  const candidates = inventory
    .filter(item => item.sizeBytes >= policy.thresholds.largeAssetBytes)
    .map(item => ({
      ...item,
      protected: isProtected(item.path),
      decision: isProtected(item.path)
        ? 'PROTECTED_PATH_REVIEW_REQUIRED'
        : 'EXTERNAL_ARCHIVE_REVIEW_REQUIRED'
    }));

  return {
    engine: 'SHEIKHA_STORAGE_GOVERNANCE_PLANNER_V1',
    status: 'PLAN_READY_FOR_HUMAN_REVIEW',
    candidates,
    steps: [
      'VERIFY_BUSINESS_OWNER',
      'CALCULATE_AND_RECORD_CHECKSUM',
      'VERIFY_EXTERNAL_ARCHIVE_DESTINATION',
      'COPY_WITHOUT_REMOVING_SOURCE',
      'VERIFY_ARCHIVE_COPY_AND_RECOVERY',
      'RECORD_EVIDENCE_IN_MASTER_LOG_CENTER',
      'OBTAIN_EXPLICIT_HUMAN_APPROVAL'
    ],
    prohibitedAutomation: [
      'AUTOMATIC_DELETE',
      'AUTOMATIC_MOVE',
      'UNVERIFIED_SOURCE_REMOVAL',
      'PROTECTED_RUNTIME_REMOVAL'
    ],
    decision: candidates.length
      ? 'STORAGE_REMEDIATION_REVIEW_REQUIRED'
      : 'NO_LARGE_ASSET_ACTION_REQUIRED'
  };
}

function status(options = {}) {
  const filesystem = options.filesystem || filesystemSnapshot(options.targetPath);
  const severity = classifyUsage(Number(filesystem.usedPercent) || 0);
  return {
    system: policy.system,
    status: 'ACTIVE_READ_ONLY_GOVERNANCE',
    mode: policy.mode,
    filesystem: { ...filesystem, severity },
    decision: severity === 'CRITICAL'
      ? 'IMMEDIATE_HUMAN_STORAGE_REVIEW_REQUIRED'
      : severity === 'HIGH'
        ? 'PRIORITY_STORAGE_REVIEW_REQUIRED'
        : severity === 'WARNING'
          ? 'STORAGE_MONITORING_REQUIRED'
          : 'STORAGE_WITHIN_POLICY',
    integratesWith: [
      'SHEIKHA_MASTER_LOG_CENTER_V1',
      'SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1',
      'SHEIKHA_UNIFIED_APEX_ACTIVATION_V1'
    ],
    governanceReferences: policy.governanceReferences,
    rules: policy.rules
  };
}

module.exports = {
  policy,
  classifyUsage,
  filesystemSnapshot,
  normalizeInventory,
  plan,
  status
};
