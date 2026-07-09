#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function main() {
  const repoRoot = process.cwd();
  const keysDir = path.join(repoRoot, 'security', 'keys');
  const privateKeyPath = process.env.SHEIKHA_ACCREDITATION_PRIVATE_KEY_PATH || path.join(keysDir, 'sheikha-accreditation-signing-private.pem');
  const publicKeyPath = process.env.SHEIKHA_ACCREDITATION_PUBLIC_KEY_PATH || path.join(keysDir, 'sheikha-accreditation-signing-public.pem');

  fs.mkdirSync(path.dirname(privateKeyPath), { recursive: true });
  fs.mkdirSync(path.dirname(publicKeyPath), { recursive: true });

  if (fs.existsSync(privateKeyPath) || fs.existsSync(publicKeyPath)) {
    throw new Error('Accreditation signing key files already exist. Set custom paths or rotate manually.');
  }

  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  fs.writeFileSync(privateKeyPath, privateKey, { encoding: 'utf8', mode: 0o600 });
  fs.writeFileSync(publicKeyPath, publicKey, { encoding: 'utf8', mode: 0o644 });

  const fingerprint = crypto.createHash('sha256').update(publicKey).digest('hex');
  process.stdout.write(`${JSON.stringify({
    status: 'created',
    algorithm: 'RSA-4096',
    privateKeyPath: path.relative(repoRoot, privateKeyPath),
    publicKeyPath: path.relative(repoRoot, publicKeyPath),
    publicKeyFingerprint: `sha256:${fingerprint}`
  }, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  console.error(String(error.message || error));
  process.exit(1);
}
