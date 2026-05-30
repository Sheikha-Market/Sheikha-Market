'use strict';

const {
  loadArabicRuntimeState,
  saveArabicRuntimeState
} = require('./arabic-runtime-state-store');

const {
  applyArabicOperation
} = require('../memory/arabic-runtime-memory-engine');

function executePersistentArabicOperation(operation = {}) {

  let state =
    loadArabicRuntimeState();

  state =
    applyArabicOperation(
      state,
      operation
    );

  saveArabicRuntimeState(state);

  return {
    runtime:
      'SHEIKHA_PERSISTENT_ARABIC_RUNTIME',

    status:
      'STATE_PERSISTED',

    state
  };
}

module.exports = {
  executePersistentArabicOperation
};
