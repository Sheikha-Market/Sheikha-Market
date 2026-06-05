'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT,p));
const write = (p,c)=>{fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),c);};

const checks = {
  engine: exists('runtime/platform-operating-engines/v1/sheikha-platform-operating-engines-v1.json'),
  identity: exists('runtime/platform-operating-engines/v1/registries/identity-engine.json'),
  experts: exists('runtime/platform-operating-engines/v1/registries/expert-registry.json'),
  community: exists('runtime/platform-operating-engines/v1/registries/community-engine.json'),
  research: exists('runtime/platform-operating-engines/v1/registries/research-engine.json'),
  innovation: exists('runtime/platform-operating-engines/v1/registries/innovation-engine.json'),
  marketplace: exists('runtime/platform-operating-engines/v1/registries/marketplace-engine.json'),
  socialInnovation: exists('runtime/specialized-social-innovation/v1/sheikha-specialized-social-innovation-v1-report.json'),
  databaseKnowledge: exists('runtime/database-knowledge-engine/v1/sheikha-database-knowledge-engine-v1-report.json'),
  html: exists('public/sheikha-platform/index.html'),
  css: exists('public/sheikha-platform/platform.css'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const report = {
  system:'SHEIKHA_PLATFORM_OPERATING_ENGINES_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0,100-missing.length*8) : 100,
  decision: missing.length ? 'REVIEW_PLATFORM_OPERATING_ENGINES_GAPS' : 'PLATFORM_OPERATING_ENGINES_ACTIVE_100',
  checks,
  missing,
  principle:'ولا حول ولا قوة إلا بالله'
};

write('runtime/platform-operating-engines/v1/sheikha-platform-operating-engines-v1-report.json', JSON.stringify(report,null,2)+'\n');
write('runtime/platform-operating-engines/v1/sheikha-platform-operating-engines-v1-report.md', `# SHEIKHA_PLATFORM_OPERATING_ENGINES_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report,null,2));
