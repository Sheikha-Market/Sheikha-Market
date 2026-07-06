const fs = require('fs');
const path = require('path');

const checks = [
  ['governance', 'runtime/quran-sunnah-governance/sheikha-quran-sunnah-governance.json'],
  ['chatCodeGovernance', 'runtime/chat-code-governance/sheikha-chat-code-behavior-governance.json'],
  ['federalOrganization', 'runtime/federal-organization/v1.2/sheikha-federal-organization-v1.2.json'],
  ['architectureFreeze', 'runtime/architecture-freeze/v1.3/sheikha-architecture-freeze-v1.3.json'],
  ['knowledge', 'runtime/knowledge/v1/sheikha-knowledge-v1.json'],
  ['editorCore', 'runtime/editor-core/v1/sheikha-editor-core-v1.json'],
  ['architectureIntelligence', 'runtime/architecture-intelligence/v1/sheikha-architecture-intelligence-v1.json'],
  ['operationLoop', 'runtime/operation-loop/v1/sheikha-operation-loop-v1.json'],
  ['patchEngine', 'runtime/patch-engine/v1/sheikha-patch-engine-v1.json'],
  ['curatedMergeEngine', 'runtime/curated-merge-engine/v1/sheikha-curated-merge-engine-v1.json'],
  ['openapiRegistry', 'runtime/openapi-registry/sheikha-openapi-registry.json'],
  ['sdkRegistry', 'runtime/sdk-registry/sheikha-sdk-registry.json'],
  ['mcpBridge', 'runtime/mcp-unified-bridge/sheikha-mcp-unified-bridge.json'],
  ['projectGovernance', 'runtime/project-governance/sheikha-project-governance.json'],
  ['prGovernance', 'runtime/pr-governance/sheikha-pr-governance.json']
];

const results = checks.map(([name, file]) => ({
  name,
  file,
  exists: fs.existsSync(file)
}));

const passed = results.filter(r => r.exists).length;
const total = results.length;
const score = Math.round((passed / total) * 100);

const report = {
  report: 'SHEIKHA_EXCELLENCE_SCORE_REPORT',
  status: score === 100 ? 'TARGET_ACHIEVED' : 'IMPROVEMENT_REQUIRED',
  target: 100,
  score,
  passed,
  total,
  results,
  gaps: results.filter(r => !r.exists),
  nextAction: score === 100
    ? 'Maintain excellence through operation loop, reporting, audit, and continuous improvement.'
    : 'Complete missing layers and rerun excellence score.',
  timestamp: new Date().toISOString()
};

const outDir = path.join(process.cwd(), 'runtime/excellence-score/v1');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'sheikha-excellence-score-report.json'),
  JSON.stringify(report, null, 2) + '\n'
);

console.log(JSON.stringify({
  score,
  status: report.status,
  passed,
  total,
  output: 'runtime/excellence-score/v1/sheikha-excellence-score-report.json'
}, null, 2));
