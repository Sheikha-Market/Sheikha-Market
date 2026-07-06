#!/usr/bin/env bash
set -euo pipefail

echo "🧵 SHEIKHA PM2 FABRIC V1"

node --check core/pm2-fabric/sheikha-pm2-fabric-v1.js
npm test -- tests/sheikha-pm2-fabric-v1.test.js
npm run lint

pm2 jlist > runtime/pm2-fabric/pm2-jlist.json

node - <<'NODE' > runtime/pm2-fabric/sheikha-pm2-fabric-report.json
const fs = require('fs');
const { evaluatePm2Fabric } = require('./core/pm2-fabric/sheikha-pm2-fabric-v1');

const processes = JSON.parse(fs.readFileSync('runtime/pm2-fabric/pm2-jlist.json', 'utf8'));
console.log(JSON.stringify(evaluatePm2Fabric(processes), null, 2));
NODE

cat runtime/pm2-fabric/sheikha-pm2-fabric-report.json

node - <<'NODE'
const report = require('./runtime/pm2-fabric/sheikha-pm2-fabric-report.json');
if (report.status !== 'PASSED') {
  console.error('❌ PM2 Fabric blocked');
  process.exit(1);
}
console.log('✅ PM2 Fabric passed');
NODE

echo "✅ SHEIKHA PM2 FABRIC ACTIVATION PASSED"
