#!/usr/bin/env node
'use strict';

const runtime = require('../runtime/unified/sheikha-unified-runtime');

const command = process.argv[2] || 'help';

const commands = {
  health() {
    console.log(JSON.stringify(runtime.health(), null, 2));
  },

  interfaces() {
    console.log(JSON.stringify(runtime.interfaces(), null, 2));
  },

  runtime() {
    console.log(JSON.stringify({
      runtime: runtime.runtime,
      version: runtime.version,
      startedAt: runtime.startedAt
    }, null, 2));
  },

  registry() {
    console.log(JSON.stringify(require('../../runtime/unified-runtime/registry/unified-runtime-registry.json'), null, 2));
  },

  policy() {
    console.log(JSON.stringify(require('../../runtime/unified-runtime/policy/unified-runtime-policy.json'), null, 2));
  },

  control() {
    console.log(JSON.stringify(require('../../runtime/control-plane/registry/sheikha-unified-control-plane.json'), null, 2));
  },

  help() {
    console.log(`
SHEIKHA UNIFIED COMMAND LAYER

Commands:
  sheikha health
  sheikha interfaces
  sheikha runtime
  sheikha registry
  sheikha policy
  sheikha control
`);
  }
};

(commands[command] || commands.help)();
