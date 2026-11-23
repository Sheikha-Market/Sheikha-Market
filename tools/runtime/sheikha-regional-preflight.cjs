'use strict';

const topology = require('../../config/cloud/sheikha-regional-topology-v1.json');
const hybrid = require('../../config/cloud/sheikha-hybrid-domain-plan-v1.json');
const { regionalPlan, assessSnapshot } = require('../../core/cloud-fabric/sheikha-regional-preflight-v1.cjs');

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !['plan', 'assess'].includes(args[0])) throw new Error('INVALID_ARGUMENTS');
  let result;
  if (args[0] === 'plan') result = regionalPlan(topology, hybrid);
  else {
    let size = 0;
    const chunks = [];
    for await (const chunk of process.stdin) {
      size += chunk.length;
      if (size > 1024 * 1024) throw new Error('INPUT_LIMIT');
      chunks.push(chunk);
    }
    result = assessSnapshot(JSON.parse(Buffer.concat(chunks).toString('utf8')), topology, hybrid);
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exitCode = result.status === 'BLOCKED' ? 1 : 0;
}

main().catch(() => {
  process.stderr.write('{"status":"INVALID_INPUT","executed":false}\n');
  process.exitCode = 2;
});
