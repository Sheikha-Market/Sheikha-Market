'use strict';

function createArabicRuntimeFrame({
  name = 'main',
  scope = 'global',
  parent = null
} = {}) {
  return {
    frame: name,
    scope,
    parent,
    stack: [],
    locals: {},
    ledger: [],
    states: [],
    deterministic: true
  };
}

function pushFrameValue(frame, value) {
  return {
    ...frame,
    stack: [
      ...frame.stack,
      value
    ]
  };
}

function commitFrameLedger(frame, entry) {
  return {
    ...frame,
    ledger: [
      ...frame.ledger,
      entry
    ],
    states: [
      ...frame.states,
      {
        type: 'FRAME_LEDGER_COMMITTED',
        entry
      }
    ]
  };
}

module.exports = {
  createArabicRuntimeFrame,
  pushFrameValue,
  commitFrameLedger
};
