'use strict';

const fs = require('fs');

const fabric = JSON.parse(
  fs.readFileSync('runtime/ai-fabric/sheikha-ai-fabric-layers.json', 'utf8')
);

console.log(JSON.stringify({
  fabric: fabric.fabric,
  status: fabric.status,
  orchestration: fabric.layers.orchestration.status,
  mlopsPlatform: fabric.layers.mlopsPlatform.status,
  governanceMesh: fabric.layers.governanceMesh.status,
  principle: fabric.principle
}, null, 2));
