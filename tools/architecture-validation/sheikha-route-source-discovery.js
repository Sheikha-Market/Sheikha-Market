const fs = require('fs');
const path = require('path');

const routesDir = path.join(process.cwd(), 'routes');
const outDir = path.join(process.cwd(), 'runtime/architecture-validation/route-source-discovery');
const outFile = path.join(outDir, 'sheikha-route-source-discovery.json');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function score(content, file) {
  let points = 0;
  const reasons = [];

  if (content.includes("try") && content.includes("catch")) {
    points += 2; reasons.push("has_error_handling");
  }
  if (content.includes("process.cwd()")) {
    points += 2; reasons.push("root_safe_path");
  }
  if (content.includes("timestamp")) {
    points += 1; reasons.push("has_timestamp");
  }
  if (content.includes("success: true")) {
    points += 1; reasons.push("standard_success_response");
  }
  if (content.includes("router.get('/status'")) {
    points += 1; reasons.push("standard_status_route");
  }
  if (file.includes("governance") || file.includes("control-plane") || file.includes("fabric")) {
    points += 1; reasons.push("strategic_layer");
  }

  return { points, reasons };
}

const files = walk(routesDir).filter(f => f.endsWith('.js'));
const entries = [];

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g)];

  for (const m of matches) {
    const quality = score(content, rel);
    entries.push({
      method: m[1].toUpperCase(),
      path: m[2],
      file: rel,
      qualityScore: quality.points,
      qualityReasons: quality.reasons
    });
  }
}

const byPath = {};
for (const e of entries) {
  byPath[e.path] = byPath[e.path] || [];
  byPath[e.path].push(e);
}

const duplicates = Object.entries(byPath)
  .filter(([, list]) => list.length > 1)
  .map(([routePath, list]) => ({
    path: routePath,
    count: list.length,
    bestCandidate: [...list].sort((a, b) => b.qualityScore - a.qualityScore)[0],
    candidates: [...list].sort((a, b) => b.qualityScore - a.qualityScore)
  }));

const report = {
  report: "SHEIKHA_ROUTE_SOURCE_DISCOVERY",
  status: "ACTIVE",
  totalRouteDeclarations: entries.length,
  duplicatePaths: duplicates.length,
  rule: "Do not delete duplicates until mount context and quality score are reviewed.",
  duplicates,
  timestamp: new Date().toISOString()
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify({
  totalRouteDeclarations: report.totalRouteDeclarations,
  duplicatePaths: report.duplicatePaths,
  output: outFile
}, null, 2));
