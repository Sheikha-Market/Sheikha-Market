#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.join(__dirname, '..');
const composeDir = path.join(rootDir, 'infra', 'docker', 'compose', 'prod');
const templatePath = path.join(composeDir, '.env.example');
const outputPath = path.join(composeDir, '.env');

function randomBase64(size) {
  return crypto.randomBytes(size).toString('base64');
}

function randomHex(size) {
  return crypto.randomBytes(size).toString('hex');
}

function replaceLine(text, key, value) {
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(text)) return text.replace(pattern, `${key}=${value}`);
  return `${text.trimEnd()}\n${key}=${value}\n`;
}

if (!fs.existsSync(templatePath)) {
  console.error(`Missing template: ${templatePath}`);
  process.exit(1);
}

let text = fs.readFileSync(templatePath, 'utf8');

const replacements = {
  POSTGRES_PASSWORD: randomBase64(24),
  GRAFANA_ADMIN_PASSWORD: randomBase64(24),
  JWT_SECRET: randomBase64(48),
  PASSWORD_SALT: randomHex(24),
  SHEIKHA_SDK_TOKEN: randomHex(32),
  SHEIKHA_IDE_TOKEN: randomHex(32),
  BACKUP_PASSPHRASE: randomBase64(48)
};

for (const [key, value] of Object.entries(replacements)) {
  text = replaceLine(text, key, value);
}

fs.writeFileSync(outputPath, text, { mode: 0o600 });

console.log(`✅ Generated production env: ${outputPath}`);
