#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { validateRegistry, summary, buildGraph, MAX_BYTES } = require('../../core/institutional-governance/index.cjs');

function run(args) {
  const command = args.shift();
  if (!['validate', 'summary', 'graph'].includes(command)) throw new Error('COMMAND_MUST_BE_VALIDATE_SUMMARY_OR_GRAPH');
  const options = {};
  while (args.length) {
    const name = args.shift();
    if (!['--input', '--output'].includes(name) || options[name] || !args.length) throw new Error('INVALID_ARGUMENTS');
    options[name] = args.shift();
  }
  if (!options['--input']) throw new Error('INPUT_REQUIRED');
  const fd = fs.openSync(options['--input'], fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  let registry;
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > MAX_BYTES) throw new Error('INPUT_FILE_REFUSED');
    registry = JSON.parse(fs.readFileSync(fd, 'utf8'));
  } finally { fs.closeSync(fd); }
  const validation = validateRegistry(registry);
  const result = command === 'validate' || !validation.valid ? validation : command === 'summary' ? summary(registry) : buildGraph(registry);
  const text = JSON.stringify(result, null, 2) + '\n';
  // Exclusive creation: never overwrite a source, previous report, or symlink.
  if (options['--output']) fs.writeFileSync(options['--output'], text, { flag: 'wx', mode: 0o600 });
  process.stdout.write(text);
  if (!validation.valid) process.exitCode = 1;
}
if (require.main === module) {
  try { run(process.argv.slice(2)); }
  catch (error) {
    process.stderr.write(JSON.stringify({ status: 'REFUSED', code: /^[A-Z_]{3,80}$/.test(error.message) ? error.message : error.code === 'EEXIST' ? 'OUTPUT_ALREADY_EXISTS' : 'INPUT_OR_OUTPUT_REFUSED' }) + '\n');
    process.exitCode = 1;
  }
}
module.exports = { run };
