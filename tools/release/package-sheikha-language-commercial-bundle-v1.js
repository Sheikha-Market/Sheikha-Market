#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {build, OUTPUT} = require('./build-sheikha-language-commercial-bundle-v1');

const ROOT = path.resolve(__dirname, '..', '..');
const RELEASE_ROOT = path.dirname(OUTPUT);
const TAR_PATH = path.join(RELEASE_ROOT, 'sheikha-language-commercial-v1.tar');
const ARCHIVE_PATH = `${TAR_PATH}.gz`;
const CHECKSUM_PATH = path.join(RELEASE_ROOT, 'SHA256SUMS');

function run(command, args) {
  const result = spawnSync(command, args, {cwd: RELEASE_ROOT, encoding: 'utf8'});
  if (result.error || result.status !== 0) {
    throw new Error(`${command} failed: ${result.error?.message || result.stderr || result.status}`);
  }
}

function packageBundle() {
  const manifest = build();
  fs.rmSync(TAR_PATH, {force: true});
  fs.rmSync(ARCHIVE_PATH, {force: true});
  run('tar', [
    '--sort=name', '--mtime=@0', '--owner=0', '--group=0', '--numeric-owner',
    '-cf', TAR_PATH, 'v1'
  ]);
  run('gzip', ['-n', TAR_PATH]);
  const archive = fs.readFileSync(ARCHIVE_PATH);
  const archiveSha256 = crypto.createHash('sha256').update(archive).digest('hex');
  fs.writeFileSync(
    CHECKSUM_PATH,
    `${archiveSha256}  ${path.relative(ROOT, ARCHIVE_PATH)}\n`,
    'ascii'
  );
  return {
    system: 'SHEIKHA_LANGUAGE_COMMERCIAL_PACKAGE_V1',
    status: 'CONTRACTED_DISTRIBUTION_PACKAGE_BUILT',
    bundleSha256: manifest.bundleSha256,
    archive: path.relative(ROOT, ARCHIVE_PATH),
    archiveBytes: archive.length,
    archiveSha256,
    checksums: path.relative(ROOT, CHECKSUM_PATH)
  };
}

if (require.main === module) process.stdout.write(`${JSON.stringify(packageBundle(), null, 2)}\n`);
module.exports = {ARCHIVE_PATH, CHECKSUM_PATH, packageBundle};
