const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

const report = {
  report: 'SHEIKHA_SOURCE_CONTROL_AND_ROUTE_ALIGNMENT_AUDIT',
  status: 'ACTIVE',
  git: {
    status: sh('git status -sb'),
    branch: sh('git branch --show-current'),
    remotes: sh('git remote -v'),
    lastCommit: sh('git log --oneline -1')
  },
  runtime: {
    fabricRoutesJson: fs.existsSync('runtime/fabric-bootstrap/sheikha-fabric-routes.json'),
    fabricLoader: fs.existsSync('lib/fabric-bootstrap/fabric-bootstrap-loader.js'),
    canonicalRouteRegistry: fs.existsSync('runtime/architecture-validation/canonical-routes/sheikha-canonical-route-registry.json'),
    routeSourceDiscovery: fs.existsSync('runtime/architecture-validation/route-source-discovery/sheikha-route-source-discovery.json')
  },
  checks: {
    fabricJsonValid: sh("python3 -m json.tool runtime/fabric-bootstrap/sheikha-fabric-routes.json >/dev/null && echo OK"),
    fabricLoaderSyntax: sh("node --check lib/fabric-bootstrap/fabric-bootstrap-loader.js"),
    serverSyntax: sh("node --check server.js")
  },
  decision: {
    github: 'PRIMARY_REMOTE',
    gitlab: 'MIRROR_ONLY_UNTIL_CONFIGURED',
    vscode: 'CLIENT_ONLY',
    codex: 'CLIENT_ONLY',
    fabric: 'ROUTE_MOUNT_AUTHORITY',
    canonicalRegistry: 'QUALITY_ALIGNMENT_REFERENCE'
  },
  rules: {
    noConflictBetweenGitHubGitLabGitVSCode: true,
    noDirectMountConflictWithFabric: true,
    noDeletionWithoutCanonicalReview: true,
    allRoutesMustAlignToCanonicalRegistry: true
  },
  timestamp: new Date().toISOString()
};

const outDir = path.join(process.cwd(), 'runtime/architecture-validation/unified-source-control');
fs.mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, 'sheikha-source-control-alignment-audit.json');
fs.writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  status: report.status,
  branch: report.git.branch,
  lastCommit: report.git.lastCommit,
  output: outFile
}, null, 2));
