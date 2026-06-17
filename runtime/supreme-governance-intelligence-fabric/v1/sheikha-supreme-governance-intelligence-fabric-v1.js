'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function safeStatus() {
  return {
    success: true,
    system: 'SHEIKHA_SUPREME_GOVERNANCE_INTELLIGENCE_FABRIC_V1',
    status: 'ACTIVE',
    position: 'HIGHEST_GOVERNANCE_INTELLIGENCE_LAYER',
    apexLevel: 12,
    below: [
      'ORCHESTRATOR_FABRIC_L11',
      'FOUNDRY_V3_L10',
      'SUPREME_ORCHESTRATOR',
      'RUNTIME_FABRIC_V5',
      'ENTERPRISE_INSPECTOR_V3',
      'DEVELOPER_TOOLS_APEX_V1',
      'AI_NOTES_GOVERNANCE_AUTOFIX_V1'
    ],
    engines: {
      observability: 'ACTIVE',
      inspectorBinding: exists('core/enterprise/sheikha-enterprise-inspector-v3.js') ? 'BOUND' : 'MISSING',
      developerTools: exists('runtime/developer-tools-apex/v1/sheikha-developer-tools-apex-v1.js') ? 'BOUND' : 'MISSING',
      aiNotesGovernance: exists('runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1.js') ? 'BOUND' : 'MISSING',
      patchEngine: 'GOVERNED_PLAN_ONLY',
      selfHealing: 'SAFE_CHECKS_ONLY',
      autonomousRepair: 'HUMAN_APPROVAL_REQUIRED'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      envProtected: true,
      secretsProtected: true,
      destructiveActionsBlocked: true,
      rollbackRequired: true,
      testsRequiredBeforeCommit: true,
      humanApprovalForCriticalChanges: true
    }
  };
}

function inspect() {
  return {
    ...safeStatus(),
    runtime: {
      cwd: ROOT,
      node: process.version,
      pid: process.pid,
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage()
    },
    files: {
      server: exists('server.js'),
      packageJson: exists('package.json'),
      extension: exists('sheikha-vscode-extension/package.json'),
      inspector: exists('core/enterprise/sheikha-enterprise-inspector-v3.js'),
      developerToolsApex: exists('runtime/developer-tools-apex/v1/sheikha-developer-tools-apex-v1.js'),
      aiNotesGovernance: exists('runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1.js')
    }
  };
}

function classifyFinding(finding = {}) {
  const text = `${finding.message || ''} ${finding.file || ''}`;

  if (/\.env|secret|token|password|private[_-]?key/i.test(text)) {
    return {
      severity: 'CRITICAL',
      action: 'HUMAN_REVIEW_REQUIRED',
      autoFixAllowed: false
    };
  }

  if (/rm -rf|drop table|delete database|truncate|destructive/i.test(text)) {
    return {
      severity: 'HIGH',
      action: 'BLOCK',
      autoFixAllowed: false
    };
  }

  if (/syntax|lint|format|trailing|newline|missing export|command not found/i.test(text)) {
    return {
      severity: 'LOW',
      action: 'SAFE_PATCH_ALLOWED',
      autoFixAllowed: true
    };
  }

  return {
    severity: 'MEDIUM',
    action: 'PLAN_ONLY',
    autoFixAllowed: false
  };
}

function governancePlan(findings = []) {
  const items = findings.map((finding) => ({
    ...finding,
    governance: classifyFinding(finding)
  }));

  return {
    success: true,
    system: 'SHEIKHA_SUPREME_GOVERNANCE_INTELLIGENCE_FABRIC_V1',
    status: 'PLANNED',
    totalFindings: items.length,
    items
  };
}

module.exports = {
  safeStatus,
  inspect,
  classifyFinding,
  governancePlan
};
