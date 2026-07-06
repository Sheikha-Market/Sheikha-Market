'use strict';

const fs = require('fs');

const inventory = JSON.parse(
  fs.readFileSync('runtime/site/site-route-inventory.json', 'utf8')
);

const canonical = JSON.parse(
  fs.readFileSync('runtime/site/canonical-site-map.json', 'utf8')
);

const canonicalFiles = new Set([
  ...Object.values(canonical.publicRoutes),
  ...Object.values(canonical.protectedRoutes)
]);

const unmanaged = inventory.pages.filter(page => {
  if (page.file.includes('public/_archive')) return false;
  if (page.file.includes('public/_admin')) return false;
  return !canonicalFiles.has(page.file);
});

const result = {
  classifier: 'SHEIKHA_SITE_ROUTE_CLASSIFIER',
  status: unmanaged.length ? 'REVIEW_REQUIRED' : 'CLEAN',
  totalPages: inventory.totalPages,
  canonicalCount: canonicalFiles.size,
  unmanagedCount: unmanaged.length,
  unmanaged: unmanaged.slice(0, 50),
  principle: 'لا ضرر ولا ضرار'
};

console.log(JSON.stringify(result, null, 2));

process.exit(unmanaged.length ? 1 : 0);
