'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT, p));
const write = (p, c) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), c); };

const checks = {
  engine: exists('runtime/smart-cities-engine/v1/sheikha-smart-cities-engine-v1.json'),
  domains: exists('runtime/smart-cities-engine/v1/registries/smart-city-domains.json'),
  spaceIotMlAi: exists('runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1-report.json'),
  executiveCommercialOS: exists('runtime/executive-commercial-os/v1/sheikha-executive-commercial-os-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
const report = {
  system: 'SHEIKHA_SMART_CITIES_ENGINE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_SMART_CITIES_ENGINE_GAPS' : 'SMART_CITIES_ENGINE_ACTIVE_100',
  checks,
  missing,
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/smart-cities-engine/v1/sheikha-smart-cities-engine-v1-report.json', JSON.stringify(report, null, 2) + '\n');
write('runtime/smart-cities-engine/v1/sheikha-smart-cities-engine-v1-report.md', `# SHEIKHA_SMART_CITIES_ENGINE_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report, null, 2));
