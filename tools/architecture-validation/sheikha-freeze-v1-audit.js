const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (e) {
    return `ERROR: ${e.message}`;
  }
}

const report = {
  report: "SHEIKHA_ARCHITECTURE_FREEZE_V1_AUDIT",
  status: "ACTIVE",
  git: {
    status: sh("git status -sb"),
    branch: sh("git branch --show-current"),
    lastCommit: sh("git log --oneline -1"),
    remotes: sh("git remote -v")
  },
  checks: {
    freezeJson: sh("python3 -m json.tool runtime/architecture-freeze/v1/sheikha-architecture-freeze-v1.json >/dev/null && echo OK"),
    sdkJson: sh("python3 -m json.tool runtime/sdk-layer/sheikha-sdk-layer.json >/dev/null && echo OK"),
    googleJson: sh("python3 -m json.tool runtime/external-alignment/google-cloud/sheikha-google-cloud-alignment.json >/dev/null && echo OK"),
    fabricJson: sh("python3 -m json.tool runtime/fabric-bootstrap/sheikha-fabric-routes.json >/dev/null && echo OK"),
    serverSyntax: sh("node --check server.js"),
    fabricLoaderSyntax: sh("node --check lib/fabric-bootstrap/fabric-bootstrap-loader.js")
  },
  githubPullRequests: sh("command -v gh >/dev/null && gh pr list --state open || echo 'gh_cli_not_available_or_not_authenticated'"),
  googleCloud: sh("command -v gcloud >/dev/null && gcloud config list --format=json || echo 'gcloud_not_available_or_not_authenticated'"),
  decision: {
    architectureFreezeV1: "ACTIVE_BASELINE",
    sdkLayer: "ACTIVE_INTERFACE_LAYER",
    googleCloud: "ALIGNMENT_ONLY_UNTIL_AUTH_AND_API_AUDIT",
    githubPRs: "REVIEW_REQUIRED_BEFORE_MERGE",
    noConflictMode: true
  },
  timestamp: new Date().toISOString()
};

const outDir = path.join(process.cwd(), "runtime/architecture-freeze/v1");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "sheikha-architecture-freeze-v1-audit.json"),
  JSON.stringify(report, null, 2) + "\n"
);

console.log(JSON.stringify({
  status: report.status,
  branch: report.git.branch,
  lastCommit: report.git.lastCommit,
  output: "runtime/architecture-freeze/v1/sheikha-architecture-freeze-v1-audit.json"
}, null, 2));
