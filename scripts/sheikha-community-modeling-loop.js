#!/usr/bin/env node
'use strict';

const { execSync } = require('node:child_process');

const INTERVAL_MS = 21600 * 1000; // 6 hours

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runIgnite() {
  execSync('node scripts/sheikha-community-modeling-ignite.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_prefix: '',
      NPM_CONFIG_PREFIX: '',
      npm_lifecycle_script: '',
      npm_lifecycle_event: ''
    }
  });
}

async function main() {
  while (true) {
    try {
      runIgnite();
    } catch (error) {
      process.stderr.write(`[community-modeling-loop] ignite failed: ${error.message}\n`);
    }
    await sleep(INTERVAL_MS);
  }
}

main();
