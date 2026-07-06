const fs = require('fs');
const path = require('path');

const targets = process.argv.slice(2);
if (!targets.length) {
  console.error('Usage: node tools/patch-engine/sheikha-conflict-marker-scan.js <file...>');
  process.exit(1);
}

const markers = ['<<<<<<<', '=======', '>>>>>>>'];
const results = targets.map(file => {
  const exists = fs.existsSync(file);
  const content = exists ? fs.readFileSync(file, 'utf8') : '';
  const found = markers.filter(m => content.includes(m));
  return { file, exists, hasConflictMarkers: found.length > 0, markers: found };
});

const outDir = path.join(process.cwd(), 'runtime/patch-engine/v1/pr-21');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'conflict-marker-scan.json'),
  JSON.stringify({ scan: 'SHEIKHA_CONFLICT_MARKER_SCAN', results }, null, 2) + '\n'
);

console.log(JSON.stringify(results, null, 2));
