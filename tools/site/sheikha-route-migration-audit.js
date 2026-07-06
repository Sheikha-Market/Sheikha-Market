'use strict';

const fs = require('fs');

const inventory = JSON.parse(
  fs.readFileSync('runtime/site/site-route-inventory.json', 'utf8')
);

const plan = JSON.parse(
  fs.readFileSync('runtime/site/route-migration-plan.json', 'utf8')
);

const routes = inventory.pages.map(p => p.route);

const result = {
  audit: 'SHEIKHA_ROUTE_MIGRATION_AUDIT',
  status: 'ACTIVE',
  totalPages: inventory.totalPages,
  publicTargets: plan.targets.public.length,
  protectedTargets: plan.targets.protected.length,
  internalCandidates: plan.targets.internalCandidates.length,
  archiveCandidates: plan.targets.archiveCandidates.length,
  brandCandidates: plan.targets.brandCandidates.length,
  remainingToClassify: routes.length,
  principle: 'لا ضرر ولا ضرار'
};

console.log(JSON.stringify(result, null, 2));
