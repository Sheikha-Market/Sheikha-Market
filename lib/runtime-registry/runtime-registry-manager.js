const fs = require('fs');
const path = require('path');

function registryPath() {
  return path.join(
    process.cwd(),
    'runtime/runtime-registry/sheikha-runtime-registry.json'
  );
}

function getRegistry() {
  return JSON.parse(
    fs.readFileSync(registryPath(), 'utf8')
  );
}

module.exports = {
  getRegistry
};
