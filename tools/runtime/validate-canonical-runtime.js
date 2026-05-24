#!/usr/bin/env node
'use strict';

const fs = require('fs');

const registry =
  require('../../docs/registry/SHEIKHA-BLUEPRINT-REGISTRY.json');

const result = {
  success: true,
  canonical: registry.zones.canonical,
  mirrors: registry.zones.mirrors,
  archive: registry.zones.archive,
  experimental: registry.zones.experimental,
  violations: []
};

for (const zone of registry.zones.mirrors) {
  if (fs.existsSync(zone)) {
    result.violations.push({
      type: 'mirror-detected',
      path: zone
    });
  }
}

console.log(JSON.stringify(result, null, 2));
