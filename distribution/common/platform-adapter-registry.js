'use strict';

const debAdapter = require('../linux/deb/sheikha-linux-deb-adapter-v1');
const cliAdapter = require('../linux/cli/sheikha-linux-cli-adapter-v1');
const tarAdapter = require('../linux/tar/sheikha-linux-tar-adapter-v1');

const adapters = Object.freeze([
  debAdapter,
  tarAdapter,
  cliAdapter
]);

function resolve(targetId) {
  return adapters.find((adapter) => adapter.TARGET_ID === targetId) || null;
}

function status(context) {
  return adapters.map((adapter) => ({
    targetId: adapter.TARGET_ID,
    available: adapter.canBuild(context)
  }));
}

module.exports = { adapters, resolve, status };
