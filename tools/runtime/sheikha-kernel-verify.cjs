'use strict';

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--manifest')) {
  process.stderr.write('Usage: node tools/runtime/sheikha-kernel-verify.cjs [--manifest]\n');
  process.exitCode = 2;
} else {
  try {
    const kernel = require('../../runtime/kernel/sheikha-kernel');
    const result = args[0] === '--manifest' ? kernel.getManifest() : kernel.verifyLocal();
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    if (result.success === false) process.exitCode = 1;
  } catch (_error) {
    process.stderr.write('LOCAL_KERNEL_VERIFICATION_FAILED\n');
    process.exitCode = 1;
  }
}
