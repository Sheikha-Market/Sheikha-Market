'use strict';

const fs = require('fs');
const path = require('path');

const {
  productionSummary
} = require('../production-summary');

function createSnapshot() {

  const snapshot = {
    timestamp: new Date().toISOString(),
    ...productionSummary()
  };

  const file = path.join(
    __dirname,
    `snapshot-${Date.now()}.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(snapshot, null, 2)
  );

  return {
    status: 'CREATED',
    file,
    snapshot
  };
}

module.exports = {
  createSnapshot
};
