'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT,p));
const write = (p,c)=>{fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),c);};

const checks = {
  runtime: exists('runtime/role-based-dashboard-ui/v1/sheikha-role-based-dashboard-ui-v1.json'),
  html: exists('public/sheikha-dashboards/index.html'),
  css: exists('public/sheikha-dashboards/dashboards.css'),
  js: exists('public/sheikha-dashboards/dashboards.js'),
  organizationCommandUi: exists('runtime/organization-command-ui/v1/sheikha-organization-command-ui-v1-report.json'),
  cosmicPortal: exists('runtime/cosmic-portal-ui/v1/sheikha-cosmic-portal-ui-v1-report.json'),
  commercialRealActivation: exists('runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);

const report = {
  system:'SHEIKHA_ROLE_BASED_DASHBOARD_UI_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0,100-missing.length*10) : 100,
  decision: missing.length ? 'REVIEW_ROLE_BASED_DASHBOARD_UI_GAPS' : 'ROLE_BASED_DASHBOARD_UI_ACTIVE_100',
  checks,
  missing,
  principle:'ولا حول ولا قوة إلا بالله'
};

write('runtime/role-based-dashboard-ui/v1/sheikha-role-based-dashboard-ui-v1-report.json', JSON.stringify(report,null,2)+'\n');
write('runtime/role-based-dashboard-ui/v1/sheikha-role-based-dashboard-ui-v1-report.md', `# SHEIKHA_ROLE_BASED_DASHBOARD_UI_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report,null,2));
