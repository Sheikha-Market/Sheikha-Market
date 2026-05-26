'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function bootstrap() {
  const state = {
    success: true,
    runtime: 'SHEIKHA_BOOTSTRAP_RUNTIME',
    canonical: true,
    singleton: true,
    governance: 'ACTIVE',
    localFirst: true,
    offlineCapable: true,
    timestamp: new Date().toISOString()
  };

  const out = path.join(
    ROOT,
    'runtime/state/bootstrap-state.json'
  );

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(state, null, 2));

  return state;
}

module.exports = { bootstrap };
