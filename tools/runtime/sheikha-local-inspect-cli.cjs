'use strict';
// Local read-only inspection. Never imports application modules or activates devices.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const MANIFEST = path.join(ROOT, 'private/operations/SHEIKHA-LOCAL-OPERATING-MANIFEST-V1.json');
const PREFLIGHT = path.join(ROOT, 'private/reports/SHEIKHA-V43.83-LOCAL-PREFLIGHT-20261022T222134Z.json');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function readJson(file) {
  const info = fs.lstatSync(file);
  if (!info.isFile() || info.isSymbolicLink() || info.size > 256 * 1024) throw new Error('InvalidLocalRecord');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function optionalJson(file) { try { return readJson(file); } catch { return null; } }

function sourceComparison(receipt) {
  if (!receipt?.sourceHashes || receipt.passed !== true) return { state: 'NOT_VERIFIED', checkedFiles: 0, mismatches: [] };
  const mismatches = [];
  const entries = Object.entries(receipt.sourceHashes);
  for (const [relative, expected] of entries) {
    const absolute = path.resolve(ROOT, relative);
    if (!absolute.startsWith(ROOT + path.sep)) {
      mismatches.push({ path: relative, state: 'INVALID_RECEIPT_PATH' });
      continue;
    }
    try {
      if (sha256(fs.readFileSync(absolute)) !== expected) mismatches.push({ path: relative, state: 'CHANGED' });
    } catch { mismatches.push({ path: relative, state: 'UNREADABLE' }); }
  }
  return { state: mismatches.length ? 'SOURCE_CHANGED_SINCE_TEST' : 'MATCHES_TESTED_SOURCE', checkedFiles: entries.length, mismatches };
}

function probe(port, urlPath) {
  return new Promise(resolve => {
    let settled = false;
    let timer;
    const finish = value => { if (!settled) { settled = true; clearTimeout(timer); resolve({ path: urlPath, ...value }); } };
    const request = http.get({ hostname: '127.0.0.1', port, path: urlPath, headers: { Accept: 'application/json' } }, response => {
      const parts = [];
      let bytes = 0;
      response.on('data', part => {
        bytes += part.length;
        if (bytes > 65536) { finish({ state: 'RESPONSE_TOO_LARGE', httpStatus: response.statusCode }); request.destroy(); }
        else parts.push(part);
      });
      response.on('end', () => {
        let body;
        try { body = JSON.parse(Buffer.concat(parts).toString('utf8')); } catch {}
        const observation = { state: 'HTTP_RESPONSE_OBSERVED', httpStatus: response.statusCode };
        if (urlPath === '/api/infinite-agent/status' && body && typeof body === 'object') {
          Object.assign(observation, { schema: typeof body.schema === 'string' ? body.schema.slice(0, 80) : null,
            localSimulation: body.localSimulation === true, bounded: body.bounded === true,
            liveNeuralNetworkClaim: typeof body.liveNeuralNetwork === 'boolean' ? body.liveNeuralNetwork : null,
            sealIsDeclarationOnly: typeof body.seal === 'string', verifiedAIInference: false, verifiedBareMetalBoot: false });
        }
        finish(observation);
      });
      response.on('error', () => finish({ state: 'UNREACHABLE_OR_BLOCKED' }));
    });
    timer = setTimeout(() => { finish({ state: 'TIMEOUT' }); request.destroy(); }, 2500);
    request.on('error', () => finish({ state: 'UNREACHABLE_OR_BLOCKED' }));
  });
}

async function status() {
  const receipt = optionalJson(PREFLIGHT);
  const services = await Promise.all([19185, 18080].map(async port => ({
    url: `http://127.0.0.1:${port}`, scope: port === 19185 ? 'GOVERNED_LOCAL_CANDIDATE' : 'SEPARATE_USER_RUNTIME_IF_PRESENT',
    observations: await Promise.all(['/api/health', '/api/infinite-agent/status', '/api/infinite-agent/design'].map(p => probe(port, p)))
  })));
  return { schema: 'SHEIKHA_LOCAL_CLI_STATUS_V1', checkedAtUtc: new Date().toISOString(), readOnly: true,
    source: sourceComparison(receipt), historicalPreflight: receipt ? { imageId: receipt.imageId, timestamp: receipt.timestamp,
      passedRequests: receipt.passedRequests, totalRequests: receipt.totalRequests } : null,
    services, externalDeploymentPerformed: false,
    note: 'HTTP responses establish endpoint behavior only. Saved seals do not establish inference, GPU acceleration or bare-metal boot.' };
}

function manifest() {
  const record = readJson(MANIFEST);
  return { schema: 'SHEIKHA_LOCAL_CLI_MANIFEST_V1', readOnly: true, path: path.relative(ROOT, MANIFEST),
    classification: record.classification, manifestSha256: sha256(fs.readFileSync(MANIFEST)),
    governance: record.declaredGovernance,
    identity: { projectBrand: record.identity?.projectBrand, tradeNameUserReportedStatus: record.identity?.tradeNameUserReportedStatus },
    operationalState: record.operationalState, platformTargets: record.platformTargets,
    cloudDiagramState: record.referenceArchitecture?.status,
    note: 'Local inventory and declarations. This command does not activate systems or certify compliance or ownership.' };
}

function checkJs(input) {
  const absolute = fs.realpathSync(path.resolve(ROOT, input));
  if (!absolute.startsWith(ROOT + path.sep)) throw new Error('PathOutsideProject');
  const info = fs.statSync(absolute);
  if (!info.isFile() || info.size > 2 * 1024 * 1024 || !/\.(?:c|m)?js$/.test(absolute)) throw new Error('ExpectedProjectJavaScriptFile');
  const relative = path.relative(ROOT, absolute);
  if (info.size === 0) return { path: relative, passed: false, reason: 'EMPTY_FILE', executed: false };
  const source = fs.readFileSync(absolute);
  if (/\[STRIPPED\]|الصق محتوى|سيتم لصق الكود/.test(source.toString('utf8'))) return { path: relative, passed: false, reason: 'PLACEHOLDER_CONTENT', executed: false };
  const result = spawnSync(process.execPath, ['--check', absolute], { encoding: 'utf8', timeout: 10000, maxBuffer: 65536, windowsHide: true });
  return { path: relative, passed: result.status === 0 && !result.error,
    reason: result.error?.code === 'EPERM' ? 'PROCESS_CHECK_BLOCKED' : result.error ? 'CHECK_FAILED_OR_TIMED_OUT' : result.status === 0 ? 'SYNTAX_VALID' : 'INVALID_SYNTAX',
    sha256: sha256(source), executed: false, note: 'Syntax only; static ACTIVE/SEALED declarations do not establish execution.' };
}

async function main(argv = process.argv.slice(2)) {
  const [command, argument] = argv;
  let result;
  if (command === 'status' && argv.length === 1) result = await status();
  else if (command === 'manifest' && argv.length === 1) result = manifest();
  else if (command === 'check-js' && argv.length === 2) { result = checkJs(argument); if (!result.passed) process.exitCode = 1; }
  else { process.stderr.write('Usage: node cli.cjs status | manifest | check-js <project-file.js>\n'); process.exitCode = 2; return; }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
if (require.main === module) main().catch(error => {
  process.stderr.write(JSON.stringify({ success: false, error: error.code || error.message }) + '\n'); process.exitCode = 1;
});
module.exports = { checkJs, sourceComparison, main };
