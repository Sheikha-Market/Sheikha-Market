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

  help() {
    console.log(`
SHEIKHA UNIFIED COMMAND LAYER

Commands:
  sheikha health
  sheikha interfaces
  sheikha runtime
`);
  }
};

(commands[command] || commands.help)();
