#!/usr/bin/env node
'use strict';

const http = require('http');

const runtime = require('../runtime/unified/sheikha-unified-runtime');


function apiGet(path) {
  const port = process.env.SHEIKHA_PORT || 8080;
  const options = {
    hostname: '127.0.0.1',
    port,
    path,
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
      } catch {
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error(JSON.stringify({
      success: false,
      error: 'api_unreachable',
      message: error.message
    }, null, 2));
    process.exitCode = 1;
  });

  req.end();
}

const rawCommand = process.argv[2] || 'help';
const command = rawCommand.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const commands = {
  apiHealth() {
    apiGet('/api/runtime/health');
  },

  apiRegistry() {
    apiGet('/api/runtime/registry');
  },

  apiPolicy() {
    apiGet('/api/runtime/policy');
  },

  apiControl() {
    apiGet('/api/runtime/control');
  },

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
  sheikha api-health
  sheikha api-registry
  sheikha api-policy
  sheikha api-control
`);
  }
};

(commands[command] || commands.help)();
