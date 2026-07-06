'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const exists = p => fs.existsSync(path.join(ROOT, p));
const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), c);
};

const checks = {
  engine: exists('runtime/admin-methodology-information-impact-os-v1/v1/sheikha-admin-methodology-information-impact-os-v1.json'),
  methodologies: exists('runtime/admin-methodology-information-impact-os-v1/v1/registries/admin-methodologies.json'),
  procedures: exists('runtime/admin-methodology-information-impact-os-v1/v1/registries/admin-procedures.json'),
  forms: exists('runtime/admin-methodology-information-impact-os-v1/v1/registries/admin-forms.json'),
  informationFlow: exists('runtime/admin-methodology-information-impact-os-v1/v1/registries/information-flow-map.json'),
  valueMap: exists('runtime/admin-methodology-information-impact-os-v1/v1/registries/information-impact-value-map.json'),
  bindings: exists('runtime/admin-methodology-information-impact-os-v1/v1/registries/os-bindings.json'),
  docs: exists('docs/admin-methodology-information-impact-os-v1/SHEIKHA-ADMIN-METHODOLOGY-INFORMATION-IMPACT-OS-V1.md'),
  projectLifecycle: exists('runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1-report.json'),
  workflowAutomation: exists('runtime/workflow-automation-engine-v1/v1/sheikha-workflow-automation-engine-v1-report.json'),
  marketplaceOS: exists('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json'),
  executiveDecision: exists('runtime/executive-decision-engine-v1/v1/sheikha-executive-decision-engine-v1-report.json'),
  governanceGenerator: exists('runtime/governance-generator/v1/sheikha-governance-generator-v1-report.json'),
  unifiedDataFabric: exists('runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const methodologies = readJson('runtime/admin-methodology-information-impact-os-v1/v1/registries/admin-methodologies.json').methodologies;
const procedures = readJson('runtime/admin-methodology-information-impact-os-v1/v1/registries/admin-procedures.json').procedures;
const forms = readJson('runtime/admin-methodology-information-impact-os-v1/v1/registries/admin-forms.json').forms;
const flows = readJson('runtime/admin-methodology-information-impact-os-v1/v1/registries/information-flow-map.json').flows;
const valueMappings = readJson('runtime/admin-methodology-information-impact-os-v1/v1/registries/information-impact-value-map.json').valueMappings;
const bindings = readJson('runtime/admin-methodology-information-impact-os-v1/v1/registries/os-bindings.json').bindings;

const report = {
  system: 'SHEIKHA_ADMIN_METHODOLOGY_INFORMATION_IMPACT_OS_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_ADMIN_METHODOLOGY_INFORMATION_IMPACT_OS_V1_GAPS' : 'ADMIN_METHODOLOGY_INFORMATION_IMPACT_OS_V1_ACTIVE_100',
  checks,
  missing,
  coverage: {
    methodologies: methodologies.length,
    procedures: procedures.length,
    forms: forms.length,
    informationFlows: flows.length,
    valueMappings: valueMappings.length,
    bindings: bindings.length
  },
  cycle: ["INFORMATION","SOURCE_VERIFICATION","CLASSIFICATION","IMPACT_ANALYSIS","VALUE_CONVERSION","DECISION","EXECUTION","MEASUREMENT","IMPROVEMENT","KNOWLEDGE_CAPTURE"],
  values: ["ECONOMIC_VALUE","COMMERCIAL_VALUE","TECHNICAL_VALUE","DEVELOPMENT_IMPACT"],
  principle: 'عبادة الله وإعمار الأرض بالحق والعدل والإحسان، ولا حول ولا قوة إلا بالله'
};

write('runtime/admin-methodology-information-impact-os-v1/v1/sheikha-admin-methodology-information-impact-os-v1-report.json', JSON.stringify(report, null, 2) + '\n');
write('runtime/admin-methodology-information-impact-os-v1/v1/sheikha-admin-methodology-information-impact-os-v1-report.md', `# SHEIKHA_ADMIN_METHODOLOGY_INFORMATION_IMPACT_OS_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

المقصد: عبادة الله وإعمار الأرض بالحق والعدل والإحسان.

ولا حول ولا قوة إلا بالله.
`);

console.log(JSON.stringify(report, null, 2));
