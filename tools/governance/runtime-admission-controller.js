'use strict';

const crypto = require('crypto');
const { execFileSync } = require('child_process');
const os = require('os');
const path = require('path');
const { readStatus } = require('./git-context-reader');

const CLASSIFICATION_RULES = [
  { prefix: '.env', classification: 'REVIEW_REQUIRED', owner: 'Security Governance' },
  { prefix: '.githooks/', classification: 'REVIEW_REQUIRED', owner: 'Governance Automation' },
  { prefix: 'ACTIVATION-', classification: 'ACTIVE', owner: 'Activation Governance' },
  { prefix: 'GLOBAL_MANIFEST.md', classification: 'ACTIVE', owner: 'System Manifest Governance' },
  { prefix: 'PR_', classification: 'REVIEW_REQUIRED', owner: 'Pull Request Governance' },
  { prefix: 'README_', classification: 'ACTIVE', owner: 'Documentation Governance' },
  { prefix: '.gitignore', classification: 'REVIEW_REQUIRED', owner: 'Repository Governance' },
  { prefix: 'deploy_', classification: 'REVIEW_REQUIRED', owner: 'Deployment Governance' },
  { prefix: 'ecosystem.config.js.save', classification: 'REVIEW_REQUIRED', owner: 'Runtime Operations Governance' },
  { prefix: 'eslint', classification: 'REVIEW_REQUIRED', owner: 'Tooling Governance' },
  { prefix: 'package.json', classification: 'REVIEW_REQUIRED', owner: 'Runtime Package Governance' },
  { prefix: 'php-ai-cluster/', classification: 'STAGING', owner: 'PHP AI Cluster Governance' },
  { prefix: 'php-ai-extension/', classification: 'STAGING', owner: 'PHP AI Extension Governance' },
  { prefix: 'release/', classification: 'REVIEW_REQUIRED', owner: 'Release Governance' },
  { prefix: 'setup_', classification: 'REVIEW_REQUIRED', owner: 'Runtime Setup Governance' },
  { prefix: 'core/', classification: 'PROTECTED', owner: 'Runtime Kernel Organization' },
  { prefix: 'runtime/', classification: 'PROTECTED', owner: 'Runtime Governance Organization' },
  { prefix: 'public/executive-civilization-control-center/', classification: 'ACTIVE', owner: 'Executive Observatory Governance' },
  { prefix: 'routes/', classification: 'ACTIVE', owner: 'API Federation Organization' },
  { prefix: 'tools/activation/', classification: 'REVIEW_REQUIRED', owner: 'Activation Governance' },
  { prefix: 'scripts/activate-', classification: 'REVIEW_REQUIRED', owner: 'Activation Governance' },
  { prefix: 'scripts/sheikha-', classification: 'REVIEW_REQUIRED', owner: 'Sheikha Operations Governance' },
  { prefix: 'scripts/universal-', classification: 'REVIEW_REQUIRED', owner: 'Universal Runtime Governance' },
  { prefix: 'scripts/neural-', classification: 'REVIEW_REQUIRED', owner: 'Neural Runtime Governance' },
  { prefix: 'scripts/auto-', classification: 'REVIEW_REQUIRED', owner: 'Runtime Automation Governance' },
  { prefix: 'scripts/patch-', classification: 'REVIEW_REQUIRED', owner: 'Runtime Patch Governance' },
  { prefix: 'scripts/', classification: 'REVIEW_REQUIRED', owner: 'Automation Organization' },
  { prefix: 'docs/', classification: 'ACTIVE', owner: 'Documentation Governance' },
  { prefix: 'topology/', classification: 'EXPERIMENTAL', owner: 'Architecture Organization' },
  { prefix: 'governance/', classification: 'PROTECTED', owner: 'Governance Organization' },
  { prefix: 'lib/runtime/', classification: 'STAGING', owner: 'Runtime Kernel Organization' },
  { prefix: 'sheikha-vscode-extension/', classification: 'STAGING', owner: 'IDE Organization' },
  { prefix: 'tests/', classification: 'STAGING', owner: 'Test Governance Organization' },
  { prefix: 'tools/api-contracts/', classification: 'PROTECTED', owner: 'API Contract Governance Organization' },
  { prefix: 'tools/agi-asi-research-science-fabric/', classification: 'PROTECTED', owner: 'AGI ASI Research Science Fabric Governance Organization' },
  { prefix: 'tools/ai-cluster-pipeline-fabric/', classification: 'PROTECTED', owner: 'AI Cluster Pipeline Fabric Governance Organization' },
  { prefix: 'tools/ai-supercomputer-cloud-cluster-pipeline-fabric/', classification: 'PROTECTED', owner: 'AI Supercomputer Cloud Cluster Pipeline Fabric Governance Organization' },
  { prefix: 'tools/capability-registry/', classification: 'PROTECTED', owner: 'Capability Registry Governance Organization' },
  { prefix: 'tools/cloud-supercomputer-fabric/', classification: 'PROTECTED', owner: 'Cloud Supercomputer Fabric Governance Organization' },
  { prefix: 'tools/commercial-real-activation/', classification: 'PROTECTED', owner: 'Commercial Real Activation Governance Organization' },
  { prefix: 'tools/commercial-product-layer/', classification: 'PROTECTED', owner: 'Commercial Product Governance Organization' },
  { prefix: 'tools/licensing-engine/', classification: 'PROTECTED', owner: 'Licensing Governance Organization' },
  { prefix: 'tools/commercial-governance-engine/', classification: 'PROTECTED', owner: 'Commercial Governance Organization' },
  { prefix: 'tools/commercial-execution-layer/', classification: 'PROTECTED', owner: 'Commercial Execution Governance Organization' },
  { prefix: 'tools/customer-classification/', classification: 'PROTECTED', owner: 'Customer Classification Governance Organization' },
  { prefix: 'tools/development-functions-fabric/', classification: 'PROTECTED', owner: 'Development Functions Fabric Governance Organization' },
  { prefix: 'tools/devops-ai-lab-fabric/', classification: 'PROTECTED', owner: 'DevOps AI Lab Fabric Governance Organization' },
  { prefix: 'tools/governance-generator/', classification: 'PROTECTED', owner: 'Governance Generator Organization' },
  { prefix: 'tools/governed-intelligence-execution-loop/', classification: 'PROTECTED', owner: 'Governed Intelligence Execution Loop Organization' },
  { prefix: 'tools/multi-supercomputer-cloud-fabric/', classification: 'PROTECTED', owner: 'Multi Supercomputer Cloud Fabric Governance Organization' },
  { prefix: 'tools/platform-factories/', classification: 'PROTECTED', owner: 'Platform Factories Governance Organization' },
  { prefix: 'tools/platform-operating-engines/', classification: 'PROTECTED', owner: 'Platform Operating Engines Governance Organization' },
  { prefix: 'tools/resource-intelligence-simulation-fabric/', classification: 'PROTECTED', owner: 'Resource Intelligence Simulation Fabric Governance Organization' },
  { prefix: 'tools/intelligence-integration-fabric/', classification: 'PROTECTED', owner: 'Intelligence Integration Fabric Governance Organization' },
  { prefix: 'tools/root-knowledge-agentic-fabric/', classification: 'PROTECTED', owner: 'Root Knowledge Agentic Fabric Governance Organization' },
  { prefix: 'tools/sdk-fabric-mcp-integration/', classification: 'PROTECTED', owner: 'SDK Fabric MCP Integration Governance Organization' },
  { prefix: 'tools/provider-agreement-roadmap/', classification: 'PROTECTED', owner: 'Provider Agreement Roadmap Governance Organization' },
  { prefix: 'tools/provider-compute-fabric/', classification: 'PROTECTED', owner: 'Provider Compute Fabric Governance Organization' },
  { prefix: 'tools/activate-sheikha-compute-integration-readiness.sh', classification: 'PROTECTED', owner: 'Compute Integration Readiness Governance Organization' },
  { prefix: 'tools/sovereign-commercial-ai-supercluster/', classification: 'PROTECTED', owner: 'Sovereign Commercial AI Supercluster Governance Organization' },
  { prefix: 'tools/ugit-ai-control-plane/', classification: 'PROTECTED', owner: 'UGIT AI Control Plane Governance Organization' },
  { prefix: 'tools/decision-registry/', classification: 'PROTECTED', owner: 'Decision Registry Governance Organization' },
  { prefix: 'tools/governance/', classification: 'PROTECTED', owner: 'Governance Tooling Organization' },
  { prefix: 'tools/runtime/', classification: 'REVIEW_REQUIRED', owner: 'Runtime Tooling Governance' },
  { prefix: 'tools/security/', classification: 'REVIEW_REQUIRED', owner: 'Security Tooling Governance' },
  { prefix: 'sheikha-enterprise-al-portal@', classification: 'REVIEW_REQUIRED', owner: 'Enterprise Portal Governance' }
];

const BLOCKED_PATTERNS = [
  '.env',
  '.pem',
  '.key',
  'id_rsa',
  'secret',
  'password'
];

function getUntrackedFiles() {
  return readStatus()
    .filter(line => line.trim())
    .map(line => line.trimEnd())
    .filter(Boolean)
    .map(line => {
      const status = line.slice(0, 2);
      const file = line.slice(3).trim();
      return file || line.trim();
    });
}

function classify(file) {
  const matched =
    CLASSIFICATION_RULES.find(rule =>
      file.startsWith(rule.prefix)
    );

  if (!matched) {
    return {
      classification: 'REVIEW_REQUIRED'
    };
  }

  return matched;
}

function isEnvTemplate(file) {
  const lower = file.toLowerCase();
  return (
    lower.startsWith('.env') &&
    lower.endsWith('.example')
  );
}

function isSecurityScanArtifact(file) {
  const lower = file.toLowerCase();
  return (
    (
      lower.startsWith('runtime/security/') ||
      lower.startsWith('tools/security/')
    ) &&
    (
      lower.includes('secret-scan') ||
      lower.includes('sensitive-scan') ||
      lower.includes('security-scan')
    ) &&
    !lower.endsWith('.env') &&
    !lower.endsWith('.pem') &&
    !lower.endsWith('.key')
  );
}


// SHEIKHA_WRITTEN_CONTRACT_HASH_PINNING_V1
const WRITTEN_CONTRACT_PATH =
  'runtime/distribution/v6/' +
  'sheikha-v6-written-governance-contract.json';

function readStagedBuffer(file) {
  try {
    return execFileSync(
      'git',
      ['show', `:${file}`],
      {
        encoding: null,
        stdio: [
          'ignore',
          'pipe',
          'ignore'
        ]
      }
    );
  } catch {
    return null;
  }
}

function hashBuffer(value) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

function containsActualSecretMaterial(value) {
  const text = value.toString('utf8');

  const patterns = [
    /\bsk-[A-Za-z0-9_-]{35,}\b/,
    /\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{30,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\b(?:JWT_SECRET|DATA_ENCRYPTION_KEY|PASSWORD_SALT)\s*=\s*['"]?[A-Fa-f0-9]{32,}['"]?/
  ];

  return patterns.some(
    pattern => pattern.test(text)
  );
}

function loadWrittenContract() {
  const staged =
    readStagedBuffer(WRITTEN_CONTRACT_PATH);

  if (!staged) {
    return null;
  }

  let contract;

  try {
    contract = JSON.parse(
      staged.toString('utf8')
    );
  } catch {
    return null;
  }

  const acceptanceText =
    contract.acceptance &&
    contract.acceptance.text;

  const valid = [
    contract.system ===
      'SHEIKHA-V6-WRITTEN-GOVERNANCE-CONTRACT-V1',

    contract.status ===
      'ACTIVE_WRITTEN_ACCEPTED',

    contract.effective === true,

    contract.acceptanceRecorded === true,

    contract.defaultAuthorization ===
      'DENY',

    contract.entryCount === 9,

    Array.isArray(contract.entries),

    contract.entries.length === 9,

    typeof acceptanceText ===
      'string',

    contract.requiredAcceptanceText ===
      acceptanceText,

    contract.requiredAcceptanceTextSha256 ===
      hashBuffer(
        Buffer.from(
          acceptanceText,
          'utf8'
        )
      ),

    contract.acceptance.sha256 ===
      hashBuffer(
        Buffer.from(
          acceptanceText,
          'utf8'
        )
      ),

    contract.permissions &&
      contract.permissions
        .actualSecretMaterial === false,

    contract.permissions &&
      contract.permissions
        .additionalFiles === false,

    contract.permissions &&
      contract.permissions
        .network === false,

    contract.permissions &&
      contract.permissions
        .sudo === false,

    contract.permissions &&
      contract.permissions
        .externalPublishing === false,

    contract.automaticRevocation &&
      contract.automaticRevocation
        .onHashChange === true,

    contract.automaticRevocation &&
      contract.automaticRevocation
        .onPathChange === true,

    contract.automaticRevocation &&
      contract.automaticRevocation
        .onSizeChange === true
  ].every(Boolean);

  return valid
    ? contract
    : null;
}

function getWrittenContractApproval(file) {
  const contract =
    loadWrittenContract();

  if (!contract) {
    return {
      approved: false,
      reason:
        'No active valid written contract'
    };
  }

  const entry =
    contract.entries.find(
      item => item.path === file
    );

  if (!entry) {
    return {
      approved: false,
      reason:
        'Path absent from written contract'
    };
  }

  const staged =
    readStagedBuffer(file);

  if (!staged) {
    return {
      approved: false,
      reason:
        'No staged content'
    };
  }

  if (
    staged.length !== entry.bytes
  ) {
    return {
      approved: false,
      reason:
        'Written contract byte length mismatch'
    };
  }

  if (
    hashBuffer(staged) !==
    entry.sha256
  ) {
    return {
      approved: false,
      reason:
        'Written contract hash mismatch'
    };
  }

  if (
    containsActualSecretMaterial(staged)
  ) {
    return {
      approved: false,
      reason:
        'Actual secret-like material detected'
    };
  }

  return {
    approved: true,
    contractId:
      contract.system,
    contractStatus:
      contract.status,
    entrySha256:
      entry.sha256
  };
}

function isBlocked(file) {
  if (isEnvTemplate(file)) {
    return false;
  }

  if (isSecurityScanArtifact(file)) {
    return false;
  }

  return BLOCKED_PATTERNS.some(pattern =>
    file.toLowerCase().includes(pattern)
  );
}

function evaluateFile(file) {
  const writtenContractApproval =
    getWrittenContractApproval(file);

  if (
    writtenContractApproval.approved
  ) {
    return {
      file,
      decision: 'ALLOWED',
      classification:
        'WRITTEN_CONTRACT_HASH_PINNED',
      owner:
        'Written Governance Contract',
      contractId:
        writtenContractApproval.contractId,
      entrySha256:
        writtenContractApproval.entrySha256
    };
  }

  if (isBlocked(file)) {
    return {
      file,
      decision: 'BLOCKED',
      reason: 'Sensitive or forbidden pattern detected'
    };
  }

  const result = classify(file);

  if (
    result.classification ===
    'REVIEW_REQUIRED'
  ) {
    return {
      file,
      decision: 'REVIEW_REQUIRED',
      reason: result.owner
        ? 'Governance review required'
        : 'No governance ownership',
      owner: result.owner || 'Unassigned Governance Review'
    };
  }

  return {
    file,
    decision: 'ALLOWED',
    classification:
      result.classification
  };
}

function runAdmissionController() {

  const files =
    getUntrackedFiles();

  const evaluations =
    files.map(evaluateFile);

  const blocked =
    evaluations.filter(
      item => item.decision === 'BLOCKED'
    );

  const review =
    evaluations.filter(
      item =>
        item.decision ===
        'REVIEW_REQUIRED'
    );

  const allowed =
    evaluations.filter(
      item => item.decision === 'ALLOWED'
    );

  // سجل تدقيق محلي (audit log)
  try {
    const auditLogPath = path.join(__dirname, 'audit-log.jsonl');
    const auditEntry = {
      timestamp: new Date().toISOString(),
      user: os.userInfo().username,
      cwd: process.cwd(),
      files,
      status: blocked.length > 0 ? 'BLOCKED' : 'ACTIVE',
      blocked: blocked.map(b => b.file),
      review: review.map(r => r.file),
      allowed: allowed.map(a => a.file)
    };
    require('fs').appendFileSync(auditLogPath, JSON.stringify(auditEntry) + '\n');
  } catch (e) {
    // تجاهل أي خطأ في التدقيق
  }
  return {
    runtime:
      'SHEIKHA_RUNTIME_ADMISSION_CONTROLLER',

    status:
      blocked.length > 0
        ? 'BLOCKED'
        : 'ACTIVE',

    totals: {
      files: files.length,
      allowed: allowed.length,
      review: review.length,
      blocked: blocked.length
    },

    principle:
      'لا ضرر ولا ضرار',

    evaluations
  };
}

if (require.main === module) {
  console.log(JSON.stringify(runAdmissionController(), null, 2));
}

module.exports = {
  runAdmissionController,
  evaluateFile,
  isBlocked,
  isSecurityScanArtifact
};
