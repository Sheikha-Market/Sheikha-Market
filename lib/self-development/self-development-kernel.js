const fs = require('fs');
const path = require('path');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8'));
}

function getSelfDevelopmentStatus() {
  const policy = readJson('runtime/self-development/sheikha-self-development-policy.json');

  return {
    success: true,
    kernel: policy.system,
    status: policy.status,
    mode: policy.mode,
    independence: policy.independence,
    rules: policy.rules,
    loop: policy.improvementLoop,
    authority: {
      sheikhaLayer: 'governing-runtime-layer',
      humanApproval: 'required',
      vscode: 'client-interface-only',
      copilot: 'external-advisor-only',
      github: 'source-control-and-publishing-only'
    },
    timestamp: new Date().toISOString()
  };
}

function createImprovementProposal({ title, target, reason, tests }) {
  const id = `proposal-${Date.now()}`;
  const proposal = {
    id,
    title,
    target,
    reason,
    tests: tests || ['node --check', 'npm run lint'],
    status: 'PROPOSED_NOT_APPLIED',
    approvalRequired: true,
    rollbackRequired: true,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(process.cwd(), `runtime/self-development/proposals/${id}.json`),
    JSON.stringify(proposal, null, 2)
  );

  return proposal;
}

module.exports = {
  getSelfDevelopmentStatus,
  createImprovementProposal
};
