#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { createFoundry } = require('../../core/foundry/sheikha-visual-foundry.cjs');
const command = process.argv[2] || 'status';
if (!['archive', 'daily', 'guard', 'status', 'watch', 'import-generated'].includes(command)) {
  console.error('Usage: node tools/media/sheikha-visual-foundry.cjs archive|daily|guard|status|watch|import-generated <image> <provenance.json>');
  process.exitCode = 2;
} else {
  let foundry;
  try {
    foundry = createFoundry();
    if (command === 'watch') {
      if (foundry.status().watch.fresh) throw Error('WATCH_ALREADY_RUNNING');
      const stop = foundry.watch();
      for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => { stop(); process.exit(0); });
      console.log(JSON.stringify({ status: 'WATCH_STARTED', pid: process.pid }));
    } else {
      const result = command === 'import-generated'
        ? foundry.importGenerated(process.argv[3], JSON.parse(fs.readFileSync(process.argv[4], 'utf8')))
        : foundry[command]();
      console.log(JSON.stringify(result, null, 2));
      if ((result.status || result.decision || '').startsWith('HOLD')) process.exitCode = 2;
    }
  } catch (error) {
    if (error.message === 'FOUNDRY_BUSY') console.log(JSON.stringify({ status: 'BUSY_RETRY_NEXT_TICK' }));
    else {
      try { foundry?.recordError(error); } catch {}
      console.error(JSON.stringify({ status: 'HOLD_ERROR', error: error.code || error.message }));
      process.exitCode = 1;
    }
  }
}
