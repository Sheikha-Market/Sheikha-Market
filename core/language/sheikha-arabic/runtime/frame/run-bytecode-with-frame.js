'use strict';

const {
  createArabicRuntimeFrame,
  pushFrameValue,
  commitFrameLedger
} = require('./arabic-runtime-frame-engine');

function runArabicBytecodeWithFrame(program = {}) {
  let frame = createArabicRuntimeFrame({
    name: 'arabic_bytecode_frame',
    scope: 'runtime'
  });

  const bytecode = Array.isArray(program.bytecode)
    ? program.bytecode
    : program.optimized || [];

  for (const ins of bytecode) {
    if (ins.opcode?.startsWith('PUSH_')) {
      frame = pushFrameValue(frame, ins.operand);
    }

    if (ins.opcode === 'COMMIT_LEDGER') {
      for (const entry of ins.operand || []) {
        frame = commitFrameLedger(frame, entry);
      }
    }
  }

  return {
    runtime: 'SHEIKHA_ARABIC_BYTECODE_FRAME_RUNTIME',
    status: frame.ledger.length ? 'FRAME_EXECUTED' : 'NO_FRAME_OUTPUT',
    frame
  };
}

module.exports = { runArabicBytecodeWithFrame };
