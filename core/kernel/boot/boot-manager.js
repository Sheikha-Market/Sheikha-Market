'use strict';

// SHEIKHA Kernel Boot Manager
// Unified entrypoint for all runtime layers

const path = require('path');
const registry = require('../registry/kernel-registry');

function bootKernel() {
  // Boot sequence: runtime, governance, providers, federation, orchestration
  const runtime = require('../../runtime');
  const governance = require('../governance');
  const providers = require('../../providers/provider-registry');
  const federation = require('../federation');
  const orchestration = require('../orchestration');

  return {
    success: true,
    booted: [
      'runtime',
      'governance',
      'providers',
      'federation',
      'orchestration'
    ],
    timestamp: new Date().toISOString(),
    registry
  };
}

module.exports = { bootKernel };
