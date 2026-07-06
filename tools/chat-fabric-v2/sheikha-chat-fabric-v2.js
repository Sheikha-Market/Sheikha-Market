'use strict';

const fs = require('fs');
const path = require('path');
const fabric = require('../../runtime/chat-fabric-v2/sheikha-chat-fabric-v2');

const report = {
  ...fabric.status(),
  generatedAt: new Date().toISOString()
};

const outDir = path.join(process.cwd(), 'runtime/chat-fabric-v2');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'sheikha-chat-fabric-v2-report.json'),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
