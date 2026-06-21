'use strict';

const manifest =
require('./runtime-manifest.json');

function loadManifest() {
  return manifest;
}

module.exports = {
  loadManifest
};
