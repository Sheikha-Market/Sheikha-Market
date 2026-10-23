#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { evaluatePortfolio, recipientDraft, renderRecipientMarkdown } = require('../../core/partnerships/shared-goals-v1');
const ROOT = path.resolve(__dirname, '../..');
const PRIVATE = path.join(ROOT, 'reports/private');

function demand(ok, code) { if (!ok) throw new Error(code); }
function inside(root, file) { return file.startsWith(root + path.sep); }

function privatePath(file) {
  const resolved = path.resolve(file);
  demand(inside(PRIVATE, resolved), 'PRIVATE_REPORTS_PATH_REQUIRED');
  // Check every component, including ancestors; reject symlink redirection.
  let current = path.parse(resolved).root;
  for (const part of resolved.slice(current.length).split(path.sep)) {
    current = path.join(current, part);
    if (fs.existsSync(current)) demand(!fs.lstatSync(current).isSymbolicLink(), 'SYMLINK_PATH_DENIED');
  }
  return resolved;
}

function readPrivate(file, maxBytes = 5 * 1024 * 1024) {
  const resolved = privatePath(file);
  const parent = fs.statSync(path.dirname(resolved));
  demand((parent.mode & 0o777) === 0o700, 'PRIVATE_DIRECTORY_MODE_700_REQUIRED');
  const fd = fs.openSync(resolved, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(fd);
    demand(stat.isFile() && stat.nlink === 1 && stat.size <= maxBytes, 'UNSAFE_INPUT_FILE');
    demand((stat.mode & 0o777) === 0o600 && stat.uid === process.getuid(), 'PRIVATE_FILE_MODE_AND_OWNER_REQUIRED');
    return fs.readFileSync(fd);
  } finally { fs.closeSync(fd); }
}

function main(args) {
  demand(args.length === 4 && args[0] === '--input' && args[2] === '--out', 'USAGE: --input PRIVATE_INPUT_JSON --out NEW_PRIVATE_DIRECTORY');
  const inputFile = privatePath(args[1]);
  const output = privatePath(args[3]);
  demand(!fs.existsSync(output), 'OUTPUT_ALREADY_EXISTS_NO_OVERWRITE');
  demand((fs.statSync(path.dirname(output)).mode & 0o777) === 0o700, 'OUTPUT_PARENT_MODE_700_REQUIRED');
  const input = JSON.parse(readPrivate(inputFile).toString('utf8'));
  demand(input && input.schemaVersion === '1.0.0' && Array.isArray(input.evidenceFiles) && input.evidenceFiles.length <= 1000, 'INVALID_INPUT');
  const evidenceBlobs = new Map();
  let totalEvidenceBytes = 0;
  for (const item of input.evidenceFiles) {
    demand(item && /^[a-f0-9]{64}$/.test(item.sha256 || '') && typeof item.file === 'string' && !path.isAbsolute(item.file), 'INVALID_EVIDENCE_REFERENCE');
    const file = path.resolve(path.dirname(inputFile), item.file);
    demand(inside(path.dirname(inputFile), file), 'EVIDENCE_PATH_ESCAPE_DENIED');
    demand(!evidenceBlobs.has(item.sha256), 'DUPLICATE_EVIDENCE_REFERENCE');
    const bytes = readPrivate(file, 1024 * 1024);
    totalEvidenceBytes += bytes.length;
    demand(totalEvidenceBytes <= 32 * 1024 * 1024, 'TOTAL_EVIDENCE_SIZE_EXCEEDED');
    evidenceBlobs.set(item.sha256, bytes);
  }
  const report = evaluatePortfolio(input.portfolio, { ...input.window, observations: input.observations, evidenceBlobs });
  fs.mkdirSync(output, { mode: 0o700 });
  const write = (name, value) => fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  write('evaluation.json', report);
  for (const rel of report.relationships) {
    const draft = recipientDraft(report, rel.id, rel.tenantId);
    write(`recipient-${rel.id}.json`, draft);
    fs.writeFileSync(path.join(output, `recipient-${rel.id}.ar.md`), renderRecipientMarkdown(draft), { mode: 0o600, flag: 'wx' });
  }
  write('completion.json', { complete: true, reportSha256: report.reportSha256, relationshipDrafts: report.relationships.length, sent: 0, productionActivated: false });
  return { evaluationComplete: true, relationshipDrafts: report.relationships.length, externalMessagesSent: 0, reportSha256: report.reportSha256 };
}

if (require.main === module) {
  try { console.log(JSON.stringify(main(process.argv.slice(2)), null, 2)); }
  catch (error) {
    // Do not print raw data, file paths or OS error messages into shared logs.
    console.error(JSON.stringify({ evaluationComplete: false, error: /^[A-Z0-9_: -]+$/.test(error.message) ? error.message : 'PRIVATE_EVALUATION_FAILED', externalMessagesSent: 0 }));
    process.exitCode = 1;
  }
}
module.exports = { main, privatePath, readPrivate };
