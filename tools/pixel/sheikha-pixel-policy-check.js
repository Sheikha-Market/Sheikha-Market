'use strict';

const fs = require('fs');

const policy = JSON.parse(
  fs.readFileSync('runtime/pixel/sheikha-pixel-policy.json', 'utf8')
);

const required = [
  'visualPixel',
  'marketingPixel',
  'trackingPixel',
  'allowedUse',
  'blockedUse',
  'rule'
];

const missing = required.filter(key => !policy[key]);

const result = {
  checker: 'SHEIKHA_PIXEL_POLICY_CHECK',
  status: missing.length ? 'REVIEW_REQUIRED' : 'ACTIVE',
  missing,
  principle: policy.principle
};

console.log(JSON.stringify(result, null, 2));

process.exit(missing.length ? 1 : 0);
