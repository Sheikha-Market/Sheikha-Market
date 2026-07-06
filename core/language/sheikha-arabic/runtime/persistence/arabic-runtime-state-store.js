'use strict';

const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(
  __dirname,
  'arabic-runtime-state.json'
);

function loadArabicRuntimeState() {
  if (!fs.existsSync(STORAGE_FILE)) {
    return {
      accounts: {},
      operations: [],
      states: [],
      deterministic: true
    };
  }

  return JSON.parse(
    fs.readFileSync(STORAGE_FILE, 'utf8')
  );
}

function saveArabicRuntimeState(state = {}) {
  fs.writeFileSync(
    STORAGE_FILE,
    JSON.stringify(state, null, 2)
  );

  return {
    saved: true,
    file: STORAGE_FILE
  };
}

module.exports = {
  STORAGE_FILE,
  loadArabicRuntimeState,
  saveArabicRuntimeState
};
