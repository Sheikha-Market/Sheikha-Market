'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT,p));
const write = (p,c)=>{fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),c);};

const checks = {
  engine: exists('runtime/specialized-social-innovation/v1/sheikha-specialized-social-innovation-v1.json'),
  taxonomy: exists('runtime/specialized-social-innovation/v1/registries/community-taxonomy.json'),
  pipeline: exists('runtime/specialized-social-innovation/v1/registries/issue-to-product-pipeline.json'),
  gitIntegration: exists('runtime/specialized-social-innovation/v1/registries/git-knowledge-integration.json'),
  databaseKnowledgeEngine: exists('runtime/database-knowledge-engine/v1/sheikha-database-knowledge-engine-v1-report.json'),
  organizationCommandUi: exists('runtime/organization-command-ui/v1/sheikha-organization-command-ui-v1-report.json'),
  html: exists('public/riyadh-aljannah-community/index.html'),
  css: exists('public/riyadh-aljannah-community/community.css'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);

const report = {
  system:'SHEIKHA_SPECIALIZED_SOCIAL_INNOVATION_ECOSYSTEM_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0,100-missing.length*8) : 100,
  decision: missing.length ? 'REVIEW_SPECIALIZED_SOCIAL_INNOVATION_GAPS' : 'SPECIALIZED_SOCIAL_INNOVATION_ACTIVE_100',
  checks,
  missing,
  outputs:[
    'COMMUNITY_DISCUSSION',
    'SPECIALIZED_WIKI',
    'ISSUE_TO_SOLUTION',
    'PROTOTYPE',
    'RESEARCH_PAPER',
    'CERTIFICATE',
    'LICENSE',
    'PRODUCT'
  ],
  principle:'ولا حول ولا قوة إلا بالله'
};

write('runtime/specialized-social-innovation/v1/sheikha-specialized-social-innovation-v1-report.json', JSON.stringify(report,null,2)+'\n');
write('runtime/specialized-social-innovation/v1/sheikha-specialized-social-innovation-v1-report.md', `# SHEIKHA_SPECIALIZED_SOCIAL_INNOVATION_ECOSYSTEM_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report,null,2));
