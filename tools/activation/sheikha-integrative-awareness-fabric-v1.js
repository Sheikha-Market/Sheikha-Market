'use strict';

const fabric = require(
  '../../core/integrative-awareness/' +
  'sheikha-integrative-awareness-fabric-v1'
);

const result = {
  status: fabric.status(),
  verification: fabric.verify()
};

console.log(JSON.stringify(result, null, 2));

if (!result.verification.passed) {
  process.exitCode = 1;
} else {
  console.log('INTEGRATIVE_AWARENESS_FABRIC_READY');
}
