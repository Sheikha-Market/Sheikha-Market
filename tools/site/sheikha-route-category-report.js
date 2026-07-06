'use strict';

const fs = require('fs');

const inventory = JSON.parse(
  fs.readFileSync('runtime/site/site-route-inventory.json', 'utf8')
);

const categories = {
  canonical: [],
  admin: [],
  archive: [],
  engines: [],
  generated: [],
  marketing: [],
  internal: [],
  publicArabic: [],
  publicEnglish: [],
  review: []
};

for (const page of inventory.pages) {
  const f = page.file;
  const r = page.route;

  if (f.includes('public/_admin')) categories.admin.push(page);
  else if (f.includes('public/_archive')) categories.archive.push(page);
  else if (f.includes('public/_engines')) categories.engines.push(page);
  else if (f.includes('public/generated-images')) categories.generated.push(page);
  else if (f.includes('public/marketing')) categories.marketing.push(page);
  else if (
    r.includes('dashboard') ||
    r.includes('monitor') ||
    r.includes('cli') ||
    r.includes('mcp') ||
    r.includes('sdk') ||
    r.includes('control')
  ) categories.internal.push(page);
  else if (/[\u0600-\u06FF]/.test(r)) categories.publicArabic.push(page);
  else if (/^[\/A-Za-z0-9._-]+$/.test(r)) categories.publicEnglish.push(page);
  else categories.review.push(page);
}

const summary = Object.fromEntries(
  Object.entries(categories).map(([k, v]) => [k, v.length])
);

const report = {
  report: 'SHEIKHA_ROUTE_CATEGORY_REPORT',
  status: 'ACTIVE',
  summary,
  categories,
  principle: 'لا ضرر ولا ضرار'
};

fs.writeFileSync(
  'runtime/site/route-category-report.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify({ status: 'ACTIVE', summary }, null, 2));
