#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { inspect, loadRegistry } = require('../../core/integrations/sheikha-provider-federation-v1.cjs');

function run(command, args) {
  const child = spawnSync(command, args, { encoding: 'utf8', timeout: 15000, maxBuffer: 1048576,
    shell: false, env: { ...process.env, CLOUDSDK_CORE_DISABLE_PROMPTS: '1', GH_PROMPT_DISABLED: '1' } });
  // CLI diagnostics may contain account details or credentials: never forward them.
  if (child.error || child.status !== 0) throw Error('CLI_AUTH_OR_CONNECTIVITY_UNAVAILABLE');
  return child.stdout;
}

function binding(provider, expected, actual, active) {
  const identityMatches = expected.every((value, i) => value === actual[i]);
  return { provider, state: !identityMatches ? 'IDENTITY_MISMATCH' : active ? 'READ_VERIFIED' : 'NOT_ACTIVE',
    scope: 'RESOURCE_METADATA_ONLY', identityMatches, operationalReadinessVerified: false };
}

async function jsonResponse(response) {
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 65536) throw Error('RESPONSE_TOO_LARGE');
    chunks.push(chunk);
  }
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch (_) { if (response.ok) throw Error('INVALID_RESPONSE'); }
  if (!response.ok) {
    const reasons = ['SERVICE_DISABLED', 'ACCESS_TOKEN_SCOPE_INSUFFICIENT', 'IAM_PERMISSION_DENIED', 'RATE_LIMIT_EXCEEDED'];
    const reason = Array.isArray(body?.error?.details)
      ? body.error.details.map(d => d?.reason).find(r => reasons.includes(r)) : undefined;
    return { httpStatus: response.status, ...(reason ? { reason } : {}) };
  }
  return { body };
}

async function probeGoogle(registry, { execute = run, request = fetch } = {}) {
  const expected = registry.providers['google-cloud'];
  const results = [];
  try {
    const cloud = JSON.parse(execute('gcloud', ['projects', 'describe', expected.projectId,
      '--format=json(projectId,projectNumber,lifecycleState)', '--quiet']));
    const result = binding('google-cloud', [expected.projectId, expected.projectNumber],
      [cloud.projectId, cloud.projectNumber], cloud.lifecycleState === 'ACTIVE');
    results.push(result);
    if (result.state !== 'READ_VERIFIED') return [...results, { provider: 'firebase', state: 'BLOCKED_BY_PROJECT_CHECK' }];
    // Existing gcloud auth is used only for this fixed Google API origin, never stored or returned.
    const token = execute('gcloud', ['auth', 'print-access-token', '--quiet']).trim();
    if (!token || token.length > 16384 || /\s/.test(token)) throw Error('AUTH_UNAVAILABLE');
    const response = await request(`https://firebase.googleapis.com/v1beta1/projects/${expected.projectId}`, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    const data = await jsonResponse(response);
    if (!data.body) results.push({ provider: 'firebase', state: 'READ_NOT_VERIFIED', ...data });
    else results.push(binding('firebase', [expected.projectId, expected.projectNumber],
      [data.body.projectId, data.body.projectNumber], data.body.state === 'ACTIVE'));
  } catch (_) {
    results.push({ provider: results.length ? 'firebase' : 'google-cloud', state: 'AUTH_OR_READ_CHECK_FAILED' });
  }
  return results;
}

function probeGithub(registry, execute = run) {
  try {
    const repo = registry.providers.github.repository;
    const data = JSON.parse(execute('gh', ['api', `repos/${repo}`, '--jq', '{full_name,archived}']));
    return binding('github', [repo.toLowerCase()], [String(data.full_name || '').toLowerCase()], data.archived === false);
  } catch (_) { return { provider: 'github', state: 'AUTH_OR_READ_CHECK_FAILED' }; }
}

async function main(args, deps = {}) {
  if (args.some(a => !['--probe-google', '--probe-github'].includes(a)) || new Set(args).size !== args.length) {
    return { status: 'BLOCKED', issues: ['ARGUMENTS_NOT_SUPPORTED'] };
  }
  const report = inspect();
  report.observedAt = new Date().toISOString();
  report.probes = [];
  if (report.status === 'BLOCKED') return report;
  const registry = loadRegistry();
  if (args.includes('--probe-google')) report.probes.push(...await probeGoogle(registry, deps));
  if (args.includes('--probe-github')) report.probes.push(probeGithub(registry, deps.execute));
  report.remoteReadsAttempted = args.length > 0;
  report.remoteOperations = args.length > 0;
  if (args.length) report.scope = 'LOCAL_CONFIGURATION_AND_SELECTED_REMOTE_METADATA';
  report.cloudWritesPerformed = false;
  if (report.probes.some(p => p.state !== 'READ_VERIFIED')) report.status = 'REVIEW_REQUIRED';
  return report;
}

if (require.main === module) {
  main(process.argv.slice(2)).then(report => {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = ['BLOCKED', 'REVIEW_REQUIRED'].includes(report.status) ? 2 : 0;
  }).catch(() => {
    process.stdout.write('{"status":"BLOCKED","issues":["CHECK_UNAVAILABLE"]}\n');
    process.exitCode = 2;
  });
}

module.exports = { binding, jsonResponse, probeGoogle, probeGithub, main };
