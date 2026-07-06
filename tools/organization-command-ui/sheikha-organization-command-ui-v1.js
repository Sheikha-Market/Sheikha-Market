'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT,p));
const write = (p,c)=>{fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),c);};

const checks = {
  organizationRuntime: exists('runtime/organization-command-ui/v1/sheikha-organization-command-ui-v1.json'),
  html: exists('public/sheikha-organization/index.html'),
  css: exists('public/sheikha-organization/organization.css'),
  cosmicPortal: exists('runtime/cosmic-portal-ui/v1/sheikha-cosmic-portal-ui-v1-report.json'),
  governanceOrchestrator: exists('runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json'),
  commercialRealActivation: exists('runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json'),
  aiFabric: exists('runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);

const report = {
  system:'SHEIKHA_ORGANIZATION_COMMAND_UI_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0,100-missing.length*10) : 100,
  decision: missing.length ? 'REVIEW_ORGANIZATION_COMMAND_UI_GAPS' : 'ORGANIZATION_COMMAND_UI_ACTIVE_100',
  checks,
  missing,
  principle:'ولا حول ولا قوة إلا بالله'
};

write('runtime/organization-command-ui/v1/sheikha-organization-command-ui-v1-report.json', JSON.stringify(report,null,2)+'\n');
write('runtime/organization-command-ui/v1/sheikha-organization-command-ui-v1-report.md', `# SHEIKHA_ORGANIZATION_COMMAND_UI_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report,null,2));
