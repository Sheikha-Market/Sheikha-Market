const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 20000 }).trim();
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

const report = {
  report: "SHEIKHA_PR_GOVERNANCE_AUDIT",
  status: "ACTIVE",
  baseline: "SHEIKHA_ARCHITECTURE_FREEZE_V1_1",
  git: {
    branch: sh("git branch --show-current"),
    status: sh("git status -sb"),
    lastCommit: sh("git log --oneline -1"),
    remotes: sh("git remote -v")
  },
  github: {
    openPullRequests: sh("gh pr list --state open"),
    note: "If GitHub API times out, do not merge manually. Retry after network stabilizes."
  },
  checks: {
    fabricJson: sh("python3 -m json.tool runtime/fabric-bootstrap/sheikha-fabric-routes.json >/dev/null && echo OK"),
    freezeV11: sh("python3 -m json.tool runtime/architecture-freeze/v1.1/sheikha-architecture-freeze-v1.1.json >/dev/null && echo OK"),
    federalOrg: sh("python3 -m json.tool runtime/federal-organization/v1.2/sheikha-federal-organization-v1.2.json >/dev/null && echo OK"),
    prGovernance: sh("python3 -m json.tool runtime/pr-governance/activation/sheikha-pr-activation-governance.json >/dev/null && echo OK"),
    serverSyntax: sh("node --check server.js"),
    lint: sh("npm run lint")
  },
  mergeDecision: {
    autoMergeAllowed: false,
    humanApprovalRequired: true,
    requiredBeforeMerge: [
      "GitHub PR list must be readable",
      "PR must be classified",
      "Freeze V1.1 compatibility must pass",
      "Fabric and route conflicts must pass",
      "Tests and lint must pass",
      "Secrets must not be committed"
    ]
  },
  timestamp: new Date().toISOString()
};

const outDir = path.join(process.cwd(), "runtime/pr-governance/activation");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "sheikha-pr-governance-audit.json"),
  JSON.stringify(report, null, 2) + "\n"
);

console.log(JSON.stringify({
  status: report.status,
  branch: report.git.branch,
  lastCommit: report.git.lastCommit,
  output: "runtime/pr-governance/activation/sheikha-pr-governance-audit.json"
}, null, 2));
