#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env');

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    out[k] = v;
  }
  return out;
}

function masked(v) {
  if (!v) return '(missing)';
  if (v.length <= 8) return '****';
  return `${v.slice(0, 4)}...${v.slice(-4)}`;
}

function ok(flag) {
  return flag ? 'OK' : 'MISSING';
}

function main() {
  if (!fs.existsSync(ENV_PATH)) {
    console.error('CRITICAL: .env not found');
    process.exit(1);
  }

  const env = parseEnv(fs.readFileSync(ENV_PATH, 'utf8'));
  const base = env.BASE_URL || '';

  const checks = {
    JWT_SECRET: (env.JWT_SECRET || '').length >= 32,
    PASSWORD_SALT: (env.PASSWORD_SALT || '').length >= 10,
    BASE_URL: /^https?:\/\//.test(base),
    GOOGLE_CLIENT_ID: !!env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!env.GOOGLE_CLIENT_SECRET,
    NAFATH_CLIENT_ID: !!env.NAFATH_CLIENT_ID,
    NAFATH_CLIENT_SECRET: !!env.NAFATH_CLIENT_SECRET
  };

  console.log('\n=== Auth Readiness ===');
  console.log(`JWT_SECRET: ${ok(checks.JWT_SECRET)}`);
  console.log(`PASSWORD_SALT: ${ok(checks.PASSWORD_SALT)}`);
  console.log(`BASE_URL: ${ok(checks.BASE_URL)} ${base || '(missing)'}`);
  console.log(`GOOGLE_CLIENT_ID: ${ok(checks.GOOGLE_CLIENT_ID)} ${masked(env.GOOGLE_CLIENT_ID || '')}`);
  console.log(`GOOGLE_CLIENT_SECRET: ${ok(checks.GOOGLE_CLIENT_SECRET)} ${masked(env.GOOGLE_CLIENT_SECRET || '')}`);
  console.log(`NAFATH_CLIENT_ID: ${ok(checks.NAFATH_CLIENT_ID)} ${masked(env.NAFATH_CLIENT_ID || '')}`);
  console.log(`NAFATH_CLIENT_SECRET: ${ok(checks.NAFATH_CLIENT_SECRET)} ${masked(env.NAFATH_CLIENT_SECRET || '')}`);

  if (checks.BASE_URL) {
    console.log('\n=== Callback URLs (configure in provider consoles) ===');
    console.log(`Google : ${base}/api/auth/google/callback`);
    console.log(`Nafath : ${base}/api/auth/nafath/callback`);
  } else {
    console.log('\nWARN: Set BASE_URL first, e.g. https://www.sheikha.top');
  }

  const googleReady = checks.BASE_URL && checks.GOOGLE_CLIENT_ID && checks.GOOGLE_CLIENT_SECRET;
  const nafathReady = checks.BASE_URL && checks.NAFATH_CLIENT_ID && checks.NAFATH_CLIENT_SECRET;
  const coreReady = checks.JWT_SECRET && checks.PASSWORD_SALT;

  console.log('\n=== Summary ===');
  console.log(`Core auth: ${coreReady ? 'READY' : 'NOT READY'}`);
  console.log(`Google auth: ${googleReady ? 'READY' : 'NOT READY'}`);
  console.log(`Nafath auth: ${nafathReady ? 'READY' : 'NOT READY'}`);

  if (!coreReady) process.exit(1);
}

main();
