'use strict';

const fs = require('fs');

const policy = JSON.parse(
  fs.readFileSync('runtime/identity/sheikha-identity-policy.json', 'utf8')
);

const required = [
  'coreIdentity',
  'visualIdentity',
  'marketingIdentity',
  'governanceRule'
];

const missing = required.filter(key => !policy[key]);

const result = {
  checker: 'SHEIKHA_IDENTITY_CHECK',
  status: missing.length ? 'REVIEW_REQUIRED' : 'ACTIVE',
  missing,
  identity: policy.identity,
  principle: policy.principle
};

console.log(JSON.stringify(result, null, 2));

process.exit(missing.length ? 1 : 0);
