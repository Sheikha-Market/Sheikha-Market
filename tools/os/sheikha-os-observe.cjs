'use strict';

const { HostObserver, ARCHITECTURE } = require('../../runtime/sheikha-os-enterprise-federation/sheikha-host-observation');
const { inspectPlatformEvidence } = require('../../runtime/sheikha-os-enterprise-federation/sheikha-platform-evidence');

async function main(args) {
  if (args[0] === '--integration') {
    if (args.length !== 5 || args[1] !== '--repo' || args[3] !== '--head') throw Error('USE_INTEGRATION_REPO_ABSOLUTE_PATH_HEAD_FULL_SHA');
    console.log(JSON.stringify(inspectPlatformEvidence({ repo: args[2], expectedHead: args[4] }), null, 2)); return;
  }
  if (args.length !== 1 || !['--inspect', '--watch-three', '--architecture'].includes(args[0])) throw Error('USE_INSPECT_WATCH_THREE_OR_ARCHITECTURE');
  if (args[0] === '--architecture') { console.log(JSON.stringify(ARCHITECTURE, null, 2)); return; }
  const observer = new HostObserver();
  if (args[0] === '--inspect') { console.log(JSON.stringify(observer.sample(), null, 2)); return; }
  const controller = new AbortController(); const abort = () => controller.abort();
  process.once('SIGINT', abort); process.once('SIGTERM', abort);
  try {
    const result = await observer.watch({ intervalMs: 1000, maxSamples: 3, signal: controller.signal,
      onSample: sample => console.log(JSON.stringify(sample)) });
    console.log(JSON.stringify({ session: result, backgroundTaskRemaining: false }));
  } finally { observer.stop(); process.removeListener('SIGINT', abort); process.removeListener('SIGTERM', abort); }
}

if (require.main === module) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { main };
