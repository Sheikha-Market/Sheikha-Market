#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env');
const AUTOFIX = process.env.SHEIKHA_AUTOFIX === '1';

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx <= 0) continue;
    const key = t.slice(0, idx).trim();
    const val = t.slice(idx + 1).trim();
    out[key] = val;
  }
  return out;
}

function ensureEnvVar(fileText, key, value) {
  const rx = new RegExp(`^${key}=.*$`, 'm');
  if (rx.test(fileText)) return fileText.replace(rx, `${key}=${value}`);
  const suffix = fileText.endsWith('\n') || fileText.length === 0 ? '' : '\n';
  return `${fileText}${suffix}${key}=${value}\n`;
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

async function run() {
  let critical = 0;
  let warnings = 0;
  let fixes = 0;

  section('Runtime');
  const nodeVersion = process.version;
  const nodeMajor = Number(nodeVersion.replace(/^v/, '').split('.')[0]);
  console.log(`Node: ${nodeVersion}`);
  if (nodeMajor < 20) {
    critical++;
    console.log('CRITICAL: Node version is below 20.');
  } else if (nodeMajor >= 25) {
    warnings++;
    console.log('WARN: Node 25 active. Keep compatibility checks because package targets Node 20.');
  } else {
    console.log('OK: Node runtime is compatible.');
  }

  section('Core Files');
  const requiredFiles = ['server.js', 'package.json', 'public/لوحة-الادمن.html'];
  for (const rel of requiredFiles) {
    const p = path.join(ROOT, rel);
    if (fs.existsSync(p)) console.log(`OK: ${rel}`);
    else {
      critical++;
      console.log(`CRITICAL: Missing ${rel}`);
    }
  }

  section('Environment Security');
  let envText = '';
  if (fs.existsSync(ENV_PATH)) {
    envText = fs.readFileSync(ENV_PATH, 'utf8');
    console.log('OK: .env found');
  } else {
    warnings++;
    console.log('WARN: .env not found');
    if (AUTOFIX) {
      fs.writeFileSync(ENV_PATH, '', 'utf8');
      envText = '';
      fixes++;
      console.log('FIXED: Created .env');
    }
  }

  let env = parseEnv(envText);
  const jwt = env.JWT_SECRET || '';
  const salt = env.PASSWORD_SALT || '';

  if (jwt.length < 32) {
    critical++;
    console.log('CRITICAL: JWT_SECRET missing or too short (<32).');
    if (AUTOFIX) {
      const val = crypto.randomBytes(48).toString('base64');
      envText = ensureEnvVar(envText, 'JWT_SECRET', val);
      fixes++;
      critical--;
      console.log('FIXED: Generated JWT_SECRET.');
    }
  } else {
    console.log('OK: JWT_SECRET length is valid.');
  }

  if (salt.length < 10) {
    critical++;
    console.log('CRITICAL: PASSWORD_SALT missing or too short (<10).');
    if (AUTOFIX) {
      const val = crypto.randomBytes(24).toString('hex');
      envText = ensureEnvVar(envText, 'PASSWORD_SALT', val);
      fixes++;
      critical--;
      console.log('FIXED: Generated PASSWORD_SALT.');
    }
  } else {
    console.log('OK: PASSWORD_SALT is set.');
  }

  if (AUTOFIX && envText) {
    fs.writeFileSync(ENV_PATH, envText, 'utf8');
    env = parseEnv(envText);
  }

  section('Integration Readiness');
  const integrationKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'ALERT_WEBHOOK_URL', 'VPS_HOST'];
  for (const key of integrationKeys) {
    if (env[key] && String(env[key]).trim().length > 0) {
      console.log(`OK: ${key} configured`);
    } else {
      warnings++;
      console.log(`WARN: ${key} not configured`);
    }
  }

  section('Local Health Endpoint');
  try {
    const r = await fetch('http://127.0.0.1:8080/api/health', { method: 'GET' });
    if (r.ok) {
      const text = await r.text();
      console.log(`OK: /api/health responded ${r.status}`);
      console.log(`Body: ${text.slice(0, 160)}`);
    } else {
      warnings++;
      console.log(`WARN: /api/health returned ${r.status}`);
    }
  } catch (e) {
    warnings++;
    console.log(`WARN: /api/health unreachable (${e.message})`);
  }

  section('Summary');
  console.log(`Critical: ${critical}`);
  console.log(`Warnings: ${warnings}`);
  console.log(`Fixes: ${fixes}`);
  console.log(`Mode: ${AUTOFIX ? 'AUTOFIX' : 'READONLY'}`);

  if (critical > 0) {
    console.log('\nResult: FAILED (critical issues present)');
    process.exit(1);
  }
  console.log('\nResult: PASS (ready for integration hardening)');
}

run().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

