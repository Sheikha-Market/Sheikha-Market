'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(p){ return fs.existsSync(path.join(ROOT,p)); }
function write(p, content){
  fs.mkdirSync(path.dirname(path.join(ROOT,p)), {recursive:true});
  fs.writeFileSync(path.join(ROOT,p), content);
}

const checks = {
  uiRuntime: exists('runtime/cosmic-portal-ui/v1/sheikha-cosmic-portal-ui-v1.json'),
  html: exists('public/sheikha-ui/index.html'),
  css: exists('public/sheikha-ui/sheikha.css'),
  commercialRealActivation: exists('runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json'),
  providerComputeFabric: exists('runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json'),
  governanceOrchestrator: exists('runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([,ok])=>!ok).map(([k])=>k);

const report = {
  system:'SHEIKHA_COSMIC_PORTAL_UI_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0,100 - missing.length*10) : 100,
  decision: missing.length ? 'REVIEW_COSMIC_PORTAL_UI_GAPS' : 'COSMIC_PORTAL_UI_ACTIVE_100',
  checks,
  missing,
  pages:['HOME','SUPPLIER','BUYER','CONTRACTS','LICENSING','BILLING','REVENUE','CONTROL_CENTER'],
  principle:'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/cosmic-portal-ui/v1/sheikha-cosmic-portal-ui-v1-report.json',
  JSON.stringify(report,null,2)+'\n'
);

write(
  'runtime/cosmic-portal-ui/v1/sheikha-cosmic-portal-ui-v1-report.md',
  `# SHEIKHA_COSMIC_PORTAL_UI_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report,null,2));
