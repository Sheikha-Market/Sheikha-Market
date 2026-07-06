'use strict';

const {
  createArabicExecutionKernel,
  tickArabicKernel,
  attachFrame,
  attachTransaction
} = require('./arabic-execution-kernel');

const {
  buildArabicBytecodeV2
} = require('../../vm/v2/arabic-bytecode-v2');

const {
  runPersistentTransactionalArabicBytecode
} = require('../transaction/run-persistent-transactional-bytecode');

function runArabicKernelProgram(input) {
  let kernel = createArabicExecutionKernel();

  const program = buildArabicBytecodeV2(input);
  const execution = runPersistentTransactionalArabicBytecode(program);

  kernel = tickArabicKernel(kernel);

  if (execution.result?.frameResult?.frame) {
    kernel = attachFrame(kernel, execution.result.frameResult.frame);
  }

  if (execution.result?.transaction) {
    kernel = attachTransaction(kernel, execution.result.transaction);
  }

  return {
    runtime: 'SHEIKHA_ARABIC_KERNEL_PROGRAM_RUNTIME',
    status: execution.persisted ? 'KERNEL_PROGRAM_EXECUTED' : 'KERNEL_PROGRAM_BLOCKED',
    kernel,
    execution
  };
}

module.exports = { runArabicKernelProgram };
