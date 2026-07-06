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
  issueToImpactLoop: exists('runtime/devops-ai-lab-fabric/v1/registries/issue-to-impact-loop-registry.json'),
  platformEngines: exists('runtime/platform-operating-engines/v1/sheikha-platform-operating-engines-v1-report.json'),
  platformFactories: exists('runtime/platform-factories/v1/sheikha-platform-factories-v1-report.json'),
  customerRevenueExperience: exists('runtime/customer-revenue-experience/v1/sheikha-customer-revenue-experience-v1-report.json'),
  socialInnovation: exists('runtime/specialized-social-innovation/v1/sheikha-specialized-social-innovation-v1-report.json'),
  aiFabric: exists('runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json'),
  html: exists('public/sheikha-devops-lab/index.html'),
  css: exists('public/sheikha-devops-lab/devops-lab.css'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js'),
  fabricRouteMounted: (() => {
    try {
      const fabric = JSON.parse(fs.readFileSync(path.join(ROOT, 'runtime/fabric-bootstrap/sheikha-fabric-routes.json'), 'utf8'));
      const route = fabric.routes.find((item) => item.name === 'devops-ai-lab-fabric-v1');
      return Boolean(
        route &&
        route.mount === '/api/devops/ai-lab' &&
        route.module === 'routes/devops-ai-lab-fabric/status.routes.js'
      );
    } catch {
      return false;
    }
  })()
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
    'EXPERIMENT',
    'API',
    'AI',
    'CODE',
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
