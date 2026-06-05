'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT,p));
const write = (p,c)=>{fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),c);};

const checks = {
  engine: exists('runtime/devops-ai-lab-fabric/v1/sheikha-devops-ai-lab-fabric-v1.json'),
  gitWorkflow: exists('runtime/devops-ai-lab-fabric/v1/registries/git-workflow-registry.json'),
  pipelineRegistry: exists('runtime/devops-ai-lab-fabric/v1/registries/pipeline-registry.json'),
  apiIntegrationLab: exists('runtime/devops-ai-lab-fabric/v1/registries/api-integration-lab-registry.json'),
  experimentToProduct: exists('runtime/devops-ai-lab-fabric/v1/registries/experiment-to-product-registry.json'),
  platformEngines: exists('runtime/platform-operating-engines/v1/sheikha-platform-operating-engines-v1-report.json'),
  socialInnovation: exists('runtime/specialized-social-innovation/v1/sheikha-specialized-social-innovation-v1-report.json'),
  aiFabric: exists('runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json'),
  html: exists('public/sheikha-devops-lab/index.html'),
  css: exists('public/sheikha-devops-lab/devops-lab.css'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);

const report = {
  system:'SHEIKHA_DEVOPS_AI_LAB_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0,100-missing.length*8) : 100,
  decision: missing.length ? 'REVIEW_DEVOPS_AI_LAB_FABRIC_GAPS' : 'DEVOPS_AI_LAB_FABRIC_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'ISSUE',
    'GIT_BRANCH',
    'EXPERIMENT',
    'API_INTEGRATION',
    'AI_ANALYSIS',
    'PROTOTYPE',
    'TEST',
    'MERGE',
    'PRODUCT',
    'KNOWLEDGE',
    'EDUCATION',
    'IMPACT'
  ],
  principle:'ولا حول ولا قوة إلا بالله'
};

write('runtime/devops-ai-lab-fabric/v1/sheikha-devops-ai-lab-fabric-v1-report.json', JSON.stringify(report,null,2)+'\n');
write('runtime/devops-ai-lab-fabric/v1/sheikha-devops-ai-lab-fabric-v1-report.md', `# SHEIKHA_DEVOPS_AI_LAB_FABRIC_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report,null,2));
