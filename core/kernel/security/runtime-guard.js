'use strict';

const fs = require('fs');
const path = require('path');

const LOCK =
  path.join(
    process.cwd(),
    'runtime/locks/canonical-runtime.lock'
  );

function verify() {
  if (!fs.existsSync(LOCK)) {
    throw new Error(
      'SHEIKHA canonical runtime lock missing'
    );
  }

  return {
    success: true,
    runtimeLock: true,
    canonical: true,
    timestamp: new Date().toISOString()
  };
}

module.exports = { verify };
