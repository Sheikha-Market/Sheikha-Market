'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

const OUTPUT = path.join(
  ROOT,
  'runtime/activation-inventory/v1/' +
    'sheikha-activation-inventory-v1.json'
);

const ROOTS = [
  'core',
  'runtime',
  'routes',
  'tools',
  'middleware',
  'tests',
  'governance',
  'sheikha-language'
];

function walk(directory, files = []) {
  if (!fs.existsSync(directory)) {
    return files;
  }

  for (const entry of fs.readdirSync(
    directory,
    { withFileTypes: true }
  )) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === 'dist' ||
      entry.name === 'coverage' ||
      entry.name === 'reports'
    ) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (
      entry.isFile() &&
      /\.(?:js|json|md|shk|ebnf)$/i.test(entry.name)
    ) {
      const stat = fs.statSync(fullPath);

      if (stat.size <= 2 * 1024 * 1024) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function relative(filePath) {
  return path
    .relative(ROOT, filePath)
    .split(path.sep)
    .join('/');
}

function buildInventory() {
  const files = [];

  for (const root of ROOTS) {
    walk(path.join(ROOT, root), files);
  }

  const systems = new Map();

  for (const filePath of files) {
    let content;

    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const names = new Set(
      content.match(/SHEIKHA_[A-Z0-9_]{3,}/g) || []
    );

    for (const name of names) {
      if (!systems.has(name)) {
        systems.set(name, {
          system: name,
          implementationFiles: [],
          testFiles: [],
          evidenceFiles: []
        });
      }

      const record = systems.get(name);
      const file = relative(filePath);

      if (
        file.startsWith('tests/') ||
        file.includes('/tests/')
      ) {
        record.testFiles.push(file);
      } else if (
        file.includes('/evidence/') ||
        file.toLowerCase().includes('evidence')
      ) {
        record.evidenceFiles.push(file);
      } else {
        record.implementationFiles.push(file);
      }
    }
  }

  const records = [...systems.values()]
    .map((record) => {
      for (const key of [
        'implementationFiles',
        'testFiles',
        'evidenceFiles'
      ]) {
        record[key] = [
          ...new Set(record[key])
        ].sort();
      }

      let classification = 'DECLARED';

      if (record.evidenceFiles.length > 0) {
        classification = 'VERIFIED';
      } else if (
        record.implementationFiles.length > 0 &&
        record.testFiles.length > 0
      ) {
        classification = 'IMPLEMENTED';
      }

      return {
        ...record,
        classification
      };
    })
    .sort((a, b) =>
      a.system.localeCompare(b.system)
    );

  const summary = {
    VERIFIED: 0,
    IMPLEMENTED: 0,
    DECLARED: 0
  };

  for (const record of records) {
    summary[record.classification] += 1;
  }

  const inventory = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_ACTIVATION_INVENTORY_V1',
    status: 'ACTIVE',
    scan: {
      roots: ROOTS,
      filesInspected: files.length,
      discoveredSystems: records.length
    },
    summary,
    systems: records,
    passed: records.length > 0
  };

  fs.mkdirSync(
    path.dirname(OUTPUT),
    { recursive: true }
  );

  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(inventory, null, 2) + '\n',
    'utf8'
  );

  return inventory;
}

if (require.main === module) {
  const inventory = buildInventory();

  process.stdout.write(
    JSON.stringify({
      system: inventory.system,
      scan: inventory.scan,
      summary: inventory.summary,
      passed: inventory.passed
    }, null, 2) + '\n'
  );

  if (!inventory.passed) {
    process.exitCode = 1;
  }
}

module.exports = {
  OUTPUT,
  buildInventory
};
