'use strict';

const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(
  process.cwd(),
  'runtime/database/audit'
);

function ensureDir() {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

function writeAudit(entry) {
  ensureDir();

  const file =
    new Date().toISOString().slice(0, 10) + '.log';

  const fullPath = path.join(AUDIT_DIR, file);

  fs.appendFileSync(
    fullPath,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...entry
    }) + '\n'
  );
}

module.exports = {
  writeAudit
};
