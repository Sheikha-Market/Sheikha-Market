'use strict';

const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

const pages = walk(publicDir)
  .filter(file => file.endsWith('.html'))
  .map(file => ({
    file: path.relative(process.cwd(), file),
    route: '/' + path.relative(publicDir, file).replace(/\\/g, '/')
  }));

const report = {
  registry: 'SHEIKHA_SITE_ROUTE_INVENTORY',
  status: 'ACTIVE',
  totalPages: pages.length,
  pages,
  principle: 'لا ضرر ولا ضرار'
};

fs.mkdirSync('runtime/site', { recursive: true });
fs.writeFileSync(
  'runtime/site/site-route-inventory.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
