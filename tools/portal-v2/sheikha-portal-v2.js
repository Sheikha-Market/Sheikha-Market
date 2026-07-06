'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT,p));
const write = (p,c)=>{fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),c);};

const checks = {
  portalRuntime: exists('runtime/portal-v2/v1/sheikha-portal-v2.json'),
  portalRegistry: exists('runtime/portal-v2/v1/registries/portal-registry.json'),
  customerRevenue: exists('runtime/customer-revenue-experience/v1/sheikha-customer-revenue-experience-v1-report.json'),
  customerClassification: exists('runtime/customer-classification/v1/sheikha-customer-classification-v1-report.json'),
  platformEngines: exists('runtime/platform-operating-engines/v1/sheikha-platform-operating-engines-v1-report.json'),
  devopsAiLab: exists('runtime/devops-ai-lab-fabric/v1/sheikha-devops-ai-lab-fabric-v1-report.json'),
  html: exists('public/sheikha-portal-v2/index.html'),
  css: exists('public/sheikha-portal-v2/portal-v2.css'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);

const report = {
  system:'SHEIKHA_PORTAL_V2',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0,100-missing.length*10) : 100,
  decision: missing.length ? 'REVIEW_PORTAL_V2_GAPS' : 'PORTAL_V2_ACTIVE_100',
  checks,
  missing,
  principle:'ولا حول ولا قوة إلا بالله'
};

write('runtime/portal-v2/v1/sheikha-portal-v2-report.json', JSON.stringify(report,null,2)+'\n');
write('runtime/portal-v2/v1/sheikha-portal-v2-report.md', `# SHEIKHA_PORTAL_V2\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report,null,2));
