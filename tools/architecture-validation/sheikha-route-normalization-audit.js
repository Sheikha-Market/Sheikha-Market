const http = require('http');
const fs = require('fs');
const path = require('path');

const url = 'http://127.0.0.1:8080/api/runtime/introspection/routes';

http.get(url, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    const routes = data.routes || [];

    const byPath = {};
    for (const route of routes) {
      const key = route.path || route.mount || 'UNKNOWN';
      byPath[key] = byPath[key] || [];
      byPath[key].push(route);
    }

    const duplicates = Object.entries(byPath)
      .filter(([, items]) => items.length > 1)
      .map(([routePath, items]) => ({
        path: routePath,
        count: items.length,
        methods: [...new Set(items.flatMap(i => i.methods || []))]
      }));

    const report = {
      report: 'SHEIKHA_ROUTE_NORMALIZATION_AUDIT',
      status: 'ACTIVE',
      total: routes.length,
      unique: Object.keys(byPath).length,
      duplicateEntries: routes.length - Object.keys(byPath).length,
      duplicatePaths: duplicates.length,
      duplicates,
      rules: {
        no_delete_without_review: true,
        normalize_before_remove: true,
        preserve_methods: true,
        preserve_governance_routes: true
      },
      timestamp: new Date().toISOString()
    };

    const out = path.join(
      process.cwd(),
      'runtime/architecture-validation/route-normalization/sheikha-route-normalization-audit.json'
    );

    fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({
      total: report.total,
      unique: report.unique,
      duplicateEntries: report.duplicateEntries,
      duplicatePaths: report.duplicatePaths,
      output: out
    }, null, 2));
  });
}).on('error', err => {
  console.error(err);
  process.exit(1);
});
