
'use strict';



const fs = require('fs');

const path = require('path');



const ROOT = process.cwd();



function exists(p) {

  return fs.existsSync(path.join(ROOT, p));

}



function write(p, content) {

  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });

  fs.writeFileSync(path.join(ROOT, p), content);

}



const checks = {

  commercialProductLayer: exists('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1.json'),

  licensingEngine: exists('runtime/licensing-engine/v1/sheikha-licensing-engine-v1.json'),

  licensesRegistry: exists('runtime/licensing-engine/v1/registries/licenses.json'),

  contractEngine: exists('runtime/contract-engine/v1/sheikha-contract-engine-v1.json'),

  contractsRegistry: exists('runtime/contract-engine/v1/registries/contracts.json'),

  customerRegistry: exists('runtime/customer-registry/v1/sheikha-customer-registry-v1.json'),

  billingEngine: exists('runtime/billing-engine/v1/sheikha-billing-engine-v1.json'),

  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')

};



const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);



const policies = [

  {

    id: 'CGOV-001',

    name: 'No Sale Without Contract',

    rule: 'Any external sale, license, SaaS, API, SDK, or enterprise component must have an approved contract before activation.'

  },

  {

    id: 'CGOV-002',

    name: 'No License Without Customer',

    rule: 'A license cannot be issued unless the customer is registered and commercially approved.'

  },

  {

    id: 'CGOV-003',

    name: 'No Billing Without Approval',

    rule: 'Invoices must only be generated after contract approval and license activation.'

  },

  {

    id: 'CGOV-004',

    name: 'No False Partner or Customer Claim',

    rule: 'Sheikha must not claim OpenAI, any AI company, or any enterprise as a customer, partner, or licensee without a signed agreement.'

  },

  {

    id: 'CGOV-005',

    name: 'Legal Review Before External Sale',

    rule: 'External commercial licensing requires legal review before signing or activation.'

  },

  {

    id: 'CGOV-006',

    name: 'Human Commercial Approval',

    rule: 'Pricing, license scope, renewal, cancellation, liability, and customer-facing terms require human approval.'

  }

];



const procedures = [

  'Lead → Proposal → Commercial Review → Legal Review → Approval → Contract',

  'Contract → License Generation → Customer Registry Update → Billing Setup',

  'Usage → Measurement → Renewal Review → Lessons Learned → Commercial Improvement'

];



const report = {

  system: 'SHEIKHA_COMMERCIAL_GOVERNANCE_ENGINE_V1',

  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',

  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,

  decision: missing.length ? 'REVIEW_COMMERCIAL_GOVERNANCE_GAPS' : 'COMMERCIAL_GOVERNANCE_ENGINE_ACTIVE_100',

  checks,

  missing,

  generated: {

    policies: policies.length,

    procedures: procedures.length

  },

  principle: 'ولا حول ولا قوة إلا بالله'

};



write(

  'runtime/commercial-governance-engine/v1/generated/commercial-governance-policies.json',

  JSON.stringify({ registry: 'SHEIKHA_COMMERCIAL_GOVERNANCE_POLICIES_V1', status: 'ACTIVE', policies }, null, 2) + '\n'

);



write(

  'runtime/commercial-governance-engine/v1/generated/commercial-governance-procedures.json',

  JSON.stringify({ registry: 'SHEIKHA_COMMERCIAL_GOVERNANCE_PROCEDURES_V1', status: 'ACTIVE', procedures }, null, 2) + '\n'

);



write(

  'runtime/commercial-governance-engine/v1/sheikha-commercial-governance-engine-v1-report.json',

  JSON.stringify(report, null, 2) + '\n'

);



write(

  'runtime/commercial-governance-engine/v1/sheikha-commercial-governance-engine-v1-report.md',

  `# SHEIKHA_COMMERCIAL_GOVERNANCE_ENGINE_V1



## الحالة

- النظام: ${report.system}

- الحالة: ${report.status}

- الدرجة: ${report.score}

- القرار: ${report.decision}



## السياسات المولدة

${policies.map(p => `- ${p.id}: ${p.name}`).join('\n')}



## الإجراءات

${procedures.map((p, i) => `${i + 1}. ${p}`).join('\n')}



## القاعدة

 بيع  بالعقد.  ترخيص  بالعميل.  فوترة بالموافقة. شراكة  اتفاقية موقعة.



ولا حول ولا قوة إلا بالله.

`

);



console.log(JSON.stringify(report, null, 2));

