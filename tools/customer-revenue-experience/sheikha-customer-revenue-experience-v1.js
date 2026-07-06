'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT,p));
const write = (p,c)=>{fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),c);};

const checks = {
  engine: exists('runtime/customer-revenue-experience/v1/sheikha-customer-revenue-experience-v1.json'),
  productCatalog: exists('runtime/customer-revenue-experience/v1/registries/product-catalog.json'),
  onboardingFlow: exists('runtime/customer-revenue-experience/v1/registries/customer-onboarding-flow.json'),
  subscriptionPlans: exists('runtime/customer-revenue-experience/v1/registries/subscription-plans.json'),
  revenueImpactMetrics: exists('runtime/customer-revenue-experience/v1/registries/revenue-impact-metrics.json'),
  customerClassification: exists('runtime/customer-classification/v1/sheikha-customer-classification-v1-report.json'),
  commercialRealActivation: exists('runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json'),
  platformEngines: exists('runtime/platform-operating-engines/v1/sheikha-platform-operating-engines-v1-report.json'),
  devopsAiLab: exists('runtime/devops-ai-lab-fabric/v1/sheikha-devops-ai-lab-fabric-v1-report.json'),
  html: exists('public/sheikha-customer-revenue/index.html'),
  css: exists('public/sheikha-customer-revenue/customer-revenue.css'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);

const report = {
  system:'SHEIKHA_CUSTOMER_REVENUE_EXPERIENCE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0,100-missing.length*8) : 100,
  decision: missing.length ? 'REVIEW_CUSTOMER_REVENUE_EXPERIENCE_GAPS' : 'CUSTOMER_REVENUE_EXPERIENCE_ACTIVE_100',
  checks,
  missing,
  cycle:[
    'VISITOR',
    'REGISTRATION',
    'CLASSIFICATION',
    'PRODUCT_MATCHING',
    'OFFER',
    'CONTRACT',
    'LICENSE',
    'INVOICE',
    'PAYMENT',
    'ACTIVATION',
    'IMPACT'
  ],
  principle:'ولا حول ولا قوة إلا بالله'
};

write('runtime/customer-revenue-experience/v1/sheikha-customer-revenue-experience-v1-report.json', JSON.stringify(report,null,2)+'\n');
write('runtime/customer-revenue-experience/v1/sheikha-customer-revenue-experience-v1-report.md', `# SHEIKHA_CUSTOMER_REVENUE_EXPERIENCE_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report,null,2));
