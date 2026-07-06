'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

function exists(p){ return fs.existsSync(path.join(ROOT,p)); }
function write(p,c){
  fs.mkdirSync(path.dirname(path.join(ROOT,p)), { recursive:true });
  fs.writeFileSync(path.join(ROOT,p), c);
}

const checks = {
  engine: exists('runtime/database-knowledge-engine/v1/sheikha-database-knowledge-engine-v1.json'),
  schemaRegistry: exists('runtime/database-knowledge-engine/v1/registries/database-schema-registry.json'),
  contentGovernance: exists('runtime/database-knowledge-engine/v1/registries/content-governance-registry.json'),
  knowledgeEngine: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  governanceOrchestrator: exists('runtime/governance-orchestrator/v1/sheikha-governance-orchestrator-v1-report.json'),
  organizationCommandUi: exists('runtime/organization-command-ui/v1/sheikha-organization-command-ui-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);

const report = {
  system: 'SHEIKHA_DATABASE_KNOWLEDGE_ENGINE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0,100-missing.length*10) : 100,
  decision: missing.length ? 'REVIEW_DATABASE_KNOWLEDGE_ENGINE_GAPS' : 'DATABASE_KNOWLEDGE_ENGINE_ACTIVE_100',
  checks,
  missing,
  modules: [
    'QURAN_KNOWLEDGE',
    'SUNNAH_KNOWLEDGE',
    'APPLIED_SCIENCES',
    'AI_TECHNOLOGY',
    'SPECIALIZED_WIKI',
    'COMMUNITY_FORUM',
    'INNOVATION_LAB',
    'UNIVERSITY_PARTNERS',
    'SOCIETAL_SOLUTIONS'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/database-knowledge-engine/v1/sheikha-database-knowledge-engine-v1-report.json',
  JSON.stringify(report,null,2)+'\n'
);

write(
  'runtime/database-knowledge-engine/v1/sheikha-database-knowledge-engine-v1-report.md',
  `# SHEIKHA_DATABASE_KNOWLEDGE_ENGINE_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report,null,2));
