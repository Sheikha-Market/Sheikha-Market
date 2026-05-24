'use strict';

const path = require('path');
const fs = require('fs');

const BLOCKED = [
  'docs/architecture/blueprints/auto',
  'exports',
  'mirrors',
  'public/_archive',
  'repos/git-sheikha',
  'infra/docker/compose/prod/Sheikha-Market'
];

function validateCanonicalPath(target) {
  const normalized = target.replace(/\\/g, '/');

  for (const item of BLOCKED) {
    if (normalized.includes(item)) {
      return false;
    }
  }

  return true;
}

function loadCanonicalRuntime(target) {
  if (!validateCanonicalPath(target)) {
    throw new Error(`Blocked non-canonical runtime path: ${target}`);
  }

  const absolute = path.resolve(target);

  if (!fs.existsSync(absolute)) {
    throw new Error(`Runtime target missing: ${absolute}`);
  }

  return require(absolute);
}

module.exports = {
  validateCanonicalPath,
  loadCanonicalRuntime
};
